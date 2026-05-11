/**
 * Configuration Management
 * Loads environment variables from .env and provides typed access
 */

import dotenv from 'dotenv';

// Load .env file
dotenv.config();

/**
 * Configuration object with environment variables and defaults
 */
export const config = {
  // Server
  port: parseInt(process.env.PORT || '4443', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Gemini API
  geminiApiKey: process.env.GOOGLE_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map(o => o.trim()),

  // Timeout
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Default Generation Config (per JSON-SCHEMA.md)
  generation: {
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '1.0'),
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192', 10),
    topP: parseFloat(process.env.GEMINI_TOP_P || '0.95'),
    topK: parseInt(process.env.GEMINI_TOP_K || '40', 10),
    candidateCount: parseInt(process.env.GEMINI_CANDIDATE_COUNT || '1', 10),
    stopSequences: process.env.GEMINI_STOP_SEQUENCES
      ? JSON.parse(process.env.GEMINI_STOP_SEQUENCES)
      : undefined,
    responseMimeType: process.env.GEMINI_RESPONSE_MIME_TYPE || 'text/plain',
    systemInstruction: process.env.GEMINI_SYSTEM_INSTRUCTION || undefined,
  }
};

/**
 * Validate required configuration
 */
export function validateConfig() {
  const errors = [];

  if (!config.geminiApiKey) {
    errors.push('GOOGLE_API_KEY environment variable is required');
  }

  // Validate generation config ranges
  if (config.generation.temperature < 0 || config.generation.temperature > 2) {
    errors.push('GEMINI_TEMPERATURE must be between 0 and 2');
  }

  if (config.generation.topP < 0 || config.generation.topP > 1) {
    errors.push('GEMINI_TOP_P must be between 0 and 1');
  }

  if (config.generation.topK < 1 || config.generation.topK > 100) {
    errors.push('GEMINI_TOP_K must be between 1 and 100');
  }

  if (config.generation.maxOutputTokens < 1 || config.generation.maxOutputTokens > 8192) {
    errors.push('GEMINI_MAX_TOKENS must be between 1 and 8192');
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}
