// ==========================================
// ☁️ SUPABASE STORAGE UTILITY
// ==========================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ozgndkqgoclzzdhitoww.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'Image';

/**
 * Upload a file buffer or base64 data to Supabase Storage bucket 'Image'
 * Returns the public URL string.
 */
export async function uploadToStorage(
  fileBuffer: Buffer,
  originalFilename: string,
  contentType: string = 'image/jpeg',
  folder: string = 'uploads'
): Promise<string> {
  if (!SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured in environment variables');
  }

  // Clean filename and ensure uniqueness
  const timestamp = Date.now();
  const cleanName = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-');
  const path = `${folder}/${timestamp}-${cleanName}`;

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: fileBuffer as any,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase upload error:', errorText);
    throw new Error(`Failed to upload image to Supabase Storage: ${response.statusText}`);
  }

  // Return public CDN URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Uploads a base64 Data URL to Supabase Storage
 */
export async function uploadBase64ToStorage(
  base64DataUrl: string,
  filename: string,
  folder: string = 'uploads'
): Promise<string> {
  const matches = base64DataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // If it's already a regular URL (http/https), just return it
    if (base64DataUrl.startsWith('http://') || base64DataUrl.startsWith('https://')) {
      return base64DataUrl;
    }
    throw new Error('Invalid base64 image format');
  }

  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  return uploadToStorage(buffer, filename, contentType, folder);
}

/**
 * Delete a file from Supabase Storage by its public URL or path
 */
export async function deleteFromStorage(fileUrlOrPath: string): Promise<boolean> {
  if (!SERVICE_KEY || !fileUrlOrPath) return false;

  try {
    let filePath = fileUrlOrPath;
    const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
    if (filePath.startsWith(prefix)) {
      filePath = filePath.replace(prefix, '');
    }

    const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: [filePath] }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting from storage:', error);
    return false;
  }
}
