'use strict';

const Leaderboard = require('./leaderboard.model');
const Participant = require('../user/participant.model');
const Session = require('../session/session.model');

/**
 * Compute the current leaderboard, persist a snapshot, and broadcast to all
 * clients in the session room.
 *
 * @param {import('socket.io').Server} io
 * @param {string} sessionCode
 * @param {number} questionIndex
 * @returns {Promise<Array>} rankings array
 */
async function computeAndBroadcast(io, sessionCode, questionIndex) {
  const session = await Session.findOne({ sessionCode });
  if (!session) return [];

  // Sort: highest score first, then lowest total response time
  const participants = await Participant.find({ sessionId: session._id }).sort({
    totalScore: -1,
    totalResponseTimeMs: 1,
  });

  const rankings = participants.map((p, i) => ({
    rank: i + 1,
    participantId: p._id,
    displayName: p.displayName,
    totalScore: p.totalScore,
    totalResponseTimeMs: p.totalResponseTimeMs,
    isActive: p.isActive,
  }));

  // Persist snapshot
  try {
    const snap = await Leaderboard.create({
      sessionId: session._id,
      questionIndex,
      rankings,
    });
    session.leaderboardSnaps.push(snap._id);
    await session.save();
  } catch (err) {
    console.error('[Leaderboard] Failed to persist snapshot:', err.message);
  }

  // Broadcast to all clients in the session room
  io.to(sessionCode).emit('leaderboard_update', { rankings });

  return rankings;
}

/**
 * Get the latest leaderboard snapshot for a session.
 * @param {string} sessionId
 * @returns {Promise<Leaderboard|null>}
 */
async function getLatestSnapshot(sessionId) {
  return Leaderboard.findOne({ sessionId }).sort({ createdAt: -1 });
}

/**
 * Get a participant's rank from the latest leaderboard snapshot.
 * @param {string} sessionId
 * @param {string} participantId
 * @returns {Promise<number>} rank (1-based), or 0 if not found
 */
async function getParticipantRank(sessionId, participantId) {
  const snap = await getLatestSnapshot(sessionId);
  if (!snap) return 0;
  const entry = snap.rankings.find(
    (r) => r.participantId && r.participantId.toString() === participantId.toString()
  );
  return entry ? entry.rank : 0;
}

module.exports = { computeAndBroadcast, getLatestSnapshot, getParticipantRank };
