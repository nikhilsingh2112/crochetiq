import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowLeftRight, Download, Loader2, Sparkles } from "lucide-react";

import { CopyButton } from "@/components/CopyButton";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GOAL_LABELS } from "@/lib/ai/types";
import { getProject } from "@/lib/projects.functions";
import { currencyLabel, formatPrice, type CrochetCurrency } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Saved crochet project — CrochetIQ" },
      {
        name: "description",
        content: "Revisit an saved crochet project: enhanced photo, captions, hashtags, pricing and ideas.",
      },
      { property: "og:title", content: "Saved crochet project — CrochetIQ" },
      {
        property: "og:description",
        content: "Your saved enhanced photo, captions, hashtags, pricing guidance and crochet ideas.",
      },
    ],
  }),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const fetchProject = useServerFn(getProject);
  const [showOriginal, setShowOriginal] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<CrochetCurrency | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject({ data: { id: projectId } }),
  });

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="grid place-items-center py-32">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl">We couldn't find that project</h1>
          <p className="mt-3 text-muted-foreground">
            It may have been removed, or it belongs to another account.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </main>
      </div>
    );
  }

  const { analysis, content } = data;
  const currency = displayCurrency ?? content.currency;
  const image = showOriginal ? data.originalImage : data.enhancedImage;

  const captions = [
    { key: "friendly", label: "Friendly", text: content.friendlyCaption },
    { key: "professional", label: "Professional", text: content.professionalCaption },
    { key: "playful", label: "Playful", text: content.playfulCaption },
  ];

  function download() {
    if (!data?.enhancedImage) return;
    const link = document.createElement("a");
    link.href = data.enhancedImage;
    link.download = `crochetiq-${analysis.detectedItem.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/dashboard">
            <ArrowLeft className="mr-1.5 size-4" /> Back to dashboard
          </Link>
        </Button>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {GOAL_LABELS[data.goal]} ·{" "}
              {new Date(data.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">{analysis.detectedItem}</h1>
          </div>
          {data.enhancedImage ? (
            <Button onClick={download} className="rounded-full shadow-lift">
              <Download className="mr-2 size-4" /> Download photo
            </Button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden rounded-3xl border-border/60 shadow-soft">
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="font-display text-xl">
                {showOriginal ? "Your original photo" : "Enhanced photo"}
              </CardTitle>
              {data.originalImage && data.enhancedImage ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => setShowOriginal((value) => !value)}
                >
                  <ArrowLeftRight className="mr-1.5 size-4" />
                  {showOriginal ? "Show enhanced" : "Compare original"}
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {image ? (
                <img
                  src={image}
                  alt={`${showOriginal ? "Original" : "Enhanced"} photo of ${analysis.detectedItem}`}
                  className="w-full rounded-2xl border border-border/60 object-contain"
                  loading="lazy"
                />
              ) : (
                <p className="text-sm text-muted-foreground">This photo is no longer available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-xl">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Detail label="Detected Item" value={analysis.detectedItem} />
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
              {data.notes ? <Detail label="Your notes" value={data.notes} /> : null}
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
                variant={currency === "INR" ? "default" : "secondary"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setDisplayCurrency("INR")}
              >
                ₹ INR
              </Button>
              <Button
                size="sm"
                variant={currency === "USD" ? "default" : "secondary"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setDisplayCurrency("USD")}
              >
                $ USD
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Estimated Price Range
              </p>
              <p className="mt-1 font-display text-2xl">
                {formatPrice(content.pricingMin, currency)} – {formatPrice(content.pricingMax, currency)}
              </p>
            </div>
            <Detail label="Difficulty" value={analysis.difficulty} />
            <Detail label="Category" value={analysis.category} />
            <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-3">
              Saved in {currencyLabel(content.currency)}. Estimates only — your local market,
              materials and experience are the final word.
            </p>
          </CardContent>
        </Card>

        {data.ideas.length ? (
          <section className="mt-10">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="font-display text-2xl">Inspiration from this project</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.ideas.map((idea) => (
                <Card
                  key={idea.id}
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
        ) : null}
      </main>
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
