import Link from "next/link";
import { redirect } from "next/navigation";

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
    redirect("/class/register");
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
        <Card className="w-full max-w-lg bg-white text-center">
          <CardHeader>
            <CardTitle>Post-Test Submitted</CardTitle>
            <CardDescription>
              Thank you. JBA has received your final feedback and AFTER photo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/waiting">Back to Waiting Area</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!registration.classes.post_test_open) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-lg bg-white text-center">
          <CardHeader>
            <CardTitle>Post-Test Not Yet Open</CardTitle>
            <CardDescription>
              Please enjoy your class. The JBA team will open post-test access
              after the session ends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/waiting">Back to Waiting Area</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const trainers = await getClassTrainersForStudent(registration.class_id);

  if (trainers.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-lg bg-white text-center">
          <CardHeader>
            <CardTitle>Post-Test Setup Pending</CardTitle>
            <CardDescription>
              Trainer ratings are not ready yet. Please ask the JBA team to add
              trainers for this class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/waiting">Back to Waiting Area</Link>
            </Button>
          </CardContent>
        </Card>
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
    </main>
  );
}
