/**
 * swapfaces-api 客户端（Cloudflare Worker 项目，生产基址 https://api.opengoon.art）
 * 本地开发可设置 SWAPFACES_API_URL=http://127.0.0.1:8787
 *
 * 换脸流程由 API 侧 /unlimit-face-swapper/swap-from-two 完成：
 * 并行 detect 目标图与来源图 → swap → 返回 actionId
 * 详见 /Users/mac/work/swapfaces-api/README.md
 */

const SWAPFACES_API_URL =
  process.env.SWAPFACES_API_URL?.replace(/\/$/, '') || 'https://api.opengoon.art';

export const FACE_SWAP_WEBSITE = 'swapfaces';
export const FACE_SWAP_ACTION_TYPE = 'image_unlimit_face_swapper';

/** swap-from-two 内含两次 detect + swap，耗时较长 */
const SWAP_FROM_TWO_TIMEOUT_MS = 120_000;

export interface PresignResult {
  presignUrl: string;
  url: string;
}

export interface SwapFromTwoResult {
  actionId: number;
}

export interface FaceSwapTask {
  id: number;
  status: string;
  percent?: number;
  comments?: string;
  response?: string;
}

function getContentType(filename: string, mimeType?: string): string {
  if (mimeType && mimeType.startsWith('image/')) {
    return mimeType;
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

function formatApiError(message?: string, fallback = 'Face swap failed'): string {
  if (!message) return fallback;
  if (message.includes('No accounts in database')) {
    return 'Face swap service is not ready. Please try again later.';
  }
  if (message.includes('Server Error') || message.includes('failed with 500')) {
    return 'Face swap service is temporarily unavailable. Please try again in a moment.';
  }
  if (message.includes('timed out')) {
    return 'Face swap timed out. Please try again.';
  }
  if (/no faceUrls|Face detect .* failed|Detect \(.*\) job failed/i.test(message)) {
    return 'No face detected. Please use clear front-facing photos.';
  }
  return message;
}

export async function getPresignUrl(contentType: string): Promise<PresignResult> {
  const response = await fetch(`${SWAPFACES_API_URL}/upload/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_type: FACE_SWAP_ACTION_TYPE,
      content_type: contentType,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 200 || !data.result?.presignUrl) {
    throw new Error(formatApiError(data.message, 'Failed to get upload URL'));
  }

  return data.result;
}

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<string> {
  const contentType = getContentType(filename, mimeType);
  const { presignUrl, url } = await getPresignUrl(contentType);

  const uploadResponse = await fetch(presignUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: buffer,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }

  return url;
}

export async function swapFromTwo(
  imageUrl: string,
  sourceUrl: string
): Promise<SwapFromTwoResult> {
  const response = await fetch(`${SWAPFACES_API_URL}/unlimit-face-swapper/swap-from-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl,
      sourceUrl,
      website: FACE_SWAP_WEBSITE,
    }),
    signal: AbortSignal.timeout(SWAP_FROM_TWO_TIMEOUT_MS),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 200 || data.actionId == null) {
    throw new Error(formatApiError(data.message));
  }

  return { actionId: Number(data.actionId) };
}

export async function getFaceSwapTask(actionId: string | number): Promise<FaceSwapTask | null> {
  const response = await fetch(`${SWAPFACES_API_URL}/face-swapper/tasks/${actionId}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();

  if (!response.ok || data.code !== 200) {
    throw new Error(formatApiError(data.message, 'Failed to query task'));
  }

  const task = data.result?.[0];
  return task ?? null;
}

export function parseTaskResultUrl(task: FaceSwapTask): string | null {
  if (!task.response) return null;

  try {
    const parsed =
      typeof task.response === 'string' ? JSON.parse(task.response) : task.response;
    if (typeof parsed === 'string') return parsed;
    return parsed.resultUrl || parsed.previewUrl || parsed.url || null;
  } catch {
    return typeof task.response === 'string' && task.response.startsWith('http')
      ? task.response
      : null;
  }
}

export function mapTaskStatus(task: FaceSwapTask): {
  status: 1 | 2 | 3;
  resultUrl?: string;
  error?: string;
} {
  const normalized = (task.status || '').toLowerCase();
  const resultUrl = parseTaskResultUrl(task);
  const isComplete = task.percent === 1 || task.percent === 100;

  if (normalized === 'success' || normalized === 'completed' || (isComplete && resultUrl)) {
    return { status: 2, resultUrl: resultUrl || undefined };
  }

  if (normalized === 'failed' || normalized === 'error') {
    return { status: 3, error: task.comments || 'Face swap failed' };
  }

  if (resultUrl && isComplete) {
    return { status: 2, resultUrl };
  }

  return { status: 1 };
}
