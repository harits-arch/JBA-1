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
  "Every day",
  "2-3 times a week",
  "Only for certain events",
  "Almost never"
];

const maleGroomingFrequencies = [
  "Every day",
  "Several times a week",
  "Only for meetings or important events",
  "Rarely / not routine"
];

const femaleActivities = [
  "Basic skincare",
  "Light makeup",
  "Full makeup",
  "Hair styling",
  "Not routine"
];

const maleHabits = [
  "Basic skincare (face wash, sunscreen)",
  "Hair styling",
  "Perfume / body care",
  "Beard or moustache grooming",
  "Not routine"
];

const femaleObstacles = [
  "No time",
  "Do not know the right technique",
  "Do not have suitable products",
  "Lazy / not used to it",
  "Not confident",
  "Confused about product order",
  "Other"
];

const maleObstacles = [
  "No time",
  "Do not know the right way",
  "Do not have suitable products",
  "Lazy / not used to it",
  "Do not feel it is important",
  "Confused where to start",
  "Other"
];

const maleSkinTypes = [
  "Acne scars",
  "Acne-prone",
  "Oily",
  "Dry",
  "Normal and dull"
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

  return (
    <form
      action={formAction}
      className="space-y-6"
      encType="multipart/form-data"
    >
      <input type="hidden" name="classId" value={classId} />

      <QuestionSection
        title="Grooming Habit"
        description={
          isFemale
            ? "Tell us how often you do makeup, hair, or appearance grooming."
            : "Tell us how often you pay attention to grooming."
        }
      >
        <RadioGroup
          name="groomingFrequency"
          options={isFemale ? femaleGroomingFrequencies : maleGroomingFrequencies}
        />
        <FieldError errors={state.fieldErrors?.groomingFrequency} />
      </QuestionSection>

      <QuestionSection
        title={isFemale ? "Activities" : "Grooming Routine"}
        description="Choose all that apply."
      >
        <CheckboxGroup
          name={isFemale ? "femaleActivities" : "maleHabits"}
          options={isFemale ? femaleActivities : maleHabits}
        />
        <FieldError
          errors={
            isFemale ? state.fieldErrors?.femaleActivities : state.fieldErrors?.maleHabits
          }
        />
      </QuestionSection>

      <QuestionSection
        title={isFemale ? "Expectations" : "Goal for Joining"}
        description="Share what you hope to gain from this class."
      >
        <Textarea
          name="expectations"
          placeholder={
            isFemale
              ? "Example: feel more confident, look professional, do my own grooming..."
              : "Example: look more professional, increase confidence, support work..."
          }
        />
        <FieldError errors={state.fieldErrors?.expectations} />
      </QuestionSection>

      <QuestionSection
        title="Obstacles"
        description="What makes consistent grooming difficult for you?"
      >
        <CheckboxGroup
          name="obstacles"
          options={isFemale ? femaleObstacles : maleObstacles}
        />
        <FieldError errors={state.fieldErrors?.obstacles} />
        <Textarea
          name="obstacleExplanation"
          placeholder="Briefly describe your biggest obstacle."
        />
        <FieldError errors={state.fieldErrors?.obstacleExplanation} />
      </QuestionSection>

      {isFemale ? null : (
        <>
          <QuestionSection
            title="Skin Type Assessment"
            description="This helps JBA match grooming product recommendations."
          >
            <RadioGroup name="maleSkinType" options={maleSkinTypes} />
            <FieldError errors={state.fieldErrors?.maleSkinType} />
          </QuestionSection>

          <QuestionSection
            title="Social Media Task"
            description="Confirm your willingness and upload timeline."
          >
            <RadioGroup
              name="maleSocialMediaWilling"
              options={[
                { label: "Yes, I am willing to post", value: "yes" },
                { label: "No, I am not willing", value: "no" }
              ]}
            />
            <FieldError errors={state.fieldErrors?.maleSocialMediaWilling} />
            <RadioGroup
              name="maleUploadTimeline"
              options={[
                "Same day",
                "Maximum 1 day after class",
                "Maximum 2 days after class"
              ]}
            />
            <FieldError errors={state.fieldErrors?.maleUploadTimeline} />
          </QuestionSection>
        </>
      )}

      <QuestionSection
        title="Commitment"
        description="All commitments are mandatory before joining the class."
      >
        <CheckboxGroup
          name="commitments"
          options={
            isFemale
              ? [
                  {
                    label: "Follow Instagram Jakarta Beauty Academy",
                    value: "follow-instagram"
                  },
                  {
                    label: "Send a BEFORE photo without makeup and without filter",
                    value: "before-photo"
                  },
                  {
                    label: "Arrive on time and follow the class seriously",
                    value: "on-time"
                  }
                ]
              : [
                  {
                    label: "Follow Instagram Jakarta Beauty Academy",
                    value: "follow-instagram"
                  },
                  {
                    label: "Arrive on time and follow the class seriously",
                    value: "on-time"
                  },
                  {
                    label: "Send a natural BEFORE photo without filter",
                    value: "before-photo"
                  },
                  {
                    label: "Follow directions during the practice session",
                    value: "follow-directions"
                  }
                ]
          }
        />
      </QuestionSection>

      <QuestionSection
        title="Upload BEFORE Photo"
        description={
          isFemale
            ? "Upload a clear front-facing photo without makeup and without filter."
            : "Upload a clear natural front-facing photo without edit or filter."
        }
      >
        <input
          name="beforePhoto"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
        />
        <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP. Max 5MB.</p>
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
  options
}: {
  name: string;
  options: Array<string | { label: string; value: string }>;
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
  options
}: {
  name: string;
  options: Array<string | { label: string; value: string }>;
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
      {pending ? "Submitting..." : "Submit Pre-Test"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
