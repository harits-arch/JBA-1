import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const portalSteps = [
  "Phone OTP login",
  "Class code registration",
  "Before photo and pre-test",
  "Admin-triggered post-test"
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-primary/20 to-transparent" />
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-primary">
            JBA Student Portal
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Admin</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Student Login</Link>
            </Button>
          </div>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-white/70 px-4 py-2 text-sm font-medium text-primary shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              Professional grooming class operations
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-primary sm:text-6xl">
                A premium student portal for Jakarta Beauty Academy.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Register B2B participants, collect gender-specific pre-tests,
                manage trainers, and open post-test feedback after the class.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Start Student Flow <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/admin">Open Admin Dashboard</Link>
              </Button>
            </div>
          </div>

          <Card className="bg-white/85 backdrop-blur">
            <CardHeader>
              <CardTitle>Event Flow</CardTitle>
              <CardDescription>
                Designed for mobile use during live JBA classes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {portalSteps.map((step) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="font-medium">{step}</span>
                </div>
              ))}
              <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
                <ShieldCheck className="mb-3 h-6 w-6 text-accent" />
                <p className="text-sm leading-6">
                  Before and after photos are stored privately and exposed to
                  admins through signed URLs only.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
