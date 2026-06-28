import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../../shared/constants/http.constants';
import {
  submitTryOn,
  getTryOnStatus,
  resolveModelImage,
  isTryOnConfigured,
} from './tryon.service';

// Used to turn a relative product image path (e.g. /uploads/..) into an
// absolute URL the AI provider can fetch.
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || '';

/** Build the garment image source: uploaded file -> data URI, else a URL. */
const toGarmentSource = (req: Request): string | null => {
  const file = (req as any).file;
  if (file && file.buffer) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  const garmentUrl: string = (req.body && req.body.garmentUrl) || '';
  if (!garmentUrl) return null;

  if (/^https?:\/\//i.test(garmentUrl) || garmentUrl.startsWith('data:')) {
    return garmentUrl;
  }
  // Relative path -> make absolute so the provider can fetch it.
  if (PUBLIC_BASE_URL) {
    const base = PUBLIC_BASE_URL.replace(/\/$/, '');
    return `${base}${garmentUrl.startsWith('/') ? '' : '/'}${garmentUrl}`;
  }
  return null;
};

/** POST /api/tryon — start a try-on render job. */
export const createTryOn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isTryOnConfigured()) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'AI try-on is not configured on the server',
      });
    }

    const garment = toGarmentSource(req);
    if (!garment) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'A saree image (file upload or garmentUrl) is required',
      });
    }

    const modelImage = resolveModelImage(req.body && req.body.modelId);
    const jobId = await submitTryOn({
      humanImage: modelImage,
      garmentImage: garment,
      description: req.body && req.body.description,
    });

    return res.status(HTTP_STATUS.CREATED).json({ success: true, data: { jobId } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/tryon/:jobId — poll the status / result of a render job. */
export const getTryOn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId as string;
    if (!jobId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: 'jobId is required' });
    }

    const result = await getTryOnStatus(jobId);
    return res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
