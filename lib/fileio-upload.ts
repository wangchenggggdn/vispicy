/**
 * Upload image to file.io
 * @param file - The image file to upload
 * @returns The temporary image URL from file.io
 */
export async function uploadToFileIO(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://file.io', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[File.io Upload] Error response:', errorText);
      throw new Error(`Failed to upload image: ${errorText}`);
    }

    const data = await response.json();
    console.log('[File.io Upload] Response data:', JSON.stringify(data, null, 2));

    // file.io 返回格式: { link: "..." } 或 { url: "..." }
    const imageUrl = data.link || data.url;

    if (!imageUrl) {
      console.error('[File.io Upload] No URL in response:', data);
      throw new Error('No URL returned from file.io');
    }

    return imageUrl;
  } catch (error) {
    console.error('[File.io Upload] Error:', error);
    throw error;
  }
}
