"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOADS_DIR = path_1.default.join(__dirname, '../../../../uploads/products');
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const fileFilter = (_req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG, PNG, WebP, GIF images are allowed'));
    }
};
const buildStorage = () => {
    var _a;
    const keyId = process.env.AWS_ACCESS_KEY_ID;
    const secret = process.env.AWS_SECRET_ACCESS_KEY;
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION || 'ap-south-1';
    if (keyId && secret && bucket) {
        // Use S3
        const { S3Client } = require('@aws-sdk/client-s3');
        const multerS3Mod = require('multer-s3');
        const multerS3fn = (_a = multerS3Mod.default) !== null && _a !== void 0 ? _a : multerS3Mod;
        const s3 = new S3Client({
            region,
            credentials: { accessKeyId: keyId, secretAccessKey: secret },
        });
        console.log(`[upload] Using S3 bucket "${bucket}" in ${region}`);
        return multerS3fn({
            s3,
            bucket,
            contentType: multerS3fn.AUTO_CONTENT_TYPE,
            key: (_req, file, cb) => {
                const ext = path_1.default.extname(file.originalname);
                cb(null, `products/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
            },
        });
    }
    // Fallback: local disk
    console.log('[upload] AWS credentials not found — using local disk storage');
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
    return multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
    });
};
exports.uploadToS3 = (0, multer_1.default)({
    storage: buildStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});
