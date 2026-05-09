'use strict';

const Session = require('../session/session.model');
const leaderboardService = require('../leaderboard/leaderboard.service');
const analyticsService = require('../analytics/analytics.service');

// In-memory timer state: sessionCode → { interval, remaining, questionIndex, startedAt, totalMs }
const activeTimers = new Map();

/**
 * Clear and remove the active timer for a session.
 * @param {string} sessionCode
 */
function clearActiveTimer(sessionCode) {
  const state = activeTimers.get(sessionCode);
  if (state) {
    clearInterval(state.interval);
    activeTimers.delete(sessionCode);
  }
}

/**
 * Called when a question's timer expires or all participants have answered.
 * Computes leaderboard and pushes analytics to presenter.
 */
async function finalizeQuestion(io, sessionCode, questionIndex) {
  try {
    const session = await Session.findOne({ sessionCode });
    if (!session) return;

    const rankings = await leaderboardService.computeAndBroadcast(io, sessionCode, questionIndex);
    const analytics = await analyticsService.buildAnalytics(session._id);
    io.to(`${sessionCode}:presenter`).emit('analytics_update', analytics);
  } catch (err) {
    console.error('[Socket] finalizeQuestion error:', err.message);
  }
}

/**
 * Start a server-side countdown timer for a question.
 * Emits timer_tick every second and timer_expired when done.
 *
 * @param {import('socket.io').Server} io
 * @param {string} sessionCode
 * @param {number} questionIndex
 * @param {number} timerSeconds
 */
function startTimer(io, sessionCode, questionIndex, timerSeconds) {
  clearActiveTimer(sessionCode);

  let remaining = timerSeconds;
  const startedAt = Date.now();
  const totalMs = timerSeconds * 1000;

  const interval = setInterval(async () => {
    remaining--;
    io.to(sessionCode).emit('timer_tick', { questionIndex, remainingSeconds: remaining });

    if (remaining <= 0) {
      clearActiveTimer(sessionCode);
      io.to(sessionCode).emit('timer_expired', { questionIndex });
      await finalizeQuestion(io, sessionCode, questionIndex);
    }
  }, 1000);

  activeTimers.set(sessionCode, { interval, remaining, questionIndex, startedAt, totalMs });
}

/**
 * Register question flow Socket.IO event handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerQuestionHandlers(io, socket) {
  // ─── Next question ─────────────────────────────────────────────────────────
  socket.on('next_question', async ({ sessionCode, presenterToken }) => {
    try {
      const code = sessionCode?.toUpperCase();
      const session = await Session.findOne({ sessionCode: code });
      if (!session) return socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });
      if (session.presenterToken !== presenterToken)
        return socket.emit('error', { code: 'INVALID_TOKEN', message: 'Invalid presenter token.' });
      if (session.status !== 'active')
        return socket.emit('error', { code: 'SESSION_NOT_ACTIVE', message: 'Session is not active.' });

      const nextIndex = session.currentQuestionIndex + 1;
      if (nextIndex >= session.questions.length) {
        return socket.emit('error', { code: 'NO_MORE_QUESTIONS', message: 'No more questions.' });
      }

      clearActiveTimer(code);

      session.currentQuestionIndex = nextIndex;
      session.questionStartedAt = new Date();
      await session.save();

      const question = session.questions[nextIndex];
      io.to(code).emit('new_question', {
        questionIndex: nextIndex,
        totalQuestions: session.questions.length,
        text: question.text,
        options: question.options,
        timerSeconds: question.timerSeconds,
        difficulty: question.difficulty,
      });

      startTimer(io, code, nextIndex, question.timerSeconds);
    } catch (err) {
      console.error('[Socket] next_question error:', err.message);
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // ─── Previous question ─────────────────────────────────────────────────────
  socket.on('prev_question', async ({ sessionCode, presenterToken }) => {
    try {
      const code = sessionCode?.toUpperCase();
      const session = await Session.findOne({ sessionCode: code });
      if (!session) return socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });
      if (session.presenterToken !== presenterToken)
        return socket.emit('error', { code: 'INVALID_TOKEN', message: 'Invalid presenter token.' });

      const prevIndex = Math.max(0, session.currentQuestionIndex - 1);
      clearActiveTimer(code);

      session.currentQuestionIndex = prevIndex;
      session.questionStartedAt = new Date();
      await session.save();

      const question = session.questions[prevIndex];
      io.to(code).emit('new_question', {
        questionIndex: prevIndex,
        totalQuestions: session.questions.length,
        text: question.text,
        options: question.options,
        timerSeconds: question.timerSeconds,
        difficulty: question.difficulty,
      });

      startTimer(io, code, prevIndex, question.timerSeconds);
    } catch (err) {
      console.error('[Socket] prev_question error:', err.message);
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });
}

module.exports = {
  registerQuestionHandlers,
  startTimer,
  clearActiveTimer,
  finalizeQuestion,
  activeTimers,
};
