/**
 * Backend API Unit Tests
 * Tests for Gemini API routes - validation and error handling
 */

import './setup.js';
import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:4443';

describe('Health Check', () => {
  it('should return 200 for health endpoint', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.status).toBe('healthy');
  });

  it('should include version and uptime info', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    expect(data.data.version).toBeDefined();
    expect(data.data.uptime).toBeDefined();
  });
});

describe('POST /gemini/text - Validation', () => {
  it('should reject request without prompt', async () => {
    const res = await fetch(`${BASE_URL}/gemini/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('should reject empty prompt', async () => {
    const res = await fetch(`${BASE_URL}/gemini/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '' }),
    });
    expect(res.status).toBe(422);
  });

  it('should reject non-string prompt', async () => {
    const res = await fetch(`${BASE_URL}/gemini/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 123 }),
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /gemini/chat - Validation', () => {
  it('should reject request without message', async () => {
    const res = await fetch(`${BASE_URL}/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('should reject non-string message', async () => {
    const res = await fetch(`${BASE_URL}/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 123 }),
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /gemini/stream-chat - Validation', () => {
  it('should reject request without message', async () => {
    const res = await fetch(`${BASE_URL}/gemini/stream-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const text = await res.text();
    expect(text).toContain('error');
  });

  it('should return text/event-stream content type', async () => {
    const res = await fetch(`${BASE_URL}/gemini/stream-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' }),
    });
    expect(res.headers.get('content-type')).toContain('text/event-stream');
  });
});

describe('POST /gemini/document - Validation', () => {
  it('should reject request without content or prompt', async () => {
    const res = await fetch(`${BASE_URL}/gemini/document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('should reject request without prompt', async () => {
    const res = await fetch(`${BASE_URL}/gemini/document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'some content' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /gemini/audio - Validation', () => {
  it('should reject request without prompt', async () => {
    const res = await fetch(`${BASE_URL}/gemini/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('CORS Support', () => {
  it('should handle OPTIONS preflight', async () => {
    const res = await fetch(`${BASE_URL}/gemini/text`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    expect(res.status).toBe(204);
  });
});

describe('Response Format', () => {
  it('should return consistent error format', async () => {
    const res = await fetch(`${BASE_URL}/gemini/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error_code).toBeDefined();
    expect(data.message).toBeDefined();
  });
});
