import { Trophy } from 'lucide-react'
import { formatDateShort, formatWeight } from '@/lib/utils'
import type { PersonalRecord } from '@/types'

interface PRTableProps {
  records: PersonalRecord[]
  unitPreference?: 'metric' | 'imperial'
}

export function PRTable({ records, unitPreference = 'metric' }: PRTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Trophy className="h-8 w-8 text-[#a1a1aa] mb-3" />
        <p className="text-sm text-[#a1a1aa]">No personal records yet. Log workouts to set your first PR!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            <th className="text-left py-3 px-2 text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Exercise</th>
            <th className="text-right py-3 px-2 text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Weight</th>
            <th className="text-right py-3 px-2 text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Reps</th>
            <th className="text-right py-3 px-2 text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {records.map((pr) => (
            <tr key={pr.id} className="hover:bg-[#111111]/50 transition-colors">
              <td className="py-3 px-2 font-medium text-white">{pr.exercise_name}</td>
              <td className="py-3 px-2 text-right text-[#a1a1aa]">
                {pr.weight_kg ? formatWeight(pr.weight_kg, unitPreference) : '—'}
              </td>
              <td className="py-3 px-2 text-right text-[#a1a1aa]">
                {pr.reps ?? '—'}
              </td>
              <td className="py-3 px-2 text-right text-[#a1a1aa]">
                {formatDateShort(pr.achieved_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
