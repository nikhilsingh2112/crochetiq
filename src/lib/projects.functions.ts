import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "crochet-photos";

const saveSchema = z.object({
  originalImage: z.string().min(16),
  enhancedImage: z.string().min(16),
  goal: z.enum(["social", "sell", "ideas"]),
  notes: z.string().max(1000).default(""),
  analysis: z.object({
    detectedItem: z.string(),
    category: z.string(),
    difficulty: z.string(),
    colors: z.array(z.string()),
    suggestedUse: z.string(),
  }),
  content: z.object({
    friendlyCaption: z.string(),
    professionalCaption: z.string(),
    playfulCaption: z.string(),
    productDescription: z.string(),
    hashtags: z.array(z.string()),
    pricingMin: z.number(),
    pricingMax: z.number(),
    currency: z.enum(["INR", "USD"]).default("USD"),
  }),
  ideas: z.array(z.object({ title: z.string(), description: z.string().default("") })),
});

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  const binary = atob(match[2]!);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { bytes, contentType: match[1]! };
}

export const saveCrochetProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const upload = async (image: string, label: string): Promise<string | null> => {
      const parsed = dataUrlToBytes(image);
      if (!parsed) return image.startsWith("http") ? image : null;
      const ext = parsed.contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
      const path = `${userId}/${crypto.randomUUID()}-${label}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, parsed.bytes, { contentType: parsed.contentType, upsert: false });
      if (error) throw new Error(`Could not save your photo: ${error.message}`);
      return path;
    };

    const [originalPath, enhancedPath] = await Promise.all([
      upload(data.originalImage, "original"),
      upload(data.enhancedImage, "enhanced"),
    ]);

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        original_image_url: originalPath,
        enhanced_image_url: enhancedPath,
        goal: data.goal,
        notes: data.notes,
      })
      .select("id")
      .single();

    if (error || !project) throw new Error(error?.message ?? "Could not save this project.");

    await Promise.all([
      supabase.from("ai_analysis").insert({
        project_id: project.id,
        detected_item: data.analysis.detectedItem,
        category: data.analysis.category,
        colors: data.analysis.colors,
        difficulty: data.analysis.difficulty,
        suggested_use: data.analysis.suggestedUse,
      }),
      supabase.from("ai_content").insert({
        project_id: project.id,
        friendly_caption: data.content.friendlyCaption,
        professional_caption: data.content.professionalCaption,
        playful_caption: data.content.playfulCaption,
        product_description: data.content.productDescription,
        hashtags: data.content.hashtags,
        pricing_min: data.content.pricingMin,
        pricing_max: data.content.pricingMax,
        currency: data.content.currency,
      }),
      data.ideas.length
        ? supabase.from("ideas").insert(
            data.ideas.map((idea) => ({
              project_id: project.id,
              title: idea.title,
              description: idea.description,
              saved: true,
            })),
          )

        : Promise.resolve(),
    ]);

    return { id: project.id as string };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: projects } = await supabase
      .from("projects")
      .select(
        "id, goal, notes, created_at, enhanced_image_url, ai_analysis(detected_item, category, difficulty), ai_content(pricing_min, pricing_max, currency)",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);

    const rows = projects ?? [];

    const withImages = await Promise.all(
      rows.map(async (row) => {
        let image: string | null = null;
        const stored = row.enhanced_image_url;
        if (stored) {
          if (stored.startsWith("http")) image = stored;
          else {
            const { data: signed } = await supabase.storage
              .from(BUCKET)
              .createSignedUrl(stored, 60 * 60);
            image = signed?.signedUrl ?? null;
          }
        }
        const analysis = Array.isArray(row.ai_analysis) ? row.ai_analysis[0] : row.ai_analysis;
        const content = Array.isArray(row.ai_content) ? row.ai_content[0] : row.ai_content;
        return {
          id: row.id as string,
          goal: row.goal as string,
          createdAt: row.created_at as string,
          image,
          detectedItem: analysis?.detected_item ?? "Crochet project",
          category: analysis?.category ?? "Handmade",
          difficulty: analysis?.difficulty ?? "",
          pricingMin: content?.pricing_min ?? 0,
          pricingMax: content?.pricing_max ?? 0,
          currency: (content?.currency as "INR" | "USD") ?? "USD",
        };
      }),
    );

    const projectIds = rows.map((r) => r.id);

    const [{ count: captionCount }, ideasResult] = await Promise.all([
      supabase
        .from("ai_content")
        .select("id", { count: "exact", head: true })
        .in("project_id", projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"]),
      supabase
        .from("ideas")
        .select("id, title, description, saved, project_id")
        .in("project_id", projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"])
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const ideas = ideasResult.data ?? [];

    return {
      projects: withImages,
      savedIdeas: ideas
        .filter((idea) => idea.saved)
        .map((idea) => ({ id: idea.id as string, title: idea.title as string, description: (idea.description as string) ?? "" })),
      stats: {
        projectsCreated: withImages.length,
        captionsGenerated: (captionCount ?? 0) * 3,
        ideasSaved: ideas.filter((idea) => idea.saved).length,
      },
    };
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("id, name, email, avatar, theme, created_at")
      .eq("id", context.userId)
      .maybeSingle();
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ name: z.string().max(80).optional(), theme: z.enum(["light", "dark"]).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ ...(data.name !== undefined ? { name: data.name } : {}), ...(data.theme ? { theme: data.theme } : {}) })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
