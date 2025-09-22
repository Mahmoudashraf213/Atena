import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';

// signup validation schema
export const signupVal = joi.object({
    name: generalFields.name.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    phone: generalFields.phone.optional(),  
})

// login validation schema
export const loginVal = joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required()
})

// forget password validation schema
export const forgetPasswordVal = joi.object({
    email: generalFields.email.required(),
})


// reset password validation schema
export const resetPasswordVal = joi.object({
    email: generalFields.email.required(),
    newPassword: generalFields.password.required(),
    otp: generalFields.otp.required(),

})
