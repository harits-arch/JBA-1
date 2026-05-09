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
  const values = state.values ?? {};

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="clientName">Nama Client</Label>
        <Input
          id="clientName"
          name="clientName"
          placeholder="PT Super Spring"
          defaultValue={values.clientName ?? ""}
        />
        <FieldError errors={state.fieldErrors?.clientName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="className">Nama Kelas</Label>
        <Input
          id="className"
          name="className"
          placeholder="Personal Grooming Class"
          defaultValue={values.className ?? ""}
        />
        <FieldError errors={state.fieldErrors?.className} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classCode">Kode Kelas</Label>
        <Input
          id="classCode"
          name="classCode"
          placeholder="Otomatis dibuat"
          defaultValue={values.classCode ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Kosongkan untuk membuat kode unik otomatis.
        </p>
        <FieldError errors={state.fieldErrors?.classCode} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classDate">Tanggal Kelas</Label>
        <Input
          id="classDate"
          name="classDate"
          type="date"
          defaultValue={values.classDate ?? ""}
        />
        <FieldError errors={state.fieldErrors?.classDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={values.status ?? "active"}
          className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
          <option value="archived">Diarsipkan</option>
        </select>
        <FieldError errors={state.fieldErrors?.status} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Lokasi</Label>
        <Input
          id="location"
          name="location"
          placeholder="Jakarta"
          defaultValue={values.location ?? ""}
        />
        <FieldError errors={state.fieldErrors?.location} />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Setup ruangan, detail sesi, atau catatan operasional"
          defaultValue={values.notes ?? ""}
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
      {pending ? "Membuat..." : "Buat Kelas"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
