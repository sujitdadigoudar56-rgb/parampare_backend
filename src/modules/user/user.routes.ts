import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from './user.controller';
import { protect } from '../../core/middleware/auth.middleware';

const router = Router();

router.use(protect as any); // All routes private

router.get('/profile', getProfile as any);
router.patch('/profile', updateProfile as any);

router.get('/addresses', getAddresses as any);
router.post('/address', addAddress as any);

router.put('/address/:id', updateAddress as any);
router.delete('/address/:id', deleteAddress as any);

export default router;
