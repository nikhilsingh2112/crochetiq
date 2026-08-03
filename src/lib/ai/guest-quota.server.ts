// Guest abuse control for the AI services.
//
// Signed-in makers are unlimited. Anonymous visitors get a small number of
// free runs, tracked server-side against a hashed request fingerprint so the
// paid AI gateway cannot be used as a free anonymous proxy.
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export const GUEST_RUN_LIMIT = 2;

export const GUEST_LIMIT_MESSAGE =
  "You've used your free guest runs. Create a free CrochetIQ account to keep making content — it takes a few seconds.";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns the signed-in user id, or null for guests. */
async function currentUserId(): Promise<string | null> {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (token.split(".").length !== 3) return null;

  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data, error } = await client.auth.getClaims(token);
    if (error) return null;
    return (data?.claims?.sub as string | undefined) ?? null;
  } catch {
    return null;
  }
}

async function fingerprint(): Promise<string> {
  const request = getRequest();
  const headers = request?.headers;
  const ip =
    headers?.get("cf-connecting-ip") ??
    headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers?.get("x-real-ip") ??
    "unknown";
  const ua = headers?.get("user-agent") ?? "unknown";
  return sha256(`${ip}|${ua}`);
}

export interface GuestGuardResult {
  authenticated: boolean;
  runsUsed: number;
  runsLeft: number;
}

/**
 * Enforces the guest quota. Pass `consume: true` on the first step of a run
 * (analysis) so a full generation counts once, not three times.
 */
export async function guardAiUsage(consume: boolean): Promise<GuestGuardResult> {
  const userId = await currentUserId();
  if (userId) {
    return { authenticated: true, runsUsed: 0, runsLeft: Number.POSITIVE_INFINITY };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // The generated Database types don't include these helper RPCs yet.
  const admin = supabaseAdmin as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  };
  const key = await fingerprint();

  if (consume) {
    const { data, error } = await admin.rpc("consume_guest_ai_run", {
      _fingerprint: key,
      _limit: GUEST_RUN_LIMIT,
    });
    if (error) {
      console.error("[guest-quota]", error);
      throw new Error("We couldn't start your project just now. Please try again.");
    }
    const runs = Number(data);
    if (runs < 0) throw new Error(GUEST_LIMIT_MESSAGE);
    return { authenticated: false, runsUsed: runs, runsLeft: Math.max(0, GUEST_RUN_LIMIT - runs) };
  }

  const { data, error } = await admin.rpc("guest_ai_runs_used", { _fingerprint: key });
  if (error) {
    console.error("[guest-quota]", error);
    throw new Error("We couldn't continue your project just now. Please try again.");
  }
  const runs = Number(data ?? 0);
  if (runs > GUEST_RUN_LIMIT) throw new Error(GUEST_LIMIT_MESSAGE);
  return { authenticated: false, runsUsed: runs, runsLeft: Math.max(0, GUEST_RUN_LIMIT - runs) };
}
