const generateMessage = (entity) => ({
    alreadyExist: `${entity} already exist`,
    notExist: `${entity} not found`,
    created: `${entity} created successfully`,
    failToCreate: `Failed to create ${entity}`,
    updated: `${entity} updated successfully`,
    failToUpdate: `Failed to update ${entity}`,
    deleted: `${entity} deleted successfully`,
    failToDelete: `Failed to delete ${entity}`,
    fetchedSuccessfully: `${entity} fetched successfully`,
    failToFetch: `${entity} failed to fetch`
});

export const messages = {
    user: {
        ...generateMessage('user'),
        verified: "user verified successfully",
        invalidCredentials: "invalid credentials",  
        notVerified: "user not verified",
        invalidToken: "invalid token",            
        loginSuccessfully: "login successfully",
        unauthorized: "unauthorized to access this api",
        invalidPassword: "invalid password",     
        passwordUpdated: "password updated successfully",
        invalidOTP: "invalid OTP",
        failToUpdatePassword: "failed to update password",
        noAccountsFound: "no accounts found",
        otpSent: "OTP sent successfully",         
        accountCreated: "Account created successfully please check your mail to verify",
        otpVerified: "OTP verified successfully",
        samePassword: "new password cannot be same as old password",
        notHaveCart: "user does not have a cart",
        fcmUpdated: "FCM token updated successfully",
        missingGoogleToken: "Missing Google token",
    },
    products: {
        ...generateMessage('products'),
        alreadyExist: "products item already exists",
        invalidPrice: "Invalid price value",
        invalidQuantity: "Invalid quantity value",
        invalidSize: "Invalid size",
        failToCreate: "Failed to create products item",
        created: "products item created successfully",
        invalidCouponDiscount : "Invalid coupon discount value, it should be between 0 and 100",
        invalidCouponCode: "Invalid coupon code",
        noProductsFound: "No products found to update.", 
        stockNotEnough : "Product stock is not enough",
        addedToCart: "Product added to cart successfully",
        deletedFromCart: "Product deleted from cart successfully",
        quantityLess: "Requested quantity exceeds available stock.",

    },
    file: {
        ...generateMessage('file'),
        required: "File is required.",
    },
    category: {
        ...generateMessage('category'),
  },
    coupon: {
        ...generateMessage('coupon'),
        discountAmount: "For percentage discount type, discount amount cannot be more than 100",
        notAssigned: "Coupon not assigned to user",
        couponExpired: "Coupon is expired",
    },
   discount: {
        ...generateMessage('discount'),
        invalidInput: "Discount and discountType are required. discountType must be 'percentage' or 'fixed'.",
        appliedSuccessfully: "Global discount applied to all products successfully.",
        removedSuccessfully: "Global discount removed from all products successfully.",
   },
   review: {
        ...generateMessage('review'),
   },
    cart: {
        ...generateMessage('cart'),
    },
    order:{
        ...generateMessage('order'),
    }

};
