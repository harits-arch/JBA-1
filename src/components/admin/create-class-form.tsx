"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClassAction } from "@/lib/admin/actions";
import type { AdminFormState } from "@/lib/admin/schema";

const initialState: AdminFormState = {
  status: "idle"
};

export function CreateClassForm() {
  const [state, formAction] = useActionState(createClassAction, initialState);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name</Label>
        <Input id="clientName" name="clientName" placeholder="PT Super Spring" />
        <FieldError errors={state.fieldErrors?.clientName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="className">Class Name</Label>
        <Input
          id="className"
          name="className"
          placeholder="Personal Grooming Class"
        />
        <FieldError errors={state.fieldErrors?.className} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classCode">Class Code</Label>
        <Input id="classCode" name="classCode" placeholder="Auto-generated" />
        <p className="text-xs text-muted-foreground">
          Leave blank to generate a unique code.
        </p>
        <FieldError errors={state.fieldErrors?.classCode} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classDate">Class Date</Label>
        <Input id="classDate" name="classDate" type="date" />
        <FieldError errors={state.fieldErrors?.classDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue="active"
          className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        <FieldError errors={state.fieldErrors?.status} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="Jakarta" />
        <FieldError errors={state.fieldErrors?.location} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Room setup, session details, or operational notes"
        />
        <FieldError errors={state.fieldErrors?.notes} />
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
      {pending ? "Creating..." : "Create Class"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
