'use strict';

/**
 * Returns the active AI provider name.
 * Defaults to 'openai' if AI_PROVIDER env var is not set.
 * Valid values: 'openai' | 'gemini'
 */
function getActiveProvider() {
  const provider = process.env.AI_PROVIDER || 'openai';
  if (!['openai', 'gemini'].includes(provider)) {
    console.warn(`[AI Config] Unknown AI_PROVIDER "${provider}", falling back to "openai".`);
    return 'openai';
  }
  return provider;
}

module.exports = { getActiveProvider };
