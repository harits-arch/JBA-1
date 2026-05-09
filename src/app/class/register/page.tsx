import Link from "next/link";

import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import { ClassRegistrationForm } from "@/components/student/class-registration-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireStudentUser } from "@/lib/student/guards";
import { getStudentCurrentRegistration } from "@/lib/student/queries";

export const dynamic = "force-dynamic";

export default async function ClassRegisterPage() {
  const user = await requireStudentUser();
  const registration = await getStudentCurrentRegistration(user.id);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md bg-white">
        {registration?.classes ? (
          <>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Kamu Sudah Terdaftar</CardTitle>
                  <CardDescription>
                    Kamu sudah terhubung dengan kelas JBA ini.
                  </CardDescription>
                </div>
                <Badge variant="success">Aktif</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border bg-background p-4">
                <p className="font-semibold text-primary">
                  {registration.classes.client_name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {registration.classes.class_name ?? "JBA Grooming Class"}
                </p>
                <p className="mt-3 font-mono text-sm font-semibold">
                  {registration.classes.class_code}
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/student/dashboard">Kembali ke Dashboard</Link>
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Masukkan Kode Kelas</CardTitle>
              <CardDescription>
                Gunakan kode yang diberikan oleh JBA atau perusahaan kamu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassRegistrationForm />
            </CardContent>
          </>
        )}
      </Card>
      <div className="mt-6">
        <StudentLogoutButton />
      </div>
    </main>
  );
}
