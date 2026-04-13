'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VIEWS, type ViewType } from '@/types'

const VIEW_LABELS: Record<ViewType, string> = {
  front: 'Front View',
  back: 'Back View',
  side: 'Side View',
}

interface PhysiqueLightboxProps {
  /** Map of available goal images by view. Only views with truthy URLs are shown. */
  images: Partial<Record<ViewType, string>>
  /** Currently displayed view. */
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  onClose: () => void
  /** Optional label shown after the view name, e.g. "Athletic · 1 Year" */
  goalLabel?: string
}

export function PhysiqueLightbox({
  images,
  activeView,
  onViewChange,
  onClose,
  goalLabel,
}: PhysiqueLightboxProps) {
  const availableViews = VIEWS.filter((v) => images[v])
  const activeIndex = availableViews.indexOf(activeView)
  const activeUrl = images[activeView]

  const gotoPrev = useCallback(() => {
    if (activeIndex > 0) onViewChange(availableViews[activeIndex - 1])
  }, [activeIndex, availableViews, onViewChange])

  const gotoNext = useCallback(() => {
    if (activeIndex < availableViews.length - 1) onViewChange(availableViews[activeIndex + 1])
  }, [activeIndex, availableViews, onViewChange])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') gotoPrev()
      if (e.key === 'ArrowRight') gotoNext()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, gotoPrev, gotoNext])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!activeUrl) return null

  const title = [VIEW_LABELS[activeView], goalLabel].filter(Boolean).join(' — ')
  const canPrev = activeIndex > 0
  const canNext = activeIndex < availableViews.length - 1

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-white truncate pr-8">{title}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image — sized to fit within viewport with 3:4 aspect ratio */}
      <div
        className="relative rounded-xl overflow-hidden shadow-2xl"
        style={{ width: 'min(90vw, calc(78vh * 3 / 4))', aspectRatio: '3/4' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={activeUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="90vw"
          priority
        />
      </div>

      {/* Prev / Next arrows */}
      {availableViews.length > 1 && (
        <>
          <button
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-sm',
              !canPrev && 'opacity-20 cursor-not-allowed'
            )}
            onClick={(e) => { e.stopPropagation(); gotoPrev() }}
            disabled={!canPrev}
            aria-label="Previous view"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-sm',
              !canNext && 'opacity-20 cursor-not-allowed'
            )}
            onClick={(e) => { e.stopPropagation(); gotoNext() }}
            disabled={!canNext}
            aria-label="Next view"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* View selector pills */}
      {availableViews.length > 1 && (
        <div
          className="absolute bottom-5 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {availableViews.map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                v === activeView
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white hover:bg-white/35'
              )}
            >
              {VIEW_LABELS[v].replace(' View', '')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
