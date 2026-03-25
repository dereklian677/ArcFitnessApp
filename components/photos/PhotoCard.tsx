'use client'

import Image from 'next/image'
import { formatDateShort } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ProgressPhoto } from '@/types'

const typeLabels: Record<string, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
  custom: 'Custom',
}

interface PhotoCardProps {
  photo: ProgressPhoto
  onClick?: (photo: ProgressPhoto) => void
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
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
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-[10px] bg-black/50 border-white/20 text-white backdrop-blur-sm">
            {typeLabels[photo.photo_type] ?? photo.photo_type}
          </Badge>
          <Badge variant="muted" className="text-[10px] backdrop-blur-sm">
            AI Score: —
          </Badge>
        </div>
        <p className="text-[10px] text-white/80">{formatDateShort(photo.taken_at)}</p>
      </div>
    </div>
  )
}
