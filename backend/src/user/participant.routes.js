'use strict';

const router = require('express').Router();
const controller = require('./participant.controller');

// Join a session
router.post('/sessions/:code/join', controller.joinSession);

// REST fallback for answer submission
router.post('/sessions/:sessionId/answers', controller.submitAnswerREST);

// Participant post-session summary
router.get('/sessions/:sessionId/participants/:participantId/summary', controller.getParticipantSummary);

module.exports = router;
