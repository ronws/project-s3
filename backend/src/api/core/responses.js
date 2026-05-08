/**
 * Standardized Response Formatting
 * Ensures consistent response shape across all endpoints
 */

export class ResponseFormatter {
  /**
   * Format a success response
   * @param {*} data - Response data payload
   * @param {string} message - Success message
   * @param {string} requestId - Request correlation ID
   * @returns {object} Formatted response
   */
  static success(data, message = 'Success', requestId) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      ...(requestId && { request_id: requestId }),
    };
  }

  /**
   * Format an error response
   * @param {string} errorCode - Error code identifier
   * @param {string} message - Error message
   * @param {*} details - Additional error details
   * @param {string} requestId - Request correlation ID
   * @returns {object} Formatted error response
   */
  static error(errorCode, message, details = null, requestId) {
    return {
      success: false,
      error_code: errorCode,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      ...(requestId && { request_id: requestId }),
    };
  }

  /**
   * Format validation error response
   * @param {*} fieldErrors - Field-level validation errors
   * @param {string} requestId - Request correlation ID
   * @returns {object} Formatted validation error response
   */
  static validationError(fieldErrors, requestId) {
    return {
      success: false,
      error_code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: fieldErrors,
      timestamp: new Date().toISOString(),
      ...(requestId && { request_id: requestId }),
    };
  }
}
