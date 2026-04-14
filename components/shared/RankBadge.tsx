import { Crown, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RANK_HEX } from '@/lib/constants/ranks'
import type { Rank } from '@/types'

interface RankBadgeProps {
  rank: Rank
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-1.5 font-medium',
}

const iconSizes = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
}

function RankIcon({ rank, className }: { rank: Rank; className?: string }) {
  if (rank === 'Diamond' || rank === 'Platinum') {
    return <Gem className={className} />
  }
  return <Crown className={className} />
}

export function RankBadge({ rank, className, size = 'md' }: RankBadgeProps) {
  const colors = RANK_HEX[rank]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeClasses[size],
        className
      )}
      style={{
        color: colors.text,
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      <RankIcon rank={rank} className={iconSizes[size]} />
      {rank}
    </span>
  )
}
