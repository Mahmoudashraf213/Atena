import { model, Schema } from "mongoose";
import { clothingSizes, discountTypes} from "../../src/utils/constant/enum.js";

// schema
const productsSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      enum: Object.values(clothingSizes), // e.g., XS, S, M, L, XL, XXL
      required: true,
    },
    Images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      }
    ],
    color: {
      type: String, 
      trim: true,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: Object.values(discountTypes),
      default: discountTypes.PERCENTAGE
    },
    finalPrice: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// model
export const products = model("Products", productsSchema);
