import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Heart, Lightbulb, ScanSearch, Sparkles, Wand2 } from "lucide-react";

import heroImage from "@/assets/hero-crochet.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { YarnMark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CrochetIQ — Your AI assistant for crochet creators" },
      {
        name: "description",
        content:
          "Upload a finished crochet project and get an enhanced photo, ready-to-post captions, hashtags, pricing guidance and five fresh ideas.",
      },
      { property: "og:title", content: "CrochetIQ — Your AI assistant for crochet creators" },
      {
        property: "og:description",
        content:
          "Upload a finished crochet project and get an enhanced photo, ready-to-post captions, hashtags, pricing guidance and five fresh ideas.",
      },
    ],
  }),
  component: LandingPage,
});

const steps = [
  { icon: Camera, label: "Upload", copy: "Share a photo of your finished piece" },
  { icon: ScanSearch, label: "AI Analysis", copy: "We read the stitches, colors and craft" },
  { icon: Wand2, label: "Enhanced Photo", copy: "Softer light, truer colors, calmer background" },
  { icon: Sparkles, label: "Content", copy: "Captions, hashtags and pricing" },
  { icon: Lightbulb, label: "Inspiration", copy: "Five ideas for your next make" },
];

const features = [
  {
    icon: Heart,
    title: "It understands crochet",
    copy: "Not just \"a blanket\". CrochetIQ reads the stitch style, yarn feel, colorway and difficulty the way another maker would.",
    tint: "bg-dusty-pink/50",
  },
  {
    icon: Sparkles,
    title: "It writes social-ready content",
    copy: "Three caption voices, a shop-ready product description, hashtags that fit, and a fair price range for your time and materials.",
    tint: "bg-lavender/50",
  },
  {
    icon: Lightbulb,
    title: "It inspires your next make",
    copy: "Every project ends with five related ideas, so your hook never has to wonder what comes next.",
    tint: "bg-sage/50",
  },
];

function LandingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="bg-hero-mesh">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-sm text-muted-foreground shadow-soft">
                <YarnMark className="size-4 text-primary" />
                Made for crochet makers
              </span>
              <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Your AI assistant for crochet creators.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                You finished the piece — the hard part is done. CrochetIQ helps you get it ready to
                share online: a brighter photo, captions in your voice, hashtags, a fair price, and
                ideas for what to make next.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full px-7 shadow-lift">
                  <Link to="/upload">Upload Your Crochet</Link>
                </Button>
                {authLoading ? null : isAuthenticated ? (
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-7">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-7">
                    <Link to="/upload" search={{ guest: true }}>
                      Try without Signing In
                    </Link>
                  </Button>
                )}
              </div>
              {authLoading ? null : (
                <p className="mt-4 text-sm text-muted-foreground">
                  {isAuthenticated
                    ? "You're signed in — every project you save lands in your dashboard."
                    : "No account needed to try it. Sign up only when you want to keep your projects."}
                </p>
              )}
            </div>


            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-card/50 blur-2xl" aria-hidden="true" />
              <img
                src={heroImage}
                alt="Illustration of a lavender yarn ball, crochet hook, sage blanket and pink amigurumi bunny"
                className="relative w-full rounded-[2rem] border border-border/60 shadow-lift"
                loading="eager"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-3xl">How it works</h2>
          <p className="mt-3 text-center text-muted-foreground">
            Five gentle steps, about two minutes of waiting.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step.label}>
                <Card className="h-full rounded-3xl border-border/60 bg-card/80 shadow-soft transition-transform hover:-translate-y-1">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <span className="grid size-11 place-items-center rounded-2xl bg-warm-gradient">
                      <step.icon className="size-5 text-foreground/70" />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <p className="font-display text-lg">{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.copy}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-cream/60 py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="text-center font-display text-3xl">Built by makers, for makers</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="rounded-3xl border-border/60 shadow-soft">
                  <CardContent className="space-y-4 p-7">
                    <span className={`grid size-12 place-items-center rounded-2xl ${feature.tint}`}>
                      <feature.icon className="size-6 text-foreground/70" />
                    </span>
                    <h3 className="font-display text-xl">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.copy}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 py-20 text-center">
          <h2 className="font-display text-3xl">Ready when your hook is</h2>
          <p className="mt-3 text-muted-foreground">
            Bring one photo. We'll handle the caption panic.
          </p>
          <Button asChild size="lg" className="mt-7 rounded-full px-8 shadow-lift">
            <Link to="/upload">Upload Your Crochet</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        CrochetIQ — made with yarn, tea and a little AI.
      </footer>
    </div>
  );
}
