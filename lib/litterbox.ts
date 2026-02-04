/**
 * Upload image to litterbox (temporary image hosting service)
 * @param file - The image file to upload
 * @returns The temporary image URL
 */
export async function uploadToLitterbox(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('time', '24h'); // Keep for 24 hours
  formData.append('fileToUpload', file);

  try {
    const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to litterbox');
    }

    const url = await response.text();
    return url.trim();
  } catch (error) {
    console.error('Error uploading to litterbox:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Convert a URL to a File object
 * @param url - The URL to convert
 * @param filename - The filename to use
 * @returns The File object
 */
export async function urlToFile(url: string, filename: string = 'image.png'): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}
