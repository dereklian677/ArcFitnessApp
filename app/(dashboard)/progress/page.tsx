import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { TrendingUp, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signPhotoUrls, signGoalPhysiqueUrl } from '@/lib/supabase/storage'
import { calculateVolume } from '@/lib/utils'
import { ScoreRing } from '@/components/progress/ScoreRing'
import { PRTable } from '@/components/progress/PRTable'
import { AIPlaceholderCard } from '@/components/progress/AIPlaceholderCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { VolumeDataPoint } from '@/lib/hooks/useProgress'

// Load recharts client-only (uses browser APIs)
const VolumeChart = dynamic(
  () => import('@/components/progress/VolumeChart').then((m) => m.VolumeChart),
  { ssr: false }
)

export default async function ProgressPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile, photos, PRs, workouts
  const [profileRes, photosRes, prsRes, workoutsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('progress_score, unit_preference, goal_image_url, goal_type, goal_timeframe')
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

  // Re-sign goal physique URL if the user has generated one
  const goalSignedUrl = profileRes.data?.goal_image_url
    ? await signGoalPhysiqueUrl(supabase, user.id)
    : null
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

  const firstPhoto = photos[0]
  const latestPhoto = photos[photos.length - 1]
  const showComparison = photos.length >= 2 && firstPhoto !== latestPhoto

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
            <p className="text-xs text-[#a1a1aa] mt-1">AI Score · Coming Soon</p>
          </div>
        </CardContent>
      </Card>

      {/* AI placeholder */}
      <AIPlaceholderCard />

      {/* Photo comparison */}
      {(showComparison || goalSignedUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photo Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns:
                  showComparison && goalSignedUrl
                    ? 'repeat(3, 1fr)'
                    : showComparison
                    ? 'repeat(2, 1fr)'
                    : '1fr',
              }}
            >
              {showComparison && (
                <>
                  <div className="space-y-2">
                    <p className="text-xs text-[#a1a1aa] text-center">Earliest</p>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                      <Image
                        src={firstPhoto.photo_url}
                        alt="Earliest photo"
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
                        alt="Most recent photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </>
              )}
              {goalSignedUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-primary text-center font-medium">Your Goal</p>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-primary/30">
                    <Image
                      src={goalSignedUrl}
                      alt="Goal physique"
                      fill
                      className="object-cover object-top"
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
      )}

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
