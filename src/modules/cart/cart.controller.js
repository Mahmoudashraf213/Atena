import {  Cart, products } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// add to cart
export const addToCart = async (req, res, next) => {
  // get data from req
  const { productId, quantity } = req.body;
  const user = req.authUser._id;

  // check if product exists
  const productExist = await products.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.products.notExist, 404));
  }

  // check stock
  if (productExist.quantity < quantity) {
    return next(new AppError(messages.products.stockNotEnough, 404));
  }

  // check product in cart
  const ProductExistInCart = await Cart.findOneAndUpdate(
    { user, "products.productId": productId },
    { "products.$.quantity": quantity },
    { new: true }
  );

  let data = ProductExistInCart;

  if (!ProductExistInCart) {
    // add product to cart
    const addedProduct = await Cart.findOneAndUpdate(
      { user },
      { $push: { products: { productId, quantity } } },
      { new: true, upsert: true }
    );
    data = addedProduct;
  }

  // send res
  return res.status(200).json({
    message: messages.products.addedToCart,
    success: true,
    data,
  });
};

// get cart
export const getCart = async (req, res, next) => {
  // get data from req
  const user = req.authUser._id;

  // get cart data
  const cart = await Cart.findOne({ user }).populate('products.productId', 'name price');

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: messages.cart.notExist
    });
  }

  // send res 
  return res.status(200).json({
    success: true,
    message: messages.cart.fetchedSuccessfully,
    data: cart
  });
};

// delete product from cart
export const deleteProductFromCart = async (req, res, next) => {
  // get data from req
  const { productId } = req.params;
  const user = req.authUser._id;

  // check if product exists in cart
  const productInCartExist = await Cart.findOne({ user, "products.productId": productId });
  if (!productInCartExist) {
    return next(new AppError(messages.products.notExist, 404));
  }

  // remove product from cart
  const updatedCart = await Cart.findOneAndUpdate(
    { user },
    { $pull: { products: { productId } } },
    { new: true }
  ).populate('products.productId', 'name price');

  // send response
  return res.status(200).json({
    success: true,
    message: messages.products.deletedFromCart,
    data: updatedCart
  });
};