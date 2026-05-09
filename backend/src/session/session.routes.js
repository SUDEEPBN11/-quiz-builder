'use strict';

const router = require('express').Router();
const controller = require('./session.controller');

router.post('/', controller.createSession);
router.get('/:code', controller.getSession);
router.patch('/:sessionId/status', controller.updateStatus);

module.exports = router;
