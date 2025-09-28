import { model, Schema } from "mongoose";
import { clothingSizes} from "../../src/utils/constant/enum.js";

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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    finalPrice: {
      type: String, 
      required: false,
      trim: true,
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
