// import modules
import joi from 'joi';
import { AppError } from '../utils/appError.js';
import { clothingSizes } from '../utils/constant/enum.js';

export const generalFields = {
    name: joi.string().trim().required(),
    price: joi.number().positive().required(),
    quantity: joi.number().integer().min(0).required(),
    description: joi.string().trim().optional(),
    color: joi.string().trim().required(),
    size: joi.string().valid(...Object.values(clothingSizes)).required(),
    image: joi.object({
      secure_url: joi.string().uri().required(),
      public_id: joi.string().required(),
    }).required(),
    coupon: joi.object({
      code: joi.string().trim().required(),
      discount: joi.number().min(0).max(100).required()
  }).optional(),
    finalPrice: joi.string().trim(),
    objectId: joi.string().hex().length(24),
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
