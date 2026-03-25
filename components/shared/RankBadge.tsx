import { cn } from '@/lib/utils'
import { RANK_COLORS } from '@/lib/constants/ranks'
import type { Rank } from '@/types'

interface RankBadgeProps {
  rank: Rank
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5 font-bold',
}

const rankEmoji: Record<Rank, string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '💠',
}

export function RankBadge({ rank, className, size = 'md' }: RankBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        RANK_COLORS[rank],
        sizeClasses[size],
        className
      )}
    >
      <span>{rankEmoji[rank]}</span>
      {rank}
    </span>
  )
}
