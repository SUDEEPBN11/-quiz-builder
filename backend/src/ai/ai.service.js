'use strict';

const { getActiveProvider } = require('../config/ai');

// Lazy-load providers to avoid crashing if API keys are missing at startup
let _providers = null;

function getProviders() {
  if (!_providers) {
    _providers = {
      openai: require('./openai.provider'),
      gemini: require('./gemini.provider'),
    };
  }
  return _providers;
}

/**
 * Build the structured prompt sent to the AI provider.
 * @param {string} topic
 * @param {string} difficulty  - 'easy' | 'medium' | 'hard'
 * @param {number} count
 * @returns {string}
 */
function buildPrompt(topic, difficulty, count) {
  return `Generate ${count} multiple-choice quiz questions about the following topic at ${difficulty} difficulty level.

Topic: ${topic}

Requirements:
- Each question must have exactly 4 answer options.
- Exactly one option must be correct.
- Questions should be clear, unambiguous, and appropriate for the difficulty level.

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {
    "text": "<question text>",
    "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
    "correctIndex": <integer 0-3>
  }
]`;
}

/**
 * Parse and validate the raw string response from an AI provider.
 * @param {string} raw
 * @returns {Array<{ text: string, options: string[], correctIndex: number }>}
 */
function parseAndValidate(raw) {
  let parsed;
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    const err = new Error('AI provider returned invalid JSON. Please try again.');
    err.statusCode = 502;
    throw err;
  }

  // Accept both a bare array and { questions: [...] }
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;

  if (!Array.isArray(questions)) {
    const err = new Error('AI response is missing the questions array.');
    err.statusCode = 502;
    throw err;
  }

  return questions.map((q, i) => {
    if (!q.text || typeof q.text !== 'string' || q.text.trim().length === 0) {
      const err = new Error(`Question at index ${i} is missing "text".`);
      err.statusCode = 502;
      throw err;
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      const err = new Error(`Question at index ${i} must have exactly 4 options.`);
      err.statusCode = 502;
      throw err;
    }
    if (q.correctIndex === undefined || q.correctIndex === null || q.correctIndex < 0 || q.correctIndex > 3) {
      const err = new Error(`Question at index ${i} has an invalid "correctIndex".`);
      err.statusCode = 502;
      throw err;
    }
    return {
      text: q.text.trim(),
      options: q.options.map((o) => String(o).trim()),
      correctIndex: Number(q.correctIndex),
    };
  });
}

/**
 * Generate quiz questions using the configured AI provider.
 * @param {{ topic: string, difficulty: string, count: number, provider?: string }} params
 * @returns {Promise<Array>}
 */
async function generateQuestions({ topic, difficulty = 'medium', count = 5, provider }) {
  const providerName = provider || getActiveProvider();
  const providers = getProviders();
  const impl = providers[providerName];

  if (!impl) {
    const err = new Error(`Unknown AI provider: "${providerName}". Valid options: openai, gemini.`);
    err.statusCode = 400;
    throw err;
  }

  return impl.generate({ topic, difficulty, count });
}

module.exports = { generateQuestions, buildPrompt, parseAndValidate };
