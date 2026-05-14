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
import {
  createSubmissionPhotoUrl,
  getClassDetail,
  getClassSubmissions
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function ClassSubmissionsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [{ classData }, submissions] = await Promise.all([
    getClassDetail(id),
    getClassSubmissions(id)
  ]);
  const beforePhotoUrls = await Promise.all(
    submissions.preTests.map((submission) =>
      createSubmissionPhotoUrl(submission.before_photo_path)
    )
  );
  const afterPhotoUrls = await Promise.all(
    submissions.postTests.map((submission) =>
      createSubmissionPhotoUrl(submission.after_photo_path)
    )
  );
  const progressPhotoUrls = await Promise.all(
    submissions.progressEntries.map((entry) =>
      createSubmissionPhotoUrl(entry.after_photo_path)
    )
  );
  const progressByUser = groupProgressEntriesByUser(submissions.progressEntries);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="ghost">
            <Link href={`/admin/classes/${classData.id}`}>Kembali ke Kelas</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/admin/classes/${classData.id}/students`}>
              Lihat Student
            </Link>
          </Button>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Submission Viewer</CardTitle>
            <CardDescription>
              {classData.client_name} - {classData.class_code}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Metric label="Pre-Tests" value={submissions.preTests.length} />
            <Metric label="Post-Tests" value={submissions.postTests.length} />
            <Metric
              label="Foto Progress Harian"
              value={submissions.progressEntries.length}
            />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Hasil Pre-Test</CardTitle>
            <CardDescription>
              Termasuk jawaban sesuai gender dan link foto BEFORE.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissions.preTests.length > 0 ? (
              submissions.preTests.map((submission, index) => (
                <div
                  key={submission.id}
                  className="space-y-4 rounded-3xl border bg-background p-4"
                >
                  <SubmissionHeader
                    name={submission.users?.full_name}
                    phone={submission.users?.phone}
                    submittedAt={submission.submitted_at}
                    gender={submission.gender}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Info label="Frekuensi" value={submission.grooming_frequency} />
                    <Info
                      label="Kendala"
                      value={submission.obstacles?.join(", ")}
                    />
                    <Info
                      label="Aktivitas / Kebiasaan"
                      value={
                        submission.gender === "female"
                          ? submission.female_activities?.join(", ")
                          : submission.male_habits?.join(", ")
                      }
                    />
                    <Info label="Kondisi Kulit" value={submission.male_skin_type} />
                  </div>
                  <LongInfo label="Ekspektasi" value={submission.expectations} />
                  <LongInfo
                    label="Penjelasan Kendala"
                    value={submission.obstacle_explanation}
                  />
                  <PhotoButton
                    href={beforePhotoUrls[index]}
                    label="Unduh Foto BEFORE"
                  />
                </div>
              ))
            ) : (
              <EmptyState label="Belum ada submission Pre-Test." />
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Hasil Post-Test</CardTitle>
            <CardDescription>
              Termasuk rating trainer, feedback, persetujuan, dan link foto AFTER.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissions.postTests.length > 0 ? (
              submissions.postTests.map((submission, index) => (
                <div
                  key={submission.id}
                  className="space-y-4 rounded-3xl border bg-background p-4"
                >
                  <SubmissionHeader
                    name={submission.users?.full_name}
                    phone={submission.users?.phone}
                    submittedAt={submission.submitted_at}
                    gender={submission.users?.gender}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Info label="Rekomendasi" value={submission.recommendation} />
                    <Info
                      label="Direkomendasikan Untuk"
                      value={submission.recommendation_target}
                    />
                    <Info
                      label="Persetujuan Konten"
                      value={submission.content_consent ? "Ya" : "Tidak"}
                    />
                  </div>
                  <LongInfo label="Paling Disukai" value={submission.liked_most} />
                  <LongInfo
                    label="Feedback Perbaikan"
                    value={submission.improvement_feedback}
                  />
                  <LongInfo label="Langkah Berikutnya" value={submission.next_steps} />
                  <LongInfo label="Testimoni" value={submission.testimonial} />
                  <div className="grid gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Rating Trainer
                    </p>
                    {submission.trainer_ratings.length > 0 ? (
                      submission.trainer_ratings.map((rating) => (
                        <div
                          key={rating.id}
                          className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3"
                        >
                          <div>
                            <p className="font-medium">
                              {rating.trainers?.name ?? "Trainer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {rating.trainers?.role ?? "-"}
                            </p>
                          </div>
                          <Badge variant="secondary">{rating.rating}/5</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Belum ada rating trainer.
                      </p>
                    )}
                  </div>
                  <PhotoButton
                    href={afterPhotoUrls[index]}
                    label="Unduh Foto AFTER"
                  />
                </div>
              ))
            ) : (
              <EmptyState label="Belum ada submission Post-Test." />
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Rekap Foto Progress Harian</CardTitle>
            <CardDescription>
              Submission ke-2 sampai ke-14 (foto saja, maks 1 per hari WIB).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressByUser.length > 0 ? (
              progressByUser.map((group) => (
                <div
                  key={group.userId}
                  className="space-y-3 rounded-3xl border bg-background p-4"
                >
                  <SubmissionHeader
                    name={group.name}
                    phone={group.phone}
                    submittedAt={`${group.entries.length} foto progress`}
                    gender={group.gender}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.entries.map((entry) => {
                      const urlIndex = submissions.progressEntries.findIndex(
                        (item) => item.id === entry.id
                      );
                      return (
                        <div
                          key={entry.id}
                          className="rounded-2xl border bg-white p-3 text-sm"
                        >
                          <p className="font-medium text-primary">
                            {entry.entry_date} (WIB)
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Dikirim {entry.submitted_at}
                          </p>
                          <div className="mt-3">
                            <PhotoButton
                              href={progressPhotoUrls[urlIndex] ?? null}
                              label="Lihat Foto Progress"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="Belum ada foto progress harian." />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function groupProgressEntriesByUser(
  entries: Awaited<ReturnType<typeof getClassSubmissions>>["progressEntries"]
) {
  const groups = new Map<
    string,
    {
      userId: string;
      name: string | null | undefined;
      phone: string | null | undefined;
      gender: string | null | undefined;
      entries: typeof entries;
    }
  >();

  for (const entry of entries) {
    const existing = groups.get(entry.user_id);
    if (existing) {
      existing.entries.push(entry);
      continue;
    }

    groups.set(entry.user_id, {
      userId: entry.user_id,
      name: entry.users?.full_name,
      phone: entry.users?.phone,
      gender: entry.users?.gender,
      entries: [entry]
    });
  }

  return Array.from(groups.values());
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
    </div>
  );
}

function SubmissionHeader({
  name,
  phone,
  submittedAt,
  gender
}: {
  name?: string | null;
  phone?: string | null;
  submittedAt: string;
  gender?: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="font-semibold text-primary">{name ?? "Student Tanpa Nama"}</p>
        <p className="text-sm text-muted-foreground">{phone ?? "Tidak ada nomor"}</p>
        <p className="text-xs text-muted-foreground">Dikirim {submittedAt}</p>
      </div>
      {gender ? <Badge variant="outline">{gender}</Badge> : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{value || "-"}</p>
    </div>
  );
}

function LongInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value || "-"}</p>
    </div>
  );
}

function PhotoButton({
  href,
  label
}: {
  href: string | null;
  label: string;
}) {
  if (!href) {
    return null;
  }

  return (
    <Button asChild variant="secondary">
      <a href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    </Button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-background p-8 text-center text-muted-foreground">
      {label}
    </div>
  );
}
