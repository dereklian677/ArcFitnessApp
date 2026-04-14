import Link from 'next/link'
import { Calendar, Dumbbell } from 'lucide-react'
import { formatDateShort, formatVolume } from '@/lib/utils'
import type { WorkoutSummary } from '@/types'

interface WorkoutCardProps {
  workout: WorkoutSummary
  unitPreference?: 'metric' | 'imperial'
}

export function WorkoutCard({ workout, unitPreference = 'metric' }: WorkoutCardProps) {
  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="block py-4 px-4 rounded-lg transition-all duration-150 group border-l-2 hover:bg-[var(--bg-surface)]"
      style={{ borderLeftColor: 'var(--accent-violet)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="font-medium truncate transition-colors duration-150 group-hover:text-[var(--accent-violet)]"
            style={{ color: 'var(--text-primary)' }}
          >
            {workout.title}
          </h3>
          <div className="flex items-center gap-4 mt-1.5">
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Calendar className="h-3 w-3" />
              {formatDateShort(workout.completed_at)}
            </span>
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Dumbbell className="h-3 w-3" />
              {workout.exercise_count} exercises
            </span>
          </div>
        </div>
        {workout.total_volume > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--accent-cyan)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {formatVolume(workout.total_volume, unitPreference)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
