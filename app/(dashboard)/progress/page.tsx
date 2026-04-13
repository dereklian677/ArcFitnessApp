import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { TrendingUp, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signPhotoUrls, signAllGoalPhysiqueUrls } from '@/lib/supabase/storage'
import { calculateVolume } from '@/lib/utils'
import { ScoreRing } from '@/components/progress/ScoreRing'
import { PRTable } from '@/components/progress/PRTable'
import { AIPlaceholderCard } from '@/components/progress/AIPlaceholderCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { VIEWS, type ViewType } from '@/types'
import type { VolumeDataPoint } from '@/lib/hooks/useProgress'
import type { ProgressPhoto } from '@/types'

// Load recharts client-only (uses browser APIs)
const VolumeChart = dynamic(
  () => import('@/components/progress/VolumeChart').then((m) => m.VolumeChart),
  { ssr: false }
)

const VIEW_LABELS: Record<ViewType, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
}

export default async function ProgressPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile, photos, PRs, workouts
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

  // Sign all available goal views
  const goalSignedUrls = await signAllGoalPhysiqueUrls(supabase, user.id, profileRes.data ?? {})
  const hasAnyGoal = Object.keys(goalSignedUrls).length > 0

  const goalType = profileRes.data?.goal_type ?? null
  const goalTimeframe = profileRes.data?.goal_timeframe ?? null

  // Compute volume chart data server-side
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

  // Group photos by view type
  const photosByView: Record<ViewType, ProgressPhoto[]> = {
    front: photos.filter((p) => p.photo_type === 'front'),
    back: photos.filter((p) => p.photo_type === 'back'),
    side: photos.filter((p) => p.photo_type === 'side'),
  }

  // Get latest ai_score per view (for per-view score badges)
  const latestScoreByView: Record<ViewType, number | null> = {
    front: null,
    back: null,
    side: null,
  }
  for (const view of VIEWS) {
    const viewPhotos = [...photosByView[view]].reverse() // latest first
    const scored = viewPhotos.find((p) => p.ai_score !== null)
    if (scored) latestScoreByView[view] = scored.ai_score
  }

  const TIMEFRAME_LABELS: Record<string, string> = {
    '6months': '6 Months',
    '1year': '1 Year',
    '2years': '2 Years',
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Progress"
        description="Track your transformation and personal bests"
      />

      {/* Score ring */}
      <Card>
        <CardContent className="flex flex-col items-center py-8 gap-3">
          <ScoreRing score={progressScore} size={140} />
          <div className="text-center">
            <p className="font-semibold text-white">Physique Score</p>
            <p className="text-xs text-[#a1a1aa] mt-1">
              {progressScore > 0 ? `${progressScore} / 100` : 'Upload photos to start tracking'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI analysis — real score if goal is set, placeholder otherwise */}
      {hasAnyGoal ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-6xl font-bold text-white tabular-nums">{progressScore}</span>
                <span className="text-xl text-[#a1a1aa]">/100</span>
              </div>
              <ScoreRing score={progressScore} size={72} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Progress toward your goal</p>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Score updates automatically when you upload new photos
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AIPlaceholderCard />
      )}

      {/* Per-view photo comparison sections */}
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
          <Card key={view}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{VIEW_LABELS[view]} Progress</span>
                {viewScore !== null && (
                  <span className="text-sm font-normal text-[#a1a1aa]">
                    Score:{' '}
                    <span className="font-semibold text-white">{viewScore}/100</span>
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
              >
                {showComparison && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs text-[#a1a1aa] text-center">Earliest</p>
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
                      <p className="text-xs text-[#a1a1aa] text-center">Most Recent</p>
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
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
                  <div className="space-y-2">
                    <p className="text-xs text-primary text-center font-medium">Your Goal</p>
                    <div className="rounded-lg overflow-hidden border border-primary/30">
                      <Image
                        src={goalUrl}
                        alt={`${view} goal physique`}
                        width={400}
                        height={600}
                        className="w-full h-auto"
                      />
                    </div>
                    {(goalType || goalTimeframe) && (
                      <p className="text-xs text-[#a1a1aa] text-center">
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
            </CardContent>
          </Card>
        )
      })}

      {/* Volume chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Training Volume — Last 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VolumeChart data={volumeData} />
        </CardContent>
      </Card>

      {/* Personal records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <PRTable records={prs} unitPreference={unitPreference} />
        </CardContent>
      </Card>
    </div>
  )
}
