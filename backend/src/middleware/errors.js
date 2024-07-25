export const errorResponse = (error, req, res, next) => {
    console.error(error)
    res.status(500).json({ error: error.message })
}