import Link from "next/link";
import { notFound } from "next/navigation";

import { EditClassForm } from "@/components/admin/edit-class-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getClassRowForEdit } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function EditClassPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const classData = await getClassRowForEdit(id);

  if (!classData) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost">
          <Link href={`/admin/classes/${classData.id}`}>← Kembali ke detail</Link>
        </Button>
        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Edit Kelas
            </CardTitle>
            <CardDescription>
              Perbarui data kelas atau hapus jika diperlukan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditClassForm classData={classData} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
