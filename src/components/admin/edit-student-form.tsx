"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteStudentAdminAction,
  updateStudentAdminAction
} from "@/lib/admin/actions";
import type { AdminFormState } from "@/lib/admin/schema";
import type { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

const initialState: AdminFormState = {
  status: "idle"
};

export function EditStudentForm({ user }: { user: UserRow }) {
  const [state, formAction] = useActionState(updateStudentAdminAction, initialState);
  const values = state.values ?? {};

  return (
    <div className="space-y-8">
      <form action={formAction} className="grid gap-5 sm:grid-cols-2">
        <input type="hidden" name="userId" value={user.id} />

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Nama lengkap</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={values.fullName ?? user.full_name ?? ""}
          />
          <FieldError errors={state.fieldErrors?.fullName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={values.phone ?? user.phone ?? ""}
          />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={values.email ?? user.email ?? ""}
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            defaultValue={
              values.gender ?? user.gender ?? ""
            }
            className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">—</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          <FieldError errors={state.fieldErrors?.gender} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagramUsername">Instagram</Label>
          <Input
            id="instagramUsername"
            name="instagramUsername"
            defaultValue={
              values.instagramUsername ?? user.instagram_username ?? ""
            }
          />
          <FieldError errors={state.fieldErrors?.instagramUsername} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Tanggal lahir</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={
              values.dateOfBirth ?? user.date_of_birth ?? ""
            }
          />
          <FieldError errors={state.fieldErrors?.dateOfBirth} />
        </div>

        {state.message ? (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive sm:col-span-2">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <SubmitUpdateButton />
          <Button asChild variant="secondary" type="button">
            <Link href="/admin/students">Batal</Link>
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive">Zona bahaya</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Menghapus siswa akan menghapus registrasi, pre/post test, dan foto
          terkait (cascade).
        </p>
        <form
          action={deleteStudentAdminAction}
          className="mt-4"
          onSubmit={(e) => {
            if (
              !confirm(
                `Hapus akun siswa "${user.full_name ?? user.id}"? Tidak dapat dibatalkan.`
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="userId" value={user.id} />
          <DeleteSubmitButton />
        </form>
      </div>
    </div>
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
      {pending ? "Menghapus..." : "Hapus siswa"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}
