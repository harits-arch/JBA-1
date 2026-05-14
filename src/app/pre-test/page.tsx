import { redirect } from "next/navigation";

import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import { PreTestForm } from "@/components/student/pre-test-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { resolveStudentActiveRegistration } from "@/lib/student/active-class";
import { requireStudentUser } from "@/lib/student/guards";
import { getStudentPreTestSubmission } from "@/lib/student/queries";

export const dynamic = "force-dynamic";

export default async function PreTestPage() {
  const user = await requireStudentUser();

  if (!user.gender) {
    redirect("/onboarding");
  }

  const registration = await resolveStudentActiveRegistration(user.id);

  if (!registration?.classes) {
    redirect("/student/dashboard");
  }

  const existingSubmission = await getStudentPreTestSubmission(
    user.id,
    registration.class_id
  );

  if (existingSubmission) {
    redirect("/student/dashboard");
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-3xl bg-white">
        <CardHeader>
          <CardTitle>Pre-Test</CardTitle>
          <CardDescription>
            {registration.classes.client_name} -{" "}
            {registration.classes.class_code}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreTestForm classId={registration.class_id} gender={user.gender} />
        </CardContent>
      </Card>
      <div className="mx-auto mt-6 flex max-w-3xl justify-center">
        <StudentLogoutButton />
      </div>
    </main>
  );
}
