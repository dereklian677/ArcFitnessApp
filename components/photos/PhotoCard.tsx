'use client'

import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ProgressPhoto } from '@/types'

function AIScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/50 text-white/60 backdrop-blur-sm border border-white/10 animate-pulse">
        Analyzing...
      </span>
    )
  }
  if (score === 0) {
    return (
      <Badge variant="muted" className="text-[10px] backdrop-blur-sm">
        Baseline
      </Badge>
    )
  }
  const colorClass =
    score <= 33
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : score <= 66
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      : 'bg-green-500/20 text-green-300 border-green-500/30'
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm border font-medium',
        colorClass
      )}
    >
      {score}/100
    </span>
  )
}

const typeLabels: Record<string, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
  custom: 'Custom',
}

interface PhotoCardProps {
  photo: ProgressPhoto
  onClick?: (photo: ProgressPhoto) => void
  onDelete?: (id: string) => void
}

export function PhotoCard({ photo, onClick, onDelete }: PhotoCardProps) {
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this photo? This cannot be undone.')) return
    onDelete?.(photo.id)
  }

  return (
    <div
      className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#111111] border border-[#1a1a1a] cursor-pointer group hover:border-[#2a2a2a] transition-all duration-200"
      onClick={() => onClick?.(photo)}
    >
      <Image
        src={photo.photo_url}
        alt={`${typeLabels[photo.photo_type] ?? 'Progress'} photo`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
          aria-label="Delete photo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-[10px] bg-black/50 border-white/20 text-white backdrop-blur-sm">
            {typeLabels[photo.photo_type] ?? photo.photo_type}
          </Badge>
          <AIScoreBadge score={photo.ai_score} />
        </div>
        <p className="text-[10px] text-white/80">{formatDateShort(photo.taken_at)}</p>
      </div>
    </div>
  )
}
