'use strict';

const leaderboardService = require('./leaderboard.service');
const sessionService = require('../session/session.service');

async function getLatestLeaderboard(req, res, next) {
  try {
    const session = await sessionService.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found.' } });

    const snap = await leaderboardService.getLatestSnapshot(session._id);
    res.json({ rankings: snap?.rankings || [] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLatestLeaderboard };
