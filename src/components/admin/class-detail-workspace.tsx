"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ParticipantRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  progress: "registered" | "pre-test" | "post-test";
};

export type GalleryItem = {
  id: string;
  name: string;
  phone: string | null;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
};

export type FeedbackItem = {
  id: string;
  name: string;
  likedMost: string | null;
  improvementFeedback: string | null;
  nextSteps: string | null;
  testimonial: string | null;
  trainerRatings: Array<{
    id: string;
    rating: number;
    trainerName: string;
    trainerRole: string;
  }>;
};

const progressLabels = {
  registered: "Registered",
  "pre-test": "Pre-Test Done",
  "post-test": "Post-Test Done"
};

export function ClassDetailWorkspace({
  participants,
  galleryItems,
  feedbackItems
}: {
  participants: ParticipantRow[];
  galleryItems: GalleryItem[];
  feedbackItems: FeedbackItem[];
}) {
  const [query, setQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");
  const [selectedGalleryItem, setSelectedGalleryItem] =
    useState<GalleryItem | null>(null);

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return participants.filter((participant) => {
      const matchesQuery =
        !normalizedQuery ||
        participant.name.toLowerCase().includes(normalizedQuery) ||
        participant.phone?.toLowerCase().includes(normalizedQuery) ||
        participant.email?.toLowerCase().includes(normalizedQuery);
      const matchesProgress =
        progressFilter === "all" || participant.progress === progressFilter;

      return matchesQuery && matchesProgress;
    });
  }, [participants, progressFilter, query]);

  return (
    <>
      <Tabs defaultValue="participants">
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            <TabsTrigger value="participants">Daftar Peserta</TabsTrigger>
            <TabsTrigger value="submissions">Galeri Tugas</TabsTrigger>
            <TabsTrigger value="feedback">Assessment & Feedback</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="participants">
          <Card className="border-accent/30 bg-white/90">
            <CardHeader>
              <CardTitle className="[font-family:var(--font-playfair)]">
                Daftar Peserta
              </CardTitle>
              <CardDescription>
                Cari peserta dan filter berdasarkan progress terbaru.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari nama, nomor WhatsApp, atau email"
                    className="pl-10"
                  />
                </div>
                <select
                  value={progressFilter}
                  onChange={(event) => setProgressFilter(event.target.value)}
                  className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">Semua Progress</option>
                  <option value="registered">Registered</option>
                  <option value="pre-test">Pre-Test Done</option>
                  <option value="post-test">Post-Test Done</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-3xl border">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="bg-primary text-primary-foreground">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Nama Siswa</th>
                      <th className="px-5 py-4 font-semibold">Nomor WhatsApp</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Status Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-secondary/40">
                          <td className="px-5 py-4 font-semibold text-primary">
                            {participant.name}
                          </td>
                          <td className="px-5 py-4">
                            {participant.phone ? (
                              <a
                                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                                href={`https://wa.me/${participant.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {participant.phone}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-5 py-4">{participant.email ?? "-"}</td>
                          <td className="px-5 py-4">
                            <ProgressBadge progress={participant.progress} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-10 text-center text-muted-foreground"
                        >
                          Tidak ada peserta yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {galleryItems.length > 0 ? (
              galleryItems.map((item) => (
                <Card key={item.id} className="border-accent/30 bg-white/90">
                  <CardHeader>
                    <CardTitle className="text-xl [font-family:var(--font-playfair)]">
                      {item.name}
                    </CardTitle>
                    <CardDescription>{item.phone ?? "Nomor belum tersedia"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PhotoComparison item={item} />
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => setSelectedGalleryItem(item)}
                    >
                      View Fullscreen
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyPanel label="Belum ada foto submission untuk kelas ini." />
            )}
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="space-y-5">
            {feedbackItems.length > 0 ? (
              feedbackItems.map((item) => (
                <Card key={item.id} className="border-accent/30 bg-white/90">
                  <CardHeader>
                    <CardTitle className="[font-family:var(--font-playfair)]">
                      {item.name}
                    </CardTitle>
                    <CardDescription>
                      Ringkasan rating trainer dan feedback student.
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
              ))
            ) : (
              <EmptyPanel label="Belum ada feedback Post-Test untuk kelas ini." />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(selectedGalleryItem)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGalleryItem(null);
          }
        }}
      >
        {selectedGalleryItem ? (
          <DialogContent onClose={() => setSelectedGalleryItem(null)}>
            <DialogHeader>
              <DialogTitle>{selectedGalleryItem.name}</DialogTitle>
              <DialogDescription>
                Perbandingan foto BEFORE dan AFTER dalam tampilan penuh.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5">
              <PhotoComparison item={selectedGalleryItem} large />
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}

function ProgressBadge({ progress }: { progress: ParticipantRow["progress"] }) {
  const variant = progress === "post-test" ? "success" : progress === "pre-test" ? "secondary" : "outline";

  return <Badge variant={variant}>{progressLabels[progress]}</Badge>;
}

function PhotoComparison({
  item,
  large = false
}: {
  item: GalleryItem;
  large?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PhotoFrame label="BEFORE" src={item.beforePhotoUrl} large={large} />
      <PhotoFrame label="AFTER" src={item.afterPhotoUrl} large={large} />
    </div>
  );
}

function PhotoFrame({
  label,
  src,
  large
}: {
  label: string;
  src: string | null;
  large: boolean;
}) {
  return (
    <div className="rounded-3xl border border-accent/50 bg-secondary/40 p-2">
      <div
        className={
          large
            ? "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white"
            : "relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-white"
        }
      >
        {src ? (
          // Signed Supabase URLs are already scoped and temporary.
          <img src={src} alt={`Foto ${label}`} className="h-full w-full object-cover" />
        ) : (
          <p className="px-3 text-center text-xs font-semibold text-muted-foreground">
            Foto {label} belum tersedia
          </p>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">
        {label}
      </p>
    </div>
  );
}

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
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value || "-"}</p>
    </div>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed bg-white/80 p-8 text-center text-muted-foreground md:col-span-2 xl:col-span-3">
      {label}
    </div>
  );
}
