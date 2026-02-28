import Wishlist from './wishlist.model';

export class WishlistService {
  async getWishlist(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    if (!wishlist) return [];
    // Filter out items where product no longer exists in DB
    return wishlist.items.filter((i: any) => i.product);
  }

  async addToWishlist(userId: string, productId: string) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }
    const already = wishlist.items.some((i: any) => i.product && i.product.toString() === productId);
    if (!already) {
      wishlist.items.push({ product: productId } as any);
      await wishlist.save();
    }
    const populated = await wishlist.populate('items.product');
    return populated.items.filter((i: any) => i.product);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return [];
    wishlist.items = wishlist.items.filter((i: any) => i.product && i.product.toString() !== productId);
    await wishlist.save();
    const populated = await wishlist.populate('items.product');
    return populated.items.filter((i: any) => i.product);
  }

  async toggleWishlist(userId: string, productId: string) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }
    const idx = wishlist.items.findIndex((i: any) => i.product && i.product.toString() === productId);
    if (idx > -1) {
      wishlist.items.splice(idx, 1);
      await wishlist.save();
      const populated = await wishlist.populate('items.product');
      return { added: false, items: populated.items.filter((i: any) => i.product) };
    } else {
      wishlist.items.push({ product: productId } as any);
      await wishlist.save();
      const populated = await wishlist.populate('items.product');
      return { added: true, items: populated.items.filter((i: any) => i.product) };
    }
  }
}

export const wishlistService = new WishlistService();
