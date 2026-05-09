'use strict';

const { buildPrompt, parseAndValidate } = require('./ai.service');

let _genAI = null;

function getClient() {
  if (!_genAI) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

/**
 * Generate quiz questions using Google Gemini 1.5 Flash.
 * @param {{ topic: string, difficulty: string, count: number }} params
 * @returns {Promise<Array>}
 */
async function generate({ topic, difficulty, count }) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = buildPrompt(topic, difficulty, count);

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err) {
    const error = new Error(`Gemini API error: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }

  const raw = result.response.text();
  return parseAndValidate(raw);
}

module.exports = { generate };
