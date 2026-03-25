import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatVolume, calculateVolume } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default async function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workout } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!workout) notFound()

  const exercises = workout.exercises ?? []
  const totalVolume = calculateVolume(exercises)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-[#a1a1aa]">
        <Link href="/workouts">
          <ArrowLeft className="h-4 w-4" /> Back to workouts
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{workout.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-sm text-[#a1a1aa]">
            <Calendar className="h-4 w-4" />
            {formatDate(workout.completed_at)}
          </span>
          {totalVolume > 0 && (
            <span className="text-sm text-[#a1a1aa]">
              Total volume: <span className="text-white font-medium">{formatVolume(totalVolume)}</span>
            </span>
          )}
        </div>
        {workout.notes && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-[#111111] border border-[#1a1a1a] rounded-lg">
            <FileText className="h-4 w-4 text-[#a1a1aa] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#a1a1aa]">{workout.notes}</p>
          </div>
        )}
      </div>

      {/* Exercises table */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h2 className="font-semibold text-white">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
          </h2>
        </div>
        {exercises.length > 0 ? (
          <div className="divide-y divide-[#1a1a1a]">
            {exercises
              .sort((a, b) => a.order_index - b.order_index)
              .map((exercise) => (
                <div key={exercise.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-medium text-white">{exercise.name}</span>
                      <div className="flex items-center gap-3 mt-1">
                        {exercise.sets && (
                          <span className="text-sm text-[#a1a1aa]">{exercise.sets} sets</span>
                        )}
                        {exercise.reps && (
                          <span className="text-sm text-[#a1a1aa]">{exercise.reps} reps</span>
                        )}
                        {exercise.weight_kg && (
                          <span className="text-sm text-[#a1a1aa]">{exercise.weight_kg} kg</span>
                        )}
                        {exercise.duration_seconds && (
                          <span className="text-sm text-[#a1a1aa]">{exercise.duration_seconds}s</span>
                        )}
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-[#a1a1aa] mt-1 italic">{exercise.notes}</p>
                      )}
                    </div>
                    {exercise.sets && exercise.reps && exercise.weight_kg && (
                      <span className="text-sm text-[#a1a1aa] font-medium whitespace-nowrap">
                        {formatVolume(exercise.sets * exercise.reps * exercise.weight_kg)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-[#a1a1aa]">No exercises recorded</p>
        )}
      </div>
    </div>
  )
}
