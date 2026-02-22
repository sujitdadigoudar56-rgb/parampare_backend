import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWishlistItem {
  product: Types.ObjectId;
}

export interface IWishlist extends Document {
  user: Types.ObjectId;
  items: IWishlistItem[];
}

const wishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      },
    ],
  },
  { timestamps: true }
);

export default (mongoose.models['Wishlist'] || mongoose.model<IWishlist>('Wishlist', wishlistSchema));
