import Link from "next/link";

import { AddTrainerForm } from "@/components/admin/add-trainer-form";
import { DeleteTrainerButton } from "@/components/admin/delete-trainer-button";
import { PostTestToggleForm } from "@/components/admin/post-test-toggle-form";
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
import { getClassDetail } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const { classData, trainers, stats } = await getClassDetail(id);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/classes">Back to Classes</Link>
        </Button>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{classData.client_name}</CardTitle>
                  <CardDescription>
                    {classData.class_name ?? "JBA Grooming Class"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{classData.status}</Badge>
                  <Badge
                    variant={classData.post_test_open ? "success" : "muted"}
                  >
                    {classData.post_test_open ? "Post-Test Open" : "Closed"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Class Code" value={classData.class_code} mono />
                <InfoItem label="Class Date" value={classData.class_date} />
                <InfoItem label="Location" value={classData.location ?? "-"} />
                <InfoItem label="Post-Test Access" value={classData.post_test_open ? "Open" : "Closed"} />
              </div>
              {classData.notes ? (
                <div className="rounded-2xl border bg-background p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-2 text-sm leading-6">{classData.notes}</p>
                </div>
              ) : null}
              <PostTestToggleForm
                classId={classData.id}
                postTestOpen={classData.post_test_open}
              />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Class Activity</CardTitle>
              <CardDescription>
                Operational snapshot for this event.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <MetricRow label="Registered Students" value={stats.registeredCount} />
              <MetricRow label="Pre-Test Submissions" value={stats.preTestCount} />
              <MetricRow label="Post-Test Submissions" value={stats.postTestCount} />
              <Button asChild variant="secondary">
                <Link href={`/admin/classes/${classData.id}/students`}>
                  View Students
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Trainers & Team Ratings</CardTitle>
            <CardDescription>
              These names render dynamically in the student post-test rating
              form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AddTrainerForm classId={classData.id} />

            <div className="space-y-3">
              {trainers.length > 0 ? (
                trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="flex flex-col gap-3 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-primary">{trainer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {trainer.role} - Display order {trainer.display_order}
                      </p>
                    </div>
                    <DeleteTrainerButton
                      trainerId={trainer.id}
                      classId={classData.id}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed bg-background p-6 text-center text-muted-foreground">
                  No trainers yet. Add the trainer, MC, or partner team members
                  students should rate.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function InfoItem({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className={mono ? "mt-1 font-mono font-semibold" : "mt-1 font-medium"}>
        {value}
      </p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold text-primary">{value}</span>
    </div>
  );
}
