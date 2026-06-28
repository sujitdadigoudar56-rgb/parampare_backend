/**
 * Virtual Try-On service.
 *
 * Delegates the heavy AI work to a hosted provider (fal.ai) using its *queue*
 * API, which is serverless-friendly: we submit a job and get a request id back
 * immediately, then the frontend polls for the result. This avoids holding a
 * long-running HTTP request open inside a serverless function.
 *
 * Required env:
 *   FAL_KEY              - fal.ai API key (without it, try-on is disabled).
 * Optional env:
 *   FAL_TRYON_MODEL      - model slug (default: fal-ai/idm-vton).
 *   TRYON_DEFAULT_MODEL  - default model (person) image URL.
 *   TRYON_MODEL_1/2/3    - preset model image URLs selectable from the UI.
 */

const FAL_KEY = process.env.FAL_KEY;
const FAL_MODEL = process.env.FAL_TRYON_MODEL || 'fal-ai/idm-vton';
const FAL_BASE = 'https://queue.fal.run';

export type TryOnStatus = 'pending' | 'done' | 'error';

export interface TryOnSubmitInput {
  /** Person/model image URL the saree should be rendered onto. */
  humanImage: string;
  /** Saree image as a public URL or a base64 data URI. */
  garmentImage: string;
  description?: string;
}

const authHeaders = () => ({ Authorization: `Key ${FAL_KEY}` });

const httpError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

export const isTryOnConfigured = (): boolean => !!FAL_KEY;

/** Submit a try-on job to the provider queue and return its request id. */
export const submitTryOn = async (input: TryOnSubmitInput): Promise<string> => {
  if (!FAL_KEY) throw httpError('AI try-on is not configured', 501);

  const res = await fetch(`${FAL_BASE}/${FAL_MODEL}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // IDM-VTON field names. Adjust here if you switch FAL_TRYON_MODEL.
      human_image: input.humanImage,
      garment_image: input.garmentImage,
      description: input.description || 'a traditional Ilkal saree',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw httpError(`AI provider error (${res.status}): ${text}`, 502);
  }

  const data: any = await res.json();
  const requestId: string | undefined = data.request_id || data.requestId;
  if (!requestId) throw httpError('AI provider did not return a request id', 502);
  return requestId;
};

/** Poll the provider for a submitted job's status / result. */
export const getTryOnStatus = async (
  requestId: string
): Promise<{ status: TryOnStatus; imageUrl?: string; error?: string }> => {
  if (!FAL_KEY) throw httpError('AI try-on is not configured', 501);

  const statusRes = await fetch(`${FAL_BASE}/${FAL_MODEL}/requests/${requestId}/status`, {
    headers: authHeaders(),
  });
  if (!statusRes.ok) {
    const text = await statusRes.text().catch(() => '');
    return { status: 'error', error: `Status check failed (${statusRes.status}): ${text}` };
  }

  const statusData: any = await statusRes.json();
  const providerStatus: string = statusData.status;

  if (providerStatus === 'IN_QUEUE' || providerStatus === 'IN_PROGRESS') {
    return { status: 'pending' };
  }

  if (providerStatus === 'COMPLETED') {
    const resultRes = await fetch(`${FAL_BASE}/${FAL_MODEL}/requests/${requestId}`, {
      headers: authHeaders(),
    });
    if (!resultRes.ok) {
      const text = await resultRes.text().catch(() => '');
      return { status: 'error', error: `Result fetch failed (${resultRes.status}): ${text}` };
    }
    const result: any = await resultRes.json();
    const imageUrl: string | undefined =
      result?.image?.url || result?.images?.[0]?.url || result?.output?.image?.url;
    if (!imageUrl) return { status: 'error', error: 'No image found in AI result' };
    return { status: 'done', imageUrl };
  }

  return { status: 'error', error: `Unexpected provider status: ${providerStatus}` };
};

const MODEL_IMAGES: Record<string, string | undefined> = {
  'model-1': process.env.TRYON_MODEL_1,
  'model-2': process.env.TRYON_MODEL_2,
  'model-3': process.env.TRYON_MODEL_3,
};

/** Resolve the model (person) image URL for a preset id, falling back to default. */
export const resolveModelImage = (modelId?: string): string => {
  const fallback = process.env.TRYON_DEFAULT_MODEL || MODEL_IMAGES['model-1'];
  const url = (modelId && MODEL_IMAGES[modelId]) || fallback;
  if (!url) throw httpError('No model image configured for try-on (set TRYON_DEFAULT_MODEL)', 501);
  return url;
};
