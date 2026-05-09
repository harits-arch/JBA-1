import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS
} from "@/lib/auth/constants";
import { requiredEnv } from "@/lib/env";

type AdminSessionPayload = {
  username: string;
  expiresAt: number;
};

const initialAdminUsername = "admin";
const initialAdminPassword = "2026";

export async function createAdminSession(username: string) {
  const expiresAt = Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000;
  const token = signAdminSession({ username, expiresAt });

  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin"
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession() {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  return verifyAdminSession(session);
}

export function verifyInitialAdminCredentials({
  username,
  password
}: {
  username: string;
  password: string;
}) {
  return username === initialAdminUsername && password === initialAdminPassword;
}

function signAdminSession(payload: AdminSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createAdminSessionSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyAdminSession(token: string) {
  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = createAdminSessionSignature(encodedPayload);
    const expected = Buffer.from(expectedSignature);
    const actual = Buffer.from(signature);

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as AdminSessionPayload;

    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function createAdminSessionSignature(encodedPayload: string) {
  return createHmac("sha256", requiredEnv("AUTH_SECRET", process.env.AUTH_SECRET))
    .update(`admin:${encodedPayload}`)
    .digest("base64url");
}
