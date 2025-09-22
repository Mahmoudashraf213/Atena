import { model, Schema, Types } from "mongoose";

// schema
const schema = new Schema({
    comment: String,
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    rate: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    product: {
        type: Types.ObjectId,
        ref: 'Product',
        required: true
    },
    isVerified: Boolean
}, { timestamps: true, versionKey: false })

// model
export const Review = model('Review', schema)