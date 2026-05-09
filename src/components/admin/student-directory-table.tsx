"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { AdminStudentDirectoryRow } from "@/lib/admin/queries";
import { buildWhatsAppLink } from "@/lib/admin/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StudentDirectoryTable({
  rows
}: {
  rows: AdminStudentDirectoryRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((row) => {
      const name = (row.fullName ?? "").toLowerCase();
      const phone = (row.phone ?? "").toLowerCase();
      const classes = row.classes.join(" ").toLowerCase();
      return name.includes(q) || phone.includes(q) || classes.includes(q);
    });
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama, WhatsApp, atau kelas..."
          className="pl-10"
          aria-label="Cari siswa"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-accent/30 bg-white/95 shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Nomor WA</th>
              <th className="px-4 py-3">Kelas yang diikuti</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {rows.length === 0
                    ? "Belum ada siswa terdaftar di kelas manapun."
                    : "Tidak ada hasil untuk pencarian ini."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const wa = buildWhatsAppLink(row.phone);
                return (
                  <tr
                    key={row.userId}
                    className="border-b border-border/80 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium text-primary">
                      {row.fullName?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.phone && wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-accent underline-offset-2 hover:underline"
                        >
                          {row.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.classes.length > 0 ? (
                        <ul className="list-inside list-disc space-y-1">
                          {row.classes.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/admin/students/${row.userId}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Menampilkan {filtered.length} dari {rows.length} siswa. Data dari akun
        student dan registrasi kelas (bukan tabel terpisah &quot;profiles&quot;).
      </p>
    </div>
  );
}
