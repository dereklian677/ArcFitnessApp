'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { LogOut, Cpu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile'
import { useProfile } from '@/lib/hooks/useProfile'
import { useUnit } from '@/lib/context/UnitContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/shared/PageHeader'
import { RankBadge } from '@/components/shared/RankBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { GoalPhysiqueCard } from '@/components/progress/GoalPhysiqueCard'
import type { Rank } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, isLoading, updateProfile } = useProfile()
  const { preference, setPreference } = useUnit()
  const supabase = createClient()

  // Imperial display state — decoupled from form fields to avoid double-conversion
  const [feetVal, setFeetVal] = useState('')
  const [inchesVal, setInchesVal] = useState('')
  const [weightLbsVal, setWeightLbsVal] = useState('')

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '', username: '', height_cm: undefined, weight_kg: undefined, goal_type: undefined },
  })

  // Reset form when profile loads
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

  // Re-derive imperial display values when preference changes or profile loads
  useEffect(() => {
    if (preference !== 'imperial') return
    const cm = form.getValues('height_cm')
    const kg = form.getValues('weight_kg')
    if (cm) {
      const totalIn = cm / 2.54
      setFeetVal(String(Math.floor(totalIn / 12)))
      setInchesVal(String(Math.round(totalIn % 12)))
    } else {
      setFeetVal('')
      setInchesVal('')
    }
    if (kg) {
      setWeightLbsVal(String(Math.round(kg * 2.20462 * 10) / 10))
    } else {
      setWeightLbsVal('')
    }
  // profile is included so displays re-sync after profile loads while in imperial mode
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference, profile])

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile({
      full_name: data.full_name,
      username: data.username,
      height_cm: data.height_cm ?? null,
      weight_kg: data.weight_kg ?? null,
      goal_type: data.goal_type ?? null,
    })
  }

  const handleUnitChange = async (pref: 'metric' | 'imperial') => {
    setPreference(pref)
    await updateProfile({ unit_preference: pref })
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

              {/* Height field */}
              <FormField
                control={form.control}
                name="height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Height ({preference === 'imperial' ? 'ft / in' : 'cm'})
                    </FormLabel>
                    <FormControl>
                      {preference === 'imperial' ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder="5"
                            min="3"
                            max="8"
                            value={feetVal}
                            onChange={(e) => {
                              setFeetVal(e.target.value)
                              const ft = Number(e.target.value) || 0
                              const ins = Number(inchesVal) || 0
                              const cm = Math.round((ft * 12 + ins) * 2.54)
                              field.onChange(cm || undefined)
                            }}
                          />
                          <span className="text-[#a1a1aa] text-sm flex-shrink-0">ft</span>
                          <Input
                            type="number"
                            placeholder="11"
                            min="0"
                            max="11"
                            value={inchesVal}
                            onChange={(e) => {
                              setInchesVal(e.target.value)
                              const ft = Number(feetVal) || 0
                              const ins = Number(e.target.value) || 0
                              const cm = Math.round((ft * 12 + ins) * 2.54)
                              field.onChange(cm || undefined)
                            }}
                          />
                          <span className="text-[#a1a1aa] text-sm flex-shrink-0">in</span>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weight field */}
              <FormField
                control={form.control}
                name="weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Weight ({preference === 'imperial' ? 'lbs' : 'kg'})
                    </FormLabel>
                    <FormControl>
                      {preference === 'imperial' ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={weightLbsVal}
                          onChange={(e) => {
                            setWeightLbsVal(e.target.value)
                            const raw = e.target.value ? Number(e.target.value) : undefined
                            field.onChange(raw !== undefined
                              ? parseFloat((raw / 2.20462).toFixed(1))
                              : undefined)
                          }}
                        />
                      ) : (
                        <Input
                          type="number"
                          step="0.1"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      )}
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

      {/* Preferences */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-white">Preferences</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Units</p>
            <p className="text-xs text-[#a1a1aa] mt-0.5">Weight and height display</p>
          </div>
          <div className="flex rounded-lg border border-[#2a2a2a] overflow-hidden">
            <button
              type="button"
              onClick={() => handleUnitChange('metric')}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                preference === 'metric' ? 'bg-primary text-white' : 'text-[#a1a1aa] hover:text-white'
              )}
            >
              kg / cm
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange('imperial')}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                preference === 'imperial' ? 'bg-primary text-white' : 'text-[#a1a1aa] hover:text-white'
              )}
            >
              lbs / ft
            </button>
          </div>
        </div>
      </div>

      {/* Goal physique */}
      <div className="space-y-3">
        <h2 className="font-semibold text-white">Goal Physique</h2>
        <GoalPhysiqueCard profile={profile} showRemove />
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
