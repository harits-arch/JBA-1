"use client";

import type { FormEvent } from "react";
import { useActionState, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { PhotoSourceInput } from "@/components/student/photo-source-input";
import { compressSubmissionPhoto } from "@/lib/student/compress-submission-photo";
import { submitPostTestProgressAction } from "@/lib/student/actions";
import type { StudentFormState } from "@/lib/student/schema";

const initialState: StudentFormState = {
  status: "idle"
};

export function PostTestProgressForm({ classId }: { classId: string }) {
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [state, formAction] = useActionState(
    submitPostTestProgressAction,
    initialState
  );
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientMessage(null);
    const formEl = event.currentTarget;
    setIsCompressing(true);
    try {
      const formData = new FormData(formEl);
      const raw = formData.get("afterPhoto");
      if (raw instanceof File && raw.size > 0) {
        try {
          const compressed = await compressSubmissionPhoto(raw);
          formData.set("afterPhoto", compressed);
        } catch {
          setClientMessage(
            "Gagal memproses foto. Coba gambar lain atau pastikan format JPG, PNG, atau WEBP."
          );
          return;
        }
      }
      startSubmitTransition(() => {
        formAction(formData);
      });
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="classId" value={classId} />

      <section className="space-y-3 rounded-3xl border bg-background/70 p-4 sm:p-5">
        <div>
          <h2 className="font-semibold text-primary">Foto Progress Hari Ini</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Unggah foto AFTER terbaru. Maksimal 1 kali per hari (WIB), total 14
            kali submission termasuk Post-Test awal.
          </p>
        </div>
        <PhotoSourceInput name="afterPhoto" required />
      </section>

      {clientMessage ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {clientMessage}
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" size="lg" disabled={isSubmitPending || isCompressing}>
        {isSubmitPending || isCompressing ? "Memproses..." : "Kirim Foto Progress"}
      </Button>
    </form>
  );
}
