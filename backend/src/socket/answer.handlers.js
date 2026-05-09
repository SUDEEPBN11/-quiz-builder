'use strict';

const Participant = require('../user/participant.model');
const Session = require('../session/session.model');
const { calculateScore } = require('../session/answer.service');
const { activeTimers } = require('./question.handlers');

/**
 * Register answer submission Socket.IO event handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerAnswerHandlers(io, socket) {
  // ─── Submit answer ─────────────────────────────────────────────────────────
  socket.on('submit_answer', async ({ sessionCode, participantToken, questionIndex, selectedIndex }) => {
    try {
      const code = sessionCode?.toUpperCase();

      // Validate participant
      const participant = await Participant.findOne({ participantToken });
      if (!participant) return socket.emit('error', { code: 'INVALID_TOKEN', message: 'Invalid participant token.' });

      // Validate session
      const session = await Session.findOne({ sessionCode: code });
      if (!session) return socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });
      if (session.status !== 'active') return socket.emit('error', { code: 'SESSION_NOT_ACTIVE', message: 'Session is not active.' });

      // Check timer is still running
      const timerState = activeTimers.get(code);
      if (!timerState || timerState.questionIndex !== questionIndex) {
        return socket.emit('error', { code: 'TIMER_EXPIRED', message: 'Time is up for this question.' });
      }

      // Check for duplicate submission
      const alreadyAnswered = participant.answers.some(
        (a) => a.questionIndex === questionIndex
      );
      if (alreadyAnswered) {
        return socket.emit('error', { code: 'DUPLICATE_ANSWER', message: 'You have already answered this question.' });
      }

      // Validate question index
      const question = session.questions[questionIndex];
      if (!question) return socket.emit('error', { code: 'INVALID_QUESTION', message: 'Invalid question index.' });

      // Calculate timing
      const submittedAt = new Date();
      const elapsedMs = submittedAt.getTime() - session.questionStartedAt.getTime();
      const totalMs = question.timerSeconds * 1000;
      const remainingMs = Math.max(0, totalMs - elapsedMs);
      const responseTimeMs = elapsedMs;

      // Score
      const isCorrect = Number(selectedIndex) === question.correctIndex;
      const scoreAwarded = calculateScore(isCorrect, remainingMs, totalMs);

      // Persist answer
      participant.answers.push({
        questionIndex,
        selectedIndex: Number(selectedIndex),
        isCorrect,
        isSkipped: false,
        responseTimeMs,
        scoreAwarded,
        submittedAt,
      });
      participant.totalScore += scoreAwarded;
      participant.totalResponseTimeMs += responseTimeMs;
      await participant.save();

      // Respond to submitting participant
      socket.emit('answer_result', {
        questionIndex,
        isCorrect,
        correctIndex: question.correctIndex,
        scoreAwarded,
        totalScore: participant.totalScore,
      });
    } catch (err) {
      console.error('[Socket] submit_answer error:', err.message);
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // ─── Skip question ─────────────────────────────────────────────────────────
  socket.on('skip_question', async ({ sessionCode, participantToken, questionIndex }) => {
    try {
      const code = sessionCode?.toUpperCase();

      const participant = await Participant.findOne({ participantToken });
      if (!participant) return socket.emit('error', { code: 'INVALID_TOKEN', message: 'Invalid participant token.' });

      const session = await Session.findOne({ sessionCode: code });
      if (!session) return socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });
      if (session.status !== 'active') return socket.emit('error', { code: 'SESSION_NOT_ACTIVE', message: 'Session is not active.' });

      // Check for duplicate
      const alreadyAnswered = participant.answers.some(
        (a) => a.questionIndex === questionIndex
      );
      if (alreadyAnswered) {
        return socket.emit('error', { code: 'DUPLICATE_ANSWER', message: 'You have already responded to this question.' });
      }

      const submittedAt = new Date();
      const responseTimeMs = session.questionStartedAt
        ? submittedAt.getTime() - session.questionStartedAt.getTime()
        : 0;

      participant.answers.push({
        questionIndex,
        selectedIndex: null,
        isCorrect: false,
        isSkipped: true,
        responseTimeMs,
        scoreAwarded: 0,
        submittedAt,
      });
      await participant.save();

      socket.emit('answer_result', {
        questionIndex,
        isCorrect: false,
        isSkipped: true,
        scoreAwarded: 0,
        totalScore: participant.totalScore,
      });
    } catch (err) {
      console.error('[Socket] skip_question error:', err.message);
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });
}

module.exports = { registerAnswerHandlers };
