import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import productRoutes from '../modules/product/product.routes';
import categoryRoutes from '../modules/category/category.routes';
import orderRoutes from '../modules/order/order.routes';
import userRoutes from '../modules/user/user.routes';
import cartRoutes from '../modules/cart/cart.routes';
import adminRoutes from '../modules/admin/admin.routes';
import wishlistRoutes from '../modules/wishlist/wishlist.routes';
const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/user', userRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
