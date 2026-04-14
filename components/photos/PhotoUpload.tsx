'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { usePhotos } from '@/lib/hooks/usePhotos'
import { photoUploadSchema, validateImageFile, type PhotoUploadFormData } from '@/lib/validations/photo'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function PhotoUpload() {
  const router = useRouter()
  const { uploadPhoto } = usePhotos()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<PhotoUploadFormData>({
    resolver: zodResolver(photoUploadSchema),
    defaultValues: { photo_type: 'front' },
  })

  const handleFile = (selectedFile: File) => {
    const error = validateImageFile(selectedFile)
    if (error) { toast.error(error); return }
    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreview(url)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const clearFile = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (data: PhotoUploadFormData) => {
    if (!file) { toast.error('Please select a photo'); return }
    setIsUploading(true)
    const success = await uploadPhoto(file, data.photo_type, data.taken_at)
    setIsUploading(false)
    if (success) router.push('/photos')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Drop zone */}
        {!preview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#111111]'
            )}
          >
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <Upload className="h-6 w-6 text-[#a1a1aa]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  <span className="sm:hidden">Tap to select a photo</span>
                  <span className="hidden sm:inline">Drop your photo here</span>
                </p>
                <p className="text-xs text-[#a1a1aa] mt-1">
                  <span className="sm:hidden">JPEG, PNG, WebP · max 10MB</span>
                  <span className="hidden sm:inline">or click to browse · JPEG, PNG, WebP · max 10MB</span>
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-[#111111] border border-[#1a1a1a]">
            <div className="relative aspect-[3/4] max-h-80 w-full">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#a1a1aa]" />
              <span className="text-sm text-[#a1a1aa] truncate">{file?.name}</span>
            </div>
          </div>
        )}

        {/* Photo type */}
        <FormField
          control={form.control}
          name="photo_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Photo type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="side">Side</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isUploading || !file}>
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload photo
          </Button>
        </div>
      </form>
    </Form>
  )
}
