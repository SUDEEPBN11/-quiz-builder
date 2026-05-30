'use strict';

function getActiveProvider() {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (!['openai', 'gemini', 'groq'].includes(provider)) {
    console.warn(`[AI Config] Unknown AI_PROVIDER "${provider}", falling back to "openai".`);
    return 'openai';
  }
  return provider;
}

module.exports = { getActiveProvider };
