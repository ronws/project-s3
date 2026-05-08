/**
 * CORS Middleware
 * Uses the `cors` npm package for production-ready CORS handling
 */

import cors from 'cors';

/**
 * Create CORS middleware with configured origins
 * @param {string[]} allowedOrigins - Array of allowed origins
 * @returns Express middleware
 */
export function corsMiddleware(allowedOrigins = ['*']) {
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // If wildcard is present, reflect the request origin (for credentials support)
      if (allowedOrigins.includes('*')) {
        return callback(null, origin);  // Reflect the request origin instead of '*'
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Origin not allowed
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    
    credentials: true, // Allow cookies/auth headers
    
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
    ],
    
    exposedHeaders: [
      'X-Request-ID',
      'X-Response-Time',
    ],
    
    maxAge: 86400, // 24 hours for preflight cache
  };

  return cors(corsOptions);
}
