import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import type { ViewType } from '@/types'

// Configure fal.ai client with API key
fal.config({
  credentials: process.env.FAL_API_KEY,
})

function buildPrompt(goalType: string, timeframe: string, gender: string, view: ViewType): string {
  const timeframeText =
    ({ '6months': '6 months', '1year': '1 year', '2years': '2 years' } as Record<string, string>)[timeframe] ??
    '1 year'

  const bodyText =
    ({
      lean: 'lean toned flat stomach visible abs defined muscles athletic build low body fat',
      athletic: 'athletic muscular defined physique balanced muscle development fit sports body',
      muscular: 'muscular well developed chest and arms defined abs broader shoulders strong gym physique',
    } as Record<string, string>)[goalType] ?? ''

  const viewText = ({
    front: 'Front-facing view.',
    back: 'Rear-facing view showing back muscles and posterior chain.',
    side: 'Side profile view showing overall posture and proportions.',
  } as Record<ViewType, string>)[view]

  // Kontext is an instruction-based photo editor — body-only language; face is handled by step 2 face swap
  return `Same person after ${timeframeText} of gym training. Body is now ${bodyText}. Keep background and clothing the same. Photorealistic photo. ${viewText} Keep the same pose angle as the original photo.`
}

export async function POST(request: NextRequest) {
  if (!process.env.FAL_API_KEY) {
    return NextResponse.json({ error: 'Image generation not configured' }, { status: 503 })
  }

  console.log('FAL_API_KEY present:', !!process.env.FAL_API_KEY)

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const photo = formData.get('photo') as File | null
  const goalType = formData.get('goalType') as string | null
  const timeframe = formData.get('timeframe') as string | null
  const gender = formData.get('gender') as string | null
  const viewRaw = (formData.get('view') as string | null) ?? 'front'

  if (!photo || !goalType || !timeframe || !gender) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const validViews: ViewType[] = ['front', 'back', 'side']
  const view: ViewType = validViews.includes(viewRaw as ViewType) ? (viewRaw as ViewType) : 'front'

  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(photo.type)) {
    return NextResponse.json({ error: 'Invalid file type — JPG, PNG, or WEBP only' }, { status: 400 })
  }
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large — max 10MB' }, { status: 400 })
  }

  // Convert uploaded image to base64 data URL for fal.ai
  const imageBuffer = Buffer.from(await photo.arrayBuffer())
  const imageBase64 = imageBuffer.toString('base64')
  const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`

  // ── Step 1: Flux Kontext — transform the body while keeping background/clothing ──
  const seed = Math.floor(Math.random() * 1000000)
  console.log('Generation seed:', seed, 'view:', view)
  console.log('Starting Step 1...')
  let step1: Awaited<ReturnType<typeof fal.subscribe<'fal-ai/flux-pro/kontext'>>>
  try {
    step1 = await fal.subscribe('fal-ai/flux-pro/kontext', {
      input: {
        image_url: imageDataUrl,
        prompt: buildPrompt(goalType, timeframe, gender, view),
        guidance_scale: 4.5,
        num_images: 1,
        safety_tolerance: '6',
        output_format: 'jpeg',
        seed,
      },
    })
    console.log('Step 1 full response:', JSON.stringify(step1, null, 2))
    console.log('Step 1 images:', step1.data?.images)
  } catch (err) {
    console.error('Step 1 error (full):', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2))
    return NextResponse.json({ error: 'Failed to connect to image generation service' }, { status: 502 })
  }

  const transformedImageUrl = step1.data?.images?.[0]?.url
  if (!transformedImageUrl) {
    console.error('Step 1: no image URL in response. Full data:', JSON.stringify(step1?.data, null, 2))
    return NextResponse.json({ error: 'Image generation failed. Please try again.' }, { status: 500 })
  }
  console.log('Step 1 complete. Transformed image URL:', transformedImageUrl)

  // ── Step 2: Easel AI face swap — paste original face onto transformed body ──
  // Easel AI requires public HTTPS URLs — upload the original photo to fal storage first
  console.log('Starting Step 2...')
  let uploadedFaceUrl: string
  try {
    const originalPhotoBlob = new Blob([imageBuffer], { type: 'image/jpeg' })
    uploadedFaceUrl = await fal.storage.upload(originalPhotoBlob)
    console.log('Uploaded face image URL:', uploadedFaceUrl)
  } catch (err) {
    console.error('fal.storage.upload failed:', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2))
    return NextResponse.json({ error: 'Failed to upload photo for face swap' }, { status: 502 })
  }

  let step2: Awaited<ReturnType<typeof fal.subscribe<'easel-ai/advanced-face-swap'>>>
  try {
    step2 = await fal.subscribe('easel-ai/advanced-face-swap', {
      input: {
        face_image_0: { url: uploadedFaceUrl },
        gender_0: gender as 'male' | 'female' | 'non-binary',
        target_image: { url: transformedImageUrl },
        workflow_type: 'user_hair',
        upscale: true,
      },
    })
    console.log('Step 2 full response:', JSON.stringify(step2, null, 2))
  } catch (err) {
    console.error('Step 2 error (full):', JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2))
    return NextResponse.json({ error: 'Face restoration failed. Please try again.' }, { status: 502 })
  }

  const finalImageUrl = step2.data?.image?.url
  if (!finalImageUrl) {
    console.error('Step 2: no image URL in response. Full data:', JSON.stringify(step2?.data, null, 2))
    return NextResponse.json({ error: 'Face restoration failed. Please try again.' }, { status: 500 })
  }
  console.log('Step 2 complete. Final image URL:', finalImageUrl)

  const imageResponse = await fetch(finalImageUrl)
  const generatedBuffer = Buffer.from(await imageResponse.arrayBuffer())

  // Check for black image — safety filter returns a solid black image instead of an error
  const { data: pixelData } = await sharp(generatedBuffer).greyscale().raw().toBuffer({ resolveWithObject: true })
  const avgPixelValue = pixelData.reduce((sum, val) => sum + val, 0) / pixelData.length
  if (avgPixelValue < 10) {
    console.error('fal.ai: black image detected (avg pixel value:', avgPixelValue, ') — safety filter likely triggered')
    return NextResponse.json(
      { error: 'Generation was blocked by content filter — please try again' },
      { status: 422 }
    )
  }

  // Upload to Supabase Storage: goal-physique/{user_id}/goal-{view}.jpg
  const storagePath = `${user.id}/goal-${view}.jpg`
  const uploadBlob = new Blob([generatedBuffer], { type: 'image/jpeg' })

  const { error: uploadError } = await supabase.storage
    .from('goal-physique')
    .upload(storagePath, uploadBlob, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to save generated image' }, { status: 500 })
  }

  // Generate signed URL (1 hour)
  const { data: signedData, error: signedError } = await supabase.storage
    .from('goal-physique')
    .createSignedUrl(storagePath, 3600)

  if (signedError || !signedData?.signedUrl) {
    console.error('Signed URL error:', signedError)
    return NextResponse.json({ error: 'Failed to generate image URL' }, { status: 500 })
  }

  // Build per-view profile update
  const goalUrlColumn = `goal_image_${view}_url` as const
  const goalGeneratedAtColumn = `goal_generated_${view}_at` as const

  const updateData: Record<string, unknown> = {
    [goalUrlColumn]: signedData.signedUrl,
    [goalGeneratedAtColumn]: new Date().toISOString(),
    goal_type: goalType as 'lean' | 'athletic' | 'muscular',
    goal_timeframe: timeframe as '6months' | '1year' | '2years',
    goal_gender: gender as 'male' | 'female',
  }

  // Keep goal_image_url and goal_generated_at in sync with the front view for backwards compatibility
  if (view === 'front') {
    updateData.goal_image_url = signedData.signedUrl
    updateData.goal_generated_at = new Date().toISOString()
  }

  await supabase.from('profiles').update(updateData).eq('id', user.id)

  return NextResponse.json({ success: true, imageUrl: signedData.signedUrl })
}
