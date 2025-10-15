import { Cart,  Coupon, Order, products } from '../../../db/index.js';
import { ApiFeature } from '../../utils/apiFeatures.js';
import { AppError } from "../../utils/appError.js";
import { discountTypes, roles } from "../../utils/constant/enum.js";
import { messages } from "../../utils/constant/messages.js";

// create order 
export const createOrder = async (req, res, next) => {
  const { phone, street, coupon } = req.body;
  const user = req.authUser._id;

  // Check coupon
  let couponExist = null;
  if (coupon) {
    couponExist = await Coupon.findOne({ code: coupon });
    if (!couponExist) return next(new AppError(messages.coupon.notExist, 404));

    const currentDate = new Date();
    if (currentDate < new Date(couponExist.fromDate) || currentDate > new Date(couponExist.toDate)) {
      return next(new AppError(messages.coupon.couponExpired, 400));
    }

    if (couponExist.assignedUsers?.length) {
      const isAssigned = couponExist.assignedUsers.includes(user);
      if (!isAssigned) return next(new AppError(messages.coupon.notAssigned, 403));
    }
  }

  // Check cart
  const cart = await Cart.findOne({ user });
  if (!cart) return next(new AppError(messages.user.notHaveCart, 400));

  const cartProducts = cart.products;
  let orderPrice = 0;
  const orderProducts = [];

  // Loop through products in cart
  for (const product of cartProducts) {
    const productExist = await products.findById(product.productId);
    if (!productExist) return next(new AppError(messages.products.notExist, 404));

    // Check if requested quantity exceeds available stock
    if (product.quantity > productExist.quantity) {
      return next(
        new AppError(
          `${messages.products.quantityLess} (Available: ${productExist.quantity}, Requested: ${product.quantity})`,
          400
        )
      );
    }

    // Convert price string to number
    const basePrice = parseFloat(String(productExist.price).replace(/[^\d.]/g, '')) || 0;

    // Calculate product final price
    let finalPricePerItem = basePrice;
    if (productExist.discount > 0) {
      if (productExist.discountType === discountTypes.FIXED_AMOUNT) {
        finalPricePerItem = Math.max(basePrice - productExist.discount, 0);
      } else {
        finalPricePerItem = Math.max(basePrice - (basePrice * (productExist.discount / 100)), 0);
      }
    }

    // Ensure main image
    const mainImage =
      productExist.Images?.length > 0
        ? {
            secure_url: productExist.Images[0].secure_url,
            public_id: productExist.Images[0].public_id,
          }
        : { secure_url: 'no-image', public_id: 'no-id' };

    // Calculate total for this product
    const totalProductPrice = finalPricePerItem * product.quantity;
    orderPrice += totalProductPrice;

    orderProducts.push({
      productId: productExist._id,
      name: productExist.name,
      quantity: product.quantity,
      price: basePrice,
      finalPrice: finalPricePerItem,
      discount: productExist.discount || 0,
      mainImage,
    });

    // Reduce product stock
    productExist.quantity -= product.quantity;
    await productExist.save(); // Save the updated product stock
  }

  // Apply coupon (if exists)
  let finalPrice = orderPrice;
  if (couponExist) {
    if (couponExist.discountType === discountTypes.FIXED_AMOUNT) {
      finalPrice = Math.max(orderPrice - couponExist.discountAmount, 0);
    } else {
      finalPrice = Math.max(orderPrice - (orderPrice * (couponExist.discountAmount / 100)), 0);
    }
  }

  // Create order (CASH only)
  const order = new Order({
    user,
    address: { phone, street },
    ...(couponExist && {
      coupon: {
        couponId: couponExist._id,
        code: coupon,
        discount: couponExist.discountAmount,
      },
    }),
    paymentMethod: 'cash',
    products: orderProducts,
    orderPrice,
    finalPrice,
  });

  const createdOrder = await order.save();
  if (!createdOrder) return next(new AppError(messages.order.failToCreate, 500));

  await Cart.deleteOne({ user });

  return res.status(200).json({
    message: messages.order.created,
    success: true,
    data: createdOrder,
  });
};

// update order
export const updateOrder = async (req, res, next) => {
  // get data from req 
  const { orderId } = req.params;
  const { phone, street, paymentMethod, status } = req.body;
  const user = req.authUser._id;
  const userRole = req.authUser.role;

  // check if order exist
  const orderExist = await Order.findById(orderId);
  if (!orderExist) {
    return next(new AppError(messages.order.notExist, 404));
  }

  // check user authorization
  if (userRole !== roles.ADMIN && !orderExist.user.equals(user)) {
    return next(new AppError(messages.user.unauthorized, 403));
  }

// handle status update by admin
if (userRole === roles.ADMIN && status) {
  const newStatus = status.toLowerCase();

  // handle refunded or canceled — both restore product quantities
  if (
    (newStatus === "refunded" || newStatus === "canceled") &&
    orderExist.status !== "refunded" &&
    orderExist.status !== "canceled"
  ) {
    for (const productItem of orderExist.products) {
      const productExist = await products.findById(productItem.productId);
      if (productExist) {
        productExist.quantity += productItem.quantity; // restore stock
        await productExist.save();
      }
    }
  }

  // update order status
  orderExist.status = newStatus;
}


  // update address fields if provided
  if (phone) orderExist.address.phone = phone;
  if (street) orderExist.address.street = street;

  // update payment method if provided
  if (paymentMethod) {
    orderExist.paymentMethod = paymentMethod;
  }

  // save update 
  const updatedOrder = await orderExist.save();

  if (!updatedOrder) {
    return next(new AppError(messages.order.failToUpdate, 400));
  }

  // send response
  return res.status(200).json({
    message: messages.order.updated,
    success: true,
    data: updatedOrder,
  });
};


// get all orders
export const getOrders = async (req, res, next) => {
  const user = req.authUser._id;
  const userRole = req.authUser.role;

  let orders;

  // If user -> show only their orders
  if (userRole === roles.USER) {
    const apiFeature = new ApiFeature(Order.find({ user }), req.query)
      .filter()
      .sort()
      .select()
      .pagination(); // user can still use pagination
    orders = await apiFeature.mongooseQuery;
  }

  // If admin -> show all orders (no pagination)
  else if (userRole === roles.ADMIN) {
    const apiFeature = new ApiFeature(Order.find(), req.query)
      .filter()
      .sort()
      .select(); // no pagination for admin
    orders = await apiFeature.mongooseQuery;
  }

  // Send response
  res.status(200).json({
    message: messages.order.fetchedSuccessfully,
    success: true,
    count: orders.length,
    data: orders
  });
};

//  Get Specific Order by ID
export const getSpecificOrder = async (req, res, next) => {
  const user = req.authUser._id;
  const userRole = req.authUser.role;
  const { orderId } = req.params;

  // find order by ID
  const orderExist = await Order.findById(orderId);
  if (!orderExist) {
    return next(new AppError(messages.order.notExist, 404));
  }

  // check if normal user and not owner
  if (userRole === roles.USER && !orderExist.user.equals(user)) {
    return next(new AppError(messages.user.unauthorized, 403));
  }

  // send response
  return res.status(200).json({
    message: messages.order.fetchedSuccessfully,
    success: true,
    data: orderExist
  });
};


// Delete Order
export const deleteOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const user = req.authUser._id;
  const userRole = req.authUser.role;

  // check if order exist
  const orderExist = await Order.findById(orderId);
  if (!orderExist) {
    return next(new AppError(messages.order.notExist, 404));
  }

  // check authorization
  if (userRole !== roles.ADMIN && !orderExist.user.equals(user)) {
    return next(new AppError(messages.user.unauthorized, 403));
  }

  // delete order
  const deletedOrder = await Order.findByIdAndDelete(orderId);
  if (!deletedOrder) {
    return next(new AppError(messages.order.failToDelete, 500));
  }

  // response
  return res.status(200).json({
    message: messages.order.deleted,
    success: true,
  });
};
