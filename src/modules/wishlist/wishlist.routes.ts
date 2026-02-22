import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist } from './wishlist.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();
router.use(protect as any);

router.get('/', getWishlist as any);
router.post('/add', addToWishlist as any);
router.delete('/remove', removeFromWishlist as any);
router.post('/toggle', toggleWishlist as any);

export default router;
