// Vision Service — understands the uploaded crochet photo. Nothing else.
import { chatJson } from "./provider.server";
import type { CrochetAnalysis } from "./types";

const SYSTEM = `You are a crochet expert with decades of experience in yarn crafts.
Look at the photo and describe the finished crochet item factually.
Reply with JSON only, using exactly this shape:
{
  "detectedItem": string,
  "category": string,
  "difficulty": "Beginner" | "Easy" | "Intermediate" | "Advanced",
  "colors": string[],
  "suggestedUse": string,
  "materials": string[],
  "estimatedTime": string
}
Use 2-5 colors described in plain words (e.g. "dusty pink"). Materials should list likely
yarn weight/fibre and notions. estimatedTime is a human phrase like "6-8 hours".`;

export async function runVision(imageDataUrl: string, notes: string): Promise<CrochetAnalysis> {
  const result = await chatJson<CrochetAnalysis>(SYSTEM, [
    {
      type: "text",
      text: notes.trim()
        ? `Maker's notes about this piece: ${notes.trim()}`
        : "Analyze this crochet piece.",
    },
    { type: "image_url", image_url: { url: imageDataUrl } },
  ]);

  return {
    detectedItem: result.detectedItem || "Crochet piece",
    category: result.category || "Handmade",
    difficulty: result.difficulty || "Intermediate",
    colors: Array.isArray(result.colors) ? result.colors.slice(0, 6) : [],
    suggestedUse: result.suggestedUse || "",
    materials: Array.isArray(result.materials) ? result.materials.slice(0, 6) : [],
    estimatedTime: result.estimatedTime || "A few hours",
  };
}
