import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImagePlus, Loader2, ShoppingBag, Sparkles, Lightbulb, X } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePendingUpload } from "@/lib/draft-store";
import type { CrochetGoal } from "@/lib/ai/types";

export const Route = createFileRoute("/upload")({
  validateSearch: (search: Record<string, unknown>) => ({
    guest: search["guest"] === true || search["guest"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Upload your crochet — CrochetIQ" },
      {
        name: "description",
        content:
          "Drag in a photo of your finished crochet piece, tell us your goal, and CrochetIQ prepares it for sharing.",
      },
      { property: "og:title", content: "Upload your crochet — CrochetIQ" },
      {
        property: "og:description",
        content: "Upload a JPG or PNG of your crochet project and get share-ready content.",
      },
    ],
  }),
  component: UploadPage,
});

const goals: Array<{ id: CrochetGoal; label: string; copy: string; icon: typeof Sparkles }> = [
  { id: "social", label: "Prepare for Social Media", copy: "Captions and hashtags that sound like you", icon: Sparkles },
  { id: "sell", label: "Sell My Product", copy: "Shop copy and a fair price range", icon: ShoppingBag },
  { id: "ideas", label: "Get New Ideas", copy: "Fresh projects to try next", icon: Lightbulb },
];

const MAX_EDGE = 1400;

async function fileToDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("bad image"));
      image.src = raw;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    if (scale === 1 && raw.length < 1_500_000) return raw;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return raw;
  }
}

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [goal, setGoal] = useState<CrochetGoal>("social");
  const [notes, setNotes] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);

  async function accept(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("Please choose a JPG or PNG photo.");
      return;
    }
    setReading(true);
    try {
      setImage(await fileToDataUrl(file));
    } catch {
      toast.error("We couldn't read that photo. Try another one?");
    } finally {
      setReading(false);
    }
  }

  function start() {
    if (!image) {
      toast.error("Add a photo of your crochet first.");
      return;
    }
    savePendingUpload({ image, goal, notes });
    navigate({ to: "/processing" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl sm:text-4xl">Show us your crochet</h1>
        <p className="mt-3 text-muted-foreground">
          One clear photo is all we need. JPG or PNG, natural light if you have it.
        </p>

        <Card className="mt-8 rounded-3xl border-border/60 shadow-soft">
          <CardContent className="p-6">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void accept(event.dataTransfer.files?.[0]);
              }}
              className={`relative grid min-h-64 place-items-center rounded-3xl border-2 border-dashed p-6 text-center transition-colors ${
                dragging ? "border-primary bg-lavender/25" : "border-border bg-cream/40"
              }`}
            >
              {image ? (
                <div className="w-full">
                  <img
                    src={image}
                    alt="Your uploaded crochet project"
                    className="mx-auto max-h-80 rounded-2xl object-contain shadow-soft"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 rounded-full"
                    onClick={() => setImage(null)}
                  >
                    <X className="mr-1.5 size-4" /> Choose a different photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-warm-gradient">
                    {reading ? (
                      <Loader2 className="size-6 animate-spin text-foreground/70" />
                    ) : (
                      <ImagePlus className="size-6 text-foreground/70" />
                    )}
                  </span>
                  <p className="font-display text-lg">Drag your photo here</p>
                  <p className="text-sm text-muted-foreground">JPG or PNG, up to about 10MB</p>
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => inputRef.current?.click()}
                  >
                    Browse photos
                  </Button>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(event) => void accept(event.target.files?.[0])}
              />
            </div>

            <div className="mt-8">
              <Label className="font-display text-lg">What would you like help with?</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {goals.map((option) => {
                  const active = goal === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setGoal(option.id)}
                      className={`rounded-3xl border p-4 text-left transition-all ${
                        active
                          ? "border-primary bg-lavender/30 shadow-soft"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <option.icon className="size-5 text-foreground/70" />
                      <p className="mt-3 text-sm font-semibold">{option.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{option.copy}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <Label htmlFor="notes" className="font-display text-lg">
                Anything we should know? <span className="text-sm text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                maxLength={1000}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Merino wool, took me three evenings, made for my niece..."
                className="mt-3 min-h-28 rounded-2xl"
              />
            </div>

            <Button
              size="lg"
              onClick={start}
              disabled={!image || reading}
              className="mt-8 w-full rounded-full shadow-lift"
            >
              Prepare for Sharing
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
