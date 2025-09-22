import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enum.js";
import { isValid } from "../../middleware/vaildation.js";
import { addCategoryVal, deleteCategoryVal, getCategoryByIdVal, updateCategoryVal } from "./category.validation.js";
import { addCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "./category.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";




const categoryRouter = Router();

// add category route
categoryRouter.post('/add',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(addCategoryVal),
    asyncHandler(addCategory)
)

// update category route
categoryRouter.put('/update/:categoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(updateCategoryVal),
    asyncHandler(updateCategory)
)

// get all categories route
categoryRouter.get('/',
    asyncHandler(getCategories)
)

// get category by id route
categoryRouter.get('/:categoryId',
    isValid(getCategoryByIdVal),
    asyncHandler(getCategoryById)
)

// delete category  route
categoryRouter.delete('/:categoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN]),
    isValid(deleteCategoryVal),
    asyncHandler(deleteCategory)
)
export default categoryRouter;