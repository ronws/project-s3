/**
 * Error Handler Middleware
 * Centralized error handling with standardized response formatting
 */

import { ResponseFormatter } from '../core/responses.js';
import { APIException } from '../core/exceptions.js';

/**
 * Express error handling middleware
 * Must be the last middleware registered
 */
export function errorHandler(err, req, res, next) {
  const requestId = req.state?.requestId;

  // Handle APIException
  if (err instanceof APIException) {
    const response = ResponseFormatter.error(
      err.errorCode,
      err.message,
      err.details,
      requestId
    );

    res.status(err.statusCode);
    if (err.headers) {
      Object.entries(err.headers).forEach(([key, value]) => {
        res.header(key, value);
      });
    }
    return res.json(response);
  }

  // Handle ValidationError (Express built-in)
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    const response = ResponseFormatter.validationError(
      { error: err.message },
      requestId
    );
    return res.status(422).json(response);
  }

  // Handle generic errors - sanitize message in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const message = isDevelopment ? err.message : 'An internal server error occurred';
  const details = isDevelopment ? err.stack : null;

  console.error(`[${requestId}] Unhandled error:`, err);

  const response = ResponseFormatter.error(
    'INTERNAL_SERVER_ERROR',
    message,
    details,
    requestId
  );

  res.status(500).json(response);
}
