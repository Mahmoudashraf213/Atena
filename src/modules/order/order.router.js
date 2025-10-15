import { Router } from "express";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enum.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isValid } from "../../middleware/vaildation.js";
import { deleteOrderVal, getSpecificOrderVal, orderVal, updateOrderVal } from "./order.validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createOrder, deleteOrder, getOrders, getSpecificOrder, updateOrder } from "./order.controller.js";



const orderRouter = Router()


// create order router
orderRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.USER , roles.ADMIN]),
    isValid(orderVal),
    asyncHandler(createOrder)
)    


// update order router
orderRouter.put('/:orderId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(updateOrderVal),
    asyncHandler(updateOrder)
)


// get all orders router
orderRouter.get('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    asyncHandler(getOrders)
)


// get specific order by ID router
orderRouter.get('/:orderId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.USER]),
    isValid(getSpecificOrderVal),
    asyncHandler(getSpecificOrder)
)

// delete order router
orderRouter.delete('/:orderId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(deleteOrderVal),
    asyncHandler(deleteOrder)
)
export default orderRouter;