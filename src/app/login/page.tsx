"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, User } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDemoAccounts, login } from "@/lib/auth";
import { focusElementById } from "@/lib/a11y/focus";

const DEMO_ACCOUNTS = getDemoAccounts();

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <PageShell className="space-y-8 py-8">
      <section className="space-y-2 text-center">
        <p className="text-sm font-medium text-primary">GeM Seller Co-Pilot</p>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Sahayak</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with a demo account to explore the platform
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Login</CardTitle>
          <CardDescription>Enter your demo credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="ramesh"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="demo123"
              />
            </div>
            {error && (
              <p id="login-error" className="text-sm text-destructive" role="alert" tabIndex={-1}>
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="size-4" aria-hidden="true" />
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Demo accounts</h2>
        <p className="text-sm text-muted-foreground">
          No registration needed — try a demo account
        </p>
        <div className="grid gap-3">
          {DEMO_ACCOUNTS.map((account) => (
            <Card key={account.id} size="sm">
              <CardContent className="flex items-center justify-between gap-3 pt-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{account.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.username} / demo123
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {account.profile.businessName} · {account.profile.city}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleDemoLogin(account.username)}
                >
                  Sign in
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
