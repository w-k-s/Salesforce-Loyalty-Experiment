import express from 'express';
import handlers from './member.handlers.js';
import { createMemberSchema } from './member.validation.js';
import { validate } from '../middleware/index.js'
import { requiresScope } from '../middleware/authentication.js';

export default ({ loyalty, memberService }) => {
    const memberHandlers = handlers({ loyalty, memberService })


    const memberRoutes = express.Router()
    memberRoutes.post('/register', validate(createMemberSchema), memberHandlers.create);
    memberRoutes.get('/me', requiresScope('view-profile'), memberHandlers.getById)

    return memberRoutes
}