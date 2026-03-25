import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Dumbbell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { calculateVolume } from '@/lib/utils'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import type { WorkoutSummary } from '@/types'

export default async function WorkoutsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('unit_preference')
    .eq('id', user.id)
    .single()
  const unitPreference = (profileData?.unit_preference ?? 'metric') as 'metric' | 'imperial'

  const { data } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  const workouts: WorkoutSummary[] = (data ?? []).map((w) => ({
    ...w,
    exercise_count: w.exercises?.length ?? 0,
    total_volume: calculateVolume(w.exercises ?? []),
  }))

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Workouts"
        description={`${workouts.length} workout${workouts.length !== 1 ? 's' : ''} logged`}
        action={
          <Button asChild>
            <Link href="/workouts/new">
              <Plus className="h-4 w-4" /> Log workout
            </Link>
          </Button>
        }
      />

      {workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts yet"
          description="Log your first workout to start tracking your progress and building your streak."
          action={{ label: 'Log your first workout', href: '/workouts/new' }}
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} unitPreference={unitPreference} />
          ))}
        </div>
      )}
    </div>
  )
}
