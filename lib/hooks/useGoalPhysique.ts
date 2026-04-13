'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VIEWS, type ViewType } from '@/types'

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
    gender: string,
    view: ViewType = 'front'
  ): Promise<{ imageUrl: string }> => {
    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('goalType', goalType)
      formData.append('timeframe', timeframe)
      formData.append('gender', gender)
      formData.append('view', view)

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
   * Re-generates a signed URL for the stored goal physique image for a given view.
   */
  const refreshSignedUrl = async (view: ViewType = 'front'): Promise<string | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const path = `${user.id}/goal-${view}.jpg`
    const { data } = await supabase.storage.from('goal-physique').createSignedUrl(path, 3600)

    return data?.signedUrl ?? null
  }

  /**
   * Deletes all goal physique images from storage and clears all related profile fields.
   */
  const removeGoalPhysique = async (): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const paths = VIEWS.map(v => `${user.id}/goal-${v}.jpg`)
    await supabase.storage.from('goal-physique').remove(paths)

    await supabase
      .from('profiles')
      .update({
        goal_image_url: null,
        goal_image_front_url: null,
        goal_image_back_url: null,
        goal_image_side_url: null,
        goal_type: null,
        goal_timeframe: null,
        goal_gender: null,
        goal_generated_at: null,
        goal_generated_front_at: null,
        goal_generated_back_at: null,
        goal_generated_side_at: null,
      })
      .eq('id', user.id)
  }

  return { isGenerating, generateGoalPhysique, refreshSignedUrl, removeGoalPhysique }
}
