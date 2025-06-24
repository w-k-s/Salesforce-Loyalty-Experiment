export class ApiError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
