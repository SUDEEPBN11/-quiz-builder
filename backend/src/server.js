'use strict';

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socket.manager');
const errorHandler = require('./middleware/errorHandler');

// ─── Route imports ─────────────────────────────────────────────────────────
const sessionRoutes = require('./session/session.routes');
const participantRoutes = require('./user/participant.routes');
const questionRoutes = require('./question/question.routes');
const leaderboardRoutes = require('./leaderboard/leaderboard.routes');
const analyticsRoutes = require('./analytics/analytics.routes');
const aiRoutes = require('./ai/ai.routes');
const pptxRoutes = require('./pptx/pptx.routes');

// ─── App setup ─────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── REST Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1', participantRoutes);
app.use('/api/v1/sessions/:sessionId/questions', questionRoutes);
app.use('/api/v1/sessions/:sessionId/leaderboard', leaderboardRoutes);
app.use('/api/v1/sessions/:sessionId/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/pptx', pptxRoutes);

// ─── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
});

// ─── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

// ─── Socket.IO ──────────────────────────────────────────────────────────────
initSocket(io);

// ─── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Socket.IO ready`);
    console.log(`[Server] AI provider: ${process.env.AI_PROVIDER || 'openai'}`);
  });
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err.message);
  process.exit(1);
});

module.exports = { app, httpServer };
