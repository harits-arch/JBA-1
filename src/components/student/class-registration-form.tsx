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

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="classCode">Class Code</Label>
        <Input
          id="classCode"
          name="classCode"
          placeholder="UNIQLO2026"
          autoCapitalize="characters"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Enter the code provided by JBA or your employer.
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
      {pending ? "Joining..." : "Join Class"}
    </Button>
  );
}
