"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateTrainerAction } from "@/lib/admin/actions";
import type { AdminFormState } from "@/lib/admin/schema";
import type { AdminClassListItem } from "@/lib/admin/queries";
import type { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];

const initialState: AdminFormState = {
  status: "idle"
};

export function EditTrainerForm({
  trainer,
  classes
}: {
  trainer: TrainerRow;
  classes: AdminClassListItem[];
}) {
  const [state, formAction] = useActionState(updateTrainerAction, initialState);
  const values = state.values ?? {};

  return (
    <form action={formAction} className="grid max-w-xl gap-5">
      <input type="hidden" name="trainerId" value={trainer.id} />

      <div className="space-y-2">
        <Label htmlFor="classId">Kelas</Label>
        <select
          id="classId"
          name="classId"
          defaultValue={values.classId ?? trainer.class_id}
          required
          className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.client_name} — {c.class_code}
            </option>
          ))}
        </select>
        <FieldError errors={state.fieldErrors?.classId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          name="name"
          defaultValue={values.name ?? trainer.name}
        />
        <FieldError errors={state.fieldErrors?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Peran</Label>
        <Input
          id="role"
          name="role"
          defaultValue={values.role ?? trainer.role}
        />
        <FieldError errors={state.fieldErrors?.role} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayOrder">Urutan tampil</Label>
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          min={0}
          defaultValue={
            values.displayOrder ?? String(trainer.display_order ?? 0)
          }
        />
        <FieldError errors={state.fieldErrors?.displayOrder} />
      </div>

      {state.message ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Button asChild variant="secondary" type="button">
          <Link href="/admin/trainers-database">Batal</Link>
        </Button>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
