import { model, Schema } from "mongoose";

// schema
const schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        _id: false
    }]
}, { timestamps: true, versionKey: false })

// model
export const Cart = model('Cart', schema);