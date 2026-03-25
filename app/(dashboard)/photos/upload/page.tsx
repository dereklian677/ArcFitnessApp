import { PageHeader } from '@/components/shared/PageHeader'
import { PhotoUpload } from '@/components/photos/PhotoUpload'

export default function PhotoUploadPage() {
  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <PageHeader
        title="Upload photo"
        description="Add a progress photo to track your transformation"
      />
      <PhotoUpload />
    </div>
  )
}
