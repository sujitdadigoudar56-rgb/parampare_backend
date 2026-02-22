import Wishlist from './wishlist.model';

export class WishlistService {
  async getWishlist(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    return wishlist?.items || [];
  }

  async addToWishlist(userId: string, productId: string) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }
    const already = wishlist.items.some((i: any) => i.product.toString() === productId);
    if (!already) {
      wishlist.items.push({ product: productId } as any);
      await wishlist.save();
    }
    return (await wishlist.populate('items.product')).items;
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return [];
    wishlist.items = wishlist.items.filter((i: any) => i.product.toString() !== productId);
    await wishlist.save();
    return (await wishlist.populate('items.product')).items;
  }

  async toggleWishlist(userId: string, productId: string) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }
    const idx = wishlist.items.findIndex((i: any) => i.product.toString() === productId);
    if (idx > -1) {
      wishlist.items.splice(idx, 1);
      await wishlist.save();
      return { added: false, items: (await wishlist.populate('items.product')).items };
    } else {
      wishlist.items.push({ product: productId } as any);
      await wishlist.save();
      return { added: true, items: (await wishlist.populate('items.product')).items };
    }
  }
}

export const wishlistService = new WishlistService();
