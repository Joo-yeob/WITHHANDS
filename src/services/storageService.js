import { supabase } from '@/api/supabaseClient';

const BUCKET = 'uploads';

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 * @param {File} file - The file to upload
 * @param {string} folder - Sub-folder: 'profile' | 'creatures' | 'posts'
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
export async function uploadImage(file, folder = 'creatures') {
  if (!file) throw new Error('파일이 없습니다.');

  const ext = file.name?.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || `image/${ext}`,
    });

  if (error) {
    throw new Error(error.message);
  }

  return getPublicUrl(fileName);
}

/**
 * Returns the public URL for a given storage path.
 * @param {string} path - Storage path (e.g. "profile/123-abc.jpg")
 * @returns {string} - Public URL
 */
export function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Deletes an image from Supabase Storage by its public URL.
 * @param {string} url - Public URL of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(url) {
  if (!url) return;

  // Extract the storage path from the public URL
  const parts = url.split(`/storage/v1/object/public/${BUCKET}/`);
  if (parts.length < 2) return;

  const filePath = parts[1];
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }
}