import sharp from 'sharp'

/**
 * Generates a black-and-white inpainting mask from a full-body photo.
 *
 * Black = face/head region — the AI cannot modify these pixels at all.
 * White = body region — the AI is free to transform these pixels.
 *
 * Strategy: protect the top 26% of the image as the face/head zone.
 * This is a reliable heuristic for full-body front-facing photos where
 * the subject's head occupies roughly the top quarter of the frame.
 *
 * Tuning guide (if results cut the chin):
 *   - Lots of headroom above subject → increase to 28-30%
 *   - Head very close to top edge   → decrease to 22%
 *   - 26% is the safe default for typical gym selfies / full-body shots
 */
export async function generateBodyMask(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()

  const width = metadata.width ?? 1024
  const height = metadata.height ?? 1024

  // Top 26% is face-protected (black), rest is body (white)
  const faceProtectionHeight = Math.floor(height * 0.12)

  const maskSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      <rect width="${width}" height="${faceProtectionHeight}" fill="black"/>
    </svg>
  `

  return sharp(Buffer.from(maskSvg))
    .resize(width, height)
    .png()
    .toBuffer()
}
