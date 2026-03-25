'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { calculateVolume } from '@/lib/utils'
import type { WorkoutSummary, WorkoutWithExercises, WorkoutInsert, ExerciseInsert } from '@/types'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (!error && data) {
      const summaries: WorkoutSummary[] = data.map((w) => ({
        ...w,
        exercise_count: w.exercises?.length ?? 0,
        total_volume: calculateVolume(w.exercises ?? []),
      }))
      setWorkouts(summaries)
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  const createWorkout = async (
    workoutData: Omit<WorkoutInsert, 'user_id'>,
    exercises: Omit<ExerciseInsert, 'workout_id'>[]
  ): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({ ...workoutData, user_id: user.id })
      .select()
      .single()

    if (workoutError || !workout) {
      toast.error('Failed to save workout')
      return null
    }

    if (exercises.length > 0) {
      const exercisesWithId = exercises.map((ex, i) => ({
        ...ex,
        workout_id: workout.id,
        order_index: i,
      }))

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesWithId)

      if (exercisesError) {
        toast.error('Workout saved but failed to save some exercises')
      }
    }

    toast.success('Workout logged!')
    await fetchWorkouts()
    return workout.id
  }

  const deleteWorkout = async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) { toast.error('Failed to delete workout'); return }
    toast.success('Workout deleted')
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }

  return { workouts, isLoading, createWorkout, deleteWorkout, refetch: fetchWorkouts }
}

export function useWorkout(id: string) {
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .eq('id', id)
        .single()

      if (!error && data) {
        setWorkout({ ...data, exercises: data.exercises ?? [] })
      }
      setIsLoading(false)
    }
    fetchWorkout()
  }, [id, supabase])

  return { workout, isLoading }
}
