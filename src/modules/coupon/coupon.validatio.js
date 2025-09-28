import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";

// create coupon validation
export const createCouponVal = joi.object({
    code :generalFields.code.required(),
    discountAmount: generalFields.discountAmount.required(),
    discountType: generalFields.discountType,
    fromDate: generalFields.fromDate.required(),
    toDate: generalFields.toDate.required(),
})

// update coupon validation
export const updateCouponVal = joi.object({
    couponId: generalFields.objectId.required(),
    code: generalFields.code.optional(),
    discountAmount: generalFields.discountAmount.optional(),
    discountType: generalFields.discountType,
    fromDate: generalFields.fromDate.optional(),
    toDate: generalFields.toDate.optional(),
})