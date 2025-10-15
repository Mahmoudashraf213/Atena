import { model, Schema } from "mongoose";
import { roles, status } from "../../src/utils/constant/enum.js";

// schema 
const schema = Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false // Exclude password from queries by default
    },
    phone: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.USER  // Default role is USER
    },
    status: {
        type: String,
        enum: Object.values(status),
        default: status.PENDING // Default status is PENDING
    },
    otp: String,
    otpExpires: String,
    otpVerified: {
        type: Boolean,
        default: false
    },
    fcmToken: String


}, { timestamps: true });


// model
export const User = model("User", schema);