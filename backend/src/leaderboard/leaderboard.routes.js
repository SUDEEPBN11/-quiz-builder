'use strict';

const router = require('express').Router({ mergeParams: true });
const controller = require('./leaderboard.controller');

router.get('/', controller.getLatestLeaderboard);

module.exports = router;
