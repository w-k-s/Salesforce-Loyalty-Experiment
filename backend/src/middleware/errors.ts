export const errorResponse = (error, req, res, next) => {
    console.error({ message: 'Error Middleware', error, type: typeof (error), keys: Object.keys(error) })

    const statusCode = error.statusCode || 500;
    const message = error.message || error.name || 'Internal Server Error'

    res.status(statusCode).json({
        error: message
    });
}