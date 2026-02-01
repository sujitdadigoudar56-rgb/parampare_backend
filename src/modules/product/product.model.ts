import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  attributes: Record<string, any>;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  badges: string[];
  deliveryTimeDays: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      index: true,
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    deliveryTimeDays: {
      type: String,
      default: "5-7",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common filters
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
