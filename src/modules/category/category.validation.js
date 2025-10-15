import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';


// schema for adding category
export const addCategoryVal = joi.object({
    name: generalFields.name.required(),
})

// schema for updating category
export const updateCategoryVal = joi.object({
    name: generalFields.name.optional(),
    categoryId: generalFields.objectId.required(),
})

// schema for getting category by id
export const getCategoryByIdVal = joi.object({
    categoryId: generalFields.objectId.required(),
});

// schema for deleting category 
export const deleteCategoryVal = joi.object({
    categoryId: generalFields.objectId.required(),
});