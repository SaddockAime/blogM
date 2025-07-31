import joi from 'joi';

export const LikeParamsSchema = joi.object({
    id: joi.string().uuid().required().messages({
        'string.uuid': 'Blog ID must be a valid UUID',
        'any.required': 'Blog ID is required'
    })
});
