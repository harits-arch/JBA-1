import Link from "next/link";
import { redirect } from "next/navigation";

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
    redirect("/class/register");
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
      <Card className="w-full max-w-lg bg-white text-center">
        <CardHeader>
          <CardTitle>Enjoy Your Class</CardTitle>
          <CardDescription>
            Your pre-test for {registration.classes.client_name} has been
            received.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              {postTestSubmission
                ? "Your post-test has been submitted. Thank you for your feedback."
                : registration.classes.post_test_open
                ? "The JBA team has opened post-test access."
                : "The post-test will be available after the session ends."}
            </p>
          </div>
          {postTestSubmission ? (
            <Button asChild className="w-full" variant="secondary">
              <Link href="/post-test">View Submission Status</Link>
            </Button>
          ) : registration.classes.post_test_open ? (
            <Button asChild className="w-full">
              <Link href="/post-test">Start Post-Test</Link>
            </Button>
          ) : (
            <Button asChild className="w-full" variant="secondary">
              <Link href="/post-test">Check Post-Test</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
