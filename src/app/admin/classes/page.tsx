import Link from "next/link";

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

export default async function ClassesPage() {
  await requireAdminUser();
  const classes = await getClassesForAdmin();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary [font-family:var(--font-playfair)]">
              Kelas
            </h1>
            <p className="mt-2 text-muted-foreground">
              Buat kelas, kelola trainer, dan atur akses Post-Test.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/classes/new">Buat Kelas</Link>
          </Button>
        </header>
        <Card className="border-accent/30 bg-white/90">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Manajemen Kelas
            </CardTitle>
            <CardDescription>
              Kode kelas dibagikan ke karyawan client untuk registrasi student.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="grid gap-3 rounded-3xl border border-accent/20 bg-background/80 p-5 transition-colors hover:border-accent/70 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto_auto]"
                >
                  <Link href={`/admin/classes/${classItem.id}`} className="min-w-0">
                    <h2 className="font-semibold text-primary">
                      {classItem.client_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {classItem.class_name ?? "JBA Grooming Class"}
                    </p>
                  </Link>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Kode Kelas
                    </p>
                    <p className="font-mono text-sm font-semibold">
                      {classItem.class_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Tanggal
                    </p>
                    <p className="text-sm">{classItem.class_date}</p>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    <Badge variant="outline">{classItem.status}</Badge>
                    <Badge
                      variant={classItem.post_test_open ? "success" : "muted"}
                    >
                      {classItem.post_test_open ? "Post-Test Dibuka" : "Ditutup"}
                    </Badge>
                    <Badge variant="secondary">
                      {classItem.trainers.length} Trainer
                    </Badge>
                    <Badge variant="secondary">
                      {classItem.class_registrations.length} Student
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2 lg:justify-end">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/admin/classes/${classItem.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed bg-background p-8 text-center">
                <p className="font-semibold text-primary">Belum ada kelas</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Buat kelas untuk menghasilkan kode registrasi student.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
