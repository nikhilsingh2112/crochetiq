import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { YarnMark } from "@/components/Logo";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  analyzeCrochetImage,
  enhanceCrochetImage,
  generateCrochetContent,
} from "@/lib/ai.functions";
import { loadPendingUpload, saveDraft } from "@/lib/draft-store";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Working on your crochet — CrochetIQ" },
      { name: "description", content: "CrochetIQ is analysing, enhancing and writing about your crochet project." },
      { property: "og:title", content: "Working on your crochet — CrochetIQ" },
      { property: "og:description", content: "Analysis, photo enhancement and content generation in progress." },
    ],
  }),
  component: ProcessingPage,
});

const stages = [
  "Understanding your crochet",
  "Enhancing your photo",
  "Creating your content",
  "Thinking of fresh ideas",
];

function ProcessingPage() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeCrochetImage);
  const enhance = useServerFn(enhanceCrochetImage);
  const generate = useServerFn(generateCrochetContent);
  const started = useRef(false);

  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const pending = loadPendingUpload();
    if (!pending) {
      navigate({ to: "/upload", replace: true });
      return;
    }

    void (async () => {
      try {
        setStage(0);
        const analysis = await analyze({ data: { image: pending.image, notes: pending.notes } });

        setStage(1);
        const enhancement = await enhance({ data: { image: pending.image } });

        setStage(2);
        const content = await generate({
          data: { analysis, goal: pending.goal, notes: pending.notes },
        });

        setStage(3);
        await new Promise((resolve) => setTimeout(resolve, 700));

        saveDraft({
          originalImage: pending.image,
          enhancedImage: enhancement.imageUrl,
          enhancementNote: enhancement.note,
          goal: pending.goal,
          notes: pending.notes,
          analysis,
          content,
          createdAt: new Date().toISOString(),
        });

        navigate({ to: "/results", replace: true });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Something went wrong.";
        setError(message);
        toast.error(message);
      }
    })();
  }, [analyze, enhance, generate, navigate]);

  const percent = error ? 100 : Math.round(((stage + 0.5) / stages.length) * 100);

  return (
    <div className="min-h-screen bg-hero-mesh">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-xl place-items-center px-4 py-20 text-center">
        <div className="relative grid size-28 place-items-center rounded-full bg-card/70 shadow-lift">
          <span className="absolute inset-0 animate-ping rounded-full bg-lavender/40" aria-hidden="true" />
          <YarnMark className="relative size-14 animate-spin text-primary [animation-duration:6s]" />
        </div>

        {error ? (
          <>
            <h1 className="mt-8 font-display text-3xl">That didn't go to plan</h1>
            <p className="mt-3 text-muted-foreground">{error}</p>
            <Button className="mt-6 rounded-full" onClick={() => navigate({ to: "/upload" })}>
              Try again
            </Button>
          </>
        ) : (
          <>
            <h1 className="mt-8 font-display text-3xl">{stages[stage]}…</h1>
            <p className="mt-3 text-muted-foreground">
              Hook down for a moment — this usually takes under two minutes.
            </p>
            <Progress value={percent} className="mt-8 h-2.5 w-full" />
            <ul className="mt-8 w-full space-y-3 text-left">
              {stages.map((label, index) => (
                <li
                  key={label}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                    index < stage
                      ? "border-sage/60 bg-sage/25"
                      : index === stage
                        ? "border-primary/60 bg-card shadow-soft"
                        : "border-border/50 bg-card/50 opacity-60"
                  }`}
                >
                  {index < stage ? (
                    <Check className="size-4 text-foreground/70" />
                  ) : index === stage ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <span className="size-4 rounded-full border border-border" />
                  )}
                  <span className="text-sm">{label}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
