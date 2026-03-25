'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { ProgressPhoto, PhotoType } from '@/types'

export function usePhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })

    if (!error && data) setPhotos(data)
    setIsLoading(false)
  }, [supabase])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const uploadPhoto = async (
    file: File,
    photoType: PhotoType,
    takenAt?: string
  ): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Convert to WebP using canvas
    const webpBlob = await convertToWebP(file)
    const timestamp = Date.now()
    const filePath = `${user.id}/${timestamp}-${photoType}.webp`

    const { error: storageError } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, webpBlob, { contentType: 'image/webp', upsert: false })

    if (storageError) {
      toast.error('Failed to upload photo')
      return false
    }

    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('progress_photos').insert({
      user_id: user.id,
      photo_url: publicUrl,
      photo_type: photoType,
      taken_at: takenAt ?? new Date().toISOString(),
    })

    if (dbError) {
      toast.error('Failed to save photo record')
      return false
    }

    toast.success('Photo uploaded!')
    await fetchPhotos()
    return true
  }

  const deletePhoto = async (id: string, photoUrl: string) => {
    // Extract file path from URL
    const urlParts = photoUrl.split('/progress-photos/')
    if (urlParts[1]) {
      await supabase.storage.from('progress-photos').remove([urlParts[1]])
    }

    const { error } = await supabase.from('progress_photos').delete().eq('id', id)
    if (error) { toast.error('Failed to delete photo'); return }
    toast.success('Photo deleted')
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return { photos, isLoading, uploadPhoto, deletePhoto, refetch: fetchPhotos }
}

async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          resolve(blob ?? file)
        },
        'image/webp',
        0.85
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}
