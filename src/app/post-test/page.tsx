import Link from "next/link";
import { redirect } from "next/navigation";

import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import { PostTestForm } from "@/components/student/post-test-form";
import { PostTestProgressForm } from "@/components/student/post-test-progress-form";
import { PostTestProgressRecap } from "@/components/student/post-test-progress-recap";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { resolveStudentActiveRegistration } from "@/lib/student/active-class";
import { requireStudentUser } from "@/lib/student/guards";
import { buildPostTestProgressSummary } from "@/lib/student/post-test-progress";
import {
  getClassTrainersForStudent,
  getStudentPostTestProgressEntries,
  getStudentPostTestSubmission,
  getStudentPreTestSubmission
} from "@/lib/student/queries";

export const dynamic = "force-dynamic";

export default async function PostTestPage() {
  const user = await requireStudentUser();
  const registration = await resolveStudentActiveRegistration(user.id);

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

  if (!registration.classes.post_test_open) {
    return (
      <PostTestShell>
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
      </PostTestShell>
    );
  }

  const [existingPostTest, progressEntries, trainers] = await Promise.all([
    getStudentPostTestSubmission(user.id, registration.class_id),
    getStudentPostTestProgressEntries(user.id, registration.class_id),
    getClassTrainersForStudent(registration.class_id)
  ]);

  if (!existingPostTest) {
    if (trainers.length === 0) {
      return (
        <PostTestShell>
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
        </PostTestShell>
      );
    }

    return (
      <PostTestShell wide>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Post-Test (Pertama)</CardTitle>
            <CardDescription>
              {registration.classes.client_name} -{" "}
              {registration.classes.class_code}. Submission pertama membutuhkan
              form lengkap + foto AFTER.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostTestForm classId={registration.class_id} trainers={trainers} />
          </CardContent>
        </Card>
      </PostTestShell>
    );
  }

  const summary = buildPostTestProgressSummary({
    initialSubmission: existingPostTest,
    progressEntries
  });

  return (
    <PostTestShell wide>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Post-Test Progress</CardTitle>
          <CardDescription>
            {registration.classes.client_name} - {registration.classes.class_code}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <PostTestProgressRecap
            summary={summary}
            initialSubmittedAt={existingPostTest.submitted_at}
            progressEntries={progressEntries}
          />

          {summary.canSubmitToday ? (
            <PostTestProgressForm classId={registration.class_id} />
          ) : null}

          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/student/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </PostTestShell>
  );
}

function PostTestShell({
  children,
  wide = false
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className={wide ? "mx-auto max-w-3xl space-y-6" : "mx-auto max-w-lg space-y-6"}>
        {children}
        <div className="flex justify-center">
          <StudentLogoutButton />
        </div>
      </div>
    </main>
  );
}
