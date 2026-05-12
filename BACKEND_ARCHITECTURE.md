# Backend — Complete Detailed Architecture

## Table of Contents
1. [Entry Point — server.js](#1-entry-point--serverjs)
2. [Config — db.js & ai.js](#2-config--dbjs--aijs)
3. [Middleware — errorHandler.js](#3-middleware--errorhandlerjs)
4. [Session Module](#4-session-module)
5. [Participant (User) Module](#5-participant-user-module)
6. [Question Module](#6-question-module)
7. [Leaderboard Module](#7-leaderboard-module)
8. [Analytics Module](#8-analytics-module)
9. [AI Module](#9-ai-module)
10. [PPTX Module](#10-pptx-module)
11. [Socket Module](#11-socket-module)
12. [Data Models](#12-data-models)
13. [Scoring Logic](#13-scoring-logic)

---

## 1. Entry Point — `server.js`

**Path:** `backend/src/server.js`

This is the root file that bootstraps the entire backend application.

### What it does step by step:

1. **Loads environment variables** using `dotenv.config()` — reads `backend/.env` into `process.env`
2. **Creates an Express app** — handles all HTTP REST requests
3. **Creates an HTTP server** wrapping Express — needed because Socket.IO must attach to a raw HTTP server, not Express directly
4. **Creates a Socket.IO server** on top of the HTTP server with CORS configured to allow only the frontend URL (`CLIENT_URL` from `.env`)
5. **Registers middleware:**
   - `cors` — allows cross-origin requests from the frontend
   - `express.json()` — parses JSON request bodies
   - `express.urlencoded()` — parses form-encoded bodies
6. **Mounts REST routes** at `/api/v1/...` paths
7. **Registers a health check** at `GET /health` — returns `{ status: 'ok', timestamp }` — useful for uptime monitoring
8. **Registers a 404 handler** — catches any unmatched routes
9. **Registers the global error handler** — catches all errors thrown in routes
10. **Initializes Socket.IO** by calling `initSocket(io)`
11. **Starts the server** by first connecting to MongoDB, then listening on `PORT` (default 4000)

### Key design decision:
The `start()` function is `async` and calls `connectDB()` before `httpServer.listen()`. This ensures the server never starts accepting requests if the database connection fails — it exits with code 1 instead.

---

## 2. Config — `db.js` & `ai.js`

### `backend/src/config/db.js`

Handles MongoDB connection using Mongoose.

**Logic:**
- Reads `MONGODB_URI` from environment — exits immediately if not set (fail-fast pattern)
- Calls `mongoose.connect()` with a 5-second `serverSelectionTimeoutMS` — prevents hanging forever if MongoDB is unreachable
- On success: logs `[DB] MongoDB connected successfully.`
- On failure: logs a helpful message telling the developer to check MongoDB or use Atlas, then exits with code 1
- Registers two runtime event listeners:
  - `disconnected` — warns if connection drops during runtime
  - `error` — logs any runtime MongoDB errors

### `backend/src/config/ai.js`

Simple utility that reads the `AI_PROVIDER` environment variable.

**Logic:**
- Returns `'openai'` or `'gemini'` based on `process.env.AI_PROVIDER`
- If an unknown value is set, logs a warning and falls back to `'openai'`
- Used by `ai.service.js` to decide which AI provider to call

---

## 3. Middleware — `errorHandler.js`

**Path:** `backend/src/middleware/errorHandler.js`

A global Express error handler — the last middleware registered in `server.js`.

**Logic:**
- Receives any error thrown with `next(err)` from any route or controller
- Reads `err.statusCode` — if not set, defaults to `500`
- **Client errors (4xx):** returns the actual error message to the client (safe to expose)
- **Server errors (5xx):** returns a generic `"An internal server error occurred."` message (hides internal details for security), but logs the full stack trace to the console
- Always returns structured JSON: `{ error: { code, message } }`

**Why this matters:** Every service function sets `err.statusCode` before throwing, so the error handler can correctly classify and respond to every error type without any if/else logic in controllers.

---

## 4. Session Module

### `session.model.js`

Defines the MongoDB schema for a quiz session.

**Fields:**
- `sessionCode` — 6-character uppercase unique code (e.g. `"AB12CD"`), indexed for fast lookup
- `presenterToken` — secret token like `tok_pres_<24 random chars>`, used to authenticate all host actions
- `presenterName` — display name of the host
- `status` — state machine with 4 states: `waiting → active → paused/ended`
- `currentQuestionIndex` — starts at `-1` (no question shown yet), increments as host advances
- `questions[]` — embedded array of question subdocuments (not a separate collection)
- `participants[]` — array of ObjectId references to Participant documents
- `leaderboardSnaps[]` — array of ObjectId references to Leaderboard snapshots
- `analytics` — embedded analytics object updated in real-time
- `questionStartedAt` — timestamp when current question was shown, used for score calculation
- `endedAt` — timestamp when quiz ended

**Question subdocument fields:**
- `text` — question text
- `options[4]` — exactly 4 answer choices (validated)
- `correctIndex` — integer 0–3 pointing to the correct option
- `difficulty` — `easy | medium | hard`
- `timerSeconds` — 5 to 120 seconds per question

---

### `session.service.js`

Contains all business logic for session management.

**`generateUniqueCode()`**
- Uses a custom alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — deliberately excludes `I`, `O`, `1`, `0` to avoid visual confusion
- Generates a random 6-character code
- Checks MongoDB to ensure no active session already uses that code (collision avoidance)
- Loops until a unique code is found

**`createSession(presenterName)`**
- Calls `generateUniqueCode()` to get a unique session code
- Generates a `presenterToken` using `nanoid(24)` — cryptographically random, URL-safe
- Creates and saves the Session document with `status: 'waiting'`
- Returns the full session object

**`updateSessionStatus(sessionId, newStatus, presenterToken)`**
- Implements a **state machine** with defined valid transitions:
  ```
  waiting → active
  active  → paused | ended
  paused  → active | ended
  ended   → (nothing allowed)
  ```
- Validates the presenter token before allowing any status change
- Throws a 400 error if the transition is not allowed
- Sets `endedAt` timestamp when status becomes `ended`

**`validatePresenterToken(sessionId, presenterToken)`**
- Reusable helper used by question service and analytics
- Throws 404 if session not found, 403 if token doesn't match

---

### `session.controller.js`

Thin HTTP layer — validates request inputs, calls service, formats response.

**`POST /api/v1/sessions`** — `createSession`
- Reads `presenterName` from body (optional, defaults to `'Presenter'`)
- Returns: `{ sessionId, sessionCode, presenterToken, presenterName }`

**`GET /api/v1/sessions/:code`** — `getSession`
- Looks up session by code
- Returns public info only (no presenterToken in response): `{ sessionId, sessionCode, status, questionCount, currentQuestionIndex, presenterName }`

**`PATCH /api/v1/sessions/:sessionId/status`** — `updateStatus`
- Requires `status` and `presenterToken` in body
- Returns: `{ sessionId, status }`

---

## 5. Participant (User) Module

### `participant.model.js`

Defines the MongoDB schema for a quiz participant.

**Fields:**
- `sessionId` — reference to the Session they joined
- `displayName` — name chosen when joining
- `participantToken` — secret token like `tok_part_<24 chars>`, used to authenticate all player actions
- `totalScore` — running total, updated after each answer
- `totalResponseTimeMs` — cumulative response time, used as tiebreaker in leaderboard
- `isActive` — `true` when connected via Socket.IO, `false` when disconnected
- `disconnectedAt` — timestamp of last disconnect (used for reconnect window logic)
- `answers[]` — embedded array of answer records

**Answer record fields:**
- `questionIndex` — which question this answer is for
- `selectedIndex` — which option was chosen (null if skipped)
- `isCorrect` — boolean
- `isSkipped` — boolean
- `responseTimeMs` — how long they took to answer
- `scoreAwarded` — points earned for this answer
- `submittedAt` — timestamp

---

### `participant.service.js`

**`joinSession(sessionCode, displayName)`**
- Looks up session by code — throws 404 if not found
- Checks session status is `'waiting'` — throws 400 if quiz already started or ended (prevents late joins)
- Creates a Participant document with a unique `participantToken`
- Pushes the participant's `_id` into `session.participants[]`
- Returns both the participant and session objects

**`getParticipantByToken(token)`** — simple lookup by token

**`getParticipantsBySession(sessionId)`** — returns all participants for a session

---

### `participant.controller.js`

**`POST /api/v1/sessions/:code/join`** — `joinSession`
- Validates `displayName` is not empty
- Returns: `{ participantId, participantToken, sessionId, sessionCode }`
- The `participantToken` is stored by the frontend and used for all subsequent actions

**`POST /api/v1/sessions/:sessionId/answers`** — `submitAnswerREST`
- REST fallback for answer submission (primary path is Socket.IO)
- Validates: token, session active, timer still running, no duplicate answer
- Calculates score using `calculateScore()` from `answer.service.js`
- Saves answer to participant's `answers[]` array
- Updates `totalScore` and `totalResponseTimeMs`

**`GET /api/v1/sessions/:sessionId/participants/:participantId/summary`** — `getParticipantSummary`
- Requires `participantToken` as query param for authentication
- Computes: accuracy %, rank, per-question breakdown, skipped questions with correct answers
- Returns full post-game summary for the participant summary page

---

## 6. Question Module

### `question.service.js`

**`validateQuestionData(data)`**
- Validates all question fields before saving:
  - `text` must be a non-empty string
  - `options` must be an array of exactly 4 non-empty strings
  - `correctIndex` must be 0, 1, 2, or 3
  - `difficulty` must be `easy`, `medium`, or `hard`
  - `timerSeconds` must be between 5 and 120
- Returns a cleaned/normalized version of the data (trimmed strings, numbers cast correctly)

**`addQuestion(sessionId, presenterToken, questionData)`**
- Validates presenter token first
- Validates question data
- Pushes the new question into `session.questions[]`
- Saves and returns the updated session

**`editQuestion(sessionId, presenterToken, index, questionData)`**
- Validates token and index bounds
- Merges new data over existing question using spread operator
- Calls `session.markModified('questions')` — required by Mongoose when mutating embedded arrays directly
- Saves and returns updated session

**`removeQuestion(sessionId, presenterToken, index)`**
- Validates token and index bounds
- Uses `splice(idx, 1)` to remove the question
- Calls `markModified('questions')` before saving

---

### `question.controller.js` & `question.routes.js`

Routes are mounted at `/api/v1/sessions/:sessionId/questions` with `mergeParams: true` so `:sessionId` is accessible.

| Method | Path | Action |
|--------|------|--------|
| POST | `/` | Add a question |
| PUT | `/:index` | Edit question at index |
| DELETE | `/:index` | Remove question at index |

All routes require `presenterToken` in the request body for authorization.

---

## 7. Leaderboard Module

### `leaderboard.model.js`

Stores a snapshot of rankings after each question ends.

**Fields:**
- `sessionId` — which session this snapshot belongs to
- `questionIndex` — after which question this snapshot was taken
- `rankings[]` — array of ranking entries sorted by score
  - Each entry: `{ rank, participantId, displayName, totalScore, totalResponseTimeMs }`
- `timestamps` — `createdAt` and `updatedAt` auto-managed by Mongoose

Multiple snapshots are created per session — one after each question. This allows the host to see how rankings changed over time.

---

### `leaderboard.service.js`

**`computeAndBroadcast(io, sessionCode, questionIndex)`**
- Fetches all participants for the session
- Sorts them by: `totalScore DESC`, then `totalResponseTimeMs ASC` (tiebreaker — faster overall = higher rank)
- Maps to a `rankings[]` array with 1-based rank numbers
- Persists a new Leaderboard snapshot to MongoDB
- Pushes the snapshot `_id` into `session.leaderboardSnaps[]`
- Broadcasts `leaderboard_update` event to all clients in the session room via Socket.IO
- Returns the rankings array

**`getLatestSnapshot(sessionId)`**
- Finds the most recent Leaderboard document for a session (sorted by `createdAt DESC`)

**`getParticipantRank(sessionId, participantId)`**
- Gets the latest snapshot and finds the participant's entry
- Returns their 1-based rank, or 0 if not found

---

### `leaderboard.controller.js` & `leaderboard.routes.js`

Single route: `GET /api/v1/sessions/:sessionId/leaderboard`
- Returns the latest leaderboard snapshot rankings
- No auth required (rankings are public)

---

## 8. Analytics Module

### `analytics.service.js`

**`buildAnalytics(sessionId)`**

Computes a real-time analytics snapshot. Called after every question ends and pushed to the presenter.

**Calculations:**
- `activeCount` / `inactiveCount` — counts participants by `isActive` flag
- `questionStats[]` — for each question, counts:
  - `correct` — answers where `isCorrect === true`
  - `incorrect` — answers where `isCorrect === false && isSkipped === false`
  - `skipped` — answers where `isSkipped === true`
- `overallAccuracy` — `(totalCorrect / totalNonSkipped) * 100`, rounded to integer
- `answerRate` — percentage of participants who answered at least one question
- `topPerformer` — participant with highest `totalScore` (tiebroken by `totalResponseTimeMs`)
- `mostActiveParticipant` — participant with most answers submitted

**`finalizeAnalytics(sessionId)`**
- Called when quiz ends (from `end_quiz` socket handler)
- Calls `buildAnalytics()` and persists the result into the Session document using `$set`
- Wrapped in try/catch — analytics failure never crashes the quiz end flow

---

### `analytics.routes.js`

Single route: `GET /api/v1/sessions/:sessionId/analytics`
- Requires `presenterToken` as query param or `x-presenter-token` header
- Validates token before returning data (analytics are presenter-only)
- Returns full analytics + final leaderboard combined

---

## 9. AI Module

### `ai.service.js`

The core AI orchestration layer.

**`buildPrompt(topic, difficulty, count)`**
- Constructs a structured prompt instructing the AI to return a JSON array
- Specifies exact format: `[{ text, options[4], correctIndex }]`
- Explicitly says "Return ONLY a valid JSON array" to prevent markdown wrapping

**`parseAndValidate(raw)`**
- Strips markdown code fences (` ```json `) if the AI wraps its response
- Parses JSON — throws 502 if invalid JSON
- Accepts both bare array `[...]` and `{ questions: [...] }` format
- Validates each question:
  - `text` must be a non-empty string
  - `options` must be exactly 4 items
  - `correctIndex` must be 0–3
- Returns cleaned array of validated questions

**`generateQuestions({ topic, difficulty, count, provider })`**
- Reads active provider from config (or uses override from request)
- Lazy-loads provider modules (avoids crashing at startup if API keys are missing)
- Delegates to the appropriate provider's `generate()` function

---

### `openai.provider.js`

**`generate({ topic, difficulty, count })`**
- Lazy-initializes the OpenAI client using `OPENAI_API_KEY`
- Calls `gpt-4o-mini` model with `temperature: 0.7` (balanced creativity)
- Passes the structured prompt as a user message
- Extracts the text from `response.choices[0].message.content`
- Passes raw text to `parseAndValidate()`

---

### `gemini.provider.js`

**`generate({ topic, difficulty, count })`**
- Lazy-initializes `GoogleGenerativeAI` using `GEMINI_API_KEY`
- Uses `gemini-1.5-flash` model (fast and cost-effective)
- Calls `model.generateContent(prompt)`
- Extracts text via `result.response.text()`
- Passes raw text to `parseAndValidate()`

---

### `ai.routes.js`

Single route: `POST /api/v1/ai/generate`

**Request body:**
```json
{
  "topic": "World War II",
  "difficulty": "medium",
  "count": 5,
  "provider": "openai",
  "presenterToken": "tok_pres_..."
}
```

**Logic:**
- Validates `topic` and `presenterToken` are present
- Clamps `count` between 1 and 20 (prevents abuse)
- Returns `{ questions: [...] }` — draft questions for presenter to review before adding to session

---

## 10. PPTX Module

### `pptx.service.js`

Handles PowerPoint file processing.

**`extractSlidesText(filePath)`**
- PPTX files are ZIP archives — uses `JSZip` to open the file as a ZIP
- Finds all slide XML files matching `ppt/slides/slide\d+.xml`
- Sorts slides numerically (slide1, slide2, slide3...)
- For each slide XML, extracts text from `<a:t>` tags (DrawingML text run elements)
- Strips XML tags, trims whitespace, joins text fragments with spaces
- Returns array of strings — one per slide with readable text

**`processUpload(filePath, count, difficulty, provider)`**
- Calls `extractSlidesText()` in a try/finally block
- **Always deletes the temp file** in the `finally` block — prevents disk accumulation
- Combines all slide texts into a single string: `"Slide 1: ...\n\nSlide 2: ..."`
- Passes the combined text as the `topic` to `aiService.generateQuestions()`
- The AI reads the slide content and generates relevant quiz questions

---

### `pptx.routes.js`

Single route: `POST /api/v1/pptx/upload`

**Multer configuration:**
- `dest: os.tmpdir()` — saves uploaded file to system temp directory
- `limits.fileSize: 20MB` — rejects files larger than 20MB
- `fileFilter` — only accepts `.pptx` extension, rejects all other file types

**Flow:**
1. Multer saves the file to temp storage
2. Route handler validates `presenterToken`
3. Calls `pptxService.processUpload()` with the temp file path
4. Returns `{ questions: [...] }` — AI-generated questions from slide content
5. Temp file is always cleaned up inside the service

---

## 11. Socket Module

### `socket.manager.js`

The Socket.IO initialization hub.

**`initSocket(io)`**
- Stores the `io` instance in a module-level variable `_io`
- Listens for `connection` events — fires when any client connects
- For each connected socket, registers three sets of handlers:
  - `registerSessionHandlers(io, socket)` — join, start, pause, end, disconnect
  - `registerQuestionHandlers(io, socket)` — next/prev question, timer
  - `registerAnswerHandlers(io, socket)` — submit answer, skip question
- Registers a global socket error handler
- Registers a disconnect logger

**`getIO()`**
- Returns the stored `io` instance
- Throws if called before `initSocket()` — prevents accidental use before initialization

---

### `session.handlers.js`

Manages the lifecycle of a quiz session over Socket.IO.

**Room structure:**
- `sessionCode` — all participants AND presenter join this room (broadcasts go here)
- `sessionCode:presenter` — only the presenter joins this room (host-only events go here)

**`presenter_join` event**
- Validates session exists and `presenterToken` matches
- Joins the socket to both `sessionCode` and `sessionCode:presenter` rooms
- Stores session metadata in `socket.data` for use in other handlers
- Emits `presenter_joined` back with session state
- Calls `emitParticipantList()` to send current participant list to presenter

**`join_session` event**
- Validates session and participant token
- Cancels any pending reconnect cleanup timer for this participant
- Sets `participant.isActive = true`
- Joins socket to `sessionCode` room
- Emits `session_joined` back with current session state and score

**`start_quiz` event**
- Calls `sessionService.updateSessionStatus()` to transition `waiting → active`
- Broadcasts `start_quiz` to all clients in the room

**`pause_quiz` event**
- Transitions `active → paused`
- Calls `clearActiveTimer()` to stop the countdown
- Broadcasts `quiz_paused` to all clients

**`end_quiz` event**
- Transitions to `ended`
- Clears timer
- Calls `analyticsService.finalizeAnalytics()` to persist final stats
- Gets final leaderboard snapshot
- Broadcasts `quiz_ended` with final leaderboard to all clients

**`reconnect_participant` event**
- Handles participants who disconnected and reconnected
- Cancels cleanup timer
- Re-joins socket to room
- Restores state including `remainingSeconds` from the active timer

**`disconnect` event**
- For participants: sets `isActive = false`, records `disconnectedAt`, schedules a 60-second cleanup timer, updates presenter's participant list
- For presenter: if session was active, automatically pauses it and broadcasts `quiz_paused` with reason `"Presenter disconnected."`

---

### `question.handlers.js`

Manages question flow and server-side countdown timers.

**In-memory timer state:**
```
activeTimers: Map<sessionCode, { interval, remaining, questionIndex, startedAt, totalMs }>
```
This Map lives in Node.js memory — one entry per active session. It tracks the countdown for each session independently.

**`startTimer(io, sessionCode, questionIndex, timerSeconds)`**
- Clears any existing timer for this session
- Sets `remaining = timerSeconds`
- Creates a `setInterval` that fires every 1000ms:
  - Decrements `remaining`
  - Emits `timer_tick` with `{ questionIndex, remainingSeconds }` to all clients
  - When `remaining <= 0`: clears interval, emits `timer_expired`, calls `finalizeQuestion()`
- Stores timer state in `activeTimers` Map

**`clearActiveTimer(sessionCode)`**
- Calls `clearInterval()` on the stored interval
- Removes entry from `activeTimers` Map
- Called on pause, end, next question, prev question

**`finalizeQuestion(io, sessionCode, questionIndex)`**
- Called when timer expires
- Calls `leaderboardService.computeAndBroadcast()` — computes rankings and broadcasts to all clients
- Calls `analyticsService.buildAnalytics()` — computes stats
- Emits `analytics_update` to presenter room only

**`next_question` event**
- Validates session, token, and that session is active
- Checks `nextIndex < session.questions.length` — prevents going past last question
- Clears current timer
- Increments `currentQuestionIndex`, sets `questionStartedAt = new Date()`
- Broadcasts `new_question` to all clients with question text, options, timer, difficulty
- Starts a new countdown timer

**`prev_question` event**
- Same as next but decrements index (minimum 0)
- Useful for re-showing a question

---

### `answer.handlers.js`

Handles answer submission in real-time.

**`submit_answer` event**
- Validates participant token and session
- Checks `session.status === 'active'`
- Checks timer is still running for this question index (prevents late submissions)
- Checks for duplicate answer (one answer per question per participant)
- Validates question index exists
- Calculates `elapsedMs = submittedAt - session.questionStartedAt`
- Calculates `remainingMs = max(0, totalMs - elapsedMs)`
- Calls `calculateScore(isCorrect, remainingMs, totalMs)`
- Saves answer record to `participant.answers[]`
- Updates `participant.totalScore` and `participant.totalResponseTimeMs`
- Emits `answer_result` **only to the submitting socket** (not broadcast) with: `{ isCorrect, correctIndex, scoreAwarded, totalScore }`

**`skip_question` event**
- Same validation flow as submit_answer
- Records answer with `isSkipped: true`, `scoreAwarded: 0`, `selectedIndex: null`
- Emits `answer_result` back to the player

---

## 12. Data Models

### Relationships

```
Session (1)
  ├── questions[]          ← embedded (no separate collection)
  ├── participants[]       ← references → Participant documents
  ├── leaderboardSnaps[]   ← references → Leaderboard documents
  └── analytics            ← embedded

Participant (many per Session)
  └── answers[]            ← embedded (no separate collection)

Leaderboard (many per Session, one per question)
  └── rankings[]           ← embedded snapshot
```

### Why questions are embedded in Session:
Questions are always accessed together with the session. Embedding avoids extra DB queries and keeps the data co-located. The tradeoff is a larger session document, but quiz sessions typically have 5–20 questions which is well within MongoDB's 16MB document limit.

### Why answers are embedded in Participant:
Each participant's answers are always accessed together (for scoring, summary). Embedding avoids joins and keeps answer history with the participant.

### Why Leaderboard is a separate collection:
Leaderboard snapshots grow over time (one per question) and are queried independently. Keeping them separate prevents the Session document from growing unboundedly.

---

## 13. Scoring Logic

**File:** `backend/src/session/answer.service.js`

```
BASE_POINTS = 100
MAX_SPEED_BONUS = 50

Score = BASE_POINTS + (remainingMs / totalMs) * MAX_SPEED_BONUS
```

**Examples:**
- Correct answer with 30s remaining out of 30s total: `100 + (30000/30000) * 50 = 150 points`
- Correct answer with 15s remaining out of 30s total: `100 + (15000/30000) * 50 = 125 points`
- Correct answer with 0s remaining: `100 + 0 = 100 points`
- Wrong answer: `0 points`
- Skipped: `0 points`

**Leaderboard tiebreaker:**
When two participants have the same `totalScore`, the one with lower `totalResponseTimeMs` ranks higher (faster overall = better rank).

**Score range per question:** 100–150 points (if answered correctly)
