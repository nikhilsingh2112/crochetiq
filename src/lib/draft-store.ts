import type { CrochetProjectDraft } from "./ai/types";

const KEY = "crochetiq:draft";

export function saveDraft(draft: CrochetProjectDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* storage full — the in-memory result still renders */
  }
}

export function loadDraft(): CrochetProjectDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CrochetProjectDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

const PENDING_KEY = "crochetiq:pending-upload";

export interface PendingUpload {
  image: string;
  goal: "social" | "sell" | "ideas";
  notes: string;
  currency: "INR" | "USD";
}

export function savePendingUpload(pending: PendingUpload) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function loadPendingUpload(): PendingUpload | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingUpload) : null;
  } catch {
    return null;
  }
}
