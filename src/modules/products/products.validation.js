import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';


// schema for adding products
export const addProductsVal = joi.object({
   name: generalFields.name.required(),
   price: generalFields.price.required(),
   quantity: generalFields.quantity.required(),
   description: generalFields.description.optional(),
   size: generalFields.size.required(),
   color : generalFields.color.required(),
   categoryId: generalFields.objectId.required(),
   discount: generalFields.discount.optional(),
   discountType: generalFields.discountType.optional(),
})

// schema for updating products
export const updateProductsVal = joi.object({
    name: generalFields.name.optional(),
    price: generalFields.price.optional(),
    quantity: generalFields.quantity.optional(),
    description: generalFields.description.optional(),
    size: generalFields.size.optional(),
    color: generalFields.color.optional(),
    productsId: generalFields.objectId.required(),
    categoryId: generalFields.objectId.optional(),
    discount: generalFields.discount.optional(),
    discountType: generalFields.discountType.optional(),
})

// schema for getting products by id
export const getProductsByIdVal = joi.object({
    productsId: generalFields.objectId.required(),
});

// schema for deleting products 
export const deleteProductsByIdVal = joi.object({
    productsId: generalFields.objectId.required(),
});

// schema for adding global discount
export const addGlobalDiscountVal = joi.object({
    discount: generalFields.discount.required(),
    discountType: generalFields.discountType.required(),
});


