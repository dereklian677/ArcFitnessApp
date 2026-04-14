import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { TrendingUp, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signPhotoUrls, signAllGoalPhysiqueUrls } from '@/lib/supabase/storage'
import { calculateVolume, cn } from '@/lib/utils'
import { ScoreRing } from '@/components/progress/ScoreRing'
import { PRTable } from '@/components/progress/PRTable'
import { AIPlaceholderCard } from '@/components/progress/AIPlaceholderCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Sparkles } from 'lucide-react'
import { VIEWS, type ViewType } from '@/types'
import type { VolumeDataPoint } from '@/lib/hooks/useProgress'
import type { ProgressPhoto } from '@/types'

const VolumeChart = dynamic(
  () => import('@/components/progress/VolumeChart').then((m) => m.VolumeChart),
  { ssr: false }
)

const VIEW_LABELS: Record<ViewType, string> = {
  front: 'Front',
  back:  'Back',
  side:  'Side',
}

export default async function ProgressPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, photosRes, prsRes, workoutsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'progress_score, unit_preference, goal_image_url, goal_type, goal_timeframe, goal_image_front_url, goal_image_back_url, goal_image_side_url'
      )
      .eq('id', user.id)
      .single(),
    supabase.from('progress_photos').select('*').eq('user_id', user.id).order('taken_at', { ascending: true }),
    supabase.from('personal_records').select('*').eq('user_id', user.id).order('achieved_at', { ascending: false }),
    supabase
      .from('workouts')
      .select('completed_at, exercises(*)')
      .eq('user_id', user.id)
      .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: true }),
  ])

  const progressScore = profileRes.data?.progress_score ?? 0
  const unitPreference = (profileRes.data?.unit_preference ?? 'metric') as 'metric' | 'imperial'
  const photos = await signPhotoUrls(supabase, photosRes.data ?? [])
  const prs = prsRes.data ?? []

  const goalSignedUrls = await signAllGoalPhysiqueUrls(supabase, user.id, profileRes.data ?? {})
  const hasAnyGoal = Object.keys(goalSignedUrls).length > 0

  const goalType = profileRes.data?.goal_type ?? null
  const goalTimeframe = profileRes.data?.goal_timeframe ?? null

  const volumeByDate: Record<string, number> = {}
  ;(workoutsRes.data ?? []).forEach((w) => {
    const date = new Date(w.completed_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    volumeByDate[date] = (volumeByDate[date] ?? 0) + calculateVolume(w.exercises ?? [])
  })
  const volumeData: VolumeDataPoint[] = Object.entries(volumeByDate).map(([date, volume]) => ({
    date,
    volume,
  }))

  const photosByView: Record<ViewType, ProgressPhoto[]> = {
    front: photos.filter((p) => p.photo_type === 'front'),
    back:  photos.filter((p) => p.photo_type === 'back'),
    side:  photos.filter((p) => p.photo_type === 'side'),
  }

  const latestScoreByView: Record<ViewType, number | null> = {
    front: null,
    back:  null,
    side:  null,
  }
  for (const view of VIEWS) {
    const viewPhotos = [...photosByView[view]].reverse()
    const scored = viewPhotos.find((p) => p.ai_score !== null)
    if (scored) latestScoreByView[view] = scored.ai_score
  }

  const TIMEFRAME_LABELS: Record<string, string> = {
    '6months': '6 Months',
    '1year':   '1 Year',
    '2years':  '2 Years',
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Progress"
        description="Track your transformation and personal bests"
      />

      {/* Score ring — center stage */}
      <div
        className="rounded-xl p-6 md:p-10 flex flex-col items-center gap-5"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <ScoreRing score={progressScore} size={160} strokeWidth={10} />
        <div className="text-center">
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Physique Score
          </p>
          <p
            className="section-label mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {progressScore > 0
              ? 'Progress toward goal physique'
              : 'Upload photos to start tracking'}
          </p>
        </div>
      </div>

      {/* AI analysis */}
      {hasAnyGoal ? (
        <div
          className="rounded-xl p-6"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-violet)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>AI Analysis</p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-4xl sm:text-6xl font-bold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {progressScore}
              </span>
              <span className="text-xl" style={{ color: 'var(--text-secondary)' }}>/100</span>
            </div>
            <ScoreRing score={progressScore} size={72} strokeWidth={6} />
          </div>
          <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
            Score updates automatically when you upload new photos
          </p>
        </div>
      ) : (
        <AIPlaceholderCard />
      )}

      {/* Per-view photo comparisons */}
      {VIEWS.map((view) => {
        const viewPhotos = photosByView[view]
        if (viewPhotos.length === 0) return null

        const firstPhoto = viewPhotos[0]
        const latestPhoto = viewPhotos[viewPhotos.length - 1]
        const showComparison = viewPhotos.length >= 2 && firstPhoto !== latestPhoto
        const goalUrl = goalSignedUrls[view] ?? null
        const viewScore = latestScoreByView[view]

        if (!showComparison && !goalUrl) return null

        const colCount = (showComparison ? 2 : 0) + (goalUrl ? 1 : 0)

        return (
          <div
            key={view}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {VIEW_LABELS[view]} Progress
              </p>
              {viewScore !== null && (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Score:{' '}
                  <span className="font-medium tabular-nums" style={{ color: 'var(--accent-cyan)' }}>
                    {viewScore}/100
                  </span>
                </span>
              )}
            </div>
            <div className="p-6">
              <div
                className={cn(
                  "grid gap-3",
                  colCount <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
                )}
              >
                {showComparison && (
                  <>
                    <div className="space-y-2">
                      <p className="section-label text-center">Earliest</p>
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                        <Image
                          src={firstPhoto.photo_url}
                          alt={`Earliest ${view} photo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="section-label text-center">Most Recent</p>
                      <div
                        className="relative aspect-[3/4] rounded-lg overflow-hidden"
                        style={{ border: '1px solid var(--border-subtle)' }}
                      >
                        <Image
                          src={latestPhoto.photo_url}
                          alt={`Most recent ${view} photo`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </>
                )}
                {goalUrl && (
                  <div className={cn("space-y-2", colCount === 3 && "col-span-2 sm:col-span-1")}>
                    <p className="section-label text-center" style={{ color: 'var(--accent-violet)' }}>
                      Your Goal
                    </p>
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ border: '1px solid rgba(124, 58, 237, 0.3)' }}
                    >
                      <Image
                        src={goalUrl}
                        alt={`${view} goal physique`}
                        width={400}
                        height={600}
                        className="w-full h-auto"
                      />
                    </div>
                    {(goalType || goalTimeframe) && (
                      <p className="section-label text-center">
                        {[
                          goalType ? goalType.charAt(0).toUpperCase() + goalType.slice(1) : null,
                          goalTimeframe ? TIMEFRAME_LABELS[goalTimeframe] : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Volume chart */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-cyan)' }} />
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            Training Volume
          </p>
          <span className="section-label ml-auto">Last 30 Days</span>
        </div>
        <div className="p-6">
          <VolumeChart data={volumeData} />
        </div>
      </div>

      {/* Personal records */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <Trophy className="h-4 w-4" style={{ color: 'var(--accent-gold)' }} />
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            Personal Records
          </p>
        </div>
        <div className="px-3 py-4">
          <PRTable records={prs} unitPreference={unitPreference} />
        </div>
      </div>
    </div>
  )
}
