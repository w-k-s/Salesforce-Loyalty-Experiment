import Joi from 'joi'

const NAME_REGEX = /^[A-Za-z][A-Za-z\-\s]*[A-Za-z]$/
export const createMemberSchema = Joi.object({
    firstName: Joi.string().trim().regex(NAME_REGEX).required(),
    middleName: Joi.string().trim().regex(NAME_REGEX),
    lastName: Joi.string().trim().regex(NAME_REGEX).required(),
    gender: Joi.string().valid('Male', 'Female'),
    mobileNumber: Joi.string().regex(/^971[0-9]{9}$/).required(),
    email: Joi.string().email().required(),
    birthDate: Joi.date().iso().max('now').required()
});
