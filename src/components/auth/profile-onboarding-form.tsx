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
  const values = state.values ?? {};
  const selectedGender = values.gender || user?.gender || "";

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nama Lengkap</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Nama lengkap kamu"
          defaultValue={values.fullName ?? user?.full_name ?? ""}
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
          defaultValue={values.email ?? user?.email ?? ""}
          autoComplete="email"
        />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div className="space-y-2">
        <Label>Jenis Kelamin</Label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border bg-background px-4 py-3 text-sm font-medium">
            <input
              name="gender"
              type="radio"
              value="female"
              defaultChecked={selectedGender === "female"}
              className="accent-primary"
            />
            Perempuan
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border bg-background px-4 py-3 text-sm font-medium">
            <input
              name="gender"
              type="radio"
              value="male"
              defaultChecked={selectedGender === "male"}
              className="accent-primary"
            />
            Laki-laki
          </label>
        </div>
        <FieldError errors={state.fieldErrors?.gender} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          defaultValue={values.dateOfBirth ?? user?.date_of_birth ?? ""}
          autoComplete="bday"
        />
        <FieldError errors={state.fieldErrors?.dateOfBirth} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="instagramUsername">Username Instagram</Label>
        <Input
          id="instagramUsername"
          name="instagramUsername"
          placeholder="@username"
          defaultValue={
            values.instagramUsername ??
            (user?.instagram_username ? `@${user.instagram_username}` : "")
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
      {pending ? "Menyimpan..." : "Lanjut"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
