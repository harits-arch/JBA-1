"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTrainerAction } from "@/lib/admin/actions";
import type { AdminFormState } from "@/lib/admin/schema";

const initialState: AdminFormState = {
  status: "idle"
};

export function AddTrainerForm({ classId }: { classId: string }) {
  const [state, formAction] = useActionState(addTrainerAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_120px_auto]">
      <input type="hidden" name="classId" value={classId} />

      <div className="space-y-2">
        <Label htmlFor="trainer-name">Name</Label>
        <Input id="trainer-name" name="name" placeholder="Indra Kurniawan" />
        <FieldError errors={state.fieldErrors?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trainer-role">Role</Label>
        <Input id="trainer-role" name="role" placeholder="Makeup Artist" />
        <FieldError errors={state.fieldErrors?.role} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="display-order">Order</Label>
        <Input
          id="display-order"
          name="displayOrder"
          type="number"
          min="0"
          defaultValue="0"
        />
        <FieldError errors={state.fieldErrors?.displayOrder} />
      </div>

      <div className="flex items-end">
        <SubmitButton />
      </div>

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-sm text-emerald-700 sm:col-span-4"
              : "text-sm text-destructive sm:col-span-4"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending}>
      {pending ? "Adding..." : "Add"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
