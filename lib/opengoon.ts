const OPENGOON_BASE_URL = 'https://api.opengoon.art';

export const FACE_SWAP_WEBSITE = 'swapfaces';
export const FACE_SWAP_ACTION_TYPE = 'image_unlimit_face_swapper';

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

export async function getPresignUrl(contentType: string): Promise<PresignResult> {
  const response = await fetch(`${OPENGOON_BASE_URL}/upload/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_type: FACE_SWAP_ACTION_TYPE,
      content_type: contentType,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 200 || !data.result?.presignUrl) {
    throw new Error(data.message || data.error || 'Failed to get upload URL');
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
  const response = await fetch(`${OPENGOON_BASE_URL}/unlimit-face-swapper/swap-from-two`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl,
      sourceUrl,
      website: FACE_SWAP_WEBSITE,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 200 || !data.actionId) {
    throw new Error(data.message || data.error || 'Face swap failed');
  }

  return { actionId: data.actionId };
}

export async function getFaceSwapTask(actionId: string | number): Promise<FaceSwapTask | null> {
  const response = await fetch(`${OPENGOON_BASE_URL}/face-swapper/tasks/${actionId}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const data = await response.json();

  if (!response.ok || data.code !== 200) {
    throw new Error(data.message || data.error || 'Failed to query task');
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

  // Still processing but result may already be available
  if (resultUrl && isComplete) {
    return { status: 2, resultUrl };
  }

  return { status: 1 };
}
