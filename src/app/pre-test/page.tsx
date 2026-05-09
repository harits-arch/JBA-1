import { redirect } from "next/navigation";

import { PreTestForm } from "@/components/student/pre-test-form";
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
  getStudentPreTestSubmission
} from "@/lib/student/queries";

export const dynamic = "force-dynamic";

export default async function PreTestPage() {
  const user = await requireStudentUser();

  if (!user.gender) {
    redirect("/onboarding");
  }

  const registration = await getStudentCurrentRegistration(user.id);

  if (!registration?.classes) {
    redirect("/class/register");
  }

  const existingSubmission = await getStudentPreTestSubmission(
    user.id,
    registration.class_id
  );

  if (existingSubmission) {
    redirect("/waiting");
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
    </main>
  );
}
