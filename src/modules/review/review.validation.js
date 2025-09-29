import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";

// schema for adding review
export const addReviewVal = joi.object({
    comment: generalFields.comment.optional(),
    rate: generalFields.rate.required(),
    productId: generalFields.objectId.required(),
})

// schema for getting reviews
export const getReviewsVal = joi.object({
    productId: generalFields.objectId.required(),
})

// schema for get specific review by id
export const getReviewByIdVal = joi.object({
    reviewId: generalFields.objectId.required(),
    productId: generalFields.objectId.required(),
})

// schema for deleting review by id
export const deleteReviewByIdVal = joi.object({
    reviewId: generalFields.objectId.required(),
    productId: generalFields.objectId.required(),
})