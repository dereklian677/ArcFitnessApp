'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Trash2, GripVertical, Loader2, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { workoutSchema, type WorkoutFormData } from '@/lib/validations/workout'
import { checkPR } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ExerciseAutocomplete } from './ExerciseAutocomplete'

export function WorkoutForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: '',
      notes: '',
      exercises: [{ name: '', sets: 3, reps: 10, weight_kg: 0, notes: '', order_index: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  const onSubmit = async (data: WorkoutFormData) => {
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsSubmitting(false); return }

    // Insert workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        title: data.title,
        notes: data.notes ?? null,
        completed_at: data.completed_at ?? new Date().toISOString(),
      })
      .select()
      .single()

    if (workoutError || !workout) {
      toast.error('Failed to save workout')
      setIsSubmitting(false)
      return
    }

    // Insert exercises
    const exercisesWithId = data.exercises.map((ex, i) => ({
      workout_id: workout.id,
      name: ex.name,
      sets: ex.sets ?? null,
      reps: ex.reps ?? null,
      weight_kg: ex.weight_kg ?? null,
      notes: ex.notes ?? null,
      order_index: i,
    }))

    await supabase.from('exercises').insert(exercisesWithId)

    // Check for PRs
    const { data: existingPRs } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)

    const prs = existingPRs ?? []
    const newPRs: string[] = []

    for (const ex of data.exercises) {
      if (ex.name && ex.weight_kg && ex.reps) {
        if (checkPR(ex.name, ex.weight_kg, ex.reps, prs)) {
          newPRs.push(ex.name)
          // Upsert PR record
          await supabase.from('personal_records').upsert({
            user_id: user.id,
            exercise_name: ex.name,
            weight_kg: ex.weight_kg,
            reps: ex.reps,
            achieved_at: new Date().toISOString(),
          }, { onConflict: 'user_id,exercise_name' })
        }
      }
    }

    // Show PR toasts
    newPRs.forEach((name) => {
      toast.success(`New PR on ${name}!`, {
        icon: <Trophy className="h-4 w-4 text-yellow-400" />,
      })
    })

    setIsSubmitting(false)
    router.push('/workouts')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Workout details */}
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Workout title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Upper Body Push" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Notes <span className="text-[#a1a1aa] font-normal">(optional)</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="How did it feel?" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Exercises</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ name: '', sets: 3, reps: 10, weight_kg: 0, notes: '', order_index: fields.length })}
            >
              <Plus className="h-4 w-4" /> Add exercise
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-[#a1a1aa] mt-2 flex-shrink-0 cursor-grab" />
                <div className="flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.name`}
                    render={({ field: nameField }) => (
                      <FormItem>
                        <FormLabel className="text-white text-xs">Exercise</FormLabel>
                        <FormControl>
                          <ExerciseAutocomplete
                            value={nameField.value}
                            onChange={nameField.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.sets`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs">Sets</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="3"
                              {...f}
                              value={f.value ?? ''}
                              onChange={(e) => f.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.reps`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs">Reps</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              {...f}
                              value={f.value ?? ''}
                              onChange={(e) => f.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.weight_kg`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs">Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="60"
                              {...f}
                              value={f.value ?? ''}
                              onChange={(e) => f.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.notes`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Notes (optional)"
                            {...f}
                            value={f.value ?? ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-[#a1a1aa] hover:text-red-400"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {form.formState.errors.exercises?.root && (
            <p className="text-sm text-destructive">{form.formState.errors.exercises.root.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save workout
          </Button>
        </div>
      </form>
    </Form>
  )
}
