import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/vaildation.js";
import { addGlobalDiscount, addProducts, deleteProductsById, getAllProducts, getProductsById, removeGlobalDiscount, updateProducts } from "./products.controller.js";
import { addGlobalDiscountVal, addProductsVal, deleteProductsByIdVal, getProductsByIdVal, updateProductsVal } from "./products.validation.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enum.js";

const productsRouter = Router();

//add a new products item
productsRouter.post('/add',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudUploads({}).fields([{ name : "Images" , maxCount: 5 }]),
    isValid(addProductsVal),
    asyncHandler(addProducts)
) 

// Update products item
productsRouter.put('/update/:productsId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    cloudUploads({}).fields([{ name : "Images" , maxCount: 5 }]),
    isValid(updateProductsVal),
    asyncHandler(updateProducts)
);

// Get all products items
productsRouter.get('/',
    // isAuthenticated(),
    // isAuthorized([roles.USER, roles.ADMIN]),
    asyncHandler(getAllProducts)
)

// Get products item by ID
productsRouter.get('/:productsId',
    // isAuthenticated(),
    // isAuthorized([roles.USER, roles.ADMIN]),
    isValid(getProductsByIdVal),
    asyncHandler(getProductsById)
);

// Delete products item by ID
productsRouter.delete('/delete/:productsId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(deleteProductsByIdVal),
    asyncHandler(deleteProductsById)
);

// Only admin can apply global discount
productsRouter.put('/discount',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(addGlobalDiscountVal),
    asyncHandler(addGlobalDiscount)
)

// Remove global discount - only admin
productsRouter.delete('/discount',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    asyncHandler(removeGlobalDiscount)
)

export default productsRouter