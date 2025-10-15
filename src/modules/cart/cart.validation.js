import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";


// schema for adding to cart
export const addToCartVal = joi.object({
    productId: generalFields.objectId.required(),
    quantity: generalFields.quantity.required(),
})

// schema for deleting from cart
export const deleteFromCartVal = joi.object({
    productId: generalFields.objectId.required(),
})