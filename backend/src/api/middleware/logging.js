/**
 * Request Logging Middleware
 * Generates request IDs, logs requests/responses with timing info
 */

import { randomUUID } from 'crypto';

/**
 * Generate short request ID (first 8 chars of UUID)
 */
export function generateRequestId() {
  return randomUUID().slice(0, 8);
}

/**
 * Logging middleware
 * - Adds request_id to request.state
 * - Logs incoming requests with client IP
 * - Logs responses with status and duration
 * - Adds X-Request-ID and X-Response-Time headers
 */
export function loggingMiddleware(req, res, next) {
  // Generate and attach request ID
  const requestId = generateRequestId();
  req.state = req.state || {};
  req.state.requestId = requestId;

  // Record start time
  const startTime = Date.now();

  // Get client IP
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.connection.remoteAddress ||
    'unknown';

  // Log incoming request
  console.log(
    `[${requestId}] ${req.method} ${req.path} - Client: ${clientIp}`
  );

  // Hook into res.end to log response
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - startTime;

    // Log outgoing response
    console.log(
      `[${requestId}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`
    );

    return originalEnd.apply(res, args);
  };

  next();
}
