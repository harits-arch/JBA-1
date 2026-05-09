import { StudentDirectoryTable } from "@/components/admin/student-directory-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin/guards";
import { getAllStudentsDirectory } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  await requireAdminUser();
  const rows = await getAllStudentsDirectory();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#D4AF37" }}
          >
            Manajemen Operasional
          </p>
          <h1 className="mt-2 text-4xl font-bold text-primary [font-family:var(--font-playfair)]">
            Database Siswa
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Daftar seluruh akun student dan kelas yang mereka ikuti. Nomor
            WhatsApp dapat diklik untuk membuka chat.
          </p>
        </header>

        <Card className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              Direktori
            </CardTitle>
            <CardDescription>
              Data dari tabel <code className="text-xs">users</code> (role
              student) dan <code className="text-xs">class_registrations</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentDirectoryTable rows={rows} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
