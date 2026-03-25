'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { LogOut, Lock, Sparkles, Cpu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile'
import { useProfile } from '@/lib/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/PageHeader'
import { RankBadge } from '@/components/shared/RankBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import type { Rank } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, isLoading, updateProfile } = useProfile()
  const supabase = createClient()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '', username: '', height_cm: undefined, weight_kg: undefined, goal_type: undefined },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name ?? '',
        username: profile.username ?? '',
        height_cm: profile.height_cm ?? undefined,
        weight_kg: profile.weight_kg ?? undefined,
        goal_type: profile.goal_type ?? undefined,
      })
    }
  }, [profile, form])

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile({
      full_name: data.full_name,
      username: data.username,
      height_cm: data.height_cm ?? null,
      weight_kg: data.weight_kg ?? null,
      goal_type: data.goal_type ?? null,
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={3} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader title="Profile" description="Manage your account and preferences" />

      {/* Rank display */}
      {profile && (
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 flex items-center gap-4">
          <RankBadge rank={profile.rank as Rank} size="lg" />
          <div>
            <p className="text-sm text-[#a1a1aa]">{profile.total_workouts} workouts logged</p>
            <p className="text-xs text-[#a1a1aa] mt-0.5">Longest streak: {profile.longest_streak} days</p>
          </div>
        </div>
      )}

      {/* Profile form */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Personal Info</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-white">Full name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-white">Username</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goal_type"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-white">Goal type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lean">Lean</SelectItem>
                        <SelectItem value="athletic">Athletic</SelectItem>
                        <SelectItem value="muscular">Muscular</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">Save changes</Button>
          </form>
        </Form>
      </div>

      {/* Goal physique AI placeholder */}
      <div className="relative overflow-hidden bg-[#111111] border-2 border-dashed border-[#2a2a2a] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-white">Goal Physique</span>
          </div>
          <Badge variant="muted">Coming Soon</Badge>
        </div>
        <p className="text-sm text-[#a1a1aa]">
          Generate your goal physique with AI — upload a reference image or describe your target body composition.
        </p>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <Lock className="h-4 w-4" /> Generate Goal Physique
        </Button>
      </div>

      {/* 3D avatar AI placeholder */}
      <div className="relative overflow-hidden bg-[#111111] border-2 border-dashed border-[#2a2a2a] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="font-semibold text-white">3D Physique Avatar</span>
          </div>
          <Badge variant="muted">Coming Soon</Badge>
        </div>
        <p className="text-sm text-[#a1a1aa]">
          See your goal body move in 3D — powered by Ready Player Me + AI. Your avatar will morph to match your target physique and animate with workout-specific movements.
        </p>
        <p className="text-xs text-[#a1a1aa]">Powered by Ready Player Me · SMPL body model · Mixamo animations</p>
      </div>

      <Separator />

      {/* Account section */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-white">Account</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-white">Email</p>
            <p className="text-xs text-[#a1a1aa] mt-0.5">Read-only</p>
          </div>
          <span className="text-sm text-[#a1a1aa]">••••@••••</span>
        </div>
        <Button
          variant="outline"
          className="w-full text-red-400 border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
