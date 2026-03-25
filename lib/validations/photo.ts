import { z } from 'zod'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const photoUploadSchema = z.object({
  photo_type: z.enum(['front', 'back', 'side', 'custom']).default('front'),
  taken_at: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be smaller than 10MB'
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are accepted'
  }
  return null
}

export type PhotoUploadFormData = z.infer<typeof photoUploadSchema>
