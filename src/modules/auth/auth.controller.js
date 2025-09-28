import bcrypt from "bcrypt";
import { User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { generateToken, verifyToken } from "../../utils/token.js";
import { status } from "../../utils/constant/enum.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { generateOTP, sendOTP } from "../../utils/OTP.js";

//  SIGNUP
export const signup = async (req, res, next) => {
  // get data from req
  const { name, email, password, phone } = req.body;
  // check if user already exists
  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(new AppError(messages.user.alreadyExist, 409));
  }

  // hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  //  create new user
  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
  });
  // save in DB
  const userCreated = await user.save();
  // handel fail
  if (!userCreated) {
    return next(new AppError(messages.user.failToCreate, 500));
  }
  // generate token
  const token = generateToken({ payload: { email, _id: userCreated._id } });
  //  send verification email
  await sendEmail({
    to: email,
    subject: "🛒 Verify Your Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f6fff0; text-align: center;">
          <h2 style="color: #e9ff6aff;">🛒 Welcome, ${name}!</h2>
          <p style="font-size: 16px; color: #333;">
              Thank you for signing up! Please verify your email to activate your account.
          </p>
          <a href="${req.protocol}://${req.headers.host}/auth/verify/${token}" 
              style="display: inline-block; padding: 12px 20px; background-color: #e0fa82ff; color: white; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px; margin-top: 10px;">
              Verify Your Account
          </a>
          <p style="color: #555; font-size: 14px; margin-top: 10px;">
              If you did not create this account, please ignore this email.
          </p>
      </div>
    `,
  });

  // send res
  return res.status(201).json({
    message: messages.user.created,
    success: true,
    data: userCreated,
  });
};

//  VERIFY ACCOUNT
export const verifyAccount = async (req, res, next) => {
  // get the token from request params
  const { token } = req.params;

  // verify token and extract payload
  const payload = verifyToken( token );

  // If the token is invalid , return error
  if (!payload) {
    return res.send(`
        <html>
            <head>
                <title>Verification Failed</title>
                <style>
                                        body { text-align: center; font-family: Arial, sans-serif; background-color: #f6fff0; padding: 50px; }
                        .container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; }
                        h1 { color: red; }
                        p { color: #555; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Verification Failed</h1>
                        <p>The verification link is invalid or has expired.</p>
                    </div>
                </body>
            </html>
        `);
  }

  // Find the user by email and update their status to VERIFIED
  const updatedUser = await User.findOneAndUpdate(
    { email: payload.email },
    { status: status.VERIFIED },
    { new: true }
  );

  // Check if user was found and updated
  if (!updatedUser) {
    return res.send(`
            <html>
                <head>
                    <title>Verification Failed</title>
                    <style>
                        body { text-align: center; font-family: Arial, sans-serif; background-color: #f6fff0; padding: 50px; }
                        .container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; }
                        h1 { color: red; }
                        p { color: #555; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Verification Failed</h1>
                        <p>User not found. Please check your email for a new verification link.</p>
                    </div>
                </body>
            </html>
    `);
  }

  // success response
  return res.send(`
        <html>
            <head>
                <title>Verification Successful</title>
                <style>
                    body { text-align: center; font-family: Arial, sans-serif; background-color: #f6fff0; padding: 50px; }
                    .container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; }
                    h1 { color: #d0f30bff; }
                    p { color: #555; font-size: 16px; }
                    .btn {
                        display: inline-block;
                        padding: 12px 20px;
                        background-color: #d0f30bff;
                        color: white;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: bold;
                        border-radius: 8px;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Verification Successful</h1>
                    <p>Your account has been successfully verified. You can now log in.</p>
                </div>
            </body>
        </html>
  `);
};

//  LOGIN
export const login = async (req, res, next) => {
  // get data from req
  const { email, password } = req.body;

  //  check existence
  const userExist = await User.findOne({ email }).select("+password");
  if (!userExist) {
    return next(new AppError(messages.user.invalidCredentials, 401));
  }

  // check password
  const isPasswordCorrect = bcrypt.compareSync(password, userExist.password);
  if (!isPasswordCorrect) {
    return next(new AppError(messages.user.invalidCredentials, 401));
  }

  //  check if verified
  if (userExist.status !== status.VERIFIED) {
    return next(new AppError(messages.user.notVerified, 403));
  }

  //  generate token
  const token = generateToken({
    payload: { email: userExist.email, _id: userExist._id },
  });

  //  send response
  return res.status(200).json({
    message: messages.user.loginSuccessfully,
    success: true,
    token,
  });
};



// forget password
export const forgetPassword = async (req, res, next) => {
    // get data from req
    const { email } = req.body;

    // check existence
    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 401));
    }

    // generate otp
    const otp = generateOTP();

    // send otp 
    await sendOTP(userExist.email, otp);

    // save OTP to user record
    userExist.otp = otp;
    userExist.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    // save otp in db to check
    const addOtp = await userExist.save();
    if (!addOtp) {
        return next(new AppError(messages.user.failToUpdate, 500));
    }

    // send res
    return res.status(200).json({ message: messages.user.otpSent, success: true });
};


// verify Otp And Reset Password
export const verifyOtpAndResetPassword = async (req, res, next) => {
    // get data from req
    const { email, otp, newPassword } = req.body;

    // check if user exist (include password for comparison)
    const userExist = await User.findOne({ email }).select("+password");
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 401));
    }

    // check if otp valid
    if (userExist.otp !== otp || Date.now() > userExist.otpExpires) {
        return next(new AppError(messages.user.invalidOTP, 400));
    }

    // check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, userExist.password);
    if (isSamePassword) {
        return next(new AppError(messages.user.samePassword, 400));
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update user password and clear otp
    userExist.password = hashedPassword;
    userExist.otp = undefined;
    userExist.otpExpires = undefined;
    userExist.otpVerified = false; // reset flag after password update

    // save edition in db
    const updatedUser = await userExist.save();
    // handle fail
    if (!updatedUser) {
        return next(new AppError(messages.user.failToUpdate, 400));
    }

    // send res
    return res.status(200).json({ message: messages.user.passwordUpdated, success: true });
};


// get profile
export const getProfile = async (req, res, next) => {
    // get data from req
    const user = req.authUser._id;
    // check existence
    const userExist = await User.findById(user)
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 404))
    }
    // send res 
    return res.status(200).json({
        message: messages.user.fetchedSuccessfully,
        success: true,
        data: userExist
    })
}

// update profile
export const updateProfile = async (req, res, next) => {
  const { name, phone, email, password } = req.body;
  const userId = req.authUser._id; // user from auth middleware

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(messages.user.notExist, 404));
  }

  // If email is being updated → check if it's already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new AppError(messages.user.emailTaken, 409));
    }
    user.email = email;
  }

  // Update fields if provided
  if (name) user.name = name;
  if (phone) user.phone = phone;

  // If password is provided → hash it
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    user.password = hashedPassword;
  }

  // Save
  const updatedUser = await user.save();
  if (!updatedUser) {
    return next(new AppError(messages.user.failToUpdate, 500));
  }

  // Hide password in response
  updatedUser.password = undefined;

  return res.status(200).json({
    message: messages.user.updated,
    success: true,
    data: updatedUser,
  });
};