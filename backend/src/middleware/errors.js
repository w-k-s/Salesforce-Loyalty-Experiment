export const errorResponse = (error, req, res, next) => {
    console.error(error)

    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';

    res.status(statusCode).json({
        error: message
    });
}