'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ProfileUpdate } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) setProfile(data)
    setIsLoading(false)
  }, [supabase])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates: ProfileUpdate) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      toast.error('Failed to update profile')
      return false
    }

    setProfile(data)
    toast.success('Profile updated')
    return true
  }

  return { profile, isLoading, updateProfile, refetch: fetchProfile }
}
