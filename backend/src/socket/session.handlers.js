'use strict';

const Session = require('../session/session.model');
const Participant = require('../user/participant.model');
const sessionService = require('../session/session.service');
const participantService = require('../user/participant.service');
const analyticsService = require('../analytics/analytics.service');
const { clearActiveTimer } = require('./question.handlers');

// Map of participantToken → cleanup setTimeout handle (60s reconnect window)
const reconnectTimers = new Map();

/**
 * Emit the current participant list to the presenter room.
 */
async function emitParticipantList(io, sessionCode, sessionId) {
  const participants = await Participant.find({ sessionId });
  io.to(`${sessionCode}:presenter`).emit('participant_list_update', {
    participants: participants.map((p) => ({
      id: p._id,
      displayName: p.displayName,
      isActive: p.isActive,
      totalScore: p.totalScore,
    })),
  });
}

/**
 * Register all session-level Socket.IO event handlers on a socket.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerSessionHandlers(io, socket) {
  // ─── Presenter joins their control room ───────────────────────────────────
  socket.on('presenter_join', async ({ sessionCode, presenterToken }) => {
    try {
      const session = await Session.findOne({ sessionCode: sessionCode?.toUpperCase() });
      if (!session) return socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });
      if (session.presenterToken !== presenterToken)
        return socket.emit('error', { code: 'INVALID_TOKEN', message: 'Invalid presenter token.' });

      socket.join(sessionCode.toUpperCase());
      socket.join(`${sessionCode.toUpperCase()}:presenter`);
      socket.data.role = 'presenter';
      socket.data.sessionCode = sessionCode.toUpperCase();
      socket.data.presenterToken = presenterToken;
      socket.data.sessionId = session._id.toString();

      socket.emit('presenter_joined', {
        sessionCode: session.sessionCode,
        status: session.status,
        questionCount: session.questions.length,
        currentQuestionIndex: session.currentQuestionIndex,
      });

      await emitParticipantList(io, session.sessionCode, session._id);
    } catch (err) {
      console.error('[Socket] presenter_join error:', err.message);
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // ─── Participant joins the session room ────────────────────────────────────
  socket.on('join_session', async ({ sessionCode, participantToken, displayName }) => {
    try {
      const code = sessionCode?.toUpperCase();
      const session = await Session.findOne({ sessionCode: code });
      if (!session) return socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });

      let participant = await Participant.findOne({ participantToken });

      // New participant joining for the first time via socket (token already created via REST)
      if (!participant) {
        return socket.emit('error', { code: 'INVALID_TOKEN', message: 'Invalid participant token. Please join via the join page.' });
      }

      // Cancel any pending cleanup timer for this participant
      if (reconnectTimers.has(participantToken)) {
        clearTimeout(reconnectTimers.get(participantToken));
        reconnectTimers.delete(participantToken);
      }

      // Mark active and join room
      participant.isActive = true;
      participant.disconnectedAt = null;
      await participant.save();

      socket.join(code);
      socket.data.role = 'participant';
      socket.data.sessionCode = code;
      socket.data.participantToken = participantToken;
      socket.data.participantId = participant._id.toString();
      socket.data.sessionId = session._id.toString();

      socket.emit('session_joined', {
        participantId: participant._id,
        sessionCode: code,
        currentStatus: session.status,
        totalScore: participant.totalScore,
        currentQuestionIndex: session.currentQuestionIndex,
      });

      await emitParticipantList(io, code, session._id);
    } catch (err) {
      console.error('[Socket] join_session error:', err.message);
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // ─── Start quiz ────────────────────────────────────────────────────────────
  socket.on('start_quiz', async ({ sessionCode, presenterToken }) => {
    try {
      const code = sessionCode?.toUpperCase();
      const session = await sessionService.updateSessionStatus(
        socket.data.sessionId || (await Session.findOne({ sessionCode: code }))?._id,
        'active',
        presenterToken
      );
      io.to(code).emit('start_quiz', { totalQuestions: session.questions.length });
    } catch (err) {
      console.error('[Socket] start_quiz error:', err.message);
      socket.emit('error', { code: 'START_FAILED', message: err.message });
    }
  });

  // ─── Pause quiz ────────────────────────────────────────────────────────────
  socket.on('pause_quiz', async ({ sessionCode, presenterToken }) => {
    try {
      const code = sessionCode?.toUpperCase();
      await sessionService.updateSessionStatus(
        socket.data.sessionId,
        'paused',
        presenterToken
      );
      clearActiveTimer(code);
      io.to(code).emit('quiz_paused', {});
    } catch (err) {
      console.error('[Socket] pause_quiz error:', err.message);
      socket.emit('error', { code: 'PAUSE_FAILED', message: err.message });
    }
  });

  // ─── End quiz ──────────────────────────────────────────────────────────────
  socket.on('end_quiz', async ({ sessionCode, presenterToken }) => {
    try {
      const code = sessionCode?.toUpperCase();
      const session = await sessionService.updateSessionStatus(
        socket.data.sessionId,
        'ended',
        presenterToken
      );
      clearActiveTimer(code);
      await analyticsService.finalizeAnalytics(session._id);

      const { getLatestSnapshot } = require('../leaderboard/leaderboard.service');
      const finalSnap = await getLatestSnapshot(session._id);
      io.to(code).emit('quiz_ended', { finalLeaderboard: finalSnap?.rankings || [] });
    } catch (err) {
      console.error('[Socket] end_quiz error:', err.message);
      socket.emit('error', { code: 'END_FAILED', message: err.message });
    }
  });

  // ─── Reconnect participant ─────────────────────────────────────────────────
  socket.on('reconnect_participant', async ({ sessionCode, participantToken }) => {
    try {
      const code = sessionCode?.toUpperCase();
      const participant = await Participant.findOne({ participantToken });
      if (!participant) return socket.emit('error', { code: 'INVALID_TOKEN', message: 'Invalid participant token.' });

      const session = await Session.findById(participant.sessionId);
      if (!session) return socket.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found.' });

      // Cancel cleanup timer
      if (reconnectTimers.has(participantToken)) {
        clearTimeout(reconnectTimers.get(participantToken));
        reconnectTimers.delete(participantToken);
      }

      participant.isActive = true;
      participant.disconnectedAt = null;
      await participant.save();

      socket.join(code);
      socket.data.role = 'participant';
      socket.data.sessionCode = code;
      socket.data.participantToken = participantToken;
      socket.data.participantId = participant._id.toString();
      socket.data.sessionId = session._id.toString();

      // Restore current state
      const { activeTimers } = require('./question.handlers');
      const timerState = activeTimers.get(code);

      socket.emit('session_joined', {
        participantId: participant._id,
        sessionCode: code,
        currentStatus: session.status,
        totalScore: participant.totalScore,
        currentQuestionIndex: session.currentQuestionIndex,
        remainingSeconds: timerState ? timerState.remaining : 0,
      });

      await emitParticipantList(io, code, session._id);
    } catch (err) {
      console.error('[Socket] reconnect_participant error:', err.message);
      socket.emit('error', { code: 'RECONNECT_FAILED', message: err.message });
    }
  });

  // ─── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    try {
      const { role, participantToken, sessionCode, sessionId, presenterToken } = socket.data;

      if (role === 'participant' && participantToken) {
        const participant = await Participant.findOne({ participantToken });
        if (participant) {
          participant.isActive = false;
          participant.disconnectedAt = new Date();
          await participant.save();

          // Schedule cleanup after 60s
          const timer = setTimeout(async () => {
            reconnectTimers.delete(participantToken);
            // Participant stays in DB but remains inactive
          }, 60_000);
          reconnectTimers.set(participantToken, timer);

          if (sessionCode && sessionId) {
            await emitParticipantList(io, sessionCode, sessionId);
          }
        }
      }

      if (role === 'presenter' && sessionCode && presenterToken) {
        // Pause session on presenter disconnect
        try {
          const session = await Session.findOne({ sessionCode });
          if (session && session.status === 'active') {
            await sessionService.updateSessionStatus(session._id, 'paused', presenterToken);
            clearActiveTimer(sessionCode);
            io.to(sessionCode).emit('quiz_paused', { reason: 'Presenter disconnected.' });
          }
        } catch (e) {
          console.warn('[Socket] Could not pause on presenter disconnect:', e.message);
        }
      }
    } catch (err) {
      console.error('[Socket] disconnect handler error:', err.message);
    }
  });
}

module.exports = { registerSessionHandlers, emitParticipantList, reconnectTimers };
