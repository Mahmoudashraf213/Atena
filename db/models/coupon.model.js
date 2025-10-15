import { model, Schema, Types } from "mongoose";
import { discountTypes } from "../../src/utils/constant/enum.js";

// schema
const schema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountAmount: {
        type: Number,
        required: true
    },
    discountType: {
        type: String,
        enum: Object.values(discountTypes),
        default: discountTypes.FIXED_AMOUNT
    },
    toDate: {
        type: String,
        required: true
    },
    fromDate: {
        type: String,
        required: true
    },
    assignedUsers: [{
        userId: {
            type: Types.ObjectId,
            ref: 'User'
        },
        maxCount: {
            type: Number,
            max: 5
        },
        useCount: {
            type: Number,
            default: 0
        }
    }],
    createdBy: {
        type: Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true, versionKey: false })

// model
export const Coupon = model('Coupon', schema)