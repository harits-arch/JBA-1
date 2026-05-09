import Link from "next/link";

import {
  ClassDetailWorkspace,
  type FeedbackItem,
  type GalleryItem,
  type ParticipantRow
} from "@/components/admin/class-detail-workspace";
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
import {
  createSubmissionPhotoUrl,
  getClassDetail,
  getClassSubmissions,
  getRegisteredStudents
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [{ classData, trainers, stats }, registrations, submissions] =
    await Promise.all([
      getClassDetail(id),
      getRegisteredStudents(id),
      getClassSubmissions(id)
    ]);
  const [beforePhotoUrls, afterPhotoUrls] = await Promise.all([
    Promise.all(
      submissions.preTests.map((submission) =>
        createSubmissionPhotoUrl(submission.before_photo_path)
      )
    ),
    Promise.all(
      submissions.postTests.map((submission) =>
        createSubmissionPhotoUrl(submission.after_photo_path)
      )
    )
  ]);
  const preTestByUserId = new Map(
    submissions.preTests
      .filter((submission) => submission.users?.id)
      .map((submission, index) => [
        submission.users!.id,
        { submission, photoUrl: beforePhotoUrls[index] }
      ])
  );
  const postTestByUserId = new Map(
    submissions.postTests
      .filter((submission) => submission.users?.id)
      .map((submission, index) => [
        submission.users!.id,
        { submission, photoUrl: afterPhotoUrls[index] }
      ])
  );
  const participants: ParticipantRow[] = registrations.map((registration) => {
    const student = registration.users;
    const progress = student?.id
      ? postTestByUserId.has(student.id)
        ? "post-test"
        : preTestByUserId.has(student.id)
        ? "pre-test"
        : "registered"
      : "registered";

    return {
      id: student?.id ?? registration.registered_at,
      name: student?.full_name ?? "Student Tanpa Nama",
      phone: student?.phone ?? null,
      email: student?.email ?? null,
      progress
    };
  });
  const galleryItems: GalleryItem[] = participants
    .map((participant) => {
      const before = preTestByUserId.get(participant.id);
      const after = postTestByUserId.get(participant.id);

      return {
        id: participant.id,
        name: participant.name,
        phone: participant.phone,
        beforePhotoUrl: before?.photoUrl ?? null,
        afterPhotoUrl: after?.photoUrl ?? null
      };
    })
    .filter((item) => item.beforePhotoUrl || item.afterPhotoUrl);
  const feedbackItems: FeedbackItem[] = submissions.postTests.map((submission) => ({
    id: submission.id,
    name: submission.users?.full_name ?? "Student Tanpa Nama",
    likedMost: submission.liked_most,
    improvementFeedback: submission.improvement_feedback,
    nextSteps: submission.next_steps,
    testimonial: submission.testimonial,
    trainerRatings: submission.trainer_ratings.map((rating) => ({
      id: rating.id,
      rating: rating.rating,
      trainerName: rating.trainers?.name ?? "Trainer",
      trainerRole: rating.trainers?.role ?? "-"
    }))
  }));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="ghost">
            <Link href="/admin/classes">Kembali ke Kelas</Link>
          </Button>
          <PostTestToggleForm
            classId={classData.id}
            postTestOpen={classData.post_test_open}
          />
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-accent/30 bg-white/90">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-4xl [font-family:var(--font-playfair)]">
                    {classData.client_name}
                  </CardTitle>
                  <CardDescription>
                    {classData.class_name ?? "JBA Grooming Class"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{classData.status}</Badge>
                  <Badge
                    variant={classData.post_test_open ? "success" : "muted"}
                  >
                    {classData.post_test_open ? "Post-Test Dibuka" : "Ditutup"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Kode Kelas" value={classData.class_code} mono />
                <InfoItem label="Tanggal Kelas" value={classData.class_date} />
                <InfoItem label="Lokasi" value={classData.location ?? "-"} />
                <InfoItem label="Akses Post-Test" value={classData.post_test_open ? "Dibuka" : "Ditutup"} />
              </div>
              {classData.notes ? (
                <div className="rounded-2xl border bg-background p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Catatan
                  </p>
                  <p className="mt-2 text-sm leading-6">{classData.notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-white/90">
            <CardHeader>
              <CardTitle className="[font-family:var(--font-playfair)]">
                Aktivitas Kelas
              </CardTitle>
              <CardDescription>
                Ringkasan operasional untuk event ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <MetricRow label="Student Terdaftar" value={stats.registeredCount} />
              <MetricRow label="Submission Pre-Test" value={stats.preTestCount} />
              <MetricRow label="Submission Post-Test" value={stats.postTestCount} />
            </CardContent>
          </Card>
        </section>

        <ClassDetailWorkspace
          participants={participants}
          galleryItems={galleryItems}
          feedbackItems={feedbackItems}
        />

        <Card className="border-accent/30 bg-white/90">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Trainer & Rating Tim
            </CardTitle>
            <CardDescription>
              Nama ini tampil otomatis di form rating Post-Test student.
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
                        {trainer.role} - Urutan tampil {trainer.display_order}
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
                  Belum ada trainer. Tambahkan trainer, MC, atau anggota tim
                  partner yang perlu dirating student.
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
