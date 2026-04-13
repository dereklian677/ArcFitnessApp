import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { extractStoragePath } from '@/lib/supabase/storage'
import type { ViewType } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/** Fetches an image from a signed URL, resizes to max 800px, and returns base64. */
async function fetchAndResizeImage(signedUrl: string): Promise<string> {
  const response = await fetch(signedUrl)
  if (!response.ok) throw new Error(`Failed to fetch image (${response.status}): ${signedUrl}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const resized = await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
  return resized.toString('base64')
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
  }

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { newPhotoId: string; view?: ViewType }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { newPhotoId } = body
  const view: ViewType = (['front', 'back', 'side'] as ViewType[]).includes(body.view as ViewType)
    ? (body.view as ViewType)
    : 'front'

  if (!newPhotoId) {
    return NextResponse.json({ error: 'Missing newPhotoId' }, { status: 400 })
  }

  // Fetch the newly uploaded photo record (scoped to this user for safety)
  const { data: newPhoto, error: newPhotoError } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('id', newPhotoId)
    .eq('user_id', user.id)
    .single()

  if (newPhotoError || !newPhoto) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  // Fetch baseline photo for this specific view, fall back to oldest overall
  let baselinePhoto: typeof newPhoto | null = null
  const { data: viewBaseline } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .eq('photo_type', view)
    .order('taken_at', { ascending: true })
    .limit(1)
    .single()

  if (viewBaseline) {
    baselinePhoto = viewBaseline
  } else {
    const { data: fallbackBaseline } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: true })
      .limit(1)
      .single()
    baselinePhoto = fallbackBaseline ?? null
  }

  if (!baselinePhoto) {
    return NextResponse.json({ error: 'No baseline photo found' }, { status: 404 })
  }

  // Fetch profile to check which goal views exist
  const { data: profile } = await supabase
    .from('profiles')
    .select('goal_image_url, goal_image_front_url, goal_image_back_url, goal_image_side_url')
    .eq('id', user.id)
    .single()

  // Determine which goal view to use: prefer view-specific, fall back to front
  const hasViewGoal =
    view === 'back' ? !!profile?.goal_image_back_url
    : view === 'side' ? !!profile?.goal_image_side_url
    : !!(profile?.goal_image_front_url || profile?.goal_image_url)

  const goalView: ViewType = hasViewGoal ? view : 'front'
  const hasAnyGoal = !!(profile?.goal_image_front_url || profile?.goal_image_url)

  if (!hasAnyGoal) {
    return NextResponse.json({ score: null, reason: 'no_goal_set' })
  }

  // First photo of this view is always the baseline — score 0
  if (newPhoto.id === baselinePhoto.id) {
    await supabase.from('progress_photos').update({ ai_score: 0 }).eq('id', newPhotoId)
    await recalculateCombinedScore(supabase, user.id, newPhotoId, 0)
    return NextResponse.json({ score: 0, reason: 'baseline' })
  }

  // Sign progress photo URLs
  const signProgressPhoto = async (photoUrl: string): Promise<string> => {
    const path = extractStoragePath(photoUrl)
    const { data, error } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(path, 3600)
    if (error || !data?.signedUrl) throw new Error(`Failed to sign progress photo: ${path}`)
    return data.signedUrl
  }

  // Re-sign goal physique from the known storage path
  const goalStoragePath = `${user.id}/goal-${goalView}.jpg`
  const { data: goalSignedData, error: goalSignError } = await supabase.storage
    .from('goal-physique')
    .createSignedUrl(goalStoragePath, 3600)

  if (goalSignError || !goalSignedData?.signedUrl) {
    return NextResponse.json({ error: 'Failed to sign goal image URL' }, { status: 500 })
  }

  try {
    // Sign and fetch all three images in parallel
    const [baselineSignedUrl, currentSignedUrl] = await Promise.all([
      signProgressPhoto(baselinePhoto.photo_url),
      signProgressPhoto(newPhoto.photo_url),
    ])

    const [baselineImageBase64, goalImageBase64, currentImageBase64] = await Promise.all([
      fetchAndResizeImage(baselineSignedUrl),
      fetchAndResizeImage(goalSignedData.signedUrl),
      fetchAndResizeImage(currentSignedUrl),
    ])

    // Call Claude with all three images
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are a fitness progress analyzer. I will show you three images in order: (1) BASELINE photo, (2) GOAL physique photo, (3) CURRENT progress photo. Score how far the person has progressed from their baseline toward their goal physique on a scale of 0 to 100, where 0 means identical to baseline and 100 means fully achieved the goal. Focus only on body composition changes: muscle definition, body fat, muscle size, and overall physique. Ignore differences in lighting, clothing, or background. Return ONLY a JSON object with no other text: { "score": <number 0-100> }',
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: baselineImageBase64,
              },
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: goalImageBase64,
              },
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: currentImageBase64,
              },
            },
          ],
        },
      ],
    })

    // Parse score from Claude's response
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let score = 0
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      score = Math.min(100, Math.max(0, Math.round(parsed.score)))
    } catch {
      console.error('Failed to parse Claude score response — defaulting to 0. Raw response:', text)
      score = 0
    }

    // Persist score to progress photo
    await supabase.from('progress_photos').update({ ai_score: score }).eq('id', newPhotoId)

    // Recalculate combined score across all views
    await recalculateCombinedScore(supabase, user.id, newPhotoId, score)

    return NextResponse.json({ score })
  } catch (err) {
    console.error('Scoring pipeline error:', err)
    return NextResponse.json({ error: 'Failed to score progress photo' }, { status: 500 })
  }
}

/**
 * After scoring a photo, average the latest score per view to get the combined progress score,
 * then update the profile.
 */
async function recalculateCombinedScore(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  scoredPhotoId: string,
  score: number
): Promise<void> {
  const { data: allScoredPhotos } = await supabase
    .from('progress_photos')
    .select('id, photo_type, ai_score, taken_at')
    .eq('user_id', userId)
    .not('ai_score', 'is', null)
    .order('taken_at', { ascending: false })

  // Use the just-scored value directly for the current photo (DB write may not be visible yet)
  const scoresByView: Record<string, number> = {}
  for (const photo of allScoredPhotos ?? []) {
    const effectiveScore = photo.id === scoredPhotoId ? score : (photo.ai_score ?? 0)
    if (scoresByView[photo.photo_type] === undefined) {
      scoresByView[photo.photo_type] = effectiveScore
    }
  }

  const scores = Object.values(scoresByView)
  const combinedScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  await supabase.from('profiles').update({ progress_score: combinedScore }).eq('id', userId)
}
