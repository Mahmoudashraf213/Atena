import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { forgetPasswordVal, loginVal, resetPasswordVal, signupVal } from "./auth.validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { forgetPassword, getProfile, login, signup, verifyAccount, verifyOtpAndResetPassword } from "./auth.controller.js";
import { roles } from "../../utils/constant/enum.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";

const authRouter = Router();

// signup route
authRouter.post('/signup',
    isValid(signupVal),
    asyncHandler(signup)
)

// verify account route
authRouter.get('/verify/:token',
    asyncHandler(verifyAccount)
)

// login route 
authRouter.post('/login',
    isValid(loginVal),
    asyncHandler(login)
)

// forget password route
authRouter.post('/forget-password',
    isValid(forgetPasswordVal),
    asyncHandler(forgetPassword)
)


// reset password route
authRouter.post('/reset-password',
    isValid(resetPasswordVal),
    asyncHandler(verifyOtpAndResetPassword)
)

// get profile 
authRouter.get('/profile',
    isAuthenticated(),
    isAuthorized([roles.USER, roles.ADMIN]),
    asyncHandler(getProfile)
)
export default authRouter;