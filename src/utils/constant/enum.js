export const clothingSizes = Object.freeze({
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
});

export const roles = Object.freeze({
  USER: "USER",
  ADMIN: "ADMIN",
});

export const status = Object.freeze({
  PENDING: "pending",
  VERIFIED: "verified",
  BLOCKED: "blocked"
});
export const discountTypes = Object.freeze({
  FIXED_AMOUNT: "fixed_amount",
  PERCENTAGE: "percentage",
});


export const orderStatus = Object.freeze( {
    PENDING: "pending",
    IN_PROGRESS: "inProgress",
    DELIVERED: "delivered",
    CANCELED: "canceled",
    REFUNDED: "refunded"
});


export const paymentMethods = Object.freeze( {
    CASH: "cash",
});