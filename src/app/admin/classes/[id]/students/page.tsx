import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getClassDetail, getRegisteredStudents } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function ClassStudentsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [{ classData }, registrations] = await Promise.all([
    getClassDetail(id),
    getRegisteredStudents(id)
  ]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="ghost">
            <Link href={`/admin/classes/${classData.id}`}>Back to Class</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/classes">All Classes</Link>
          </Button>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Registered Students</CardTitle>
            <CardDescription>
              {classData.client_name} - {classData.class_code}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {registrations.length > 0 ? (
              registrations.map((registration) => {
                const student = registration.users;

                return (
                  <div
                    key={`${student?.id ?? "missing"}-${registration.registered_at}`}
                    className="grid gap-3 rounded-2xl border bg-background p-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <div>
                      <p className="font-semibold text-primary">
                        {student?.full_name ?? "Unnamed Student"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student?.phone ?? "No phone"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Email
                      </p>
                      <p className="text-sm">{student?.email ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Instagram
                      </p>
                      <p className="text-sm">
                        {student?.instagram_username
                          ? `@${student.instagram_username}`
                          : "-"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                      {student?.gender ? (
                        <Badge variant="outline">{student.gender}</Badge>
                      ) : null}
                      <Badge
                        variant={
                          student?.profile_completed ? "success" : "muted"
                        }
                      >
                        {student?.profile_completed
                          ? "Profile Complete"
                          : "Incomplete"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed bg-background p-8 text-center">
                <p className="font-semibold text-primary">
                  No registered students yet
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share class code{" "}
                  <span className="font-mono font-semibold text-primary">
                    {classData.class_code}
                  </span>{" "}
                  with students to let them register.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
