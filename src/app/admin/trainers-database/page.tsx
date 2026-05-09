import Link from "next/link";
import { UserSquare2 } from "lucide-react";

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
import { getAllTrainersDirectory } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminTrainersDatabasePage() {
  await requireAdminUser();
  const trainers = await getAllTrainersDirectory();

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
            Database Trainer
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Seluruh trainer dari semua kelas. Edit untuk mengubah nama, peran,
            urutan, atau memindahkan ke kelas lain.
          </p>
        </header>

        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 [font-family:var(--font-playfair)]">
              <UserSquare2 className="h-6 w-6 text-accent" />
              Daftar trainer
            </CardTitle>
            <CardDescription>
              {trainers.length} entri. Penambahan trainer tetap dari halaman
              detail kelas.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-3">Nama</th>
                  <th className="px-3 py-3">Peran</th>
                  <th className="px-3 py-3">Kelas</th>
                  <th className="px-3 py-3">Urutan</th>
                  <th className="px-3 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {trainers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-10 text-center text-muted-foreground"
                    >
                      Belum ada trainer. Tambahkan dari halaman kelas.
                    </td>
                  </tr>
                ) : (
                  trainers.map((t) => {
                    const c = t.classes;
                    const label = c
                      ? `${c.client_name ?? "Kelas"} — ${c.class_code ?? ""}`
                      : "—";
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-border/80 last:border-0 hover:bg-muted/15"
                      >
                        <td className="px-3 py-3 font-medium text-primary">
                          {t.name}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {t.role}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant="outline">{label}</Badge>
                        </td>
                        <td className="px-3 py-3">{t.display_order}</td>
                        <td className="px-3 py-3 text-right">
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/admin/trainers-database/${t.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
