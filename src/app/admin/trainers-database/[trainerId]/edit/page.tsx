import Link from "next/link";
import { notFound } from "next/navigation";

import { EditTrainerForm } from "@/components/admin/edit-trainer-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getClassesForAdmin, getTrainerForAdminEdit } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function EditTrainerPage({
  params
}: {
  params: Promise<{ trainerId: string }>;
}) {
  await requireAdminUser();
  const { trainerId } = await params;
  const [trainer, classes] = await Promise.all([
    getTrainerForAdminEdit(trainerId),
    getClassesForAdmin()
  ]);

  if (!trainer) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/trainers-database">← Kembali ke database trainer</Link>
        </Button>
        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Edit Trainer
            </CardTitle>
            <CardDescription>
              {trainer.classes
                ? `${trainer.classes.client_name ?? ""} — ${trainer.classes.class_code ?? ""}`
                : "Trainer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditTrainerForm trainer={trainer} classes={classes} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
