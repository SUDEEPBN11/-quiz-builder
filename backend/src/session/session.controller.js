'use strict';

const sessionService = require('./session.service');

async function createSession(req, res, next) {
  try {
    const { presenterName } = req.body;
    const session = await sessionService.createSession(presenterName || 'Presenter');
    res.status(201).json({
      sessionId: session._id,
      sessionCode: session.sessionCode,
      presenterToken: session.presenterToken,
      presenterName: session.presenterName,
    });
  } catch (err) {
    next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await sessionService.getSessionByCode(req.params.code);
    if (!session) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found.' } });
    }
    res.json({
      sessionId: session._id,
      sessionCode: session.sessionCode,
      status: session.status,
      questionCount: session.questions.length,
      currentQuestionIndex: session.currentQuestionIndex,
      presenterName: session.presenterName,
    });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, presenterToken } = req.body;
    if (!status || !presenterToken) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'status and presenterToken are required.' },
      });
    }
    const session = await sessionService.updateSessionStatus(req.params.sessionId, status, presenterToken);
    res.json({ sessionId: session._id, status: session.status });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSession, getSession, updateStatus };
