import { SkeletonCard } from '@/components/shared/SkeletonCard'

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SkeletonCard className="col-span-2 md:col-span-1" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard lines={4} />
    </div>
  )
}
