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
import { getClassesForAdmin } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  await requireAdminUser();
  const classes = await getClassesForAdmin();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Classes</h1>
            <p className="mt-2 text-muted-foreground">
              Create classes, manage trainers, and control post-test access.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/classes/new">Create Class</Link>
          </Button>
        </header>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>
              Class codes are shared with client employees for student
              registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <Link
                  key={classItem.id}
                  href={`/admin/classes/${classItem.id}`}
                  className="grid gap-3 rounded-2xl border bg-background p-4 transition-colors hover:border-primary/40 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto]"
                >
                  <div>
                    <h2 className="font-semibold text-primary">
                      {classItem.client_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {classItem.class_name ?? "JBA Grooming Class"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Class Code
                    </p>
                    <p className="font-mono text-sm font-semibold">
                      {classItem.class_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Date
                    </p>
                    <p className="text-sm">{classItem.class_date}</p>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    <Badge variant="outline">{classItem.status}</Badge>
                    <Badge
                      variant={classItem.post_test_open ? "success" : "muted"}
                    >
                      {classItem.post_test_open ? "Post-Test Open" : "Closed"}
                    </Badge>
                    <Badge variant="secondary">
                      {classItem.trainers.length} Trainers
                    </Badge>
                    <Badge variant="secondary">
                      {classItem.class_registrations.length} Students
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed bg-background p-8 text-center">
                <p className="font-semibold text-primary">No classes yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a class to generate a registration code for students.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
