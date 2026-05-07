import { redirect } from "next/navigation";

import { ProfileOnboardingForm } from "@/components/auth/profile-onboarding-form";
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
    redirect("/class/register");
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl bg-white">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us who you are before joining your JBA class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileOnboardingForm user={user} />
        </CardContent>
      </Card>
    </main>
  );
}
