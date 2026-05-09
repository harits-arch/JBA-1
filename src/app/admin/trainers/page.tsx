import Link from "next/link";
import { UserCheck } from "lucide-react";

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
import { getClassesForAdmin } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminTrainersPage() {
  await requireAdminUser();
  const classes = await getClassesForAdmin();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#D4AF37" }}
          >
            Manajemen Operasional
          </p>
          <h1 className="mt-2 text-4xl font-bold text-primary [font-family:var(--font-playfair)]">
            Penugasan Trainer
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Setiap kelas memiliki daftar trainer sendiri untuk rating Post-Test.
            Kelola penugasan di halaman detail kelas.
          </p>
        </header>

        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [font-family:var(--font-playfair)]">
              <UserCheck className="h-6 w-6 text-accent" />
              Ringkasan per kelas
            </CardTitle>
            <CardDescription>
              Jumlah trainer saat ini dan tautan langsung ke blok pengelolaan
              trainer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background p-8 text-center text-muted-foreground">
                Belum ada kelas. Buat kelas baru terlebih dahulu.
              </div>
            ) : (
              classes.map((c) => {
                const trainerCount = c.trainers?.length ?? 0;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-4 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h2 className="font-semibold text-primary">
                        {c.client_name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {c.class_name ?? "JBA Grooming Class"} —{" "}
                        <span className="font-mono">{c.class_code}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{c.status}</Badge>
                        <Badge variant={trainerCount > 0 ? "secondary" : "muted"}>
                          {trainerCount} trainer
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="secondary">
                        <Link href={`/admin/classes/${c.id}/edit`}>Edit kelas</Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/admin/classes/${c.id}#trainers-section`}>
                          Kelola trainer
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
