import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeftRight,
  Check,
  Download,
  Loader2,
  Pencil,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { CopyButton } from "@/components/CopyButton";
import { SaveGateDialog } from "@/components/SaveGateDialog";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { GOAL_LABELS, type CrochetProjectDraft } from "@/lib/ai/types";
import { generateCrochetContent } from "@/lib/ai.functions";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-store";
import { saveCrochetProject } from "@/lib/projects.functions";
import { currencyLabel, formatPrice, type CrochetCurrency } from "@/lib/currency";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your crochet content — CrochetIQ" },
      {
        name: "description",
        content:
          "Your enhanced photo, AI analysis, captions, hashtags, pricing guidance and five fresh crochet ideas.",
      },
      { property: "og:title", content: "Your crochet content — CrochetIQ" },
      { property: "og:description", content: "Enhanced photo, captions, hashtags, pricing and ideas for your crochet project." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const regenerate = useServerFn(generateCrochetContent);
  const persist = useServerFn(saveCrochetProject);

  const [draft, setDraft] = useState<CrochetProjectDraft | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [itemName, setItemName] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<CrochetCurrency>("USD");

  useEffect(() => {
    const stored = loadDraft();
    if (!stored) {
      navigate({ to: "/upload", replace: true });
      return;
    }
    setDraft(stored);
    setItemName(stored.analysis.detectedItem);
    setDisplayCurrency(stored.content.currency ?? "USD");
  }, [navigate]);

  if (!draft) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="grid place-items-center py-32">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const { analysis, content } = draft;

  async function applyItemName() {
    if (!draft || !itemName.trim() || itemName.trim() === draft.analysis.detectedItem) {
      setEditing(false);
      return;
    }
    setRegenerating(true);
    try {
      const nextAnalysis = { ...draft.analysis, detectedItem: itemName.trim() };
      const nextContent = await regenerate({
        data: {
          analysis: nextAnalysis,
          goal: draft.goal,
          notes: draft.notes,
          currency: draft.content.currency ?? "USD",
        },
      });
      const next = { ...draft, analysis: nextAnalysis, content: nextContent };
      setDraft(next);
      saveDraft(next);
      setSaved(false);
      setEditing(false);
      toast.success("Content refreshed for your update");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not regenerate the content.");
    } finally {
      setRegenerating(false);
    }
  }

  function download() {
    if (!draft) return;
    const link = document.createElement("a");
    link.href = draft.enhancedImage;
    link.download = `crochetiq-${analysis.detectedItem.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function save() {
    if (!draft) return;
    if (!isAuthenticated) {
      setGateOpen(true);
      return;
    }
    setSaving(true);
    try {
      await persist({
        data: {
          originalImage: draft.originalImage,
          enhancedImage: draft.enhancedImage,
          goal: draft.goal,
          notes: draft.notes,
          analysis: {
            detectedItem: draft.analysis.detectedItem,
            category: draft.analysis.category,
            difficulty: draft.analysis.difficulty,
            colors: draft.analysis.colors,
            suggestedUse: draft.analysis.suggestedUse,
          },
          content: {
            friendlyCaption: draft.content.friendlyCaption,
            professionalCaption: draft.content.professionalCaption,
            playfulCaption: draft.content.playfulCaption,
            productDescription: draft.content.productDescription,
            hashtags: draft.content.hashtags,
            pricingMin: draft.content.pricingMin,
            pricingMax: draft.content.pricingMax,
            currency: draft.content.currency ?? "USD",
          },
          ideas: draft.content.ideas.map((idea) => ({
            title: idea.title,
            description: idea.description ?? "",
          })),
        },
      });
      setSaved(true);
      clearDraft();
      toast.success("Saved to your dashboard");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this project.");
    } finally {
      setSaving(false);
    }
  }

  const captions = [
    { key: "friendly", label: "Friendly", text: content.friendlyCaption },
    { key: "professional", label: "Professional", text: content.professionalCaption },
    { key: "playful", label: "Playful", text: content.playfulCaption },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{GOAL_LABELS[draft.goal]}</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">{analysis.detectedItem}</h1>
          </div>
          <Button
            onClick={() => void save()}
            disabled={saving || saved}
            className="rounded-full shadow-lift"
          >
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 size-4" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {saved ? "Saved" : "Save Project"}
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden rounded-3xl border-border/60 shadow-soft">
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="font-display text-xl">
                {showOriginal ? "Your original photo" : "Enhanced photo"}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => setShowOriginal((value) => !value)}
                >
                  <ArrowLeftRight className="mr-1.5 size-4" />
                  {showOriginal ? "Show enhanced" : "Compare original"}
                </Button>
                <Button size="sm" className="rounded-full" onClick={download}>
                  <Download className="mr-1.5 size-4" /> Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src={showOriginal ? draft.originalImage : draft.enhancedImage}
                alt={`${showOriginal ? "Original" : "Enhanced"} photo of ${analysis.detectedItem}`}
                className="w-full rounded-2xl border border-border/60 object-contain"
                loading="lazy"
              />
              {draft.enhancementNote ? (
                <p className="mt-3 text-xs text-muted-foreground">{draft.enhancementNote}</p>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wand2 className="size-3.5" /> Lighting, color and background gently improved.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-xl">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Detected Item
                </p>
                {editing ? (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={itemName}
                      onChange={(event) => setItemName(event.target.value)}
                      className="rounded-full"
                    />
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={regenerating}
                      onClick={() => void applyItemName()}
                    >
                      {regenerating ? <Loader2 className="size-4 animate-spin" /> : "Update"}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-lg">{analysis.detectedItem}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 rounded-full"
                      onClick={() => setEditing(true)}
                      aria-label="Edit detected item"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                )}
                {editing ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Updating this regenerates your captions and ideas.
                  </p>
                ) : null}
              </div>

              <Detail label="Category" value={analysis.category} />
              <Detail label="Difficulty" value={analysis.difficulty} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Primary Colors
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.colors.map((color) => (
                    <Badge key={color} variant="secondary" className="rounded-full capitalize">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
              <Detail label="Suggested Use" value={analysis.suggestedUse} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-3xl border-border/60 shadow-soft">
          <CardContent className="p-6">
            <Tabs defaultValue="captions">
              <TabsList className="rounded-full">
                <TabsTrigger value="captions" className="rounded-full">Captions</TabsTrigger>
                <TabsTrigger value="description" className="rounded-full">Product Description</TabsTrigger>
                <TabsTrigger value="hashtags" className="rounded-full">Hashtags</TabsTrigger>
              </TabsList>

              <TabsContent value="captions" className="mt-6 space-y-4">
                {captions.map((caption) => (
                  <div key={caption.key} className="rounded-2xl border border-border/60 bg-cream/40 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-lg">{caption.label}</p>
                      <CopyButton value={caption.text} />
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{caption.text}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="description" className="mt-6">
                <div className="rounded-2xl border border-border/60 bg-cream/40 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg">For your shop listing</p>
                    <CopyButton value={content.productDescription} />
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                    {content.productDescription}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="hashtags" className="mt-6">
                <div className="rounded-2xl border border-border/60 bg-cream/40 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg">Hashtags</p>
                    <CopyButton value={content.hashtags.join(" ")} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {content.hashtags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6 rounded-3xl border-border/60 bg-sage/20 shadow-soft">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="font-display text-xl">Pricing Suggestion</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Show in</span>
              <Button
                size="sm"
                variant={displayCurrency === "INR" ? "default" : "secondary"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setDisplayCurrency("INR")}
              >
                ₹ INR
              </Button>
              <Button
                size="sm"
                variant={displayCurrency === "USD" ? "default" : "secondary"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setDisplayCurrency("USD")}
              >
                $ USD
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Estimated Price Range
              </p>
              <p className="mt-1 font-display text-2xl">
                {formatPrice(content.pricingMin, displayCurrency)} – {formatPrice(content.pricingMax, displayCurrency)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Materials Considered
              </p>
              <p className="mt-1 text-sm">{content.materialsConsidered.join(", ") || "—"}</p>
            </div>
            <Detail label="Difficulty" value={analysis.difficulty} />
            <Detail label="Estimated Time Investment" value={content.estimatedTime} />
            <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
              Estimates are shown in {currencyLabel(displayCurrency)}
              {displayCurrency === content.currency
                ? " based on your location."
                : " (you switched the display currency)."}{" "}
              Your local market, materials and experience are the final word.
            </p>
          </CardContent>
        </Card>

        <section className="mt-10">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="font-display text-2xl">Inspiration for your next make</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.ideas.map((idea) => (
              <Card
                key={idea.title}
                className="rounded-3xl border-border/60 shadow-soft transition-transform hover:-translate-y-1"
              >
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <span className="grid size-10 place-items-center rounded-2xl bg-warm-gradient">
                    <Sparkles className="size-5 text-foreground/70" />
                  </span>
                  <h3 className="font-display text-lg">{idea.title}</h3>
                  <p className="flex-1 text-sm text-muted-foreground">{idea.description}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-fit rounded-full"
                    onClick={() =>
                      window.open(
                        `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(`crochet ${idea.title}`)}`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {!authLoading && !isAuthenticated ? (
          <p className="mt-10 rounded-3xl border border-dashed border-border bg-cream/40 p-5 text-center text-sm text-muted-foreground">
            You're browsing as a guest — download and copy everything you like. Create a free
            account when you want to keep your projects.
          </p>
        ) : null}
      </main>

      <SaveGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || "—"}</p>
    </div>
  );
}
