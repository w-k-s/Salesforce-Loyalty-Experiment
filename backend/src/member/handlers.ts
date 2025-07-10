import { NextFunction, Request, Response } from 'express'
import { registerMember } from './service.js'
import loyalty from "../loyalty/index.js";
import { CreateMemberRequest } from './types.js';

export const create = async (
  req: Request<unknown, unknown, CreateMemberRequest>,
  res: Response<any>,
  next: NextFunction
) => {
  try {
    const result = await registerMember(req.body);
    res.status(201).json({ id: result, ...req.body });
  } catch (e) {
    next(e)
  }
}

export const getById = async (req, res, next) => {
  try {
    const contactId = req.user.id
    const result = await loyalty.findMemberById(contactId)
    res.status(200).json(result)
  } catch (e) {
    next(e)
  }
}