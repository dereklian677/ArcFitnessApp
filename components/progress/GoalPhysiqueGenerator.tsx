'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, Dumbbell, Zap, TrendingUp, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGoalPhysique } from '@/lib/hooks/useGoalPhysique'

type GoalType = 'lean' | 'athletic' | 'muscular'
type Timeframe = '6months' | '1year' | '2years'
type Gender = 'male' | 'female'
type Step = 1 | 2 | 3 | 4

const LOADING_MESSAGES = [
  'Analyzing your current physique...',
  'Calculating your transformation potential...',
  'Rendering your goal physique...',
  'Applying the finishing touches...',
]

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '6months': '6 Months',
  '1year': '1 Year',
  '2years': '2 Years',
}

const GOAL_CARDS: { type: GoalType; label: string; description: string; Icon: React.ElementType }[] = [
  {
    type: 'lean',
    label: 'Lean',
    description: 'Toned and defined, athletic body fat, visible muscle tone',
    Icon: TrendingUp,
  },
  {
    type: 'athletic',
    label: 'Athletic',
    description: 'Balanced muscle and definition, functional fit physique',
    Icon: Zap,
  },
  {
    type: 'muscular',
    label: 'Muscular',
    description: 'Maximum muscle mass, powerful build, low body fat',
    Icon: Dumbbell,
  },
]

export interface GoalPhysiqueGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Start at step 4 when viewing an existing result */
  initialStep?: Step
  existingImageUrl?: string | null
  existingGoalType?: string | null
  existingTimeframe?: string | null
  /** Called when generation succeeds so the parent can update its local state */
  onSuccess?: (imageUrl: string, goalType: string, timeframe: string, gender: string, generatedAt: string) => void
}

export function GoalPhysiqueGenerator({
  open,
  onOpenChange,
  initialStep = 1,
  existingImageUrl,
  existingGoalType,
  existingTimeframe,
  onSuccess,
}: GoalPhysiqueGeneratorProps) {
  const [step, setStep] = useState<Step>(initialStep)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [goalType, setGoalType] = useState<GoalType | null>((existingGoalType as GoalType) ?? null)
  const [timeframe, setTimeframe] = useState<Timeframe | null>((existingTimeframe as Timeframe) ?? null)
  const [gender, setGender] = useState<Gender>('male')
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(existingImageUrl ?? null)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isGenerating, generateGoalPhysique } = useGoalPhysique()

  // Sync when props change (e.g. parent swaps existing data)
  useEffect(() => {
    setStep(initialStep)
    setGoalType((existingGoalType as GoalType) ?? null)
    setTimeframe((existingTimeframe as Timeframe) ?? null)
    setGeneratedImageUrl(existingImageUrl ?? null)
  }, [initialStep, existingGoalType, existingTimeframe, existingImageUrl])

  // Reset upload state when modal closes
  useEffect(() => {
    if (!open) {
      setFileError(null)
      setIsDragging(false)
    }
  }, [open])

  // Rotate loading messages during generation
  useEffect(() => {
    if (step !== 3) return
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[idx])
    }, 4000)
    return () => clearInterval(interval)
  }, [step])

  const validateAndSetFile = (file: File) => {
    setFileError(null)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFileError('Please upload a JPG, PNG, or WEBP image')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('Image must be under 10MB')
      return
    }
    setPhoto(file)
    setPhotoPreviewUrl(URL.createObjectURL(file))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const handleGenerate = async () => {
    if (!photo || !goalType || !timeframe) return
    setStep(3)
    setLoadingMessage(LOADING_MESSAGES[0])

    try {
      const result = await generateGoalPhysique(photo, goalType, timeframe, gender)
      const now = new Date().toISOString()
      setGeneratedImageUrl(result.imageUrl)
      setStep(4)
      onSuccess?.(result.imageUrl, goalType, timeframe, gender, now)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.'
      toast.error(msg)
      setStep(2)
    }
  }

  const handleTryAgain = () => {
    // If no photo was uploaded this session, go back to step 1
    setStep(photo ? 2 : 1)
    setGeneratedImageUrl(null)
  }

  const handleDownload = () => {
    if (!generatedImageUrl) return
    const a = document.createElement('a')
    a.href = generatedImageUrl
    a.download = 'goal-physique.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleSave = () => {
    toast.success('Goal physique saved!')
    onOpenChange(false)
  }

  // Prevent closing during generation
  const handleOpenChange = (newOpen: boolean) => {
    if (step === 3) return
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Upload Your Photo'}
            {step === 2 && 'Choose Your Goal'}
            {step === 3 && 'Generating Your Physique'}
            {step === 4 && 'Your Transformation'}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload photo"
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                isDragging ? 'border-primary bg-primary/5' : 'border-[#2a2a2a] hover:border-[#3a3a3a]',
                photo && 'border-primary/50 bg-primary/5'
              )}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {photo && photoPreviewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-28 h-36 rounded-lg overflow-hidden">
                    <Image src={photoPreviewUrl} alt="Preview" fill className="object-cover" sizes="112px" />
                  </div>
                  <p className="text-sm text-[#a1a1aa] truncate max-w-[200px]">{photo.name}</p>
                  <p className="text-xs text-primary">Tap to change photo</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10 text-[#a1a1aa]" />
                  <div>
                    <p className="text-sm font-medium text-white">Drop your photo here</p>
                    <p className="text-xs text-[#a1a1aa] mt-1">or click to browse</p>
                  </div>
                  <p className="text-xs text-[#a1a1aa] italic max-w-xs">
                    Upload a clear, full-body photo. Stand straight, face forward, wear fitted clothing.
                  </p>
                </div>
              )}
            </div>

            {fileError && <p className="text-sm text-red-400">{fileError}</p>}

            <div className="flex gap-2 flex-wrap">
              {['Good lighting', 'Full body visible', 'Front facing'].map((tip) => (
                <span
                  key={tip}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#1a1a1a] text-[#a1a1aa] border border-[#2a2a2a]"
                >
                  {tip}
                </span>
              ))}
            </div>

            <Button className="w-full" disabled={!photo || !!fileError} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {/* ── Step 2: Configure ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Gender */}
            <div>
              <p className="text-sm text-[#a1a1aa] mb-2">Gender</p>
              <div className="flex gap-2">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-colors border',
                      gender === g
                        ? 'bg-primary text-white border-primary'
                        : 'bg-[#111111] text-[#a1a1aa] border-[#2a2a2a] hover:border-[#3a3a3a]'
                    )}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal cards */}
            <div>
              <p className="text-sm text-[#a1a1aa] mb-2">Goal Type</p>
              <div className="space-y-2">
                {GOAL_CARDS.map(({ type, label, description, Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGoalType(type)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors',
                      goalType === type
                        ? 'border-primary bg-primary/10'
                        : 'border-[#2a2a2a] bg-[#111111] hover:border-[#3a3a3a]'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg flex-shrink-0',
                        goalType === type ? 'bg-primary/20' : 'bg-[#1a1a1a]'
                      )}
                    >
                      <Icon
                        className={cn('h-5 w-5', goalType === type ? 'text-primary' : 'text-[#a1a1aa]')}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{label}</p>
                      <p className="text-xs text-[#a1a1aa] mt-0.5">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <p className="text-sm text-[#a1a1aa] mb-2">Timeframe</p>
              <div className="flex gap-2">
                {(['6months', '1year', '2years'] as Timeframe[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-colors border',
                      timeframe === t
                        ? 'bg-primary text-white border-primary'
                        : 'bg-[#111111] text-[#a1a1aa] border-[#2a2a2a] hover:border-[#3a3a3a]'
                    )}
                  >
                    {TIMEFRAME_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={!goalType || !timeframe || isGenerating}
                onClick={handleGenerate}
              >
                Generate My Goal Physique
              </Button>
              <p className="text-xs text-[#a1a1aa] text-center">~3.5 credits per generation</p>
            </div>
          </div>
        )}

        {/* ── Step 3: Generating ── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-14 gap-6">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-medium">{loadingMessage}</p>
              <p className="text-xs text-[#a1a1aa]">This usually takes 15–30 seconds</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Result ── */}
        {step === 4 && generatedImageUrl && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Now */}
              <div className="space-y-1.5">
                <p className="text-xs text-[#a1a1aa] text-center font-medium">Now</p>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#111111] border border-[#1a1a1a]">
                  {photoPreviewUrl ? (
                    <Image src={photoPreviewUrl} alt="Current physique" fill className="object-cover" sizes="50vw" />
                  ) : (
                    <div className="flex items-center justify-center h-full px-4">
                      <p className="text-xs text-[#a1a1aa] text-center">Your before photo</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#a1a1aa] text-center">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <p className="text-xs text-primary text-center font-medium">Your Goal</p>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-primary/40">
                  <Image
                    src={generatedImageUrl}
                    alt="Goal physique"
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
                <p className="text-xs text-[#a1a1aa] text-center">
                  {timeframe ? TIMEFRAME_LABELS[timeframe] : ''}{goalType ? ` · ${goalType.charAt(0).toUpperCase() + goalType.slice(1)}` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full" onClick={handleSave}>
                Save as My Goal
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleTryAgain}>
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

            </div>

            <p className="text-xs text-[#a1a1aa] text-center border-t border-[#1a1a1a] pt-3 leading-relaxed">
              AI-generated visualization for motivation only. Individual results vary.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
