'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateVolume } from '@/lib/utils'
import type { PersonalRecord } from '@/types'

export interface VolumeDataPoint {
  date: string
  volume: number
}

export function useProgress() {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProgress = useCallback(async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    // Fetch personal records
    const { data: prs } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false })

    if (prs) setPersonalRecords(prs)

    // Fetch last 30 days of workouts for volume chart
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: workouts } = await supabase
      .from('workouts')
      .select('completed_at, exercises(*)')
      .eq('user_id', user.id)
      .gte('completed_at', thirtyDaysAgo.toISOString())
      .order('completed_at', { ascending: true })

    if (workouts) {
      // Group by date and sum volume
      const volumeByDate: Record<string, number> = {}
      workouts.forEach((w) => {
        const date = new Date(w.completed_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
        const volume = calculateVolume(w.exercises ?? [])
        volumeByDate[date] = (volumeByDate[date] ?? 0) + volume
      })

      setVolumeData(
        Object.entries(volumeByDate).map(([date, volume]) => ({ date, volume }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => { fetchProgress() }, [fetchProgress])

  return { personalRecords, volumeData, isLoading, refetch: fetchProgress }
}
