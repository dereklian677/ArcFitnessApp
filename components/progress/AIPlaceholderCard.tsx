'use client'

import { useState } from 'react'
import { Sparkles, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function AIPlaceholderCard() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-[#2a2a2a] bg-[#0a0a0a] p-6">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-white">AI Physique Analysis</span>
            </div>
            <Badge variant="muted">Coming Soon</Badge>
          </div>

          {/* Placeholder lines */}
          <div className="space-y-2 opacity-40">
            <div className="h-3 bg-[#2a2a2a] rounded w-full" />
            <div className="h-3 bg-[#2a2a2a] rounded w-4/5" />
            <div className="h-3 bg-[#2a2a2a] rounded w-3/5" />
          </div>

          {/* Locked state */}
          <div className="flex items-center gap-3 py-3 px-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <Lock className="h-4 w-4 text-[#a1a1aa] flex-shrink-0" />
            <p className="text-sm text-[#a1a1aa]">
              AI physique analysis coming soon. Upload weekly photos to unlock your progress score.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Info modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Physique Analysis — Coming Soon
            </DialogTitle>
            <DialogDescription>
              What&apos;s being built for you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-[#a1a1aa]">
            <p>
              Arc&apos;s AI analysis engine will automatically evaluate your progress photos and provide a <strong className="text-white">physique score from 0–100</strong> based on your stated goal.
            </p>
            <div className="space-y-2">
              <p className="text-white font-medium">Coming features:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Weekly physique score based on photo uploads</li>
                <li>Side-by-side before/after comparison with AI annotations</li>
                <li>Goal alignment score (how close you are to your target physique)</li>
                <li>Personalized recommendations based on your progress</li>
                <li>3D physique avatar that morphs toward your goal (powered by Ready Player Me)</li>
              </ul>
            </div>
            <p className="text-xs">
              Keep uploading weekly photos — your data is ready when this feature launches.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
