import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import productRoutes from '../modules/product/product.routes';
import orderRoutes from '../modules/order/order.routes';
import userRoutes from '../modules/user/user.routes';
import cartRoutes from '../modules/cart/cart.routes';
import { getCategories } from '../modules/product/product.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/user', userRoutes);
router.use('/cart', cartRoutes);
router.get('/categories', getCategories as any);

export default router;
