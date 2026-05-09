import { Star } from "lucide-react";

import type { GlobalFeedbackItem } from "@/lib/admin/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= rating
              ? "h-4 w-4 fill-accent text-accent"
              : "h-4 w-4 text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

function FeedbackBlock({
  label,
  value
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value || "—"}</p>
    </div>
  );
}

export function GlobalFeedbackList({ items }: { items: GlobalFeedbackItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-white/80 p-10 text-center text-muted-foreground">
        Belum ada submission Post-Test dengan feedback.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <Card key={item.id} className="border-accent/30 bg-white/95">
          <CardHeader>
            <CardTitle className="[font-family:var(--font-playfair)]">
              {item.studentName}
            </CardTitle>
            <CardDescription>
              {item.classLabel} ·{" "}
              {new Date(item.submittedAt).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Rating Trainer
              </p>
              {item.trainerRatings.length > 0 ? (
                item.trainerRatings.map((rating) => (
                  <div
                    key={rating.id}
                    className="rounded-2xl border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-primary">
                          {rating.trainerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {rating.trainerRole}
                        </p>
                      </div>
                      <StarRating rating={rating.rating} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
                  Belum ada rating trainer.
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <FeedbackBlock label="Paling Disukai" value={item.likedMost} />
              <FeedbackBlock
                label="Saran Perbaikan"
                value={item.improvementFeedback}
              />
              <FeedbackBlock
                label="Langkah Berikutnya"
                value={item.nextSteps}
              />
              <FeedbackBlock label="Testimoni" value={item.testimonial} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
