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
  "Masuk dengan OTP WhatsApp",
  "Registrasi kode kelas",
  "Foto before dan Pre-Test",
  "Post-Test dibuka admin"
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
              <Link href="/admin/login">Admin</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Masuk Student</Link>
            </Button>
          </div>
        </nav>

        <div className="mx-auto grid max-w-6xl items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-white/70 px-4 py-2 text-sm font-medium text-primary shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              Operasional kelas grooming profesional
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-primary sm:text-6xl">
                Portal student premium untuk Jakarta Beauty Academy.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Kelola peserta B2B, Pre-Test sesuai gender, trainer, dan
                feedback Post-Test setelah kelas selesai.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Mulai sebagai Student <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="bg-white/85 backdrop-blur">
            <CardHeader>
              <CardTitle>Alur Kelas</CardTitle>
              <CardDescription>
                Dirancang mobile-first untuk kelas JBA secara langsung.
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
                  Foto before dan after tersimpan privat dan hanya dibuka untuk
                  admin melalui signed URL.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
