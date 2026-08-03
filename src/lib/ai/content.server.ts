// Content Generation Service — consumes structured Vision output only.
import type { CrochetCurrency } from "@/lib/currency";
import { chatJson } from "./provider.server";
import type { CrochetAnalysis, CrochetContent, CrochetGoal } from "./types";
import { GOAL_LABELS } from "./types";

function buildSystem(currency: CrochetCurrency): string {
  const currencyNote =
    currency === "INR"
      ? "Pricing is in Indian Rupees (INR). Return whole numbers appropriate to the Indian handmade market (e.g. ₹300–₹3,000 for small accessories, more for garments or blankets)."
      : "Pricing is in US Dollars (USD).";

  return `You write for crochet makers selling and sharing handmade work.
Warm, specific, never corporate. Reply with JSON only, exactly this shape:
{
  "friendlyCaption": string,
  "professionalCaption": string,
  "playfulCaption": string,
  "productDescription": string,
  "hashtags": string[],
  "pricingMin": number,
  "pricingMax": number,
  "materialsConsidered": string[],
  "estimatedTime": string,
  "ideas": [{ "title": string, "description": string }]
}
Captions are Instagram-ready and under 300 characters each. Provide 15-20 hashtags starting
with "#". ${currencyNote} Reflect materials, difficulty and time in the price. Provide exactly 5
ideas for related crochet projects the maker could try next.`;
}

export async function runContent(
  analysis: CrochetAnalysis,
  goal: CrochetGoal,
  notes: string,
  currency: CrochetCurrency,
): Promise<CrochetContent> {
  const result = await chatJson<CrochetContent>(
    buildSystem(currency),
    `The maker's goal: ${GOAL_LABELS[goal]}.
Maker's notes: ${notes.trim() || "none"}.
Target currency: ${currency}.
Crochet piece details: ${JSON.stringify(analysis)}`,
  );

  const ideas = Array.isArray(result.ideas) ? result.ideas.slice(0, 5) : [];
  return {
    friendlyCaption: result.friendlyCaption ?? "",
    professionalCaption: result.professionalCaption ?? "",
    playfulCaption: result.playfulCaption ?? "",
    productDescription: result.productDescription ?? "",
    hashtags: Array.isArray(result.hashtags)
      ? result.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).slice(0, 24)
      : [],
    pricingMin: Number(result.pricingMin) || 0,
    pricingMax: Number(result.pricingMax) || 0,
    currency,
    materialsConsidered: Array.isArray(result.materialsConsidered)
      ? result.materialsConsidered
      : analysis.materials,
    estimatedTime: result.estimatedTime || analysis.estimatedTime,
    ideas,
  };
}
