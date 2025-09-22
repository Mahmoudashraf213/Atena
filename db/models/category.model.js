import { model, Schema, Types } from "mongoose";

//schema
const schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: [true, 'name is required'],
        lowercase: true,
        trim: true,
        minLength: [2, 'too short category name']
    },
    slug: {
        type: String,
        required: true,
        unique: [true, 'slug is required'],
        lowercase: true,
        trim: true
    },
    // image: {
    //     secure_url: {
    //         type: String,
    //         required: true
    //     },
    //     public_id: {
    //         type: String,
    //         required: true
    //     }
    // },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },


}, {
    timeseries: true,
})

//model
export const Category = model('Category', schema);