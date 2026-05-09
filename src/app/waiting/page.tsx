import Link from "next/link";
import { redirect } from "next/navigation";

import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireStudentUser } from "@/lib/student/guards";
import {
  getStudentCurrentRegistration,
  getStudentPostTestSubmission,
  getStudentPreTestSubmission
} from "@/lib/student/queries";

export const dynamic = "force-dynamic";

export default async function WaitingPage() {
  const user = await requireStudentUser();
  const registration = await getStudentCurrentRegistration(user.id);

  if (!registration?.classes) {
    redirect("/student/dashboard");
  }

  const existingSubmission = await getStudentPreTestSubmission(
    user.id,
    registration.class_id
  );

  if (!existingSubmission) {
    redirect("/pre-test");
  }

  const postTestSubmission = await getStudentPostTestSubmission(
    user.id,
    registration.class_id
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
      <Card className="w-full bg-white text-center">
        <CardHeader>
          <CardTitle>Selamat Mengikuti Kelas</CardTitle>
          <CardDescription>
            Pre-Test kamu untuk {registration.classes.client_name} sudah
            diterima.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              {postTestSubmission
                ? "Post-Test kamu sudah terkirim. Terima kasih atas feedback kamu."
                : registration.classes.post_test_open
                ? "Tim JBA sudah membuka akses Post-Test."
                : "Post-Test akan tersedia setelah sesi kelas selesai."}
            </p>
          </div>
          {postTestSubmission ? (
            <Button asChild className="w-full" variant="secondary">
              <Link href="/student/dashboard">Kembali ke Dashboard</Link>
            </Button>
          ) : registration.classes.post_test_open ? (
            <Button asChild className="w-full">
              <Link href="/post-test">Mulai Post-Test</Link>
            </Button>
          ) : (
            <Button asChild className="w-full" variant="secondary">
              <Link href="/student/dashboard">Kembali ke Dashboard</Link>
            </Button>
          )}
        </CardContent>
      </Card>
        <div className="mt-6 flex justify-center">
          <StudentLogoutButton />
        </div>
      </div>
    </main>
  );
}
