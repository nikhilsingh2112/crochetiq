import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Heart, ImageIcon, Loader2, Plus, Quote, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { getDashboard } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — CrochetIQ" },
      { name: "description", content: "Your saved crochet projects, inspirations and making stats in one place." },
      { property: "og:title", content: "Your dashboard — CrochetIQ" },
      { property: "og:description", content: "Recent crochet projects, saved ideas and quick stats." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isPending } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">Your yarn basket</h1>
            <p className="mt-2 text-muted-foreground">Everything you've made and saved with CrochetIQ.</p>
          </div>
          <Button asChild className="rounded-full shadow-lift">
            <Link to="/upload">
              <Plus className="mr-2 size-4" /> New project
            </Link>
          </Button>
        </div>

        {isPending ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label="Projects Created" value={data?.stats.projectsCreated ?? 0} icon={ImageIcon} tint="bg-lavender/40" />
              <Stat label="Captions Generated" value={data?.stats.captionsGenerated ?? 0} icon={Quote} tint="bg-sage/40" />
              <Stat label="Ideas Saved" value={data?.stats.ideasSaved ?? 0} icon={Heart} tint="bg-dusty/40" />
            </div>

            <section className="mt-12">
              <h2 className="font-display text-2xl">Recent projects</h2>
              {data?.projects.length ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden rounded-3xl border-border/60 shadow-soft">
                      <div className="aspect-[4/3] w-full bg-cream/60">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.detectedItem}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid size-full place-items-center text-muted-foreground">
                            <ImageIcon className="size-8" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-display text-lg">{project.detectedItem}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-2 font-display text-lg">
                          {formatPrice(project.pricingMin, project.currency)} – {formatPrice(project.pricingMax, project.currency)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="rounded-full">{project.category}</Badge>
                          {project.difficulty ? (
                            <Badge variant="outline" className="rounded-full">{project.difficulty}</Badge>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="mt-5 rounded-3xl border-dashed border-border bg-cream/40 shadow-none">
                  <CardContent className="grid place-items-center gap-3 py-14 text-center">
                    <Sparkles className="size-6 text-primary" />
                    <p className="font-display text-lg">No projects yet</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Upload a photo of something you've made and CrochetIQ will do the rest.
                    </p>
                    <Button asChild className="mt-2 rounded-full">
                      <Link to="/upload">Upload your crochet</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            <section className="mt-12">
              <h2 className="font-display text-2xl">Saved inspirations</h2>
              {data?.savedIdeas.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.savedIdeas.map((idea) => (
                    <Card key={idea.id} className="rounded-3xl border-border/60 shadow-soft">
                      <CardContent className="p-5">
                        <Heart className="size-5 text-primary" />
                        <h3 className="mt-3 font-display text-lg">{idea.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{idea.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Ideas from your saved projects will collect here.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string;
  value: number;
  icon: typeof Heart;
  tint: string;
}) {
  return (
    <Card className="rounded-3xl border-border/60 shadow-soft">
      <CardContent className="flex items-center gap-4 p-6">
        <span className={`grid size-12 place-items-center rounded-2xl ${tint}`}>
          <Icon className="size-5 text-foreground/70" />
        </span>
        <div>
          <p className="font-display text-3xl leading-none">{value}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
