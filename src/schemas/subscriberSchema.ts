import joi from "joi";

export const SubscribeSchema = joi.object({
    email: joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});

export const UnsubscribeSchema = joi.object({
    email: joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});
