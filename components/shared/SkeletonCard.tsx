import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonCardProps {
  lines?: number
  className?: string
}

export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={`bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 space-y-3 ${className ?? ''}`}>
      <Skeleton className="h-4 w-2/3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  )
}
