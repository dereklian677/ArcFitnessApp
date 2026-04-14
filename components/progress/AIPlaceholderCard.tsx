'use client'

import { useState } from 'react'
import { Sparkles, Lock } from 'lucide-react'
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
      <div
        className="relative overflow-hidden rounded-xl p-6"
        style={{
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border-default)',
        }}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(124, 58, 237, 0.1)' }}
              >
                <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-violet)' }} />
              </div>
              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                AI Physique Analysis
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Coming soon
            </span>
          </div>

          {/* Placeholder lines */}
          <div className="space-y-2 opacity-30">
            <div className="h-2.5 rounded-full w-full" style={{ background: 'var(--bg-subtle)' }} />
            <div className="h-2.5 rounded-full w-4/5" style={{ background: 'var(--bg-subtle)' }} />
            <div className="h-2.5 rounded-full w-3/5" style={{ background: 'var(--bg-subtle)' }} />
          </div>

          {/* Locked state */}
          <div
            className="flex items-center gap-3 py-3 px-4 rounded-lg"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Lock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Upload weekly photos to unlock your progress score.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            className="px-0 h-auto"
            style={{ color: 'var(--accent-violet)' }}
          >
            Learn more
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-violet)' }} />
              AI Physique Analysis
            </DialogTitle>
            <DialogDescription>Coming soon</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>
              Arc&apos;s AI engine will evaluate your progress photos and provide a{' '}
              <strong style={{ color: 'var(--text-primary)' }}>physique score from 0–100</strong>{' '}
              based on your stated goal.
            </p>
            <div className="space-y-2">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Coming features:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Weekly physique score based on photo uploads</li>
                <li>Side-by-side before/after comparison with AI analysis</li>
                <li>Goal alignment score</li>
                <li>Personalized recommendations based on progress</li>
              </ul>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Keep uploading weekly photos — your data is ready when this launches.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
