"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  passwordLoginAction,
  sendRegistrationOtpAction,
  verifyOtpAndCreatePasswordAction,
  type AuthFormState
} from "@/lib/auth/login-actions";

const initialState: AuthFormState = {
  status: "idle"
};

export function PhoneOtpForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [otpState, sendOtpAction] = useActionState(
    sendRegistrationOtpAction,
    initialState
  );
  const [verifyState, verifyAction] = useActionState(
    verifyOtpAndCreatePasswordAction,
    initialState
  );
  const [loginState, loginAction] = useActionState(
    passwordLoginAction,
    initialState
  );
  const activeRegisterState =
    verifyState.message || verifyState.status !== "idle" ? verifyState : otpState;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 rounded-full bg-muted p-1">
        <button
          type="button"
          className={
            mode === "login"
              ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary"
              : "px-4 py-2 text-sm font-semibold text-muted-foreground"
          }
          onClick={() => setMode("login")}
        >
          Masuk
        </button>
        <button
          type="button"
          className={
            mode === "register"
              ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary"
              : "px-4 py-2 text-sm font-semibold text-muted-foreground"
          }
          onClick={() => setMode("register")}
        >
          Daftar
        </button>
      </div>

      {mode === "login" ? (
        <form action={loginAction} className="space-y-5">
          <PhoneField
            id="login-phone"
            defaultValue={loginState.values?.phone ?? ""}
          />
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="Password kamu"
              autoComplete="current-password"
              defaultValue={loginState.values?.password ?? ""}
            />
          </div>
          <FormMessage state={loginState} />
          <SubmitButton label="Masuk" pendingLabel="Sedang masuk..." />
        </form>
      ) : (
        <div className="space-y-5">
          {otpState.status === "otp-sent" ? (
            <form action={verifyAction} className="space-y-5">
              <input type="hidden" name="phone" value={otpState.phone} />
              <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                OTP dikirim ke {otpState.phone}. Buat password untuk login
                berikutnya tanpa OTP.
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-otp">Kode OTP</Label>
                <Input
                  id="register-otp"
                  name="otp"
                  placeholder="6 digit OTP"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  defaultValue={verifyState.values?.otp ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password Baru</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  defaultValue={verifyState.values?.password ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">
                  Konfirmasi Password
                </Label>
                <Input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  defaultValue={verifyState.values?.confirmPassword ?? ""}
                />
              </div>
              <FormMessage state={activeRegisterState} />
              <SubmitButton
                label="Verifikasi OTP & Buat Password"
                pendingLabel="Memverifikasi..."
              />
            </form>
          ) : (
            <form action={sendOtpAction} className="space-y-5">
              <PhoneField
                id="register-phone"
                defaultValue={activeRegisterState.values?.phone ?? ""}
              />
              <p className="text-xs leading-5 text-muted-foreground">
                OTP hanya dipakai untuk verifikasi awal. Setelah itu login cukup
                pakai nomor WhatsApp dan password.
              </p>
              <FormMessage state={activeRegisterState} />
              <SubmitButton
                label="Kirim OTP via WhatsApp"
                pendingLabel="Mengirim..."
              />
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function PhoneField({
  id,
  defaultValue = ""
}: {
  id: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Nomor WhatsApp</Label>
      <Input
        id={id}
        name="phone"
        placeholder="0812 3456 7890"
        inputMode="tel"
        autoComplete="tel"
        defaultValue={defaultValue}
      />
      <p className="text-xs leading-5 text-muted-foreground">
        Bisa pakai 0812..., 62812..., atau +62812....
      </p>
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function FormMessage({ state }: { state: AuthFormState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.status === "error"
          ? "rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          : "rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground"
      }
    >
      {state.message}
    </p>
  );
}
