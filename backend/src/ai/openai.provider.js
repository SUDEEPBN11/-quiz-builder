'use strict';

const { buildPrompt, parseAndValidate } = require('./ai.service');

let _client = null;

function getClient() {
  if (!_client) {
    const { OpenAI } = require('openai');
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/**
 * Generate quiz questions using OpenAI GPT-4o-mini.
 * @param {{ topic: string, difficulty: string, count: number }} params
 * @returns {Promise<Array>}
 */
async function generate({ topic, difficulty, count }) {
  const client = getClient();
  const prompt = buildPrompt(topic, difficulty, count);

  let response;
  try {
    response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
  } catch (err) {
    const error = new Error(`OpenAI API error: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }

  const raw = response.choices[0]?.message?.content || '';
  return parseAndValidate(raw);
}

module.exports = { generate };
