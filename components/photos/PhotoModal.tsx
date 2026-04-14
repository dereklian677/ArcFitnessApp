'use client'

import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { ProgressPhoto } from '@/types'

const typeLabels: Record<string, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
  custom: 'Custom',
}

interface PhotoModalProps {
  photo: ProgressPhoto | null
  onClose: () => void
}

export function PhotoModal({ photo, onClose }: PhotoModalProps) {
  if (!photo) return null

  return (
    <Dialog open={!!photo} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg p-0 max-h-[85vh] overflow-y-auto">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={photo.photo_url}
            alt="Progress photo"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
            priority
          />
        </div>
        <div className="p-5 space-y-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Progress Photo</span>
              <Badge variant="outline">
                {typeLabels[photo.photo_type] ?? photo.photo_type}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#a1a1aa]">{formatDate(photo.taken_at)}</span>
            <Badge variant="muted">AI Score: Coming Soon</Badge>
          </div>
          {photo.ai_notes && (
            <p className="text-sm text-[#a1a1aa]">{photo.ai_notes}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
