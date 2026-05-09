import Link from "next/link";
import type { ComponentType } from "react";
import { ClipboardCheck, GraduationCap, Sparkles, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getAdminDashboardStats, getClassesForAdmin } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const numberFormatter = new Intl.NumberFormat("id-ID");

export default async function AdminPage() {
  await requireAdminUser();
  const [stats, classes] = await Promise.all([
    getAdminDashboardStats(),
    getClassesForAdmin()
  ]);
  const recentClasses = classes.slice(0, 3);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Operasional JBA
            </p>
            <h1 className="mt-2 text-4xl font-bold text-primary [font-family:var(--font-playfair)]">
              Dashboard Admin
            </h1>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/admin/classes/new">Buat Kelas</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Kelas" value={stats.classCount} icon={GraduationCap} />
          <MetricCard
            label="Student Terdaftar"
            value={stats.studentCount}
            icon={UsersRound}
          />
          <MetricCard
            label="Pre-Tests"
            value={stats.preTestCount}
            icon={ClipboardCheck}
          />
          <MetricCard label="Post-Tests" value={stats.postTestCount} icon={Sparkles} />
        </section>

        <Card className="border-accent/30 bg-white/90">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Kelas Terbaru
            </CardTitle>
            <CardDescription>
              Kelola kode kelas, trainer, dan akses Post-Test.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClasses.length > 0 ? (
              recentClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  href={`/admin/classes/${classItem.id}`}
                  className="flex flex-col gap-3 rounded-2xl border bg-background p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-primary">
                      {classItem.client_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {classItem.class_name ?? "JBA Grooming Class"} -{" "}
                      {classItem.class_code}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{classItem.status}</Badge>
                    <Badge
                      variant={classItem.post_test_open ? "success" : "muted"}
                    >
                      {classItem.post_test_open ? "Post-Test Dibuka" : "Ditutup"}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed bg-background p-6 text-center text-muted-foreground">
                Belum ada kelas. Buat kelas JBA pertama untuk mulai onboarding
                student.
              </div>
            )}
            <Button asChild variant="secondary">
              <Link href="/admin/classes">Lihat Semua Kelas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="overflow-hidden border-accent/40 bg-white/90">
      <CardHeader className="relative pb-4">
        <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <CardDescription className="pr-12 font-semibold">{label}</CardDescription>
        <CardTitle className="text-4xl text-primary [font-family:var(--font-playfair)]">
          {numberFormatter.format(value)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
