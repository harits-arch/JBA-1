"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firebaseAuth } from "@/lib/firebase/client";

type AuthSessionResponse = {
  nextPath?: string;
  error?: string;
};

export function PhoneOtpForm() {
  const router = useRouter();
  const confirmationResult = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function getRecaptchaVerifier() {
    if (!recaptchaVerifier.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(
        firebaseAuth,
        "recaptcha-container",
        {
          size: "invisible"
        }
      );
    }

    return recaptchaVerifier.current;
  }

  async function handleSendOtp() {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      confirmationResult.current = await signInWithPhoneNumber(
        firebaseAuth,
        phone.trim(),
        getRecaptchaVerifier()
      );
      setStep("otp");
      setMessage("OTP sent. Please check your SMS or WhatsApp-linked phone.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!confirmationResult.current) {
      setError("Please request an OTP first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const credential = await confirmationResult.current.confirm(otp.trim());
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ idToken })
      });
      const payload = (await response.json()) as AuthSessionResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create app session.");
      }

      router.replace(payload.nextPath ?? "/onboarding");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div id="recaptcha-container" />

      {step === "phone" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp / Phone Number</Label>
            <Input
              id="phone"
              placeholder="+62 812 3456 7890"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Use international format, for example +6281234567890.
            </p>
          </div>
          <Button
            className="w-full"
            disabled={isLoading || phone.trim().length < 8}
            onClick={handleSendOtp}
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              placeholder="6-digit OTP"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={isLoading || otp.trim().length < 4}
            onClick={handleVerifyOtp}
          >
            {isLoading ? "Verifying..." : "Verify and Continue"}
          </Button>
          <Button
            className="w-full"
            disabled={isLoading}
            variant="ghost"
            onClick={() => setStep("phone")}
          >
            Change Phone Number
          </Button>
        </>
      )}

      {message ? (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
