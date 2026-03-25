import { z } from 'zod'

export const onboardingSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
  height_cm: z
    .number({ invalid_type_error: 'Enter a valid height' })
    .int()
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be 250 cm or less'),
  weight_kg: z
    .number({ invalid_type_error: 'Enter a valid weight' })
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be 300 kg or less'),
  goal_type: z.enum(['lean', 'athletic', 'muscular'], {
    required_error: 'Please select a goal type',
  }),
})

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, and underscores only'),
  height_cm: z
    .number({ invalid_type_error: 'Enter a valid height' })
    .int()
    .min(100)
    .max(250)
    .nullable()
    .optional(),
  weight_kg: z
    .number({ invalid_type_error: 'Enter a valid weight' })
    .min(30)
    .max(300)
    .nullable()
    .optional(),
  goal_type: z.enum(['lean', 'athletic', 'muscular']).nullable().optional(),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
