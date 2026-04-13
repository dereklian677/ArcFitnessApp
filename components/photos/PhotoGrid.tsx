'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PhotoCard } from './PhotoCard'
import { PhotoModal } from './PhotoModal'
import { EmptyState } from '@/components/shared/EmptyState'
import type { ProgressPhoto, PhotoType } from '@/types'

interface PhotoGridProps {
  photos: ProgressPhoto[]
}

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'side', label: 'Side' },
]

export function PhotoGrid({ photos: initialPhotos }: PhotoGridProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(initialPhotos)
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  async function handleDelete(id: string) {
    const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete photo'); return }
    toast.success('Photo deleted')
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setSelectedPhoto((prev) => (prev?.id === id ? null : prev))
  }

  const filtered = activeTab === 'all'
    ? photos
    : photos.filter((p) => p.photo_type === (activeTab as PhotoType))

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="No photos yet"
              description={activeTab === 'all'
                ? 'Upload your first progress photo to start tracking your physique over time.'
                : `No ${activeTab} photos yet.`}
              action={activeTab === 'all' ? { label: 'Upload photo', href: '/photos/upload' } : undefined}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
              {filtered.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={setSelectedPhoto}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </>
  )
}
