import { z } from 'zod'

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().int().min(1).max(99).nullable().optional(),
  reps: z.number().int().min(1).max(999).nullable().optional(),
  weight_kg: z.number().min(0).max(9999).nullable().optional(),
  duration_seconds: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(500).optional(),
  order_index: z.number().int().default(0),
})

export const workoutSchema = z.object({
  title: z.string().min(1, 'Workout title is required').max(100),
  notes: z.string().max(1000).optional(),
  completed_at: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'Add at least one exercise'),
})

export type ExerciseFormData = z.infer<typeof exerciseSchema>
export type WorkoutFormData = z.infer<typeof workoutSchema>
