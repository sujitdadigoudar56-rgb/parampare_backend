import Cart, { ICart } from './cart.model';

export class CartService {
  async getCart(userId: string): Promise<ICart | null> {
    return await Cart.findOne({ user: userId }).populate('items.product');
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<ICart> {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex((item: any) => 
      item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId as any, quantity });
    }

    await cart.save();
    return (await cart.populate('items.product'));
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart> {
     const cart = await Cart.findOne({ user: userId });
     if (!cart) throw new Error('Cart not found');

     const itemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId);
     
     if (itemIndex > -1) {
         if (quantity <= 0) {
             cart.items.splice(itemIndex, 1);
         } else {
             cart.items[itemIndex].quantity = quantity;
         }
         await cart.save();
         return (await cart.populate('items.product'));
     }
     
     throw new Error('Item not in cart');
  }

  async removeFromCart(userId: string, productId: string): Promise<ICart> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter((item: any) => item.product.toString() !== productId);
    
    await cart.save();
    return (await cart.populate('items.product'));
  }

  async clearCart(userId: string): Promise<void> {
      await Cart.deleteOne({ user: userId });
  }
}

export const cartService = new CartService();
