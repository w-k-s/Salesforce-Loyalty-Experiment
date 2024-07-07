import Joi from 'joi'

export const createTransactionSchema = Joi.object({
    date: Joi.date().iso().min('now').required(),
    products: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
    })).min(1).required(),
});