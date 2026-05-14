import { Badge } from "@/components/ui/badge";
import {
  getWibEntryDateFromIso,
  type PostTestProgressSummary
} from "@/lib/student/post-test-progress";
import type { Database } from "@/types/database";

type ProgressRow =
  Database["public"]["Tables"]["post_test_progress_entries"]["Row"];

export function PostTestProgressRecap({
  summary,
  initialSubmittedAt,
  progressEntries
}: {
  summary: PostTestProgressSummary;
  initialSubmittedAt: string | null;
  progressEntries: ProgressRow[];
}) {
  const timeline = [
    ...(initialSubmittedAt
      ? [
          {
            key: "initial",
            label: "Post-Test awal (form lengkap)",
            date: getWibEntryDateFromIso(initialSubmittedAt),
            submittedAt: initialSubmittedAt
          }
        ]
      : []),
    ...progressEntries.map((entry) => ({
      key: entry.id,
      label: "Foto progress",
      date: entry.entry_date,
      submittedAt: entry.submitted_at
    }))
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Progress Post-Test</p>
          <p className="text-sm text-muted-foreground">
            {summary.totalSubmissions}/{summary.maxSubmissions} submission
          </p>
        </div>
        <Badge variant={summary.isComplete ? "success" : "secondary"}>
          {summary.isComplete ? "Selesai" : "Berjalan"}
        </Badge>
      </div>

      {timeline.length > 0 ? (
        <ol className="space-y-2">
          {timeline.map((item, index) => (
            <li
              key={item.key}
              className="flex items-start justify-between gap-3 rounded-2xl border bg-background px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-primary">
                  #{index + 1} {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tanggal WIB: {item.date}
                </p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {formatSubmittedAt(item.submittedAt)}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-2xl border border-dashed bg-background px-4 py-3 text-sm text-muted-foreground">
          Belum ada submission Post-Test.
        </p>
      )}

      {summary.isComplete ? (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Kamu sudah menyelesaikan 14 kali submission Post-Test. Terima kasih!
        </p>
      ) : summary.canSubmitToday ? (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Hari ini (WIB) kamu belum mengirim. Unggah foto progress di bawah.
        </p>
      ) : (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          Kamu sudah mengirim hari ini. Kembali besok untuk submission berikutnya.
        </p>
      )}
    </div>
  );
}

function formatSubmittedAt(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}
