'use strict';

const { buildPrompt, parseAndValidate } = require('./ai.service');

let _client = null;

function getClient() {
  if (!_client) {
    const Groq = require('groq-sdk');
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}

async function generate({ topic, difficulty, count }) {
  const client = getClient();
  const prompt = buildPrompt(topic, difficulty, count);

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a quiz question generator. Always respond with valid JSON only, no markdown, no extra text.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });
  } catch (err) {
    const error = new Error(`Groq API error: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }

  const raw = completion.choices[0]?.message?.content || '';
  return parseAndValidate(raw);
}

module.exports = { generate };
