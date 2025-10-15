import slugify from 'slugify';
import { Category , products} from '../../../db/index.js';
import { AppError } from '../../utils/appError.js';
import { messages } from '../../utils/constant/messages.js';
import { ApiFeature } from '../../utils/apiFeatures.js';


//  Add Category 
export const addCategory = async (req, res, next) => {
   let { name } = req.body;
   name = name.toLowerCase();

   // check if category already exists
   const categoryExist = await Category.findOne({ name });
   if (categoryExist) {
      return next(new AppError(messages.category.alreadyExist, 409));
   }

   // create new category
   const slug = slugify(name);
   const category = new Category({
      name,
      slug,
      createdBy: req.authUser._id
   });

   const createdCategory = await category.save();
   if (!createdCategory) {
      return next(new AppError(messages.category.failToCreate, 500));
   }

   return res.status(201).json({
      message: messages.category.created,
      success: true,
      data: createdCategory
   });
};



// update category
export const updateCategory = async (req, res, next) => {
   let { name } = req.body;
   name = name?.toLowerCase();
   const { categoryId } = req.params;

   const categoryExist = await Category.findById(categoryId);
   if (!categoryExist) {
      return next(new AppError(messages.category.notExist, 404));
   }

   if (name) {
      const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } });
      if (nameExist) {
         return next(new AppError(messages.category.alreadyExist, 409));
      }
      categoryExist.name = name;
      categoryExist.slug = slugify(name);
   }

   const updatedCategory = await categoryExist.save();
   if (!updatedCategory) {
      return next(new AppError(messages.category.failToUpdate, 500));
   }

   return res.status(200).json({
      message: messages.category.updated,
      success: true,
      data: updatedCategory
   });
};



// get all categories
export const getCategories = async (req, res, next) => {
   const apiFeature = new ApiFeature(Category.find(), req.query)
      .pagination()
      .sort()
      .select()
      .filter();

   const categories = await apiFeature.mongooseQuery;

   return res.status(200).json({
      success: true,
      data: categories
   });
};



// Get specific category
export const getCategoryById = async (req, res, next) => {
   const { categoryId } = req.params;

   // populate category with its products
   const category = await Category.findById(categoryId).populate({
      path: 'products',
      select: 'name price finalPrice'
   });

   if (!category) {
      return next(new AppError(messages.category.notExist, 404));
   }

   return res.status(200).json({
      success: true,
      data: category
   });
};

// Delete category
export const deleteCategory = async (req, res, next) => {
   const { categoryId } = req.params;

   const category = await Category.findById(categoryId);
   if (!category) {
      return next(new AppError(messages.category.notExist, 404));
   }

   const deletedCategory = await Category.findByIdAndDelete(categoryId);
   if (!deletedCategory) {
      return next(new AppError(messages.category.failToDelete, 500));
   }

   // Optionally, unset category from products that belonged to it
   await products.updateMany({ category: categoryId }, { $unset: { category: "" } });

   return res.status(200).json({
      message: messages.category.deleted,
      success: true
   });
};