import slugify from 'slugify';
import { Category } from '../../../db/index.js';
import { AppError } from '../../utils/appError.js';
import { messages } from '../../utils/constant/messages.js';
import { ApiFeature } from '../../utils/apiFeatures.js';




//  Add Category 
export const addCategory = async (req, res, next) => {
   let { name } = req.body;
   name = name.toLowerCase();

   // check existence
   const categoryExist = await Category.findOne({ name });
   if (categoryExist) {
      return next(new AppError(messages.category.alreadyExist, 409));
   }

   // prepare data
   const slug = slugify(name);
   const category = new Category({
      name,
      slug,
      createdBy: req.authUser._id
   });

   // save to DB
   const createdCategory = await category.save();
   if (!createdCategory) {
      return next(new AppError(messages.category.failToCreate, 500));
   }

   res.status(201).json({
      message: messages.category.created,
      success: true,
      data: createdCategory
   });
};

// update category
export const updateCategory = async (req, res, next) => {
   // get data from req
   let { name } = req.body;
   name = name?.toLowerCase();
   const { categoryId } = req.params;

   // check existence
   const categoryExist = await Category.findById(categoryId);
   if (!categoryExist) {
      return next(new AppError(messages.category.notExist, 404));
   }

   // check name existence
   if (name) {
      const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } });
      if (nameExist) {
         return next(new AppError(messages.category.alreadyExist, 409));
      }
      // update fields
      categoryExist.name = name;           
      categoryExist.slug = slugify(name);    
   }

   // update in db
   const updatedCategory = await categoryExist.save();
   if (!updatedCategory) {
      return next(new AppError(messages.category.failToUpdate, 500));
   }

   // send response
   res.status(200).json({
      message: messages.category.updated,
      success: true,
      data: updatedCategory
   });
};


// get all categories
export const getCategories = async (req, res, next) => {
   // build query with ApiFeature (filtering, sorting, pagination, selecting)
   const apiFeature = new ApiFeature(
      Category.find(), 
      req.query
   ).pagination().sort().select().filter();

   // execute query
   const categories = await apiFeature.mongooseQuery;

   // send response
   return res.status(200).json({
      success: true,
      data: categories
   });
};


// Get specific category
export const getCategoryById = async (req, res, next) => {
   // get data
   const { categoryId } = req.params;

   // find category by id
   const category = await Category.findById(categoryId);

   // check category existence
   if (!category) {
      return next(new AppError(messages.category.notExist, 404));
   }

   // send response
   return res.status(200).json({
      success: true,
      data: category
   });
};

// Delete category
export const deleteCategory = async (req, res, next) => {
   // get data
   const { categoryId } = req.params;

   // check category existence
   const category = await Category.findById(categoryId);
   if (!category) {
      return next(new AppError(messages.category.notExist, 404));
   }

   // delete category from db
   const deletedCategory = await Category.findByIdAndDelete(categoryId);
   if (!deletedCategory) {
      return next(new AppError(messages.category.failToDelete, 500));
   }

   // send response
   return res.status(200).json({
      message: messages.category.deleted,
      success: true
   });
};