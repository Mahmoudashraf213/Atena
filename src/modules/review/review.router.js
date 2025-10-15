import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enum.js";
import { addReviewVal, deleteReviewByIdVal, getReviewByIdVal, getReviewsVal } from "./review.validation.js";
import { isValid } from "../../middleware/vaildation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addReview, deleteReview, getReviews, getSpecificReview } from "./review.controller.js";


// add review router
const reviewRouter = Router()
reviewRouter.post('/add/:productId',
    isAuthenticated(),
    isAuthorized([roles.USER, roles.ADMIN]),
    isValid(addReviewVal),
    asyncHandler(addReview)
)

// get reviews for a product router
reviewRouter.get('/:productId',
    isValid(getReviewsVal),
    asyncHandler(getReviews)
)

// get specific review by id router
reviewRouter.get('/:productId/:reviewId',
    isValid(getReviewByIdVal),
    asyncHandler(getSpecificReview)
)


// delete review router
reviewRouter.delete('/:productId/:reviewId',
    isAuthenticated(),
    isAuthorized([roles.USER, roles.ADMIN]),
    isValid(deleteReviewByIdVal),
    asyncHandler(deleteReview)
)
export default reviewRouter;