import { Category, products } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { discountTypes } from "../../utils/constant/enum.js";
import { messages } from "../../utils/constant/messages.js";

// Add products
export const addProducts = async (req, res, next) => {
  const { name, price, quantity, description, size, color, categoryId, discount, discountType } = req.body;

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

  // Create new product instance (without finalPrice)
  const product = new products({
    name: formattedName,
    price: `${price} EGP`,
    discount: discount || 0,
    discountType: discountType || discountTypes.PERCENTAGE,
    quantity,
    description,
    size,
    color,
    Images,
    categoryId,
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

  // Populate category
  newProduct = await products.findById(newProduct._id).populate("categoryId");

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
  const { name, price, quantity, description, size, color, categoryId, discount, discountType } = req.body;

  // Find existing product
  let product = await products.findById(productsId);
  if (!product) {
    return next(new AppError(messages.products.notExist, 404));
  }

  // Convert name to lowercase if provided
  const formattedName = name ? name.toLowerCase() : undefined;

  // If category is being updated, check if it exists
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError(messages.category.notExist, 404));
    }
  }

  // Handle updating images
  let newImages = [];
  if (req.files?.Images && req.files.Images.length > 0) {
    try {
      // Delete old images from Cloudinary
      if (product.Images && product.Images.length > 0) {
        for (let img of product.Images) {
          await deleteCloudImage(img.public_id);
        }
      }

      // Upload new images
      for (let file of req.files.Images) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
          folder: "Atena/products",
        });
        newImages.push({ secure_url, public_id });
      }
      req.failImages = newImages.map(img => img.public_id); // track for rollback
    } catch (error) {
      // rollback uploaded images if error
      if (newImages.length > 0) {
        for (let img of newImages) {
          await deleteCloudImage(img.public_id);
        }
      }
      return next(new AppError(messages.products.failToUpdate, 500));
    }
  }

  // Calculate final price if price/discount changed
  let finalPrice = product.finalPrice;
  const updatedPrice = price !== undefined ? price : parseFloat(product.price);
  const updatedDiscount = discount !== undefined ? discount : product.discount;
  const updatedDiscountType = discountType || product.discountType;

  if (updatedDiscount && updatedDiscount > 0) {
    if (updatedDiscountType === discountTypes.PERCENTAGE) {
      finalPrice = updatedPrice - (updatedPrice * updatedDiscount / 100);
    } else if (updatedDiscountType === discountTypes.FIXED_AMOUNT) {
      finalPrice = updatedPrice - updatedDiscount;
    }
    if (finalPrice < 0) finalPrice = 0;
  } else {
    finalPrice = updatedPrice;
  }

  // Update product fields
  product.name = formattedName || product.name;
  product.price = price !== undefined ? `${updatedPrice} EGP` : product.price;
  product.finalPrice = `${finalPrice} EGP`;  
  product.discount = updatedDiscount;
  product.discountType = updatedDiscountType;
  product.quantity = quantity ?? product.quantity;
  product.description = description ?? product.description;
  product.size = size ?? product.size;
  product.color = color ?? product.color;
  product.categoryId = categoryId ?? product.categoryId;
  if (newImages.length > 0) product.Images = newImages;

  // Save updated product
  let updatedProduct = await product.save();
  if (!updatedProduct) {
    return next(new AppError(messages.products.failToUpdate, 500));
  }

  // Populate category
  updatedProduct = await products.findById(updatedProduct._id)
    .populate("categoryId");

  // Send response
  res.status(200).json({
    success: true,
    message: messages.products.updated,
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


// add global discount to all products
export const addGlobalDiscount = async (req, res, next) => {
  const { discount, discountType } = req.body;

  // Fetch all products
  const allProducts = await products.find();

  // Build bulk update operations
  const bulkUpdates = allProducts.map((product) => {
    // Convert "199 EGP" -> 199
    const priceValue = parseFloat(product.price);

    let finalPrice = priceValue;

    if (discountType === discountTypes.PERCENTAGE) {
      finalPrice = priceValue - (priceValue * discount) / 100;
    } else if (discountType === discountTypes.FIXED_AMOUNT) {
      finalPrice = priceValue - discount;
    }

    if (finalPrice < 0) finalPrice = 0;

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          discount,
          discountType,
          finalPrice: `${finalPrice.toFixed(2)} EGP`, 
        },
      },
    };
  });

  await products.bulkWrite(bulkUpdates);

  return res.status(200).json({
    success: true,
    message: messages.discount.appliedSuccessfully,
  });
};

// removing global discount from all products
export const removeGlobalDiscount = async (req, res, next) => {
  // Fetch all products
  const allProducts = await products.find();

  if (!allProducts.length) {
    return res.status(404).json({
      success: false,
      message: messages.products.noProductsFound,
    });
  }

  // Build bulk update operations
  const bulkUpdates = allProducts.map((product) => {
    // (if price saved as string)
    const priceValue = parseFloat(product.price);

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          discount: 0,
          discountType: null,
          finalPrice: `${priceValue.toFixed(2)} EGP`, 
        },
      },
    };
  });

  await products.bulkWrite(bulkUpdates);

  return res.status(200).json({
    success: true,
    message: messages.discount.removedSuccessfully,
  });
};