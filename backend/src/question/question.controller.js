'use strict';

const questionService = require('./question.service');

async function addQuestion(req, res, next) {
  try {
    const { presenterToken, ...questionData } = req.body;
    if (!presenterToken) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'presenterToken is required.' } });
    }
    const session = await questionService.addQuestion(req.params.sessionId, presenterToken, questionData);
    res.status(201).json({ questions: session.questions });
  } catch (err) {
    next(err);
  }
}

async function editQuestion(req, res, next) {
  try {
    const { presenterToken, ...questionData } = req.body;
    if (!presenterToken) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'presenterToken is required.' } });
    }
    const session = await questionService.editQuestion(req.params.sessionId, presenterToken, req.params.index, questionData);
    res.json({ questions: session.questions });
  } catch (err) {
    next(err);
  }
}

async function removeQuestion(req, res, next) {
  try {
    const presenterToken = req.body.presenterToken || req.query.presenterToken;
    if (!presenterToken) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'presenterToken is required.' } });
    }
    const session = await questionService.removeQuestion(req.params.sessionId, presenterToken, req.params.index);
    res.json({ questions: session.questions });
  } catch (err) {
    next(err);
  }
}

module.exports = { addQuestion, editQuestion, removeQuestion };
