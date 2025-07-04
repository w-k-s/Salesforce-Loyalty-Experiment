export const errorResponse = (error, req, res, next) => {
    console.error(error)

    const statusCode = error.statusCode || 500;
    const message = error.isOperational ? error.message : 'Internal Server Error';

    res.status(statusCode).json({
        error: message
    });
}