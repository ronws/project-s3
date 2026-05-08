/**
 * API Exception Hierarchy
 * Base exception class and specialized exceptions for different HTTP status codes
 */

export class APIException extends Error {
  constructor(
    message,
    statusCode = 500,
    errorCode = 'INTERNAL_SERVER_ERROR',
    details = null,
    headers = {}
  ) {
    super(message);
    this.name = 'APIException';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.headers = headers;
  }
}

export class BadRequestException extends APIException {
  constructor(message, details = null) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends APIException {
  constructor(message, details = null) {
    super(message, 401, 'UNAUTHORIZED', details);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends APIException {
  constructor(message, details = null) {
    super(message, 403, 'FORBIDDEN', details);
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends APIException {
  constructor(message, details = null) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends APIException {
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictException';
  }
}

export class ValidationException extends APIException {
  constructor(message, details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationException';
  }
}

export class RateLimitException extends APIException {
  constructor(message = 'Too many requests', details = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    this.name = 'RateLimitException';
  }
}

export class InternalServerException extends APIException {
  constructor(message, details = null) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerException';
  }
}

export class ServiceUnavailableException extends APIException {
  constructor(message = 'Service unavailable', details = null) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
    this.name = 'ServiceUnavailableException';
  }
}
