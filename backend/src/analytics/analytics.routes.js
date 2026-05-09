'use strict';

const router = require('express').Router({ mergeParams: true });
const analyticsService = require('./analytics.service');
const sessionService = require('../session/session.service');
const leaderboardService = require('../leaderboard/leaderboard.service');

router.get('/', async (req, res, next) => {
  try {
    const presenterToken = req.query.presenterToken || req.headers['x-presenter-token'];
    const session = await sessionService.validatePresenterToken(req.params.sessionId, presenterToken);

    const analytics = await analyticsService.buildAnalytics(session._id);
    const finalLeaderboard = await leaderboardService.getLatestSnapshot(session._id);

    res.json({
      ...analytics,
      finalLeaderboard: finalLeaderboard?.rankings || [],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
