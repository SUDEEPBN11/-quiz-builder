'use strict';

const router = require('express').Router();
const aiService = require('./ai.service');

router.post('/generate', async (req, res, next) => {
  try {
    const { topic, difficulty, count, provider, presenterToken } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'topic is required.' } });
    }
    if (!presenterToken) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'presenterToken is required.' } });
    }

    const parsedCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20);

    const questions = await aiService.generateQuestions({
      topic: topic.trim(),
      difficulty: difficulty || 'medium',
      count: parsedCount,
      provider,
    });

    res.json({ questions });
  } catch (err) {
    if (err.statusCode === 502) {
      return res.status(502).json({ error: { code: 'AI_ERROR', message: err.message } });
    }
    next(err);
  }
});

module.exports = router;
