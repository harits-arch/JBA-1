"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteClassAction,
  updateClassAction
} from "@/lib/admin/actions";
import type { AdminFormState } from "@/lib/admin/schema";
import type { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];

const initialState: AdminFormState = {
  status: "idle"
};

export function EditClassForm({ classData }: { classData: ClassRow }) {
  const [state, formAction] = useActionState(updateClassAction, initialState);
  const values = state.values ?? {};

  return (
    <div className="space-y-8">
      <form action={formAction} className="grid gap-5 sm:grid-cols-2">
        <input type="hidden" name="classId" value={classData.id} />

        <div className="space-y-2">
          <Label htmlFor="clientName">Nama Client</Label>
          <Input
            id="clientName"
            name="clientName"
            defaultValue={values.clientName ?? classData.client_name}
          />
          <FieldError errors={state.fieldErrors?.clientName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="className">Nama Kelas</Label>
          <Input
            id="className"
            name="className"
            defaultValue={values.className ?? classData.class_name ?? ""}
          />
          <FieldError errors={state.fieldErrors?.className} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classCode">Kode Kelas</Label>
          <Input
            id="classCode"
            name="classCode"
            defaultValue={values.classCode ?? classData.class_code}
          />
          <FieldError errors={state.fieldErrors?.classCode} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="classDate">Tanggal Kelas</Label>
          <Input
            id="classDate"
            name="classDate"
            type="date"
            defaultValue={values.classDate ?? classData.class_date}
          />
          <FieldError errors={state.fieldErrors?.classDate} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={values.status ?? classData.status}
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
            defaultValue={values.location ?? classData.location ?? ""}
          />
          <FieldError errors={state.fieldErrors?.location} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={values.notes ?? classData.notes ?? ""}
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </div>

        {state.message ? (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive sm:col-span-2">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <SubmitUpdateButton />
          <Button asChild variant="secondary" type="button">
            <Link href={`/admin/classes/${classData.id}`}>Batal</Link>
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive">Zona bahaya</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Menghapus kelas akan menghapus data terkait (registrasi, submission,
          trainer) menurut aturan database.
        </p>
        <DeleteClassForm classId={classData.id} label={classData.client_name} />
      </div>
    </div>
  );
}

function DeleteClassForm({
  classId,
  label
}: {
  classId: string;
  label: string;
}) {
  return (
    <form
      action={deleteClassAction}
      className="mt-4"
      onSubmit={(e) => {
        if (
          !confirm(
            `Hapus kelas "${label}" beserta data terkait? Tindakan tidak dapat dibatalkan.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="classId" value={classId} />
      <DeleteSubmitButton />
    </form>
  );
}

function SubmitUpdateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan perubahan"}
    </Button>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Menghapus..." : "Hapus kelas"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
