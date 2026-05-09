import Link from "next/link";
import { redirect } from "next/navigation";

import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import { PostTestForm } from "@/components/student/post-test-form";
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
  getClassTrainersForStudent,
  getStudentCurrentRegistration,
  getStudentPostTestSubmission,
  getStudentPreTestSubmission
} from "@/lib/student/queries";

export const dynamic = "force-dynamic";

export default async function PostTestPage() {
  const user = await requireStudentUser();
  const registration = await getStudentCurrentRegistration(user.id);

  if (!registration?.classes) {
    redirect("/student/dashboard");
  }

  const preTestSubmission = await getStudentPreTestSubmission(
    user.id,
    registration.class_id
  );

  if (!preTestSubmission) {
    redirect("/pre-test");
  }

  const existingPostTest = await getStudentPostTestSubmission(
    user.id,
    registration.class_id
  );

  if (existingPostTest) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
        <Card className="w-full bg-white text-center">
          <CardHeader>
            <CardTitle>Post-Test Sudah Terkirim</CardTitle>
            <CardDescription>
              Terima kasih. JBA sudah menerima feedback akhir dan foto AFTER kamu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/student/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
          <div className="mt-6 flex justify-center">
            <StudentLogoutButton />
          </div>
        </div>
      </main>
    );
  }

  if (!registration.classes.post_test_open) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
        <Card className="w-full bg-white text-center">
          <CardHeader>
            <CardTitle>Post-Test Belum Dibuka</CardTitle>
            <CardDescription>
              Silakan ikuti kelas terlebih dahulu. Tim JBA akan membuka akses
              Post-Test setelah sesi selesai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/student/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
          <div className="mt-6 flex justify-center">
            <StudentLogoutButton />
          </div>
        </div>
      </main>
    );
  }

  const trainers = await getClassTrainersForStudent(registration.class_id);

  if (trainers.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
        <Card className="w-full bg-white text-center">
          <CardHeader>
            <CardTitle>Setup Post-Test Belum Lengkap</CardTitle>
            <CardDescription>
              Rating trainer belum siap. Mohon minta tim JBA menambahkan trainer
              untuk kelas ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/student/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
          <div className="mt-6 flex justify-center">
            <StudentLogoutButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-3xl bg-white">
        <CardHeader>
          <CardTitle>Post-Test</CardTitle>
          <CardDescription>
            {registration.classes.client_name} -{" "}
            {registration.classes.class_code}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostTestForm classId={registration.class_id} trainers={trainers} />
        </CardContent>
      </Card>
      <div className="mx-auto mt-6 flex max-w-3xl justify-center">
        <StudentLogoutButton />
      </div>
    </main>
  );
}
