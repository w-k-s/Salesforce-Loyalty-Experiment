import express from 'express';
import { create, getById } from './member.handlers.js';
import { CreateMemberRequestSchema } from './types.js';
import { validate } from '../middleware/index.js'
import { requiresScope } from '../middleware/authentication.js';

export default () => {

    const memberRoutes = express.Router()
    memberRoutes.post('/register', validate(CreateMemberRequestSchema), create);
    memberRoutes.get('/me', requiresScope('view-profile'), getById)

    return memberRoutes
}