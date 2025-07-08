export class ApiError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
        public isOperational: boolean = true) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
