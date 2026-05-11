/**
 * Application Entry Point
 * Starts the Express server with configuration validation
 */

import { createApp } from './api/main.js';
import { config, validateConfig } from './config/core.js';

/**
 * Start the server
 */
export async function main() {
  try {
    // Validate configuration
    console.log(`Starting gemini-flash-api in ${config.nodeEnv} environment...`);
    validateConfig();

    // Create app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, config.host, () => {
      console.log(`✓ Server running at http://${config.host}:${config.port}`);
      console.log(`✓ Model: ${config.geminiModel}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ CORS Origins: ${config.corsOrigins.join(', ')}`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n✓ Shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('✗ Force exiting');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return server;
  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
  }
}

// Only run main() if this file is executed directly (not imported for tests)
if (process.env.RUN_SERVER !== 'false') {
  main();
}
