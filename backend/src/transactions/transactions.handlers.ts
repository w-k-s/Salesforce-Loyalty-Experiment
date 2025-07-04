import { Request, Response } from 'express';
import { default as loyalty } from '../loyalty/index.js';

export const create = async (req: Request, res: Response) => {
  const result = await loyalty.createTransaction({ transaction: req.body });
  res.status(201).json({ Id: result });
}
