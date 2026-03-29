'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, Clock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GoalPhysiqueGenerator } from './GoalPhysiqueGenerator'
import { useGoalPhysique } from '@/lib/hooks/useGoalPhysique'
import type { Profile } from '@/types'

const TIMEFRAME_LABELS: Record<string, string> = {
  '6months': '6 Months',
  '1year': '1 Year',
  '2years': '2 Years',
}

interface GoalPhysiqueCardProps {
  /** Server-side profile (initial data). Card manages its own local state after generation. */
  profile: Profile | null
  /**
   * Pre-signed URL generated server-side. Preferred over profile.goal_image_url
   * which may be an expired signed URL.
   */
  initialSignedUrl?: string | null
  /** Show the remove button — used on the profile page only. */
  showRemove?: boolean
}

export function GoalPhysiqueCard({ profile, initialSignedUrl, showRemove = false }: GoalPhysiqueCardProps) {
  const [open, setOpen] = useState(false)
  const [initialStep, setInitialStep] = useState<1 | 2 | 3 | 4>(1)

  // Local display state — initialised from server-provided data, updated on generation/removal
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialSignedUrl ?? profile?.goal_image_url ?? null
  )
  const [goalType, setGoalType] = useState<string | null>(profile?.goal_type ?? null)
  const [timeframe, setTimeframe] = useState<string | null>(profile?.goal_timeframe ?? null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(profile?.goal_generated_at ?? null)
  const [isRemoving, setIsRemoving] = useState(false)

  const { refreshSignedUrl, removeGoalPhysique } = useGoalPhysique()

  const hasGoal = !!imageUrl

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
    newImageUrl: string,
    newGoalType: string,
    newTimeframe: string,
    _gender: string,
    newGeneratedAt: string
  ) => {
    setImageUrl(newImageUrl)
    setGoalType(newGoalType)
    setTimeframe(newTimeframe)
    setGeneratedAt(newGeneratedAt)
  }

  const handleImageError = async () => {
    const newUrl = await refreshSignedUrl()
    if (newUrl) setImageUrl(newUrl)
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await removeGoalPhysique()
      setImageUrl(null)
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

  return (
    <>
      {hasGoal ? (
        <div className="rounded-xl border-2 border-primary/30 bg-[#0a0a0a] overflow-hidden">
          {/* Goal image */}
          <div className="relative w-full" style={{ aspectRatio: '3/4', maxHeight: 280 }}>
            <Image
              src={imageUrl!}
              alt="Goal physique"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 400px"
              onError={handleImageError}
            />
          </div>

          {/* Meta + actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                {goalLabel && <p className="font-semibold text-white text-sm">{goalLabel}</p>}
                {daysAgo !== null && (
                  <p className="text-xs text-[#a1a1aa] mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Generated {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                  </p>
                )}
              </div>
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setInitialStep(4)
                  setOpen(true)
                }}
              >
                View / Regenerate
              </Button>
              {showRemove && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-400 border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
                  disabled={isRemoving}
                  onClick={handleRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-[#0a0a0a] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">See your transformation</p>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Generate an AI vision of your goal physique
              </p>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setInitialStep(1)
              setOpen(true)
            }}
          >
            Generate Now
          </Button>
        </div>
      )}

      <GoalPhysiqueGenerator
        open={open}
        onOpenChange={setOpen}
        initialStep={initialStep}
        existingImageUrl={imageUrl}
        existingGoalType={goalType}
        existingTimeframe={timeframe}
        onSuccess={handleSuccess}
      />
    </>
  )
}
