import Address, { IAddress } from './address.model';
import Wishlist, { IWishlist } from './wishlist.model';

export class UserService {
  // Address Methods
  async getAddresses(userId: string): Promise<IAddress[]> {
    return await Address.find({ userId });
  }

  async addAddress(userId: string, data: Partial<IAddress>): Promise<IAddress> {
    // If set as default, unset others // Optional logic but good UX
    if (data.isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
    }
    return await Address.create({ ...data, userId });
  }

  async updateAddress(userId: string, addressId: string, data: Partial<IAddress>): Promise<IAddress | null> {
    if (data.isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
    }
    return await Address.findOneAndUpdate({ _id: addressId, userId }, data, { new: true });
  }

  async deleteAddress(userId: string, addressId: string): Promise<IAddress | null> {
    return await Address.findOneAndDelete({ _id: addressId, userId });
  }

  // Wishlist Methods
  async getWishlist(userId: string): Promise<any> {
    const wishlist = await Wishlist.findOne({ userId }).populate('products');
    return wishlist ? wishlist.products : [];
  }

  async toggleWishlist(userId: string, productId: string): Promise<any[]> {
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    // Convert string to ObjectId for comparison is usually handled by mongoose, but good to be explicit or use string helpers
    // Mongoose array methods:
    const index = wishlist.products.indexOf(productId as any);
    if (index > -1) {
       // Remove
       wishlist.products.splice(index, 1);
    } else {
       // Add
       wishlist.products.push(productId as any);
    }

    await wishlist.save();
    
    // Return populated? Or just list. Doc says "Add/Remove from wishlist".
    const populated = await wishlist.populate('products');
    return populated.products as any;
  }
}

export const userService = new UserService();
