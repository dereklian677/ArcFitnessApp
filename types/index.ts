import type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']

export type Exercise = Database['public']['Tables']['exercises']['Row']
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']

export type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row']
export type ProgressPhotoInsert = Database['public']['Tables']['progress_photos']['Insert']

export type PersonalRecord = Database['public']['Tables']['personal_records']['Row']
export type PersonalRecordInsert = Database['public']['Tables']['personal_records']['Insert']

export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
export type GoalType = 'lean' | 'athletic' | 'muscular'
export type PhotoType = 'front' | 'back' | 'side' | 'custom'

export type WorkoutWithExercises = Workout & {
  exercises: Exercise[]
}

export type WorkoutSummary = Workout & {
  exercise_count: number
  total_volume: number
}
