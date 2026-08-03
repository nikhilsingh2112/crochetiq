import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type {
  CrochetAnalysis,
  CrochetContent,
  CrochetGoal,
  EnhancementResult,
} from "./ai/types";

const imageSchema = z.string().min(32).max(12_000_000);

const analyzeSchema = z.object({
  image: imageSchema,
  notes: z.string().max(1000).default(""),
});

const enhanceSchema = z.object({ image: imageSchema });

const contentSchema = z.object({
  analysis: z.object({
    detectedItem: z.string(),
    category: z.string(),
    difficulty: z.string(),
    colors: z.array(z.string()),
    suggestedUse: z.string(),
    materials: z.array(z.string()),
    estimatedTime: z.string(),
  }),
  goal: z.enum(["social", "sell", "ideas"]),
  notes: z.string().max(1000).default(""),
});

/** Vision Service entry point. Consumes one guest run. */
export const analyzeCrochetImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyzeSchema.parse(input))
  .handler(async ({ data }): Promise<CrochetAnalysis> => {
    const { guardAiUsage } = await import("./ai/guest-quota.server");
    await guardAiUsage(true);
    const { runVision } = await import("./ai/vision.server");
    return runVision(data.image, data.notes);
  });

/** Image Enhancement Service entry point. */
export const enhanceCrochetImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => enhanceSchema.parse(input))
  .handler(async ({ data }): Promise<EnhancementResult> => {
    const { guardAiUsage } = await import("./ai/guest-quota.server");
    await guardAiUsage(false);
    const { runEnhancement } = await import("./ai/enhance.server");
    return runEnhancement(data.image);
  });

/** Content Generation Service entry point. */
export const generateCrochetContent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contentSchema.parse(input))
  .handler(async ({ data }): Promise<CrochetContent> => {
    const { guardAiUsage } = await import("./ai/guest-quota.server");
    await guardAiUsage(false);
    const { runContent } = await import("./ai/content.server");
    return runContent(data.analysis, data.goal as CrochetGoal, data.notes);
  });

/** How many free runs an unauthenticated visitor has left. */
export const getGuestAllowance = createServerFn({ method: "GET" }).handler(async () => {
  const { guardAiUsage, GUEST_RUN_LIMIT } = await import("./ai/guest-quota.server");
  try {
    const result = await guardAiUsage(false);
    return { ...result, limit: GUEST_RUN_LIMIT };
  } catch {
    return { authenticated: false, runsUsed: GUEST_RUN_LIMIT, runsLeft: 0, limit: GUEST_RUN_LIMIT };
  }
});

