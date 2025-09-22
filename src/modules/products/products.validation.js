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
   coupon: generalFields.coupon.optional(),
   finalPrice: generalFields.finalPrice,
})

// schema for updating products
export const updateProductsVal = joi.object({
    name: generalFields.name.optional(),
    price: generalFields.price.optional(),
    quantity: generalFields.quantity.optional(),
    description: generalFields.description.optional(),
    size: generalFields.size.optional(),
    color: generalFields.color.optional(),
    coupon: generalFields.coupon.optional(),
    finalPrice: generalFields.finalPrice.optional(),
    productsId: generalFields.objectId.required(),

})

// schema for getting products by id
export const getProductsByIdVal = joi.object({
    productsId: generalFields.objectId.required(),
});

// schema for deleting products 
export const deleteProductsByIdVal = joi.object({
    productsId: generalFields.objectId.required(),
});