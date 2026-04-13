'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, Dumbbell, Zap, TrendingUp, Download, RefreshCw, CheckCircle, Expand } from 'lucide-react'
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
import { PhysiqueLightbox } from './PhysiqueLightbox'
import { VIEWS, type ViewType } from '@/types'

type GoalType = 'lean' | 'athletic' | 'muscular'
type Timeframe = '6months' | '1year' | '2years'
type Gender = 'male' | 'female'
type Step = 1 | 2 | 3 | 4

type ViewUpload = { file: File; previewUrl: string }
export type ViewResult = { imageUrl: string; generatedAt: string }

const VIEW_INFO: Record<ViewType, { label: string; description: string }> = {
  front: { label: 'Front', description: 'Face camera, arms at sides' },
  back: { label: 'Back', description: 'Turn around, arms at sides' },
  side: { label: 'Side', description: 'Turn 90°, stand straight' },
}

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
  /** When set, the upload zone for this view is highlighted. */
  initialView?: ViewType
  /** Existing generated images — shown as "Already generated ✓" in upload zones. */
  existingResults?: Partial<Record<ViewType, { imageUrl: string }>>
  existingGoalType?: string | null
  existingTimeframe?: string | null
  onSuccess?: (
    results: Partial<Record<ViewType, ViewResult>>,
    goalType: string,
    timeframe: string,
    gender: string
  ) => void
}

export function GoalPhysiqueGenerator({
  open,
  onOpenChange,
  initialView,
  existingResults,
  existingGoalType,
  existingTimeframe,
  onSuccess,
}: GoalPhysiqueGeneratorProps) {
  const [step, setStep] = useState<Step>(1)
  const [primaryView, setPrimaryView] = useState<ViewType>(initialView ?? 'front')
  const [uploads, setUploads] = useState<Partial<Record<ViewType, ViewUpload>>>({})
  const [fileErrors, setFileErrors] = useState<Partial<Record<ViewType, string>>>({})
  const [draggingView, setDraggingView] = useState<ViewType | null>(null)
  const [goalType, setGoalType] = useState<GoalType | null>((existingGoalType as GoalType) ?? null)
  const [timeframe, setTimeframe] = useState<Timeframe | null>((existingTimeframe as Timeframe) ?? null)
  const [gender, setGender] = useState<Gender>('male')
  const [sessionResults, setSessionResults] = useState<Partial<Record<ViewType, ViewResult>>>({})
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [generatingView, setGeneratingView] = useState<ViewType | null>(null)
  const [completedViews, setCompletedViews] = useState<ViewType[]>([])
  const [generationQueue, setGenerationQueue] = useState<ViewType[]>([])
  // Lightbox state for step 4
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxView, setLightboxView] = useState<ViewType>('front')

  const fileInputRefs = useRef<Partial<Record<ViewType, HTMLInputElement>>>({})
  // Keep a ref to uploads so handleGenerate always reads the latest value, not a stale closure
  const uploadsRef = useRef(uploads)
  uploadsRef.current = uploads

  const { isGenerating, generateGoalPhysique } = useGoalPhysique()

  // Reset to a fresh state every time the dialog opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setPrimaryView(initialView ?? 'front')
      setUploads({})
      setFileErrors({})
      setDraggingView(null)
      setCompletedViews([])
      setGenerationQueue([])
      setGeneratingView(null)
      setSessionResults({})
      setLightboxOpen(false)
      setGoalType((existingGoalType as GoalType) ?? null)
      setTimeframe((existingTimeframe as Timeframe) ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const validateAndSetFile = (file: File, view: ViewType) => {
    setFileErrors(prev => ({ ...prev, [view]: undefined }))
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFileErrors(prev => ({ ...prev, [view]: 'JPG, PNG, or WEBP only' }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileErrors(prev => ({ ...prev, [view]: 'Max 10MB' }))
      return
    }
    setUploads(prev => ({ ...prev, [view]: { file, previewUrl: URL.createObjectURL(file) } }))
  }

  const hasAnyUpload = VIEWS.some(v => uploads[v] != null)

  const handleGenerate = async () => {
    if (!goalType || !timeframe) return

    // Snapshot state values NOW before any async work — avoids stale closure issues
    // Reading from uploadsRef.current gives us the latest uploads regardless of when
    // React has scheduled its re-renders.
    const currentUploads = uploadsRef.current
    const frontPhoto = currentUploads.front?.file ?? null
    const backPhoto = currentUploads.back?.file ?? null
    const sidePhoto = currentUploads.side?.file ?? null

    const viewsToGenerate: Array<{ view: ViewType; photo: File }> = []
    if (frontPhoto) viewsToGenerate.push({ view: 'front', photo: frontPhoto })
    if (backPhoto) viewsToGenerate.push({ view: 'back', photo: backPhoto })
    if (sidePhoto) viewsToGenerate.push({ view: 'side', photo: sidePhoto })

    if (viewsToGenerate.length === 0) return

    // Snapshot goal settings too so the loop body doesn't read stale state
    const snapshotGoalType = goalType
    const snapshotTimeframe = timeframe
    const snapshotGender = gender

    setStep(3)
    setLoadingMessage(LOADING_MESSAGES[0])
    setGenerationQueue(viewsToGenerate.map(({ view }) => view))
    setCompletedViews([])
    setGeneratingView(null)

    const newSessionResults: Partial<Record<ViewType, ViewResult>> = {}

    for (const { view, photo } of viewsToGenerate) {
      setGeneratingView(view)
      try {
        const result = await generateGoalPhysique(photo, snapshotGoalType, snapshotTimeframe, snapshotGender, view)
        const now = new Date().toISOString()
        newSessionResults[view] = { imageUrl: result.imageUrl, generatedAt: now }
        setSessionResults(prev => ({ ...prev, [view]: { imageUrl: result.imageUrl, generatedAt: now } }))
        setCompletedViews(prev => [...prev, view])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.'
        toast.error(`${VIEW_INFO[view].label} view: ${msg}`)
      }
    }

    setGeneratingView(null)

    if (Object.keys(newSessionResults).length > 0) {
      setStep(4)
      onSuccess?.(newSessionResults, snapshotGoalType, snapshotTimeframe, snapshotGender)
    } else {
      // All views failed — go back to configure step
      setStep(2)
    }
  }

  const handleTryAgain = () => {
    setStep(1)
    setUploads({})
    setCompletedViews([])
    setGenerationQueue([])
    setSessionResults({})
  }

  const handleDownload = (view: ViewType) => {
    const url = sessionResults[view]?.imageUrl
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `goal-physique-${view}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleSave = () => {
    toast.success('Goal physique saved!')
    onOpenChange(false)
  }

  const openLightbox = (view: ViewType) => {
    setLightboxView(view)
    setLightboxOpen(true)
  }

  // Prevent closing dialog during generation
  const handleOpenChange = (newOpen: boolean) => {
    if (step === 3) return
    onOpenChange(newOpen)
  }

  // Build lightbox image map from session results
  const lightboxImages: Partial<Record<ViewType, string>> = {}
  for (const [v, r] of Object.entries(sessionResults)) {
    if (r) lightboxImages[v as ViewType] = r.imageUrl
  }

  const goalLabel = [
    goalType ? goalType.charAt(0).toUpperCase() + goalType.slice(1) : null,
    timeframe ? TIMEFRAME_LABELS[timeframe as Timeframe] : null,
  ]
    .filter(Boolean)
    .join(' · ')

  // Views that were successfully generated this session
  const resultViews = completedViews.filter(v => sessionResults[v] != null)

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 1 && `Generate ${VIEW_INFO[primaryView].label} View`}
              {step === 2 && 'Choose Your Goal'}
              {step === 3 && 'Generating Your Physique'}
              {step === 4 && 'Generation Complete'}
            </DialogTitle>
          </DialogHeader>

          {/* ── Step 1: Upload ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-[#a1a1aa]">
                Upload a photo for each view you want to generate. At least one is required.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {VIEWS.map((view) => {
                  const info = VIEW_INFO[view]
                  const upload = uploads[view]
                  const isDraggingThis = draggingView === view
                  const error = fileErrors[view]
                  const alreadyGenerated = !!existingResults?.[view]
                  const isPrimary = view === primaryView

                  return (
                    <div key={view} className="space-y-1.5">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Upload ${info.label} photo`}
                        className={cn(
                          'border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2',
                          isDraggingThis
                            ? 'border-primary bg-primary/5'
                            : upload
                            ? 'border-primary/60 bg-primary/5'
                            : isPrimary
                            ? 'border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20'
                            : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                        )}
                        style={{ minHeight: '120px' }}
                        onClick={() => fileInputRefs.current[view]?.click()}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRefs.current[view]?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDraggingView(view) }}
                        onDragLeave={() => setDraggingView(null)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDraggingView(null)
                          const file = e.dataTransfer.files?.[0]
                          if (file) validateAndSetFile(file, view)
                        }}
                      >
                        <input
                          ref={(el) => { if (el) fileInputRefs.current[view] = el }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) validateAndSetFile(file, view)
                          }}
                        />
                        {upload ? (
                          <div className="relative w-14 h-[72px] rounded-md overflow-hidden">
                            <Image
                              src={upload.previewUrl}
                              alt={`${info.label} preview`}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                        ) : (
                          <Upload className={cn('h-6 w-6', isPrimary ? 'text-primary/60' : 'text-[#a1a1aa]')} />
                        )}
                      </div>

                      <div className="text-center space-y-0.5">
                        <p className={cn('text-xs font-medium', isPrimary ? 'text-white' : 'text-[#a1a1aa]')}>
                          {info.label}
                          {isPrimary && !upload && (
                            <span className="ml-1 text-primary text-[10px]">← start here</span>
                          )}
                        </p>
                        <p className="text-[10px] text-[#555] leading-tight">{info.description}</p>
                        {error ? (
                          <p className="text-[10px] text-red-400">{error}</p>
                        ) : alreadyGenerated && !upload ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-green-400">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Done
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button className="w-full" disabled={!hasAnyUpload} onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {/* ── Step 2: Configure ── */}
          {step === 2 && (
            <div className="space-y-5">
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
                      <div className={cn('p-2 rounded-lg flex-shrink-0', goalType === type ? 'bg-primary/20' : 'bg-[#1a1a1a]')}>
                        <Icon className={cn('h-5 w-5', goalType === type ? 'text-primary' : 'text-[#a1a1aa]')} />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{label}</p>
                        <p className="text-xs text-[#a1a1aa] mt-0.5">{description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

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
                <p className="text-xs text-[#a1a1aa] text-center">
                  ~3.5 credits per view · {VIEWS.filter(v => uploads[v]).length} view{VIEWS.filter(v => uploads[v]).length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: Generating ── */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 gap-6">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
              </div>
              <div className="w-full space-y-3">
                {generationQueue.map((view) => {
                  const isDone = completedViews.includes(view)
                  const isActive = generatingView === view
                  return (
                    <div key={view} className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      ) : isActive ? (
                        <div className="h-4 w-4 border-2 border-t-primary border-primary/20 rounded-full animate-spin flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-[#2a2a2a] flex-shrink-0" />
                      )}
                      <span className={cn('text-sm', isDone || isActive ? 'text-white' : 'text-[#a1a1aa]')}>
                        {isDone
                          ? `${VIEW_INFO[view].label} view — Done`
                          : isActive
                          ? `Generating ${VIEW_INFO[view].label.toLowerCase()} view...`
                          : `${VIEW_INFO[view].label} view`}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-[#a1a1aa]">~15–30 seconds per view</p>
            </div>
          )}

          {/* ── Step 4: Result ── */}
          {step === 4 && resultViews.length > 0 && (
            <div className="space-y-5">
              {resultViews.map((view) => {
                const result = sessionResults[view]!
                const upload = uploads[view]
                return (
                  <div key={view} className="space-y-2">
                    <p className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wide">
                      {VIEW_INFO[view].label}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Before */}
                      <div className="space-y-1.5">
                        <p className="text-xs text-[#a1a1aa] text-center font-medium">Now</p>
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#111111] border border-[#1a1a1a]">
                          {upload ? (
                            <Image
                              src={upload.previewUrl}
                              alt={`Current ${view} physique`}
                              fill
                              className="object-cover"
                              sizes="50vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full px-4">
                              <p className="text-xs text-[#a1a1aa] text-center">Your {view} photo</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Goal — clickable to expand */}
                      <div className="space-y-1.5">
                        <p className="text-xs text-primary text-center font-medium">Your Goal</p>
                        <button
                          type="button"
                          className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-primary/40 group block"
                          onClick={() => openLightbox(view)}
                          aria-label={`Expand ${view} goal physique`}
                        >
                          <Image
                            src={result.imageUrl}
                            alt={`Goal ${view} physique`}
                            fill
                            className="object-cover"
                            sizes="50vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Expand className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </button>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload(view)}>
                      <Download className="h-3.5 w-3.5" />
                      Download {VIEW_INFO[view].label} View
                    </Button>
                  </div>
                )
              })}

              <div className="space-y-2 pt-1">
                <Button className="w-full" onClick={handleSave}>
                  Save as My Goal
                </Button>
                <Button variant="outline" className="w-full" onClick={handleTryAgain}>
                  <RefreshCw className="h-4 w-4" />
                  Generate Another View
                </Button>
              </div>

              <p className="text-xs text-[#a1a1aa] text-center border-t border-[#1a1a1a] pt-3 leading-relaxed">
                AI-generated visualization for motivation only. Individual results vary.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox — rendered outside the Dialog so it can cover it */}
      {lightboxOpen && (
        <PhysiqueLightbox
          images={lightboxImages}
          activeView={lightboxView}
          onViewChange={setLightboxView}
          onClose={() => setLightboxOpen(false)}
          goalLabel={goalLabel || undefined}
        />
      )}
    </>
  )
}
