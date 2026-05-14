import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Sparkles,
  Star
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { StudentLogoutButton } from "@/components/auth/student-logout-button";
import { StudentClassSwitcher } from "@/components/student/student-class-switcher";
import { requireStudentUser } from "@/lib/student/guards";
import type { PostTestProgressSummary } from "@/lib/student/post-test-progress";
import { getStudentDashboardData } from "@/lib/student/queries";

export const dynamic = "force-dynamic";

const steps = ["Daftar", "Pre-Test", "Kelas", "Post-Test"];

export default async function StudentDashboardPage() {
  const user = await requireStudentUser();
  const dashboard = await getStudentDashboardData(user.id);
  const activeStep = getActiveStep({
    hasRegistration: Boolean(dashboard.registration?.classes),
    hasPreTest: Boolean(dashboard.preTest),
    postTestOpen: Boolean(dashboard.registration?.classes?.post_test_open),
    postTestSummary: dashboard.postTestSummary
  });
  const displayName = user.full_name?.split(" ")[0] ?? "Student";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7ead0_0%,#f7f2ea_38%,#f4efe8_100%)] px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              JBA Student
            </p>
            <h1 className="mt-1 text-3xl font-bold text-primary">
              Selamat datang, {displayName}
            </h1>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-white text-lg font-bold text-primary shadow-soft">
            {displayName[0]?.toUpperCase() ?? "S"}
          </div>
        </header>

        <Card className="overflow-hidden border-accent/30 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Progress Kelas
            </CardTitle>
            <CardDescription>
              Ikuti setiap tahap untuk menyelesaikan pengalaman grooming kamu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {steps.map((step, index) => {
                const isDone = index < activeStep;
                const isActive = index === activeStep;

                return (
                  <div key={step} className="relative text-center">
                    <div
                      className={
                        isActive
                          ? "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-md transition-all duration-300"
                          : isDone
                          ? "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300"
                          : "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300"
                      }
                    >
                      {isDone ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </div>
                    <p
                      className={
                        isActive
                          ? "mt-2 text-xs font-bold text-primary"
                          : "mt-2 text-xs text-muted-foreground"
                      }
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-accent/30 bg-primary text-primary-foreground">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">Kelas Aktif</CardTitle>
                <CardDescription className="text-primary-foreground/75">
                  Detail kelas dan trainer kamu.
                </CardDescription>
              </div>
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {dashboard.registration?.classes ? (
              <>
                <div className="rounded-3xl border border-accent/40 bg-white/10 p-4">
                  <p className="text-xl font-bold">
                    {dashboard.registration.classes.client_name ?? "Kelas JBA"}
                  </p>
                  <p className="mt-1 text-sm text-primary-foreground/75">
                    {dashboard.registration.classes.class_name ??
                      "Personal Grooming Class"}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-accent" />
                    {dashboard.registration.classes.class_date}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-accent">
                    Trainer & Tim
                  </p>
                  {dashboard.trainers.length > 0 ? (
                    <div className="grid gap-2">
                      {dashboard.trainers.slice(0, 3).map((trainer) => (
                        <div
                          key={trainer.id}
                          className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent text-sm font-bold text-accent">
                            {trainer.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{trainer.name}</p>
                            <p className="text-xs text-primary-foreground/70">
                              {trainer.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-white/10 p-3 text-sm text-primary-foreground/75">
                      Trainer akan ditampilkan setelah admin menambahkannya.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 rounded-3xl border border-accent/40 bg-white/10 p-4">
                <p className="text-lg font-semibold">Belum ikut kelas</p>
                <p className="text-sm text-primary-foreground/75">
                  Masukkan kode kelas dari JBA atau perusahaan kamu untuk mulai.
                </p>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/class/register">Ikut Kelas</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {dashboard.registrations.length > 0 ? (
          <Card className="border-accent/30 bg-white/90">
            <CardHeader>
              <CardTitle>Semua Kelas Saya</CardTitle>
              <CardDescription>
                Pilih kelas aktif untuk melihat progress, pre-test, dan post-test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StudentClassSwitcher
                registrations={dashboard.registrations}
                activeClassId={dashboard.registration?.class_id ?? null}
              />
              <Button asChild variant="outline" className="w-full">
                <Link href="/class/register">Ikut Kelas Lain</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <ActionCard
          hasRegistration={Boolean(dashboard.registration?.classes)}
          hasPreTest={Boolean(dashboard.preTest)}
          postTestOpen={Boolean(dashboard.registration?.classes?.post_test_open)}
          postTestSummary={dashboard.postTestSummary}
        />

        <Card className="border-accent/30 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-accent" />
              Preview Transformasi
            </CardTitle>
            <CardDescription>
              Foto before dan after kamu akan tampil di sini.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <PhotoFrame label="Before" src={dashboard.beforePhotoUrl} />
            <PhotoFrame
              label="After"
              src={dashboard.latestProgressPhotoUrl ?? dashboard.afterPhotoUrl}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center pb-4">
          <StudentLogoutButton className="px-6" />
        </div>
      </div>
    </main>
  );
}

function ActionCard({
  hasRegistration,
  hasPreTest,
  postTestOpen,
  postTestSummary
}: {
  hasRegistration: boolean;
  hasPreTest: boolean;
  postTestOpen: boolean;
  postTestSummary: PostTestProgressSummary | null;
}) {
  if (!hasRegistration) {
    return (
      <Button asChild className="w-full shadow-soft" size="lg">
        <Link href="/class/register">Ikut Kelas Sekarang</Link>
      </Button>
    );
  }

  if (!hasPreTest) {
    return (
      <Button asChild className="w-full shadow-soft" size="lg">
        <Link href="/pre-test">Mulai Pre-Test Assessment</Link>
      </Button>
    );
  }

  if (postTestSummary?.isComplete) {
    return (
      <div className="rounded-3xl border border-accent/40 bg-white/90 p-5 text-center">
        <Badge variant="success">Selesai</Badge>
        <p className="mt-3 font-semibold text-primary">
          Terima kasih, 14 kali submission Post-Test kamu sudah lengkap.
        </p>
      </div>
    );
  }

  if (postTestSummary && postTestSummary.totalSubmissions > 0) {
    return (
      <div className="space-y-3 rounded-3xl border border-accent/40 bg-white/90 p-5 text-center">
        <Badge variant="secondary">
          {postTestSummary.totalSubmissions}/{postTestSummary.maxSubmissions}
        </Badge>
        <p className="font-semibold text-primary">
          Lanjutkan foto progress Post-Test harian kamu.
        </p>
        <Button
          asChild
          className="w-full bg-accent text-accent-foreground shadow-soft hover:bg-accent/90"
          size="lg"
        >
          <Link href="/post-test">
            <Star className="h-4 w-4" />
            {postTestSummary.canSubmitToday
              ? "Kirim Foto Progress Hari Ini"
              : "Lihat Progress Post-Test"}
          </Link>
        </Button>
      </div>
    );
  }

  if (postTestOpen) {
    return (
      <Button
        asChild
        className="w-full bg-accent text-accent-foreground shadow-soft hover:bg-accent/90"
        size="lg"
      >
        <Link href="/post-test">
          <Star className="h-4 w-4" />
          Lengkapi Transformasi Kamu (Post-Test)
        </Link>
      </Button>
    );
  }

  return (
    <div className="rounded-3xl border border-accent/40 bg-white/90 p-5 text-center">
      <p className="font-semibold text-primary">
        Tunggu sesi selesai untuk membuka Post-Test.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin JBA akan membuka akses setelah kelas selesai.
      </p>
    </div>
  );
}

function PhotoFrame({ label, src }: { label: string; src: string | null }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-accent/70 bg-secondary/50 p-2">
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl bg-white">
        {src ? (
          <Image src={src} alt={`Foto ${label}`} fill className="object-cover" />
        ) : (
          <div className="px-3 text-center">
            <Camera className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-2 text-xs font-semibold text-primary">
              Foto {label} belum tersedia
            </p>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">
        {label}
      </p>
    </div>
  );
}

function getActiveStep({
  hasRegistration,
  hasPreTest,
  postTestOpen,
  postTestSummary
}: {
  hasRegistration: boolean;
  hasPreTest: boolean;
  postTestOpen: boolean;
  postTestSummary: PostTestProgressSummary | null;
}) {
  if (!hasRegistration) {
    return 0;
  }

  if (!hasPreTest) {
    return 1;
  }

  if (!postTestOpen) {
    return 2;
  }

  if (!postTestSummary || postTestSummary.totalSubmissions === 0) {
    return 3;
  }

  if (!postTestSummary.isComplete) {
    return 3;
  }

  return 3;
}
