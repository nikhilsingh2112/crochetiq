// Image Enhancement Service — improves the photo only.
// Deliberately independent of the vision and language pipelines.
import { generateImage } from "./provider.server";
import type { EnhancementResult } from "./types";

const PROMPT = `Retouch this photo of a handmade crochet item so it is ready for social media.
Keep the crochet piece itself exactly as it is: same stitches, same shape, same colors.
Improve lighting so it looks like soft natural daylight, gently boost color accuracy and
warmth, reduce noise, remove distracting background clutter, and present the piece on a
clean, calm, softly lit surface. Photorealistic, no text, no watermarks, no added props.`;

export async function runEnhancement(imageDataUrl: string): Promise<EnhancementResult> {
  try {
    const image = await generateImage(PROMPT, imageDataUrl);
    if (image) return { imageUrl: image, enhanced: true };
    return {
      imageUrl: imageDataUrl,
      enhanced: false,
      note: "We couldn't enhance this photo, so your original is shown.",
    };
  } catch (error) {
    console.error("[enhancement]", error);
    return {
      imageUrl: imageDataUrl,
      enhanced: false,
      note: "Photo enhancement is unavailable right now — your original photo is shown.",
    };
  }
}
