import multer from 'multer';
import path from 'path';
import fs from 'fs';

// /tmp is the only writable directory in serverless environments (Vercel, AWS Lambda)
const LOCAL_UPLOADS_DIR = process.env.VERCEL ? '/tmp/uploads/products' : path.join(__dirname, '../../../../uploads/products');

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (_req: any, file: any, cb: any) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, GIF images are allowed'));
  }
};

const buildStorage = () => {
  const keyId = process.env.ACCESS_KEY_ID;
  const secret = process.env.SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;
  const region = process.env.REGION || 'ap-south-1';

  if (keyId && secret && bucket) {
    const { S3Client } = require('@aws-sdk/client-s3');
    const multerS3Mod = require('multer-s3');
    const multerS3fn = multerS3Mod.default ?? multerS3Mod;

    const s3 = new S3Client({
      region,
      credentials: { accessKeyId: keyId, secretAccessKey: secret },
    });

    console.log(`[upload] Using S3 bucket "${bucket}" in ${region}`);

    return multerS3fn({
      s3,
      bucket,
      contentType: multerS3fn.AUTO_CONTENT_TYPE,
      key: (_req: any, file: any, cb: any) => {
        const ext = path.extname(file.originalname);
        cb(null, `products/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    });
  }

  // Fallback: local disk (mkdirSync is lazy — runs per request, not at module load)
  console.log('[upload] AWS credentials not found — using local disk storage');
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
      cb(null, LOCAL_UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
};

export const uploadToS3 = multer({
  storage: buildStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
