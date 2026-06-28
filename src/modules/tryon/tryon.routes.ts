import { Router } from 'express';
import multer from 'multer';
import { createTryOn, getTryOn } from './tryon.controller';
import { protect } from '../../core/middleware/auth.middleware';

// In-memory upload: the garment is forwarded to the AI provider as a base64
// data URI, so we never need to persist it to disk/S3.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

const router = Router();

// Try-on requires an authenticated user (and incurs AI cost per request).
router.use(protect as any);

router.post('/', upload.single('garment'), createTryOn as any);
router.get('/:jobId', getTryOn as any);

export default router;
