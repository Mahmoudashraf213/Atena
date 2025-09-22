import { products } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { messages } from "../../utils/constant/messages.js";

// Add products
export const addProducts = async (req, res, next) => {
  const { name, price, quantity, description, size, color } = req.body;

  // Convert name to lowercase for consistency
  const formattedName = name?.toLowerCase();

  // Check if the product already exists (same name & size)
  const existingProduct = await products.findOne({ name: formattedName, size });
  if (existingProduct) {
    return next(new AppError(messages.products.alreadyExist, 400));
  }

  // Handle image upload
  let Image = { secure_url: "", public_id: "" };
  if (req.files?.Image) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.Image[0].path,
      { folder: "Atena/products" }
    );
    Image = { secure_url, public_id };
    req.failImages = [public_id];
  }

  // Create new product instance
  const product = new products({
    name: formattedName,
    price: price !== undefined ? `${price} EGP` : undefined, 
    quantity,
    description,
    size,
    color,
    Image,
    createdBy: req.authUser._id,
  });

  // Save the new product
  const newProduct = await product.save();
  if (!newProduct) {
    if (req.files?.Image) {
      await deleteCloudImage(req.failImages[0]); // Rollback if save fails
    }
    return next(new AppError(messages.products.failToCreate, 500));
  }

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
  const { name, price, quantity, description, size, color, coupon } = req.body;

  // Convert name to lowercase if provided
  const formattedName = name ? name.toLowerCase() : undefined;

  // Find existing product by ID
  const product = await products.findById(productsId); 
  if (!product) {
    return next(new AppError(messages.products.notExist, 404));
  }

  // Check for duplicate name
  if (formattedName) {
    const existingProduct = await products.findOne({
      name: formattedName,
      _id: { $ne: productsId },
    });
    if (existingProduct) {
      return next(new AppError(messages.products.alreadyExist, 400));
    }
  }

  req.failImages = [];

  // Handle image update
  if (req.files?.Image) {
    if (product.Image?.public_id) {
      await deleteCloudImage(product.Image.public_id);
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.Image[0].path,
      { folder: "Atena/products" }
    );
    product.Image = { secure_url, public_id };
    req.failImages.push(public_id);
  }

  // Update fields
  if (formattedName) product.name = formattedName;
  if (price !== undefined) product.price = `${price} EGP`;
  if (quantity !== undefined) product.quantity = quantity;
  if (description) product.description = description;
  if (size) product.size = size;
  if (color) product.color = color;

  // Save
  const updatedProduct = await product.save(); 
  if (!updatedProduct) {
    return next(new AppError(messages.products.failToUpdate, 500));
  }

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

  // Find the products item by ID
  const product = await products.findById(productsId);
  if (!product) {
    return next(new AppError(messages.products.notExist, 404));
  }

  // Delete the associated image from Cloudinary (if exists)
  if (product.Image?.public_id) {
    await deleteCloudImage(product.Image.public_id);
  }

  // Delete the products item from the database
  await product.deleteOne();

  // Send response
  res.status(200).json({
    message: messages.products.deleted,
    success: true,
  });
};