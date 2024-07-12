import express from 'express';
import handlers from './member.handlers.js';
import { createMemberSchema } from './member.validation.js';
import { validate } from '../middleware/index.js'

export default (memberService) => {
    const memberHandlers = handlers(memberService)

    const memberRoutes = express.Router()
    memberRoutes.post('', validate(createMemberSchema), memberHandlers.create);

    return memberRoutes
}