import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enum.js";
import { isValid } from "../../middleware/vaildation.js";
import { addToCartVal, deleteFromCartVal } from "./cart.validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addToCart, deleteProductFromCart, getCart } from "./cart.controller.js";


const cartRouter = Router();

// add to cart router
cartRouter.put('/',
    isAuthenticated(),
    isAuthorized([roles.USER, roles.ADMIN]),
    isValid(addToCartVal),
    asyncHandler(addToCart)
)


// get cart router
cartRouter.get('/',
    isAuthenticated(),
    isAuthorized([roles.USER, roles.ADMIN]),
    asyncHandler(getCart)
)

// delete from cart router
cartRouter.delete('/:productId',
    isAuthenticated(),
    isAuthorized([roles.USER, roles.ADMIN]),
    isValid(deleteFromCartVal),
    asyncHandler(deleteProductFromCart)
)
export default cartRouter;