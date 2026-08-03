// Provider layer for the CrochetIQ AI services.
//
// All AI traffic goes through a single adapter interface so future providers
// (or user-supplied API keys) can be registered without touching the vision,
// enhancement, or content services.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export const AI_MODELS = {
  text: "openai/gpt-5.6-sol",
  image: "google/gemini-3-pro-image",
} as const;

function apiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");
  return key;
}

function gatewayError(status: number, body: string): Error {
  if (status === 429) return new Error("Our AI is a bit busy right now — please try again in a moment.");
  if (status === 402) return new Error("AI credits are exhausted. Please top up to keep creating.");
  return new Error(`AI request failed (${status}): ${body.slice(0, 300)}`);
}

/** Chat/JSON completion through the Lovable AI Gateway. */
export async function chatJson<T>(system: string, user: unknown): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: AI_MODELS.text,
      reasoning_effort: "none",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: Array.isArray(user) ? user : [{ type: "text", text: String(user) }],
        },
      ],
    }),
  });

  if (!res.ok) throw gatewayError(res.status, await res.text());

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content ?? "";
  return parseJson<T>(text);
}

/** Image generation / editing through the Lovable AI Gateway. */
export async function generateImage(prompt: string, sourceImage: string): Promise<string | null> {
  const res = await fetch(`${GATEWAY_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: AI_MODELS.image,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: sourceImage } },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) throw gatewayError(res.status, await res.text());

  const payload = await res.json();
  return findImageUrl(payload);
}

function parseJson<T>(text: string): T {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as T;
    }
    throw new Error("The AI returned an unexpected response. Please try again.");
  }
}

/** Providers differ in where they put the generated image; walk the payload. */
function findImageUrl(value: unknown, depth = 0): string | null {
  if (depth > 8 || value == null) return null;
  if (typeof value === "string") {
    if (value.startsWith("data:image/")) return value;
    if (/^https?:\/\/\S+$/.test(value) && /\.(png|jpe?g|webp)/i.test(value)) return value;
    if (value.length > 512 && /^[A-Za-z0-9+/=\s]+$/.test(value)) {
      return `data:image/png;base64,${value.replace(/\s/g, "")}`;
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageUrl(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      const found = findImageUrl(item, depth + 1);
      if (found) return found;
    }
  }
  return null;
}
