import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Camera, Dumbbell, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signPhotoUrls, signAllGoalPhysiqueUrls } from '@/lib/supabase/storage'
import { calculateVolume, getGreeting, getRankProgress, formatDateShort } from '@/lib/utils'
import { getNextRank } from '@/lib/constants/ranks'
import { ScoreRing } from '@/components/progress/ScoreRing'
import { RankBadge } from '@/components/shared/RankBadge'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { GoalPhysiqueCard } from '@/components/progress/GoalPhysiqueCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Rank, WorkoutSummary } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, workoutsRes, photosRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(3),
    supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })
      .limit(2),
  ])

  const profile = profileRes.data
  if (!profile) redirect('/onboarding')
  const unitPreference = (profile.unit_preference ?? 'metric') as 'metric' | 'imperial'

  const recentWorkouts: WorkoutSummary[] = (workoutsRes.data ?? []).map((w) => ({
    ...w,
    exercise_count: w.exercises?.length ?? 0,
    total_volume: calculateVolume(w.exercises ?? []),
  }))

  const recentPhotos = await signPhotoUrls(supabase, photosRes.data ?? [])
  const goalSignedUrls = await signAllGoalPhysiqueUrls(supabase, user.id, profile)

  const firstName = profile.full_name?.split(' ')[0] ?? profile.username ?? 'there'
  const rank = profile.rank as Rank
  const rankProgress = getRankProgress(profile.total_workouts)
  const nextRank = getNextRank(rank)

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Keep pushing toward your goal physique.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Rank card */}
        <div
          className="col-span-2 md:col-span-1 rounded-xl p-5 space-y-3"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="section-label">Rank</p>
          <RankBadge rank={rank} size="lg" />
          <Progress
            value={rankProgress}
            className="h-1"
            indicatorClassName="bg-[#D4AF37]"
          />
          {nextRank && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {profile.total_workouts} workouts &middot; {nextRank} next
            </p>
          )}
        </div>

        {/* Score ring */}
        <div
          className="rounded-xl p-5 flex flex-col items-center justify-center gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <ScoreRing score={profile.progress_score} size={80} strokeWidth={6} />
          <p className="section-label">AI Score</p>
        </div>

        {/* Streak */}
        <div
          className="rounded-xl p-5 flex flex-col items-center justify-center gap-2"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6" style={{ color: 'var(--accent-green)' }} />
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: 'var(--text-primary)' }}
            >
              {profile.current_streak}
            </span>
          </div>
          <p className="section-label">Day streak</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-11">
          <Link href="/workouts/new">
            <Dumbbell className="h-4 w-4" /> Log Workout
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link href="/photos/upload">
            <Camera className="h-4 w-4" /> Add Photo
          </Link>
        </Button>
      </div>

      {/* Recent workouts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">Recent Workouts</p>
          <Link
            href="/workouts"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            View all
          </Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <div
            className="rounded-lg p-6 text-center"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Dumbbell
              className="h-7 w-7 mx-auto mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No workouts yet. Log your first one.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentWorkouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} unitPreference={unitPreference} />
            ))}
          </div>
        )}
      </section>

      {/* Recent photos */}
      {recentPhotos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Recent Photos</p>
            <Link
              href="/photos"
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
            >
              View all
            </Link>
          </div>
          <div className="flex gap-3">
            {recentPhotos.map((photo) => (
              <Link
                key={photo.id}
                href="/photos"
                className="relative flex-1 aspect-[3/4] max-w-[160px] rounded-lg overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:scale-[1.02] transition-all duration-150"
              >
                <Image
                  src={photo.photo_url}
                  alt="Progress photo"
                  fill
                  className="object-cover"
                  sizes="160px"
                />
                <div
                  className="absolute bottom-2 left-2 text-[10px]"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {formatDateShort(photo.taken_at)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Goal physique */}
      <section>
        <p className="section-label mb-4">Goal Physique</p>
        <GoalPhysiqueCard profile={profile} initialSignedUrls={goalSignedUrls} />
      </section>
    </div>
  )
}
