import express from 'express';
import handlers from './member.handlers.js';
import { createMemberSchema } from './member.validation.js';
import { validate } from '../middleware/index.js'
import { requiresScope, checkOwner } from '../middleware/authentication.js';

export default ({loyalty, memberService}) => {
    const memberHandlers = handlers({loyalty,memberService})

    const checkResourceOwner = checkOwner({
        userIdProvider: (user) => user.customerId,
        resourceOwnerIdProvider: (req) => req.params.id
    })

    const memberRoutes = express.Router()
    memberRoutes.post('/register', validate(createMemberSchema), memberHandlers.create);
    memberRoutes.get('/:id', requiresScope('view-profile'), checkResourceOwner, memberHandlers.getById)

    return memberRoutes
}