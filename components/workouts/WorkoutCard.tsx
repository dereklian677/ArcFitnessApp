import Link from 'next/link'
import { Calendar, Dumbbell, TrendingUp } from 'lucide-react'
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
      className="block bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] hover:bg-[#151515] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
            {workout.title}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateShort(workout.completed_at)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
              <Dumbbell className="h-3.5 w-3.5" />
              {workout.exercise_count} exercises
            </span>
          </div>
        </div>
        {workout.total_volume > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#a1a1aa] flex-shrink-0">
            <TrendingUp className="h-4 w-4" />
            {formatVolume(workout.total_volume, unitPreference)}
          </div>
        )}
      </div>
    </Link>
  )
}
