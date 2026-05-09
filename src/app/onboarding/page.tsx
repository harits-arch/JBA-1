import { redirect } from "next/navigation";

import { ProfileOnboardingForm } from "@/components/auth/profile-onboarding-form";
import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getCurrentUserFromSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUserFromSession();

  if (!user) {
    redirect("/login");
  }

  if (user.profile_completed) {
    redirect("/student/dashboard");
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl bg-white">
        <CardHeader>
          <CardTitle>Lengkapi Profil Kamu</CardTitle>
          <CardDescription>
            Isi data diri sebelum mengikuti kelas JBA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileOnboardingForm user={user} />
        </CardContent>
      </Card>
      <div className="mx-auto mt-6 flex max-w-2xl justify-center">
        <StudentLogoutButton />
      </div>
    </main>
  );
}
