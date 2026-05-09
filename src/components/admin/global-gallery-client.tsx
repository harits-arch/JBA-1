"use client";

import { useState } from "react";

import type { AdminGlobalGalleryRow } from "@/lib/admin/queries";
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

function PhotoFrame({
  label,
  src,
  large
}: {
  label: string;
  src: string | null;
  large?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#4A0E1C]/20 bg-secondary/40 p-2">
      <div
        className={
          large
            ? "relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white"
            : "relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-white"
        }
      >
        {src ? (
          <img
            src={src}
            alt={`Foto ${label}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="px-3 text-center text-xs font-semibold text-muted-foreground">
            Foto {label} belum tersedia
          </p>
        )}
      </div>
      <p className="mt-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.18em] text-primary">
        {label}
      </p>
    </div>
  );
}

function PhotoComparison({
  item,
  large
}: {
  item: AdminGlobalGalleryRow;
  large?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PhotoFrame label="Before" src={item.beforePhotoUrl} large={large} />
      <PhotoFrame label="After" src={item.afterPhotoUrl} large={large} />
    </div>
  );
}

export function GlobalGalleryClient({ rows }: { rows: AdminGlobalGalleryRow[] }) {
  const [selected, setSelected] = useState<AdminGlobalGalleryRow | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-white/80 p-10 text-center text-muted-foreground">
        Belum ada foto Before/After yang tersimpan.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border-accent/30 bg-white/95 shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg [font-family:var(--font-playfair)]">
                {item.studentName}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {item.classLabel}
                {item.phone ? ` · ${item.phone}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhotoComparison item={item} />
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setSelected(item)}
              >
                Lihat layar penuh
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        {selected ? (
          <DialogContent onClose={() => setSelected(null)}>
            <DialogHeader>
              <DialogTitle>{selected.studentName}</DialogTitle>
              <DialogDescription>{selected.classLabel}</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <PhotoComparison item={selected} large />
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
