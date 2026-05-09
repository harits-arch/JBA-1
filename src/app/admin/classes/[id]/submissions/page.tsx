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

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="ghost">
            <Link href={`/admin/classes/${classData.id}`}>Back to Class</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/admin/classes/${classData.id}/students`}>
              View Students
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
              label="Pending Post-Test"
              value={Math.max(
                submissions.preTests.length - submissions.postTests.length,
                0
              )}
            />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Pre-Test Results</CardTitle>
            <CardDescription>
              Includes gender-specific answers and BEFORE photo links.
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
                    <Info label="Frequency" value={submission.grooming_frequency} />
                    <Info
                      label="Obstacles"
                      value={submission.obstacles?.join(", ")}
                    />
                    <Info
                      label="Activities / Habits"
                      value={
                        submission.gender === "female"
                          ? submission.female_activities?.join(", ")
                          : submission.male_habits?.join(", ")
                      }
                    />
                    <Info label="Skin Type" value={submission.male_skin_type} />
                  </div>
                  <LongInfo label="Expectations" value={submission.expectations} />
                  <LongInfo
                    label="Obstacle Explanation"
                    value={submission.obstacle_explanation}
                  />
                  <PhotoButton
                    href={beforePhotoUrls[index]}
                    label="Download BEFORE Photo"
                  />
                </div>
              ))
            ) : (
              <EmptyState label="No pre-test submissions yet." />
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Post-Test Results</CardTitle>
            <CardDescription>
              Includes trainer ratings, feedback, consent, and AFTER photo
              links.
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
                    <Info label="Recommendation" value={submission.recommendation} />
                    <Info
                      label="Recommend To"
                      value={submission.recommendation_target}
                    />
                    <Info
                      label="Content Consent"
                      value={submission.content_consent ? "Yes" : "No"}
                    />
                  </div>
                  <LongInfo label="Liked Most" value={submission.liked_most} />
                  <LongInfo
                    label="Improvement Feedback"
                    value={submission.improvement_feedback}
                  />
                  <LongInfo label="Next Steps" value={submission.next_steps} />
                  <LongInfo label="Testimonial" value={submission.testimonial} />
                  <div className="grid gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Trainer Ratings
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
                        No trainer ratings recorded.
                      </p>
                    )}
                  </div>
                  <PhotoButton
                    href={afterPhotoUrls[index]}
                    label="Download AFTER Photo"
                  />
                </div>
              ))
            ) : (
              <EmptyState label="No post-test submissions yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
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
        <p className="font-semibold text-primary">{name ?? "Unnamed Student"}</p>
        <p className="text-sm text-muted-foreground">{phone ?? "No phone"}</p>
        <p className="text-xs text-muted-foreground">Submitted {submittedAt}</p>
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
