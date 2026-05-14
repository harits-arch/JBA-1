import Link from "next/link";

import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import { ClassRegistrationForm } from "@/components/student/class-registration-form";
import { StudentClassSwitcher } from "@/components/student/student-class-switcher";
import { Badge } from "@/components/ui/badge";
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
import { getStudentRegistrations } from "@/lib/student/queries";

export const dynamic = "force-dynamic";

export default async function ClassRegisterPage() {
  const user = await requireStudentUser();
  const [registrations, activeRegistration] = await Promise.all([
    getStudentRegistrations(user.id),
    resolveStudentActiveRegistration(user.id)
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {registrations.length > 0 ? (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Kelas Terdaftar</CardTitle>
              <CardDescription>
                Kamu bisa ikut beberapa kelas. Pilih kelas aktif atau daftar
                kelas baru di bawah.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StudentClassSwitcher
                registrations={registrations}
                activeClassId={activeRegistration?.class_id ?? null}
              />
              <Button asChild className="w-full" variant="secondary">
                <Link href="/student/dashboard">Kembali ke Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>
                  {registrations.length > 0 ? "Ikut Kelas Lain" : "Masukkan Kode Kelas"}
                </CardTitle>
                <CardDescription>
                  Gunakan kode yang diberikan oleh JBA atau perusahaan kamu.
                </CardDescription>
              </div>
              {registrations.length > 0 ? <Badge variant="outline">Baru</Badge> : null}
            </div>
          </CardHeader>
          <CardContent>
            <ClassRegistrationForm />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <StudentLogoutButton />
      </div>
    </main>
  );
}
