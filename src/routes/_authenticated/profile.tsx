import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getProfile, updateProfile } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile & settings — CrochetIQ" },
      { name: "description", content: "Manage your CrochetIQ account details, theme preference and AI provider settings." },
      { property: "og:title", content: "Profile & settings — CrochetIQ" },
      { property: "og:description", content: "Account details, theme preference and upcoming AI provider options." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const fetchProfile = useServerFn(getProfile);
  const save = useServerFn(updateProfile);
  const { data, isPending, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });

  const [name, setName] = useState("");
  const [dark, setDark] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setName(data.name ?? "");
    setDark(data.theme === "dark");
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function persist(nextDark = dark) {
    setBusy(true);
    try {
      await save({ data: { name, theme: nextDark ? "dark" : "light" } });
      await refetch();
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl sm:text-4xl">Profile & settings</h1>

        {isPending ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <Card className="rounded-3xl border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-xl">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1.5 rounded-2xl"
                    placeholder="Maker name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1.5 rounded-2xl border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                    {data?.email ?? "—"}
                  </p>
                </div>
                {data?.created_at ? (
                  <p className="text-xs text-muted-foreground">
                    Making with CrochetIQ since{" "}
                    {new Date(data.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                ) : null}
                <Button onClick={() => void persist()} disabled={busy} className="rounded-full">
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Save changes
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-xl">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Dark theme</p>
                  <p className="text-sm text-muted-foreground">Cosy evenings by the hook.</p>
                </div>
                <Switch
                  checked={dark}
                  onCheckedChange={(value) => {
                    setDark(value);
                    void persist(value);
                  }}
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-dashed border-border bg-cream/40 shadow-none">
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="font-display text-xl">Preferred AI Provider</CardTitle>
                <Badge variant="secondary" className="rounded-full">Coming Soon</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Choose which AI powers your vision, photo and writing services.
                </p>
                <p>
                  Bring-your-own API keys, an AI playground and per-service provider choice are on
                  the way.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
