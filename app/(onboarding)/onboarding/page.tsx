'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, ChevronRight, ChevronLeft, Dumbbell, Zap, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'

const GOAL_OPTIONS = [
  {
    value: 'lean' as const,
    label: 'Lean',
    description: 'Lose fat, maintain muscle, achieve a defined physique',
    icon: Zap,
  },
  {
    value: 'athletic' as const,
    label: 'Athletic',
    description: 'Build functional strength and balanced muscle',
    icon: Target,
  },
  {
    value: 'muscular' as const,
    label: 'Muscular',
    description: 'Maximize muscle mass and size',
    icon: Dumbbell,
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: '',
      username: '',
      height_cm: undefined,
      weight_kg: undefined,
      goal_type: undefined,
    },
  })

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not authenticated')
      setIsLoading(false)
      return
    }

    // Use upsert in case the auto-create trigger didn't fire for this user
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: data.full_name,
        username: data.username,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        goal_type: data.goal_type,
      })

    setIsLoading(false)

    if (error) {
      if (error.code === '23505') {
        form.setError('username', { message: 'Username already taken' })
        setStep(1)
      } else {
        toast.error(`Failed to save profile: ${error.message}`)
      }
      return
    }

    toast.success('Profile set up! Welcome to Arc.')
    // Hard navigation avoids router.refresh() race with server redirects
    window.location.href = '/dashboard'
  }

  const validateStep = async (nextStep: number) => {
    if (step === 1) {
      const valid = await form.trigger(['full_name', 'username'])
      if (!valid) return
    }
    if (step === 2) {
      const valid = await form.trigger(['height_cm', 'weight_kg'])
      if (!valid) return
    }
    setStep(nextStep)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set up your profile</h1>
          <p className="text-[#a1a1aa] text-sm">Step {step} of 3</p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                s <= step ? 'bg-primary' : 'bg-[#1a1a1a]'
              )}
            />
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 space-y-6">
              {/* Step 1: Name & Username */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Who are you?</h2>
                    <p className="text-sm text-[#a1a1aa]">Tell us your name and choose a username</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" className="w-full" onClick={() => validateStep(2)}>
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Body stats */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Your stats</h2>
                    <p className="text-sm text-[#a1a1aa]">Used to personalize your experience</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="height_cm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="175"
                            {...field}
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
                            placeholder="75"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="button" className="flex-1" onClick={() => validateStep(3)}>
                      Continue <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Goal type */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Your goal</h2>
                    <p className="text-sm text-[#a1a1aa]">What physique are you working toward?</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="goal_type"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-3">
                          {GOAL_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className={cn(
                                'w-full flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 text-left',
                                field.value === value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-[#1a1a1a] hover:border-[#2a2a2a] bg-[#0a0a0a]'
                              )}
                            >
                              <div className={cn(
                                'p-2 rounded-md flex-shrink-0',
                                field.value === value ? 'bg-primary/20' : 'bg-[#1a1a1a]'
                              )}>
                                <Icon className={cn('h-5 w-5', field.value === value ? 'text-primary' : 'text-[#a1a1aa]')} />
                              </div>
                              <div>
                                <div className="font-medium text-white">{label}</div>
                                <div className="text-sm text-[#a1a1aa]">{description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Get started
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
