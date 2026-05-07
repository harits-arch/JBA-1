import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUserFromSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ClassRegisterPage() {
  const user = await getCurrentUserFromSession();

  if (!user) {
    redirect("/login");
  }

  if (!user.profile_completed) {
    redirect("/onboarding");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>Enter Class Code</CardTitle>
          <CardDescription>
            Students will use the code provided by JBA or their employer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="class-code">Class Code</Label>
            <Input id="class-code" placeholder="UNIQLO2026" />
          </div>
          <Button className="w-full">Join Class</Button>
        </CardContent>
      </Card>
    </main>
  );
}
