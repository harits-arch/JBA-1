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
import { getAdminDashboardStats, getClassesForAdmin } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const numberFormatter = new Intl.NumberFormat("en-US");

export default async function AdminPage() {
  await requireAdminUser();
  const [stats, classes] = await Promise.all([
    getAdminDashboardStats(),
    getClassesForAdmin()
  ]);
  const recentClasses = classes.slice(0, 3);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              JBA Operations
            </p>
            <h1 className="mt-2 text-3xl font-bold text-primary">
              Admin Dashboard
            </h1>
          </div>
          <Button asChild>
            <Link href="/admin/classes/new">Create Class</Link>
          </Button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Classes" value={stats.classCount} />
          <MetricCard label="Registered Students" value={stats.studentCount} />
          <MetricCard label="Pre-Tests" value={stats.preTestCount} />
          <MetricCard label="Post-Tests" value={stats.postTestCount} />
        </section>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Recent Classes</CardTitle>
            <CardDescription>
              Manage class codes, trainer assignments, and post-test access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClasses.length > 0 ? (
              recentClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  href={`/admin/classes/${classItem.id}`}
                  className="flex flex-col gap-3 rounded-2xl border bg-background p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-primary">
                      {classItem.client_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {classItem.class_name ?? "JBA Grooming Class"} -{" "}
                      {classItem.class_code}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{classItem.status}</Badge>
                    <Badge
                      variant={classItem.post_test_open ? "success" : "muted"}
                    >
                      {classItem.post_test_open ? "Post-Test Open" : "Closed"}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed bg-background p-6 text-center text-muted-foreground">
                No classes yet. Create the first JBA class to start onboarding
                students.
              </div>
            )}
            <Button asChild variant="secondary">
              <Link href="/admin/classes">View All Classes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl text-primary">
          {numberFormatter.format(value)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
