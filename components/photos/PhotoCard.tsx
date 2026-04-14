'use client'

import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import type { ProgressPhoto } from '@/types'

function AIScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span
        className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full animate-pulse"
        style={{
          background: 'rgba(0,0,0,0.5)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(4px)',
        }}
      >
        Scoring...
      </span>
    )
  }
  if (score === 0) {
    return (
      <span
        className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full"
        style={{
          background: 'rgba(0,0,0,0.5)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(4px)',
        }}
      >
        Baseline
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium tabular-nums"
      style={{
        background: 'rgba(0,0,0,0.6)',
        color: 'var(--accent-cyan)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {score}/100
    </span>
  )
}

const typeLabels: Record<string, string> = {
  front:  'Front',
  back:   'Back',
  side:   'Side',
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
      className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group transition-all duration-150 border border-[var(--border-subtle)] hover:border-[var(--accent-violet)] hover:scale-[1.02]"
      style={{ background: 'var(--bg-surface)' }}
      onClick={() => onClick?.(photo)}
    >
      <Image
        src={photo.photo_url}
        alt={`${typeLabels[photo.photo_type] ?? 'Progress'} photo`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-150 text-[var(--text-secondary)] hover:text-red-400"
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          aria-label="Delete photo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
        <div className="space-y-1">
          <AIScoreBadge score={photo.ai_score} />
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {formatDateShort(photo.taken_at)}
          </p>
        </div>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(0,0,0,0.5)',
            color: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {typeLabels[photo.photo_type] ?? photo.photo_type}
        </span>
      </div>
    </div>
  )
}
