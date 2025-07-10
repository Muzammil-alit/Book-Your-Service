export class CustomError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  // Client Errors (4xx)
  static badRequest(message = 'Bad Request', details?: any) {
    return new CustomError(message, 400, details);
  }

  static unauthorized(message = 'Unauthorized', details?: any) {
    return new CustomError(message, 401, details);
  }

  static forbidden(message = 'Forbidden', details?: any) {
    return new CustomError(message, 403, details);
  }

  static conflict(message = 'Conflict', details?: any) {
    return new CustomError(message, 409, details);
  }

  static validationError(message = 'Validation Error', details?: any) {
    return new CustomError(message, 400, details);
  }

  static noContent(message = 'No Content Found', details?: any) {
    return new CustomError(message, 204, details);
  }

  // Server Errors (5xx)
  static internal(message = 'Internal Server Error', details?: any) {
    return new CustomError(message, 500, details);
  }
}
