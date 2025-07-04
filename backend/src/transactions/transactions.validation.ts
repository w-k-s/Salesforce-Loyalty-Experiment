import Joi from 'joi'

export const createTransactionSchema = Joi.object({
    customerId: Joi.string().required(),//contactId
    date: Joi.date().iso().min('now').required(),
    products: Joi.array().items(Joi.object({
        id: Joi.string().required(),//PricebookEntry.Id
        quantity: Joi.number().integer().min(1).required(),
    })).min(1).required(),
});