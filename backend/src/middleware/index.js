import Joi from 'joi';

export const validate = (schema) => {
    return (req, res, next) => {
        const { error, _ } = schema.validate(req.body);
        if (error) {
            console.log('error', error)
            return res.status(400).send({
                result: error.details[0].message
            });
        }
        next()
    }
}