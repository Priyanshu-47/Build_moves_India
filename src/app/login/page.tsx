"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDemoAccounts, login } from "@/lib/auth";
import { focusElementById } from "@/lib/a11y/focus";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS = getDemoAccounts();

const AVATAR_GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function LoginProductPreview() {
  return (
    <div className="relative hidden h-full lg:block" aria-hidden="true">
      <div className="absolute inset-0 landing-grid-bg opacity-40" />
      <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
        <div>
          <Link href="/welcome" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 text-sm backdrop-blur">
              S
            </span>
            Sahayak
          </Link>
        </div>

        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-blue-100 backdrop-blur">
            <Sparkles className="size-4" aria-hidden="true" />
            GeM Seller Co-Pilot
          </div>
          <h1 className="max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
            Your co-pilot for government procurement
          </h1>
          <p className="max-w-md text-lg text-blue-100/80 leading-relaxed">
            Match tenders, prepare bids, track payments — all in one command center built
            for India&apos;s MSE sellers.
          </p>

          {/* Floating UI cards */}
          <div className="relative mt-8 h-48">
            <div className="absolute left-0 top-0 w-56 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs text-blue-200">Match score</p>
              <p className="text-3xl font-bold text-white">84/100</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[84%] rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-52 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs text-blue-200">Pending payments</p>
              <p className="text-xl font-bold text-white">₹14.9L</p>
              <p className="mt-1 text-xs text-amber-300">1 overdue</p>
            </div>
            <div className="absolute left-1/3 top-1/2 w-44 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl">
              <p className="text-xs text-blue-200">Tenders closing</p>
              <p className="text-lg font-bold text-white">3 urgent</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-white">
          <div>
            <p className="text-2xl font-bold">₹18.4L Cr</p>
            <p className="text-xs text-blue-200/70">GeM GMV</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              <AnimatedCounter value={65} suffix="L" />
            </p>
            <p className="text-xs text-blue-200/70">Sellers</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              <AnimatedCounter value={68} suffix="%" />
            </p>
            <p className="text-xs text-blue-200/70">MSE orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      queueMicrotask(() => focusElementById("login-error"));
    }
  }, [error]);

  function handleLogin(user: string, pass: string) {
    setError(null);
    setLoading(true);
    const result = login(user, pass);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.replace("/");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    handleLogin(username, password);
  }

  function handleDemoLogin(demoUsername: string) {
    setUsername(demoUsername);
    setPassword("demo123");
    handleLogin(demoUsername, "demo123");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — full bleed visual panel */}
      <div className="gradient-hero relative hidden w-[55%] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(96,165,250,0.2)_0%,_transparent_60%)]" />
        <LoginProductPreview />
      </div>

      {/* Right — form */}
      <div className="flex w-full flex-col justify-center bg-background px-6 py-12 lg:w-[45%] lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2 lg:hidden">
            <Link href="/welcome" className="text-xl font-bold text-primary">
              Sahayak
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your seller dashboard</p>
          </div>
          <div className="hidden space-y-2 lg:block">
            <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
            <p className="text-muted-foreground">
              Enter credentials or pick a demo account below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="ramesh"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline" tabIndex={-1}>
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="demo123"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
                Remember me
              </Label>
            </div>
            {error && (
              <p id="login-error" className="text-sm text-destructive" role="alert" tabIndex={-1}>
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="gradient-cta h-12 w-full rounded-xl border-0 text-base text-white"
              disabled={loading}
            >
              <LogIn className="size-4" aria-hidden="true" />
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Demo accounts</span>
            </div>
          </div>

          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((account, index) => (
              <button
                key={account.id}
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin(account.username)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                )}
              >
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                    AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
                  )}
                  aria-hidden="true"
                >
                  {getInitials(account.profile.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{account.label}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {account.profile.businessName} · {account.profile.city}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/welcome" className="font-semibold text-primary hover:underline">
              See the landing page
            </Link>
            {" · "}
            <Link href="/onboarding" className="font-semibold text-primary hover:underline">
              How it works
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
