'use strict';

const Leaderboard = require('./leaderboard.model');
const Participant = require('../user/participant.model');
const Session = require('../session/session.model');

async function computeAndBroadcast(io, sessionCode, questionIndex) {
  const session = await Session.findOne({ sessionCode });
  if (!session) return [];

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

  try {
    const snap = await Leaderboard.create({ sessionId: session._id, questionIndex, rankings });
    session.leaderboardSnaps.push(snap._id);
    await session.save();
  } catch (err) {
    console.error('[Leaderboard] Failed to persist snapshot:', err.message);
  }

  io.to(sessionCode).emit('leaderboard_update', { rankings });
  return rankings;
}

async function getLatestSnapshot(sessionId) {
  return Leaderboard.findOne({ sessionId }).sort({ createdAt: -1 });
}

async function getParticipantRank(sessionId, participantId) {
  const snap = await getLatestSnapshot(sessionId);
  if (!snap) return 0;
  const entry = snap.rankings.find(
    (r) => r.participantId && r.participantId.toString() === participantId.toString()
  );
  return entry ? entry.rank : 0;
}

module.exports = { computeAndBroadcast, getLatestSnapshot, getParticipantRank };
