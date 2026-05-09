import { GlobalFeedbackList } from "@/components/admin/global-feedback-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getGlobalFeedbackItems } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  await requireAdminUser();
  const items = await getGlobalFeedbackItems();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#D4AF37" }}
          >
            Monitoring Tugas & Hasil
          </p>
          <h1 className="mt-2 text-4xl font-bold text-primary [font-family:var(--font-playfair)]">
            Penilaian & Feedback
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Rating trainer, testimoni, dan feedback tertulis dari seluruh
            submission Post-Test.
          </p>
        </header>

        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Arsip feedback
            </CardTitle>
            <CardDescription>
              Diurutkan dari submission terbaru. Mencakup semua kelas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GlobalFeedbackList items={items} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
