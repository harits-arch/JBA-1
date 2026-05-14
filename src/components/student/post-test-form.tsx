"use client";

import type { FormEvent, ReactNode } from "react";
import { useActionState, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhotoSourceInput } from "@/components/student/photo-source-input";
import { Textarea } from "@/components/ui/textarea";
import { compressSubmissionPhoto } from "@/lib/student/compress-submission-photo";
import { submitPostTestAction } from "@/lib/student/actions";
import type { StudentFormState } from "@/lib/student/schema";
import type { Database } from "@/types/database";

type Trainer = Database["public"]["Tables"]["trainers"]["Row"];

const initialState: StudentFormState = {
  status: "idle"
};

export function PostTestForm({
  classId,
  trainers
}: {
  classId: string;
  trainers: Trainer[];
}) {
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [state, formAction] = useActionState(
    submitPostTestAction,
    initialState
  );
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const values = state.values ?? {};

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="classId" value={classId} />

      <QuestionSection
        title="Upload Foto AFTER"
        description="Unggah tampilan akhir terbaik setelah kelas. Gunakan foto wajah yang jelas tanpa filter."
      >
        <PhotoSourceInput name="afterPhoto" required />
      </QuestionSection>

      <QuestionSection
        title="Rating Trainer & Tim"
        description="Beri rating untuk setiap trainer atau anggota tim di kelas kamu."
      >
        <div className="space-y-4">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="rounded-2xl border bg-white p-4"
            >
              <div className="mb-3">
                <p className="font-semibold text-primary">{trainer.name}</p>
                <p className="text-sm text-muted-foreground">{trainer.role}</p>
              </div>
              <RatingGroup
                name={`trainerRating:${trainer.id}`}
                selectedValue={getStringValue(values, `trainerRating:${trainer.id}`)}
              />
            </div>
          ))}
        </div>
        <FieldError errors={state.fieldErrors?.trainerRatings} />
      </QuestionSection>

      <QuestionSection
        title="Pengalaman Kelas"
        description="Feedback kamu membantu JBA meningkatkan kelas berikutnya."
      >
        <Textarea
          name="likedMost"
          placeholder="Apa hal yang paling kamu suka dari kelas ini?"
          defaultValue={getStringValue(values, "likedMost")}
        />
        <FieldError errors={state.fieldErrors?.likedMost} />
        <Textarea
          name="improvementFeedback"
          placeholder="Apa yang bisa kami tingkatkan untuk kelas berikutnya?"
          defaultValue={getStringValue(values, "improvementFeedback")}
        />
        <FieldError errors={state.fieldErrors?.improvementFeedback} />
        <Textarea
          name="nextSteps"
          placeholder="Apa yang akan kamu lakukan setelah mengikuti kelas ini?"
          defaultValue={getStringValue(values, "nextSteps")}
        />
        <FieldError errors={state.fieldErrors?.nextSteps} />
      </QuestionSection>

      <QuestionSection
        title="Rekomendasi"
        description="Apakah kamu akan merekomendasikan kelas ini ke orang lain?"
      >
        <RadioGroup
          name="recommendation"
          selectedValue={getStringValue(values, "recommendation")}
          options={[
            { label: "Ya, tentu", value: "yes" },
            { label: "Mungkin", value: "maybe" },
            { label: "Tidak", value: "no" }
          ]}
        />
        <FieldError errors={state.fieldErrors?.recommendation} />
        <Textarea
          name="recommendationTarget"
          placeholder="Jika ya, kepada siapa kamu akan merekomendasikan kelas ini? (opsional)"
          defaultValue={getStringValue(values, "recommendationTarget")}
        />
      </QuestionSection>

      <QuestionSection
        title="Testimoni & Persetujuan"
        description="Bagikan testimoni singkat dan pilih apakah JBA boleh menggunakannya untuk branding."
      >
        <Textarea
          name="testimonial"
          placeholder="Tulis testimoni singkat tentang pengalaman kelas kamu."
          defaultValue={getStringValue(values, "testimonial")}
        />
        <FieldError errors={state.fieldErrors?.testimonial} />
        <RadioGroup
          name="contentConsent"
          selectedValue={getStringValue(values, "contentConsent")}
          options={[
            {
              label:
                "Ya, JBA boleh menggunakan foto dan testimoni saya untuk promosi",
              value: "yes"
            },
            {
              label: "Tidak, mohon jangan gunakan foto dan testimoni saya",
              value: "no"
            }
          ]}
        />
        <FieldError errors={state.fieldErrors?.contentConsent} />
      </QuestionSection>

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

      <SubmitButton busy={isSubmitPending || isCompressing} />
    </form>
  );
}

function QuestionSection({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-3xl border bg-background/70 p-4 sm:p-5">
      <div>
        <h2 className="font-semibold text-primary">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RatingGroup({
  name,
  selectedValue = ""
}: {
  name: string;
  selectedValue?: string;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Label
          key={rating}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border bg-background px-2 py-3 text-sm font-semibold"
        >
          <input
            name={name}
            type="radio"
            value={rating}
            defaultChecked={selectedValue === String(rating)}
            className="accent-primary"
          />
          {rating}
        </Label>
      ))}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  selectedValue = ""
}: {
  name: string;
  options: Array<{ label: string; value: string }>;
  selectedValue?: string;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <Label
          key={option.value}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-medium"
        >
          <input
            name={name}
            type="radio"
            value={option.value}
            defaultChecked={selectedValue === option.value}
            className="accent-primary"
          />
          {option.label}
        </Label>
      ))}
    </div>
  );
}

function SubmitButton({ busy }: { busy: boolean }) {
  return (
    <Button className="w-full" size="lg" disabled={busy}>
      {busy ? "Memproses..." : "Kirim Post-Test"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

function getStringValue(
  values: Record<string, string | string[]>,
  key: string
) {
  const value = values[key];

  return typeof value === "string" ? value : "";
}
