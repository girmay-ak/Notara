"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { nl } from "@/lib/i18n/nl";

export default function LoginPage() {
  const t = nl.auth;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const unconfirmed =
        error.code === "email_not_confirmed" ||
        /not confirmed/i.test(error.message);
      setError(unconfirmed ? t.errorUnconfirmed : t.errorCredentials);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t.loginTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">{t.loginSubtitle}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.loading : t.submitLogin}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <Link href="/reset" className="text-muted-foreground hover:text-foreground">
            {t.forgot}
          </Link>
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {t.toSignup}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
