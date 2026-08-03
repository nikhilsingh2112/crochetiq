import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search["mode"] === "signup" ? ("signup" as const) : ("signin" as const),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — CrochetIQ" },
      { name: "description", content: "Sign in or create a free CrochetIQ account to save your crochet projects." },
      { property: "og:title", content: "Sign in — CrochetIQ" },
      { property: "og:description", content: "Create a free account to save crochet projects and ideas." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { name } },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That didn't work — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in didn't work. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero-mesh px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card className="mt-8 rounded-3xl border-border/60 shadow-lift">
          <CardContent className="p-7">
            {checkEmail ? (
              <div className="space-y-4 text-center">
                <h1 className="font-display text-2xl">Check your inbox</h1>
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation link to {email}. Click it and you'll be all set.
                </p>
                <Button asChild variant="secondary" className="rounded-full">
                  <Link to="/">Back home</Link>
                </Button>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl">
                  {isSignUp ? "Create your free account" : "Welcome back"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isSignUp
                    ? "Save your crochet projects, captions and ideas in one cosy place."
                    : "Sign in to pick up where your hook left off."}
                </p>

                <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
                  {isSignUp ? (
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Maker name"
                        className="mt-1.5 rounded-2xl"
                      />
                    </div>
                  ) : null}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-1.5 rounded-2xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-1.5 rounded-2xl"
                    />
                  </div>
                  <Button type="submit" disabled={busy} className="w-full rounded-full">
                    {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    {isSignUp ? "Create account" : "Sign in"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  variant="secondary"
                  className="w-full rounded-full"
                  onClick={() => void google()}
                >
                  Continue with Google
                </Button>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "New to CrochetIQ?"}{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                    onClick={() => setIsSignUp((value) => !value)}
                  >
                    {isSignUp ? "Sign in" : "Create one free"}
                  </button>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/upload" className="underline-offset-4 hover:underline">
            Or keep trying it without an account
          </Link>
        </p>
      </div>
    </div>
  );
}
