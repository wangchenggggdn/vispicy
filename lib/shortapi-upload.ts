/**
 * Upload image to ShortAPI using the send API
 * @param file - The image file to upload
 * @returns The temporary image URL from ShortAPI
 */
export async function uploadToShortAPI(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const SHORTAPI_BASE_URL = 'https://api.shortapi.ai/api/v1';
  const SHORTAPI_API_KEY = process.env.SHORTAPI_API_KEY || '';

  try {
    const response = await fetch(`${SHORTAPI_BASE_URL}/image/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SHORTAPI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ShortAPI Upload] Error response:', errorText);
      throw new Error(`Failed to upload image: ${errorText}`);
    }

    const data = await response.json();
    console.log('[ShortAPI Upload] Response data:', JSON.stringify(data, null, 2));

    // ShortAPI send API 返回格式: { code: 0, data: { url: "..." } }
    const imageUrl = data.data?.url;

    if (!imageUrl) {
      console.error('[ShortAPI Upload] No URL in response:', data);
      throw new Error('No URL returned from ShortAPI');
    }

    return imageUrl;
  } catch (error) {
    console.error('[ShortAPI Upload] Error:', error);
    throw error;
  }
}
