// config/openai.js
// Centralized OpenAI client — gracefully skips init if key is not yet set.

const OpenAI = require('openai');

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Defer instantiation so missing key at load time doesn't crash the server.
let _client = null;

function getOpenAIClient() {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.startsWith('sk-your')) {
      throw new Error('OpenAI API key is not configured. Add OPENAI_API_KEY to your .env file.');
    }
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

module.exports = { getOpenAIClient, AI_MODEL };
