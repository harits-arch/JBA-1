import type { Database } from "@/types/database";

export const POST_TEST_MAX_SUBMISSIONS = 14;
export const POST_TEST_MAX_PROGRESS_ENTRIES = POST_TEST_MAX_SUBMISSIONS - 1;

const WIB_TIME_ZONE = "Asia/Jakarta";

type PostTestRow = Database["public"]["Tables"]["post_test_submissions"]["Row"];
type ProgressRow =
  Database["public"]["Tables"]["post_test_progress_entries"]["Row"];

export function getWibEntryDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function getWibEntryDateFromIso(iso: string) {
  return getWibEntryDate(new Date(iso));
}

export type PostTestProgressSummary = {
  totalSubmissions: number;
  maxSubmissions: number;
  progressEntryCount: number;
  isComplete: boolean;
  canSubmitToday: boolean;
  todayEntryDate: string;
  submittedEntryDates: string[];
};

export function buildPostTestProgressSummary({
  initialSubmission,
  progressEntries,
  now = new Date()
}: {
  initialSubmission: PostTestRow | null;
  progressEntries: ProgressRow[];
  now?: Date;
}) {
  const todayEntryDate = getWibEntryDate(now);
  const submittedEntryDates = [
    ...(initialSubmission
      ? [getWibEntryDateFromIso(initialSubmission.submitted_at)]
      : []),
    ...progressEntries.map((entry) => entry.entry_date)
  ];
  const totalSubmissions =
    (initialSubmission ? 1 : 0) + progressEntries.length;
  const isComplete = totalSubmissions >= POST_TEST_MAX_SUBMISSIONS;
  const canSubmitToday =
    !isComplete && !submittedEntryDates.includes(todayEntryDate);

  return {
    totalSubmissions,
    maxSubmissions: POST_TEST_MAX_SUBMISSIONS,
    progressEntryCount: progressEntries.length,
    isComplete,
    canSubmitToday,
    todayEntryDate,
    submittedEntryDates
  } satisfies PostTestProgressSummary;
}
