"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerForClassAction } from "@/lib/student/actions";
import type { StudentFormState } from "@/lib/student/schema";

const initialState: StudentFormState = {
  status: "idle"
};

export function ClassRegistrationForm() {
  const [state, formAction] = useActionState(
    registerForClassAction,
    initialState
  );
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="classCode">Kode Kelas</Label>
        <Input
          id="classCode"
          name="classCode"
          placeholder="UNIQLO2026"
          autoCapitalize="characters"
          defaultValue={typeof values.classCode === "string" ? values.classCode : ""}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Masukkan kode yang diberikan oleh JBA atau perusahaan kamu.
        </p>
        {state.fieldErrors?.classCode?.[0] ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.classCode[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending}>
      {pending ? "Menghubungkan..." : "Ikut Kelas"}
    </Button>
  );
}
