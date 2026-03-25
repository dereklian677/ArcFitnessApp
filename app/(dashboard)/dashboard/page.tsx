import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Plus, Camera, Dumbbell, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { calculateVolume, getGreeting, getRankProgress, formatDateShort, formatVolume } from '@/lib/utils'
import { getNextRank } from '@/lib/constants/ranks'
import { ScoreRing } from '@/components/progress/ScoreRing'
import { RankBadge } from '@/components/shared/RankBadge'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const recentWorkouts: WorkoutSummary[] = (workoutsRes.data ?? []).map((w) => ({
    ...w,
    exercise_count: w.exercises?.length ?? 0,
    total_volume: calculateVolume(w.exercises ?? []),
  }))

  const recentPhotos = photosRes.data ?? []
  const firstName = profile.full_name?.split(' ')[0] ?? profile.username ?? 'there'
  const rank = profile.rank as Rank
  const rankProgress = getRankProgress(profile.total_workouts)
  const nextRank = getNextRank(rank)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-[#a1a1aa] mt-1">Keep pushing toward your goal physique.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Rank card */}
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Rank</span>
              <RankBadge rank={rank} size="sm" />
            </div>
            <Progress value={rankProgress} className="h-1.5" />
            {nextRank && (
              <p className="text-xs text-[#a1a1aa]">
                {profile.total_workouts} workouts · {nextRank} next
              </p>
            )}
          </CardContent>
        </Card>

        {/* Score ring */}
        <Card>
          <CardContent className="pt-5 flex flex-col items-center gap-2">
            <ScoreRing score={profile.progress_score} size={80} strokeWidth={7} />
            <p className="text-xs text-[#a1a1aa] text-center">AI Score · Soon</p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardContent className="pt-5 flex flex-col items-center justify-center gap-2 h-full">
            <div className="flex items-center gap-2">
              <Flame className="h-7 w-7 text-orange-400" />
              <span className="text-3xl font-bold text-white">{profile.current_streak}</span>
            </div>
            <p className="text-xs text-[#a1a1aa]">day streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent workouts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Recent Workouts</h2>
          <Link href="/workouts" className="text-xs text-primary hover:text-primary/80 transition-colors">
            View all
          </Link>
        </div>
        {recentWorkouts.length === 0 ? (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 text-center">
            <Dumbbell className="h-8 w-8 text-[#a1a1aa] mx-auto mb-3" />
            <p className="text-sm text-[#a1a1aa]">No workouts yet. Log your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((w) => <WorkoutCard key={w.id} workout={w} />)}
          </div>
        )}
      </section>

      {/* Recent photos */}
      {recentPhotos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Recent Photos</h2>
            <Link href="/photos" className="text-xs text-primary hover:text-primary/80 transition-colors">
              View all
            </Link>
          </div>
          <div className="flex gap-3">
            {recentPhotos.map((photo) => (
              <Link
                key={photo.id}
                href="/photos"
                className="relative flex-1 aspect-[3/4] max-w-[160px] rounded-xl overflow-hidden border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all"
              >
                <Image
                  src={photo.photo_url}
                  alt="Progress photo"
                  fill
                  className="object-cover"
                  sizes="160px"
                />
                <div className="absolute bottom-2 left-2 text-[10px] text-white/80">
                  {formatDateShort(photo.taken_at)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-12">
          <Link href="/workouts/new">
            <Dumbbell className="h-4 w-4" /> Log Workout
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/photos/upload">
            <Camera className="h-4 w-4" /> Add Photo
          </Link>
        </Button>
      </div>
    </div>
  )
}
