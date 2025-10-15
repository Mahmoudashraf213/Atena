import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";

// create order validation
export const orderVal = joi.object({
    phone : generalFields.phone.required(),
    street: generalFields.street.required(),
    coupon: generalFields.code,
})


// update order validation
export const updateOrderVal = joi.object({
    orderId: generalFields.objectId.required(),
    phone: generalFields.phone.optional(),
    street: generalFields.street.optional(),
    paymentMethod: generalFields.paymentMethod.optional(),
    status: generalFields.orderStatus.optional()
})


// get specific order validation
export const getSpecificOrderVal = joi.object({
    orderId: generalFields.objectId.required(),
})

// delete order validation
export const deleteOrderVal = joi.object({
    orderId: generalFields.objectId.required(),
})