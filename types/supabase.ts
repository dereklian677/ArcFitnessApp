export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          height_cm: number | null
          weight_kg: number | null
          goal_type: 'lean' | 'athletic' | 'muscular' | null
          goal_image_url: string | null
          goal_timeframe: '6months' | '1year' | '2years' | null
          goal_generated_at: string | null
          goal_gender: 'male' | 'female' | null
          unit_preference: 'metric' | 'imperial'
          progress_score: number
          rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
          total_workouts: number
          current_streak: number
          longest_streak: number
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          goal_type?: 'lean' | 'athletic' | 'muscular' | null
          goal_image_url?: string | null
          goal_timeframe?: '6months' | '1year' | '2years' | null
          goal_generated_at?: string | null
          goal_gender?: 'male' | 'female' | null
          unit_preference?: 'metric' | 'imperial'
          progress_score?: number
          rank?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
          total_workouts?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          goal_type?: 'lean' | 'athletic' | 'muscular' | null
          goal_image_url?: string | null
          goal_timeframe?: '6months' | '1year' | '2years' | null
          goal_generated_at?: string | null
          goal_gender?: 'male' | 'female' | null
          unit_preference?: 'metric' | 'imperial'
          progress_score?: number
          rank?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
          total_workouts?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          title: string
          notes: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          notes?: string | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          notes?: string | null
          completed_at?: string
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          sets: number | null
          reps: number | null
          weight_kg: number | null
          duration_seconds: number | null
          notes: string | null
          order_index: number
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          sets?: number | null
          reps?: number | null
          weight_kg?: number | null
          duration_seconds?: number | null
          notes?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          sets?: number | null
          reps?: number | null
          weight_kg?: number | null
          duration_seconds?: number | null
          notes?: string | null
          order_index?: number
        }
      }
      progress_photos: {
        Row: {
          id: string
          user_id: string
          photo_url: string
          photo_type: 'front' | 'back' | 'side' | 'custom'
          ai_score: number | null
          ai_notes: string | null
          taken_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          photo_url: string
          photo_type?: 'front' | 'back' | 'side' | 'custom'
          ai_score?: number | null
          ai_notes?: string | null
          taken_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          photo_url?: string
          photo_type?: 'front' | 'back' | 'side' | 'custom'
          ai_score?: number | null
          ai_notes?: string | null
          taken_at?: string
          created_at?: string
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          exercise_name: string
          weight_kg: number | null
          reps: number | null
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_name: string
          weight_kg?: number | null
          reps?: number | null
          achieved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_name?: string
          weight_kg?: number | null
          reps?: number | null
          achieved_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
