import { NextFunction, Request, Response } from 'express'
import { default as loyalty } from '../loyalty/index.js'

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await loyalty.listProducts();
        res.status(200).json({ products: result });
    } catch (e) {
        next(e)
    }
}