import { Router } from "express"
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enum.js";
import { isValid } from "../../middleware/vaildation.js";
import { createCouponVal, updateCouponVal } from "./coupon.validatio.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addCoupon, deleteCoupon, getAllCoupon, getCouponById, updateCoupon } from "./coupon.controller.js";

const couponRouter = Router()


// create coupon route
couponRouter.post('/create',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(createCouponVal),
    asyncHandler(addCoupon)
)

// update coupon route
couponRouter.put('/update/:couponId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(updateCouponVal),
    asyncHandler(updateCoupon)
)

// get all coupons route
couponRouter.get('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(getAllCoupon)
)

// get coupon by id route
couponRouter.get('/:couponId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    asyncHandler(getCouponById)
)

// delete coupon route
couponRouter.delete('/:couponId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(deleteCoupon)
)
export default couponRouter;