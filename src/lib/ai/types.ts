import type { CrochetCurrency } from "@/lib/currency";

// Shared, client-safe contracts for the CrochetIQ AI layer.
// Every AI provider adapter must satisfy these shapes, so adding a new
// provider later never touches UI code.

export type CrochetGoal = "social" | "sell" | "ideas";

export const GOAL_LABELS: Record<CrochetGoal, string> = {
  social: "Prepare for Social Media",
  sell: "Sell My Product",
  ideas: "Get New Ideas",
};

export interface CrochetAnalysis {
  detectedItem: string;
  category: string;
  difficulty: string;
  colors: string[];
  suggestedUse: string;
  materials: string[];
  estimatedTime: string;
}

export interface CrochetIdea {
  title: string;
  description: string;
}

export interface CrochetContent {
  friendlyCaption: string;
  professionalCaption: string;
  playfulCaption: string;
  productDescription: string;
  hashtags: string[];
  pricingMin: number;
  pricingMax: number;
  currency: CrochetCurrency;
  materialsConsidered: string[];
  estimatedTime: string;
  ideas: CrochetIdea[];
}

export interface EnhancementResult {
  /** Data URL or remote URL of the enhanced photo. */
  imageUrl: string;
  /** True when the provider returned a genuinely new image. */
  enhanced: boolean;
  note?: string;
}

export interface CrochetProjectDraft {
  originalImage: string;
  enhancedImage: string;
  enhancementNote?: string;
  goal: CrochetGoal;
  notes: string;
  analysis: CrochetAnalysis;
  content: CrochetContent;
  createdAt: string;
}
