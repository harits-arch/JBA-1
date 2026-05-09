import { GlobalGalleryClient } from "@/components/admin/global-gallery-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getGlobalGalleryRows } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdminUser();
  const rows = await getGlobalGalleryRows();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#D4AF37" }}
          >
            Monitoring Tugas & Hasil
          </p>
          <h1 className="mt-2 text-4xl font-bold text-primary [font-family:var(--font-playfair)]">
            Galeri Tugas
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Perbandingan foto Before dan After per siswa, digabung dari seluruh
            kelas.
          </p>
        </header>

        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Transformasi grooming
            </CardTitle>
            <CardDescription>
              Grid side-by-side untuk review cepat. URL foto bersifat sementara
              (signed).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GlobalGalleryClient rows={rows} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
