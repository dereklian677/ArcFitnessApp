'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGoalPhysique() {
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = createClient()

  /**
   * Calls the /api/generate-physique route and returns the generated image URL.
   * Throws on error so callers can display a toast.
   */
  const generateGoalPhysique = async (
    photo: File,
    goalType: string,
    timeframe: string,
    gender: string
  ): Promise<{ imageUrl: string }> => {
    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('goalType', goalType)
      formData.append('timeframe', timeframe)
      formData.append('gender', gender)

      const response = await fetch('/api/generate-physique', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? 'Generation failed')
      }

      return { imageUrl: data.imageUrl }
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Re-generates a signed URL for the stored goal physique image.
   * Also updates the stored URL in the profile so it stays fresh.
   */
  const refreshSignedUrl = async (): Promise<string | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const path = `${user.id}/goal.jpg`
    const { data } = await supabase.storage.from('goal-physique').createSignedUrl(path, 3600)

    if (!data?.signedUrl) return null

    // Persist the fresh URL so the next server-render picks it up
    await supabase
      .from('profiles')
      .update({ goal_image_url: data.signedUrl })
      .eq('id', user.id)

    return data.signedUrl
  }

  /**
   * Deletes the goal physique image from storage and clears all related profile fields.
   */
  const removeGoalPhysique = async (): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.storage.from('goal-physique').remove([`${user.id}/goal.jpg`])

    await supabase
      .from('profiles')
      .update({
        goal_image_url: null,
        goal_type: null,
        goal_timeframe: null,
        goal_gender: null,
        goal_generated_at: null,
      })
      .eq('id', user.id)
  }

  return { isGenerating, generateGoalPhysique, refreshSignedUrl, removeGoalPhysique }
}
