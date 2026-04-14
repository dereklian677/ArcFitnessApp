'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, Clock, Trash2, CheckCircle, ChevronRight, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GoalPhysiqueGenerator } from './GoalPhysiqueGenerator'
import { PhysiqueLightbox } from './PhysiqueLightbox'
import { useGoalPhysique } from '@/lib/hooks/useGoalPhysique'
import { VIEWS, type Profile, type ViewType } from '@/types'
import { cn } from '@/lib/utils'

const TIMEFRAME_LABELS: Record<string, string> = {
  '6months': '6 Months',
  '1year': '1 Year',
  '2years': '2 Years',
}

const VIEW_LABELS: Record<ViewType, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
}

interface GoalPhysiqueCardProps {
  profile: Profile | null
  initialSignedUrls?: Partial<Record<ViewType, string>>
  /** @deprecated Use initialSignedUrls instead */
  initialSignedUrl?: string | null
  showRemove?: boolean
}

export function GoalPhysiqueCard({
  profile,
  initialSignedUrls,
  initialSignedUrl,
  showRemove = false,
}: GoalPhysiqueCardProps) {
  const [open, setOpen] = useState(false)
  const [targetView, setTargetView] = useState<ViewType>('front')

  // Build initial URL map from props
  const buildInitialUrls = (): Partial<Record<ViewType, string>> => {
    if (initialSignedUrls && Object.keys(initialSignedUrls).length > 0) return initialSignedUrls
    const fallback = initialSignedUrl ?? profile?.goal_image_url ?? null
    return fallback ? { front: fallback } : {}
  }

  const [imageUrls, setImageUrls] = useState<Partial<Record<ViewType, string>>>(buildInitialUrls)
  const [goalType, setGoalType] = useState<string | null>(profile?.goal_type ?? null)
  const [timeframe, setTimeframe] = useState<string | null>(profile?.goal_timeframe ?? null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(profile?.goal_generated_at ?? null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxView, setLightboxView] = useState<ViewType>('front')

  const { removeGoalPhysique } = useGoalPhysique()

  const hasAnyGoal = VIEWS.some(v => imageUrls[v])

  const goalLabel = [
    goalType ? goalType.charAt(0).toUpperCase() + goalType.slice(1) : null,
    timeframe ? TIMEFRAME_LABELS[timeframe] : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const daysAgo = generatedAt
    ? Math.floor((Date.now() - new Date(generatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleSuccess = (
    results: Partial<Record<ViewType, { imageUrl: string; generatedAt: string }>>,
    newGoalType: string,
    newTimeframe: string,
    _gender: string
  ) => {
    const newUrls: Partial<Record<ViewType, string>> = { ...imageUrls }
    let latestGeneratedAt = generatedAt
    for (const [view, data] of Object.entries(results)) {
      newUrls[view as ViewType] = data.imageUrl
      if (!latestGeneratedAt || data.generatedAt > latestGeneratedAt) {
        latestGeneratedAt = data.generatedAt
      }
    }
    setImageUrls(newUrls)
    setGoalType(newGoalType)
    setTimeframe(newTimeframe)
    setGeneratedAt(latestGeneratedAt)
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await removeGoalPhysique()
      setImageUrls({})
      setGoalType(null)
      setTimeframe(null)
      setGeneratedAt(null)
      toast.success('Goal physique removed')
    } catch {
      toast.error('Failed to remove goal physique')
    } finally {
      setIsRemoving(false)
    }
  }

  const openGeneratorForView = (view: ViewType) => {
    setTargetView(view)
    setOpen(true)
  }

  const openLightbox = (view: ViewType) => {
    setLightboxView(view)
    setLightboxOpen(true)
  }

  // Build existingResults for the generator from current image state
  const existingResults: Partial<Record<ViewType, { imageUrl: string }>> = {}
  for (const [v, url] of Object.entries(imageUrls)) {
    if (url) existingResults[v as ViewType] = { imageUrl: url }
  }

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Header */}
        <div
          className="px-4 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-violet)' }} />
            <p className="section-label">Goal Physique</p>
          </div>
          <div className="flex items-center gap-2">
            {hasAnyGoal && goalLabel && (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{goalLabel}</span>
            )}
            {hasAnyGoal && daysAgo !== null && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <Clock className="h-2.5 w-2.5" />
                {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
              </span>
            )}
            {showRemove && hasAnyGoal && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 text-red-400 border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
                disabled={isRemoving}
                onClick={handleRemove}
                aria-label="Remove goal physique"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Per-view rows */}
        <div>
          {VIEWS.map((view, idx) => {
            const url = imageUrls[view]
            const label = VIEW_LABELS[view]
            const isGenerated = !!url

            return (
              <div
                key={view}
                className="flex items-center gap-3 px-4 py-3"
                style={idx > 0 ? { borderTop: '1px solid var(--border-subtle)' } : undefined}
              >
                {/* Thumbnail */}
                <button
                  type="button"
                  className={cn(
                    'relative w-9 h-12 rounded-md overflow-hidden flex-shrink-0 transition-opacity',
                    isGenerated ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                  )}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onClick={() => isGenerated && openLightbox(view)}
                  disabled={!isGenerated}
                  aria-label={isGenerated ? `Expand ${label} goal physique` : undefined}
                >
                  {url ? (
                    <Image
                      src={url}
                      alt={`${label} goal`}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="h-3 w-3" style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  )}
                </button>

                {/* Label + status */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {label}
                  </p>
                  {isGenerated ? (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--accent-green)' }}>
                      <CheckCircle className="h-3 w-3" />
                      Generated
                    </p>
                  ) : (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      Not generated
                    </p>
                  )}
                </div>

                {/* Action button */}
                <Button
                  size="sm"
                  variant={isGenerated ? 'outline' : 'default'}
                  className="flex-shrink-0 h-7 text-xs gap-1"
                  onClick={() => openGeneratorForView(view)}
                >
                  {isGenerated ? (
                    'Regenerate'
                  ) : (
                    <>
                      Generate
                      <ChevronRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Empty state hint */}
        {!hasAnyGoal && (
          <div className="px-4 pb-4 pt-1">
            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              Generate your goal physique for each view
            </p>
          </div>
        )}
      </div>

      <GoalPhysiqueGenerator
        open={open}
        onOpenChange={setOpen}
        initialView={targetView}
        existingResults={existingResults}
        existingGoalType={goalType}
        existingTimeframe={timeframe}
        onSuccess={handleSuccess}
      />

      {/* Lightbox */}
      {lightboxOpen && (
        <PhysiqueLightbox
          images={imageUrls}
          activeView={lightboxView}
          onViewChange={setLightboxView}
          onClose={() => setLightboxOpen(false)}
          goalLabel={goalLabel || undefined}
        />
      )}
    </>
  )
}
