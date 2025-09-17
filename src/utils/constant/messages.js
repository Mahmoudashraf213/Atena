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
        accountCreated: "Account created successfully please check your mail to verify"
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
        
    }
};
