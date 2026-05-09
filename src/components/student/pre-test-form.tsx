"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPreTestAction } from "@/lib/student/actions";
import type { StudentFormState } from "@/lib/student/schema";
import type { Gender } from "@/types/database";

const initialState: StudentFormState = {
  status: "idle"
};

const femaleGroomingFrequencies = [
  "Setiap hari",
  "2-3 kali seminggu",
  "Hanya untuk acara tertentu",
  "Hampir tidak pernah"
];

const maleGroomingFrequencies = [
  "Setiap hari",
  "Beberapa kali seminggu",
  "Hanya untuk meeting atau acara penting",
  "Jarang / tidak rutin"
];

const femaleActivities = [
  "Basic skincare",
  "Makeup ringan",
  "Full makeup",
  "Hair styling",
  "Tidak rutin"
];

const maleHabits = [
  "Basic skincare (face wash, sunscreen)",
  "Menata rambut",
  "Parfum / body care",
  "Merawat janggut atau kumis",
  "Tidak rutin"
];

const femaleObstacles = [
  "Tidak ada waktu",
  "Belum tahu teknik yang benar",
  "Belum punya produk yang cocok",
  "Malas / belum terbiasa",
  "Kurang percaya diri",
  "Bingung urutan produk",
  "Lainnya"
];

const maleObstacles = [
  "Tidak ada waktu",
  "Belum tahu cara yang benar",
  "Belum punya produk yang cocok",
  "Malas / belum terbiasa",
  "Belum merasa ini penting",
  "Bingung mulai dari mana",
  "Lainnya"
];

const maleSkinTypes = [
  "Bekas jerawat",
  "Mudah berjerawat",
  "Berminyak",
  "Kering",
  "Normal dan kusam"
];

export function PreTestForm({
  classId,
  gender
}: {
  classId: string;
  gender: Gender;
}) {
  const [state, formAction] = useActionState(submitPreTestAction, initialState);
  const isFemale = gender === "female";
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="classId" value={classId} />

      <QuestionSection
        title="Kebiasaan Grooming"
        description={
          isFemale
            ? "Ceritakan seberapa sering kamu makeup, menata rambut, atau merawat penampilan."
            : "Ceritakan seberapa sering kamu memperhatikan grooming."
        }
      >
        <RadioGroup
          name="groomingFrequency"
          required
          options={isFemale ? femaleGroomingFrequencies : maleGroomingFrequencies}
          selectedValue={getStringValue(values, "groomingFrequency")}
        />
        <FieldError errors={state.fieldErrors?.groomingFrequency} />
      </QuestionSection>

      <QuestionSection
        title={isFemale ? "Aktivitas" : "Rutinitas Grooming"}
        description="Pilih semua yang sesuai."
      >
        <CheckboxGroup
          name={isFemale ? "femaleActivities" : "maleHabits"}
          options={isFemale ? femaleActivities : maleHabits}
          selectedValues={getArrayValue(
            values,
            isFemale ? "femaleActivities" : "maleHabits"
          )}
        />
        <FieldError
          errors={
            isFemale ? state.fieldErrors?.femaleActivities : state.fieldErrors?.maleHabits
          }
        />
      </QuestionSection>

      <QuestionSection
        title={isFemale ? "Ekspektasi" : "Tujuan Mengikuti Kelas"}
        description="Ceritakan hal yang ingin kamu dapatkan dari kelas ini."
      >
        <Textarea
          name="expectations"
          required
          defaultValue={getStringValue(values, "expectations")}
          placeholder={
            isFemale
              ? "Contoh: lebih percaya diri, tampil profesional, bisa grooming sendiri..."
              : "Contoh: terlihat lebih profesional, lebih percaya diri, menunjang pekerjaan..."
          }
        />
        <FieldError errors={state.fieldErrors?.expectations} />
      </QuestionSection>

      <QuestionSection
        title="Kendala"
        description="Apa yang membuat grooming konsisten terasa sulit?"
      >
        <CheckboxGroup
          name="obstacles"
          options={isFemale ? femaleObstacles : maleObstacles}
          selectedValues={getArrayValue(values, "obstacles")}
        />
        <FieldError errors={state.fieldErrors?.obstacles} />
        <Textarea
          name="obstacleExplanation"
          required
          defaultValue={getStringValue(values, "obstacleExplanation")}
          placeholder="Jelaskan singkat kendala terbesar kamu."
        />
        <FieldError errors={state.fieldErrors?.obstacleExplanation} />
      </QuestionSection>

      {isFemale ? null : (
        <>
          <QuestionSection
            title="Assessment Kondisi Kulit"
            description="Ini membantu JBA menyesuaikan rekomendasi produk grooming."
          >
            <RadioGroup
              name="maleSkinType"
              options={maleSkinTypes}
              required
              selectedValue={getStringValue(values, "maleSkinType")}
            />
            <FieldError errors={state.fieldErrors?.maleSkinType} />
          </QuestionSection>

          <QuestionSection
            title="Tugas Media Sosial"
            description="Konfirmasi kesediaan dan timeline upload."
          >
            <RadioGroup
              name="maleSocialMediaWilling"
              required
              selectedValue={getStringValue(values, "maleSocialMediaWilling")}
              options={[
                { label: "Ya, saya bersedia posting", value: "yes" },
                { label: "Tidak bersedia", value: "no" }
              ]}
            />
            <FieldError errors={state.fieldErrors?.maleSocialMediaWilling} />
            <RadioGroup
              name="maleUploadTimeline"
              required
              selectedValue={getStringValue(values, "maleUploadTimeline")}
              options={[
                "Hari yang sama",
                "Maksimal 1 hari setelah kelas",
                "Maksimal 2 hari setelah kelas"
              ]}
            />
            <FieldError errors={state.fieldErrors?.maleUploadTimeline} />
          </QuestionSection>
        </>
      )}

      <QuestionSection
        title="Komitmen"
        description="Semua komitmen wajib disetujui sebelum mengikuti kelas."
      >
        <CheckboxGroup
          name="commitments"
          required
          selectedValues={getArrayValue(values, "commitments")}
          options={
            isFemale
              ? [
                  {
                    label: "Follow Instagram Jakarta Beauty Academy",
                    value: "follow-instagram"
                  },
                  {
                    label: "Kirim foto BEFORE tanpa makeup dan tanpa filter",
                    value: "before-photo"
                  },
                  {
                    label: "Hadir tepat waktu dan mengikuti kelas dengan serius",
                    value: "on-time"
                  }
                ]
              : [
                  {
                    label: "Follow Instagram Jakarta Beauty Academy",
                    value: "follow-instagram"
                  },
                  {
                    label: "Hadir tepat waktu dan mengikuti kelas dengan serius",
                    value: "on-time"
                  },
                  {
                    label: "Kirim foto BEFORE natural tanpa filter",
                    value: "before-photo"
                  },
                  {
                    label: "Mengikuti arahan selama sesi praktik",
                    value: "follow-directions"
                  }
                ]
          }
        />
      </QuestionSection>

      <QuestionSection
        title="Upload Foto BEFORE"
        description={
          isFemale
            ? "Unggah foto wajah dari depan yang jelas tanpa makeup dan tanpa filter."
            : "Unggah foto wajah natural dari depan yang jelas tanpa edit atau filter."
        }
      >
        <input
          name="beforePhoto"
          type="file"
          required
          accept="image/png,image/jpeg,image/webp"
          className="block w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
        />
        <p className="text-xs text-muted-foreground">JPG, PNG, atau WEBP. Maksimal 5MB.</p>
      </QuestionSection>

      {state.message ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
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

function RadioGroup({
  name,
  options,
  required = false,
  selectedValue = ""
}: {
  name: string;
  options: Array<string | { label: string; value: string }>;
  required?: boolean;
  selectedValue?: string;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const label = typeof option === "string" ? option : option.label;
        const value = typeof option === "string" ? option : option.value;

        return (
          <Label
            key={value}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-medium"
          >
            <input
              name={name}
              type="radio"
              value={value}
              required={required}
              defaultChecked={selectedValue === value}
              className="accent-primary"
            />
            {label}
          </Label>
        );
      })}
    </div>
  );
}

function CheckboxGroup({
  name,
  options,
  required = false,
  selectedValues = []
}: {
  name: string;
  options: Array<string | { label: string; value: string }>;
  required?: boolean;
  selectedValues?: string[];
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const label = typeof option === "string" ? option : option.label;
        const value = typeof option === "string" ? option : option.value;

        return (
          <Label
            key={value}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-medium"
          >
            <input
              name={name}
              type="checkbox"
              value={value}
              required={required}
              defaultChecked={selectedValues.includes(value)}
              className="accent-primary"
            />
            {label}
          </Label>
        );
      })}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size="lg" disabled={pending}>
      {pending ? "Mengirim..." : "Kirim Pre-Test"}
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

function getArrayValue(
  values: Record<string, string | string[]>,
  key: string
) {
  const value = values[key];

  return Array.isArray(value) ? value : [];
}
