import express from 'express';
import handlers from './member.handlers.js';
import { createMemberSchema } from './member.validation.js';
import { validate, checkOwner } from '../middleware/index.js'

export default (memberService) => {
    const memberHandlers = handlers(memberService)

    const checkResourceOwner = checkOwner({
        userIdProvider: (user) => user.contactId,
        resourceOwnerIdProvider: (req) => req.params.id
    })

    const memberRoutes = express.Router()
    memberRoutes.post('/register', validate(createMemberSchema), memberHandlers.create);
    memberRoutes.get('/:id', checkResourceOwner, memberHandlers.getById)

    return memberRoutes
}