"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completeProfileAction,
  type ProfileFormState
} from "@/lib/auth/actions";
import type { Database } from "@/types/database";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

const initialState: ProfileFormState = {
  status: "idle"
};

export function ProfileOnboardingForm({ user }: { user: UserRow | null }) {
  const [state, formAction] = useActionState(completeProfileAction, initialState);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Your full name"
          defaultValue={user?.full_name ?? ""}
          autoComplete="name"
        />
        <FieldError errors={state.fieldErrors?.fullName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          defaultValue={user?.email ?? ""}
          autoComplete="email"
        />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border bg-background px-4 py-3 text-sm font-medium">
            <input
              name="gender"
              type="radio"
              value="female"
              defaultChecked={user?.gender === "female"}
              className="accent-primary"
            />
            Female
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border bg-background px-4 py-3 text-sm font-medium">
            <input
              name="gender"
              type="radio"
              value="male"
              defaultChecked={user?.gender === "male"}
              className="accent-primary"
            />
            Male
          </label>
        </div>
        <FieldError errors={state.fieldErrors?.gender} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          defaultValue={user?.date_of_birth ?? ""}
          autoComplete="bday"
        />
        <FieldError errors={state.fieldErrors?.dateOfBirth} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="instagramUsername">Instagram Username</Label>
        <Input
          id="instagramUsername"
          name="instagramUsername"
          placeholder="@username"
          defaultValue={
            user?.instagram_username ? `@${user.instagram_username}` : ""
          }
        />
        <FieldError errors={state.fieldErrors?.instagramUsername} />
      </div>

      {state.message ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Saving..." : "Continue"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
