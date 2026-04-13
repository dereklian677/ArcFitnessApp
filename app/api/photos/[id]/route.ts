import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractStoragePath } from '@/lib/supabase/storage'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  // Fetch the record to get the storage path — also confirms ownership
  const { data: photo, error: fetchError } = await supabase
    .from('progress_photos')
    .select('photo_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  // Delete from storage
  const storagePath = extractStoragePath(photo.photo_url)
  await supabase.storage.from('progress-photos').remove([storagePath])

  // Delete the DB record
  const { error: deleteError } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
