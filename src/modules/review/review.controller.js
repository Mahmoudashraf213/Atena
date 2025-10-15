import { products, Review } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// add review
export const addReview = async (req, res, next) => {
  // Extract review data from request body
  const { comment, rate } = req.body;

  // Extract productId from request params
  const { productId } = req.params;

  // Get the logged-in user's ID from auth middleware
  const userId = req.authUser._id;

  // Check if the product exists
  const productExist = await products.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.products.notExist, 404));
  }

  // Check if the user has already reviewed this product
  // If yes, update the existing review with new data
  const reviewExist = await Review.findOneAndUpdate(
    { user: userId, product: productId },
    { rate, comment },
    { new: true } 
  );

  // Data variable will hold either updated or newly created review
  let data = reviewExist;

  // If no existing review found → create a new one
  if (!reviewExist) {
    // Prepare a new review document
    const review = new Review({
      comment,
      rate,
      user: userId,
      product: productId,
      isVerified: true, 
    });

    // Save the new review into database
    const createdReview = await review.save();

    // Handle failure in saving
    if (!createdReview) {
      return next(new AppError(messages.review.failToCreate, 500));
    }

    // Assign newly created review to data
    data = createdReview;
  }

  // Send success response
  return res.status(201).json({
    message: messages.review.created,
    data,
  });
};


// Get all reviews for a product
export const getReviews = async (req, res, next) => {
  const { productId } = req.params;

  // Apply query features (pagination, sorting, selection, filtering)
  const apiFeature = new ApiFeature(
    Review.find({ product: productId }).populate("user", "firstName lastName"),req.query).pagination().sort().select().filter();

  // Execute query
  const reviews = await apiFeature.mongooseQuery;

  // Send response
  return res.status(200).json({
    message: messages.review.fetchedSuccessfully,
    success: true,
    count: reviews.length,
    data: reviews,
  });
};

// Get a specific review for a product
export const getSpecificReview = async (req, res, next) => {
  const { productId, reviewId } = req.params;

  // Find review by ID and make sure it belongs to the product
  const reviewExist = await Review.findOne({ _id: reviewId, product: productId }).populate("user", "firstName lastName");

  // Handle case when review does not exist
  if (!reviewExist) {
    return next(new AppError(messages.review.notExist, 404));
  }

  // Send response
  return res.status(200).json({
    message: messages.review.fetchedSuccessfully,
    success: true,
    data: reviewExist,
  });
};


// Delete review
export const deleteReview = async (req, res, next) => {
  const { productId, reviewId } = req.params;
  const userId = req.authUser._id; // Authenticated user's ID

  // User can only delete their own review (role logic is handled in router)
  const reviewExist = await Review.findOneAndDelete({
    _id: reviewId,
    product: productId,
    user: userId,
  });

  // Handle fail
  if (!reviewExist) {
    return next(new AppError(messages.review.notExist, 404));
  }

  // Send response
  return res.status(200).json({
    message: messages.review.deleted,
    success: true,
  });
};