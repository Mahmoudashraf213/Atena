import { Coupon } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { AppError } from "../../utils/appError.js";
import { discountTypes } from "../../utils/constant/enum.js";
import { messages } from "../../utils/constant/messages.js";

// add coupon
export const addCoupon = async (req, res, next) => {
    // get data from req
    const { code, discountAmount, discountType, toDate, fromDate } = req.body;
    const userId = req.authUser._id;

    // check if coupon already exists
    const couponExist = await Coupon.findOne({ code });
    if (couponExist) {
        return next(new AppError(messages.coupon.alreadyExist, 409));
    }

    // check if discount type is percentage and amount > 100
    if (discountType === discountTypes.PERCENTAGE && discountAmount > 100) {
        return next(new AppError(messages.coupon.discountAmount, 400));
    }

    // prepare new coupon object
    const coupon = new Coupon({
        code,
        discountAmount,
        discountType,
        toDate,
        fromDate,
        createdBy: req.authUser._id
    });

    // save coupon to DB
    const createdCoupon = await coupon.save();

    // handle fail to create
    if (!createdCoupon) {
        return next(new AppError(messages.coupon.failToCreate, 500));
    }

    // send response
    return res.status(201).json({
        message: messages.coupon.created,
        success: true,
        data: createdCoupon
    });
};

// update coupon
export const updateCoupon = async (req, res, next) => {
    // get data from req
    const { couponId } = req.params;
    const { code, discountAmount, discountType, toDate, fromDate } = req.body;

    // check if coupon exists
    const couponExist = await Coupon.findById(couponId);
    if (!couponExist) {
        return next(new AppError(messages.coupon.notExist, 404));
    }

    // check if code already exists (excluding current coupon)
    if (code) {
        const codeExist = await Coupon.findOne({ code, _id: { $ne: couponId } });
        if (codeExist) {
            return next(new AppError(messages.coupon.alreadyExist, 409));
        }
    }

    // check if discount type is percentage and amount > 100
    if (discountType === discountTypes.PERCENTAGE && discountAmount > 100) {
        return next(new AppError(messages.coupon.discountAmount, 400));
    }

    // update coupon fields
    couponExist.code = code || couponExist.code;
    couponExist.discountAmount = discountAmount || couponExist.discountAmount;
    couponExist.discountType = discountType || couponExist.discountType;
    couponExist.toDate = toDate || couponExist.toDate;
    couponExist.fromDate = fromDate || couponExist.fromDate;

    // save updated coupon
    const updatedCoupon = await couponExist.save();

    // send response
    return res.status(200).json({
        message: messages.coupon.updated,
        success: true,
        data: updatedCoupon
    });
};


// get all coupons
export const getAllCoupon = async (req, res, next) => {
    // build query with ApiFeature
    const apiFeature = new ApiFeature(Coupon.find(), req.query).pagination().sort().select().filter();

    // execute query
    const coupons = await apiFeature.mongooseQuery;

    // get count of all coupons in DB (without pagination)
    const count = await Coupon.countDocuments();

    // check if no coupons found after query
    if (!coupons.length) {
        return res.status(404).json({
            message: messages.coupon.notExist || "No coupons found with the given query",
            success: false,
            count: 0,
            data: []
        });
    }

    // send res
    return res.status(200).json({
        message: messages.coupon.fetchedSuccessfully,
        success: true,
        count,
        data: coupons
    });
};


// get specific coupon by id
export const getCouponById = async (req, res, next) => {
  // get data from req 
  const { couponId } = req.params;

  // check if coupon exist
  const couponExist = await Coupon.findById(couponId);

  if (!couponExist) {
    return next(new AppError(messages.coupon.notExist, 404));
  }

  // send res 
  return res.status(200).json({
    message: messages.coupon.fetchedSuccessfully,
    success: true,
    data: couponExist
  });
};


// delete coupon
export const deleteCoupon = async (req, res, next) => {
  // get data from req
  const { couponId } = req.params;

  // check if coupon exist and delete it
  const couponExist = await Coupon.findByIdAndDelete(couponId);

  if (!couponExist) {
    return next(new AppError(messages.coupon.notExist, 404));
  }

  // send res
  return res.status(200).json({
    message: messages.coupon.deleted,
    success: true,
  });
};