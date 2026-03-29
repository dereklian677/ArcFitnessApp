import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { ProgressPhoto } from '@/types'

const BUCKET = 'progress-photos'
const GOAL_BUCKET = 'goal-physique'
const SIGNED_URL_EXPIRY = 3600 // 1 hour

/**
 * Extracts the storage path from either a raw path or a full Supabase URL.
 * Handles both new records (path only) and old records (full public URL).
 */
export function extractStoragePath(photoUrl: string): string {
  if (!photoUrl.startsWith('http')) return photoUrl
  const marker = `/${BUCKET}/`
  const idx = photoUrl.indexOf(marker)
  return idx !== -1 ? photoUrl.slice(idx + marker.length) : photoUrl
}

/**
 * Takes an array of progress_photos rows and replaces photo_url with a
 * fresh signed URL. Safe to call from both server and client components.
 */
export async function signPhotoUrls(
  supabase: SupabaseClient<Database>,
  photos: ProgressPhoto[]
): Promise<ProgressPhoto[]> {
  if (photos.length === 0) return photos

  const signed = await Promise.all(
    photos.map(async (photo) => {
      const path = extractStoragePath(photo.photo_url)
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_EXPIRY)

      if (error || !data?.signedUrl) return photo
      return { ...photo, photo_url: data.signedUrl }
    })
  )

  return signed
}

/**
 * Generates a fresh signed URL for a user's goal physique image.
 * Returns null if the file doesn't exist or signing fails.
 */
export async function signGoalPhysiqueUrl(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const path = `${userId}/goal.jpg`
  const { data, error } = await supabase.storage
    .from(GOAL_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY)

  if (error || !data?.signedUrl) return null
  return data.signedUrl
}
