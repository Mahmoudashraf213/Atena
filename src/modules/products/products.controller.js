import { Category, Coupon, products } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { discountTypes } from "../../utils/constant/enum.js";
import { messages } from "../../utils/constant/messages.js";

// Add products
export const addProducts = async (req, res, next) => {
  const { name, price, quantity, description, size, color, categoryId, couponId } = req.body;

  // Convert name to lowercase for consistency
  const formattedName = name?.toLowerCase();

  // Check if the product already exists (same name & size)
  const existingProduct = await products.findOne({ name: formattedName, size });
  if (existingProduct) {
    return next(new AppError(messages.products.alreadyExist, 400));
  }

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError(messages.category.notExist, 404));
  }

  // Check if coupon exists (optional)
  let coupon = null;
  if (couponId) {
    coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return next(new AppError(messages.coupon.notExist, 404));
    }
  }

  // Handle multiple image uploads
  let Images = [];
  if (req.files?.Images && req.files.Images.length > 0) {
    try {
      for (let file of req.files.Images) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
          folder: "Atena/products",
        });
        Images.push({ secure_url, public_id });
      }
      req.failImages = Images.map(img => img.public_id); // track for rollback
    } catch (error) {
      // rollback uploaded images if error
      if (Images.length > 0) {
        for (let img of Images) {
          await deleteCloudImage(img.public_id);
        }
      }
      return next(new AppError(messages.products.failToCreate, 500));
    }
  }

  // Calculate final price
  let finalPrice = price;
  if (coupon) {
    if (coupon.discountType === discountTypes.PERCENTAGE) {
      finalPrice = price - (price * coupon.discountAmount / 100);
    } else if (coupon.discountType === discountTypes.FIXED_AMOUNT) {
      finalPrice = price - coupon.discountAmount;
    }
    if (finalPrice < 0) finalPrice = 0;
  }

  // Create new product instance
  const product = new products({
    name: formattedName,
    price: `${price} EGP`,
    finalPrice: `${finalPrice} EGP`,
    quantity,
    description,
    size,
    color,
    Images, 
    categoryId,
    couponId: couponId || null,
    createdBy: req.authUser._id,
  });

  // Save the new product
  let newProduct = await product.save();
  if (!newProduct) {
    if (Images.length > 0) {
      for (let img of Images) {
        await deleteCloudImage(img.public_id);
      }
    }
    return next(new AppError(messages.products.failToCreate, 500));
  }

  // Populate category and coupon
  newProduct = await products.findById(newProduct._id)
    .populate("categoryId")
    .populate("couponId");

  // Send response
  res.status(201).json({
    success: true,
    message: messages.products.created,
    data: newProduct,
  });
};

// Update products
export const updateProducts = async (req, res, next) => {
  const { productsId } = req.params;
  const { name, price, quantity, description, size, color, couponId, categoryId } = req.body;

  //  Find product
  const product = await products.findById(productsId);
  if (!product) {
    return next(new AppError(messages.products.notExist, 404));
  }

  //  Normalize name
  const formattedName = name ? name.toLowerCase() : undefined;

  //  Check for duplicate name
  if (formattedName) {
    const existingProduct = await products.findOne({
      name: formattedName,
      _id: { $ne: productsId },
    });
    if (existingProduct) {
      return next(new AppError(messages.products.alreadyExist, 400));
    }
    product.name = formattedName;
  }

  req.failImages = [];

  //  Handle replacing images
  if (req.files?.Images && req.files.Images.length > 0) {
    // Delete old images first
    if (product.Images?.length > 0) {
      for (let oldImg of product.Images) {
        await deleteCloudImage(oldImg.public_id);
      }
    }

    let uploadedImages = [];
    try {
      for (let file of req.files.Images) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
          folder: "Atena/products",
        });
        uploadedImages.push({ secure_url, public_id });
      }

      // Replace old images with new ones
      product.Images = uploadedImages;
      req.failImages = uploadedImages.map(img => img.public_id);
    } catch (error) {
      // Rollback uploaded images
      for (let img of uploadedImages) {
        await deleteCloudImage(img.public_id);
      }
      return next(new AppError(messages.products.failToUpdate, 500));
    }
  }

  //  Update other fields
  if (price !== undefined) product.price = `${price} EGP`;
  if (quantity !== undefined) product.quantity = quantity;
  if (description) product.description = description;
  if (size) product.size = size;
  if (color) product.color = color;

  //  Update category
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError(messages.category.notExist, 404));
    }
    product.categoryId = categoryId;
  }

  //  Handle coupon & final price
  let numericPrice = price !== undefined ? parseFloat(price) : parseFloat(product.price);
  if (couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return next(new AppError(messages.coupon.notExist, 404));
    }

    product.couponId = couponId;

    let finalPrice = numericPrice;
    if (coupon.discountType === "percentage") {
      finalPrice -= (finalPrice * coupon.discountAmount) / 100;
    } else if (coupon.discountType === "fixed_amount") {
      finalPrice -= coupon.discountAmount;
    }
    if (finalPrice < 0) finalPrice = 0;

    product.finalPrice = `${finalPrice.toFixed(2)} EGP`;
  } else {
    product.finalPrice = `${numericPrice.toFixed(2)} EGP`;
    product.couponId = null;
  }

  //  Save updated product
  const updatedProduct = await product.save();
  if (!updatedProduct) {
    return next(new AppError(messages.products.failToUpdate, 500));
  }

  //  Populate for response
  await updatedProduct.populate([
    { path: "categoryId", select: "name slug" },
    { path: "couponId", select: "code discountAmount discountType fromDate toDate" },
  ]);

  return res.status(200).json({
    message: messages.products.updated,
    success: true,
    data: updatedProduct,
  });
};

// get all products
export const getAllProducts = async (req, res, next) => { 
    const product = await products.find()

    if (!product || product.length === 0) {
        return next(new AppError(messages.products.failToFetch, 404));
    }

    res.status(200).json({
        success: true,
        message: messages.products.fetchedSuccessfully,
        count: product.length,
        data: product,

    })
}


// get products by id
export const getProductsById = async (req, res, next) => {
    const { productsId } = req.params;
    
    // Find products by ID
    const product = await products.findById(productsId); 
    if (!product) {
        return next(new AppError(messages.products.notExist, 404));
    }

    res.status(200).json({
        success: true,
        message: messages.products.fetchedSuccessfully,
        data: product,
    });
}


// delete products 
export const deleteProductsById = async (req, res, next) => {
  const { productsId } = req.params;

  // Ensure productsId is provided
  if (!productsId) {
    return next(new AppError(messages.products.notExist, 400));
  }

  // Find the product by ID
  const product = await products.findById(productsId);
  if (!product) {
    return next(new AppError(messages.products.notExist, 404));
  }

  // Delete all associated images from Cloudinary
  if (product.Images && product.Images.length > 0) {
    for (let img of product.Images) {
      if (img.public_id) {
        await deleteCloudImage(img.public_id);
      }
    }
  }

  // Delete the product from DB
  await product.deleteOne();

  // Send response
  return res.status(200).json({
    message: messages.products.deleted,
    success: true,
  });
};