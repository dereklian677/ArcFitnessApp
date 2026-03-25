import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PhotoGrid } from '@/components/photos/PhotoGrid'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'

export default async function PhotosPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .order('taken_at', { ascending: false })

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Progress Photos"
        description="Track your physique transformation over time"
        action={
          <Button asChild>
            <Link href="/photos/upload">
              <Plus className="h-4 w-4" /> Add photo
            </Link>
          </Button>
        }
      />
      <PhotoGrid photos={photos ?? []} />
    </div>
  )
}
