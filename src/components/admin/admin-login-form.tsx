"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminLoginAction,
  type AdminLoginFormState
} from "@/lib/admin/login-actions";

const initialState: AdminLoginFormState = {
  status: "idle"
};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLoginAction, initialState);
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          placeholder="Username admin"
          autoComplete="username"
          defaultValue={values.username ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
        />
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
      {pending ? "Sedang masuk..." : "Masuk Admin"}
    </Button>
  );
}
