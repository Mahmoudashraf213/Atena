// import modules
import joi from 'joi';
import { AppError } from '../utils/appError.js';
import { clothingSizes } from '../utils/constant/enum.js';

export const generalFields = {
    name: joi.string().trim(),
    price: joi.number().positive(),
    quantity: joi.number().integer().min(0),
    description: joi.string().trim(),
    color: joi.string().trim(),
    size: joi.string().valid(...Object.values(clothingSizes)),
    image: joi.object({
        secure_url: joi.string().uri(),
        public_id: joi.string(),
    }),
    coupon: joi.object({
        code: joi.string().trim(),
        discount: joi.number().min(0).max(100)
    }),
    finalPrice: joi.string().trim(),
    objectId: joi.string().hex().length(24),
    email: joi.string().email(),
    phone: joi.string().pattern(new RegExp(/^01[0-2,5]{1}[0-9]{8}$/)),
    password: joi.string().pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)),
    cPassword: joi.string().valid(joi.ref('password')),
    otp: joi.string().length(6),
};

export const isValid = (schema) => {
    return (req, res, next) => {
        let data = { ...req.body, ...req.params, ...req.query }
        const { error } = schema.validate(data, { abortEarly: false })
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }
        next()
    }
}
