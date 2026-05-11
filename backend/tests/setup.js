/**
 * Test Setup File
 * Starts the server before tests and stops it after
 */

import { beforeAll, afterAll } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

// Load .env file manually and set env vars (only if not already set)
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const envKey = key.trim();
        if (!process.env[envKey]) {
          process.env[envKey] = valueParts.join('=').trim();
        }
      }
    }
  });
  console.log('✓ Loaded .env file');
}

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

let server = null;

console.log('✓ Test setup loaded');

beforeAll(async () => {
  console.log('✓ Starting server for tests...');

  // Import main after env vars are set
  const { main } = await import('../src/server.js');
  server = await main();

  console.log('✓ Server started for tests');
});

afterAll(async () => {
  if (server) {
    console.log('✓ Stopping server after tests...');
    await new Promise((resolve) => {
      server.close(() => {
        console.log('✓ Server stopped');
        resolve();
      });
    });
    server = null;
  }
});
