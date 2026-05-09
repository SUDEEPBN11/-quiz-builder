'use strict';

const Session = require('../session/session.model');
const { validatePresenterToken } = require('../session/session.service');

/**
 * Validate question data shape.
 */
function validateQuestionData(data) {
  const { text, options, correctIndex, difficulty, timerSeconds } = data;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    const err = new Error('Question text is required.');
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(options) || options.length !== 4) {
    const err = new Error('A question must have exactly 4 options.');
    err.statusCode = 400;
    throw err;
  }

  for (let i = 0; i < options.length; i++) {
    if (!options[i] || typeof options[i] !== 'string' || options[i].trim().length === 0) {
      const err = new Error(`Option ${i + 1} must not be empty.`);
      err.statusCode = 400;
      throw err;
    }
  }

  if (correctIndex === undefined || correctIndex === null || correctIndex < 0 || correctIndex > 3) {
    const err = new Error('correctIndex must be between 0 and 3.');
    err.statusCode = 400;
    throw err;
  }

  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    const err = new Error('difficulty must be one of: easy, medium, hard.');
    err.statusCode = 400;
    throw err;
  }

  const timer = timerSeconds !== undefined ? timerSeconds : 30;
  if (timer < 5 || timer > 120) {
    const err = new Error('timerSeconds must be between 5 and 120.');
    err.statusCode = 400;
    throw err;
  }

  return {
    text: text.trim(),
    options: options.map((o) => o.trim()),
    correctIndex: Number(correctIndex),
    difficulty: difficulty || 'medium',
    timerSeconds: Number(timer),
  };
}

/**
 * Add a question to a session's question bank.
 */
async function addQuestion(sessionId, presenterToken, questionData) {
  const session = await validatePresenterToken(sessionId, presenterToken);
  const validated = validateQuestionData(questionData);
  session.questions.push(validated);
  await session.save();
  return session;
}

/**
 * Edit an existing question by index.
 */
async function editQuestion(sessionId, presenterToken, index, questionData) {
  const session = await validatePresenterToken(sessionId, presenterToken);

  const idx = Number(index);
  if (idx < 0 || idx >= session.questions.length) {
    const err = new Error(`Question index ${idx} is out of range.`);
    err.statusCode = 404;
    throw err;
  }

  const validated = validateQuestionData(questionData);
  session.questions[idx] = { ...session.questions[idx].toObject(), ...validated };
  session.markModified('questions');
  await session.save();
  return session;
}

/**
 * Remove a question by index and reorder remaining questions.
 */
async function removeQuestion(sessionId, presenterToken, index) {
  const session = await validatePresenterToken(sessionId, presenterToken);

  const idx = Number(index);
  if (idx < 0 || idx >= session.questions.length) {
    const err = new Error(`Question index ${idx} is out of range.`);
    err.statusCode = 404;
    throw err;
  }

  session.questions.splice(idx, 1);
  session.markModified('questions');
  await session.save();
  return session;
}

module.exports = { addQuestion, editQuestion, removeQuestion, validateQuestionData };
