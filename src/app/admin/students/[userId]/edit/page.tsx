import Link from "next/link";
import { notFound } from "next/navigation";

import { EditStudentForm } from "@/components/admin/edit-student-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getStudentForAdminEdit } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function EditStudentPage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdminUser();
  const { userId } = await params;
  const user = await getStudentForAdminEdit(userId);

  if (!user) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/students">← Kembali ke database siswa</Link>
        </Button>
        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Edit Siswa
            </CardTitle>
            <CardDescription>
              Ubah profil atau hapus akun siswa. Firebase UID tidak diubah di
              sini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditStudentForm user={user} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
