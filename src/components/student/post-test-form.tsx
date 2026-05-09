"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [state, formAction] = useActionState(submitPostTestAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-6"
      encType="multipart/form-data"
    >
      <input type="hidden" name="classId" value={classId} />

      <QuestionSection
        title="Upload AFTER Photo"
        description="Upload your best final look after class. Use a clear face photo without filter."
      >
        <input
          name="afterPhoto"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
        />
        <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP. Max 5MB.</p>
      </QuestionSection>

      <QuestionSection
        title="Trainer & Team Rating"
        description="Rate every trainer or team member assigned to your class."
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
              <RatingGroup name={`trainerRating:${trainer.id}`} />
            </div>
          ))}
        </div>
        <FieldError errors={state.fieldErrors?.trainerRatings} />
      </QuestionSection>

      <QuestionSection
        title="Class Experience"
        description="Your feedback helps JBA improve future corporate classes."
      >
        <Textarea
          name="likedMost"
          placeholder="What did you like most from this class?"
        />
        <FieldError errors={state.fieldErrors?.likedMost} />
        <Textarea
          name="improvementFeedback"
          placeholder="What can we improve for future classes?"
        />
        <FieldError errors={state.fieldErrors?.improvementFeedback} />
        <Textarea
          name="nextSteps"
          placeholder="What will you do after following this class?"
        />
        <FieldError errors={state.fieldErrors?.nextSteps} />
      </QuestionSection>

      <QuestionSection
        title="Recommendation"
        description="Would you recommend this class to someone else?"
      >
        <RadioGroup
          name="recommendation"
          options={[
            { label: "Yes, definitely", value: "yes" },
            { label: "Maybe", value: "maybe" },
            { label: "No", value: "no" }
          ]}
        />
        <FieldError errors={state.fieldErrors?.recommendation} />
        <Textarea
          name="recommendationTarget"
          placeholder="If yes, who would you recommend this class to? (optional)"
        />
      </QuestionSection>

      <QuestionSection
        title="Testimonial & Consent"
        description="Share a short testimonial and choose whether JBA may use it for branding."
      >
        <Textarea
          name="testimonial"
          placeholder="Write a short testimonial about your class experience."
        />
        <FieldError errors={state.fieldErrors?.testimonial} />
        <RadioGroup
          name="contentConsent"
          options={[
            {
              label:
                "Yes, JBA may use my photos and testimonial for promotion",
              value: "yes"
            },
            {
              label: "No, please do not use my photos and testimonial",
              value: "no"
            }
          ]}
        />
        <FieldError errors={state.fieldErrors?.contentConsent} />
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

function RatingGroup({ name }: { name: string }) {
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
  options
}: {
  name: string;
  options: Array<{ label: string; value: string }>;
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
            className="accent-primary"
          />
          {option.label}
        </Label>
      ))}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size="lg" disabled={pending}>
      {pending ? "Submitting..." : "Submit Post-Test"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
