import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS
} from "@/lib/auth/constants";
import { requiredEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

export async function getBearerToken() {
  const authorization = (await headers()).get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export async function getCurrentUserFromBearerToken() {
  const userId = await getBearerToken();

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

export async function createAuthSession(userId: string) {
  const expiresAt = Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000;
  const token = signSession({ userId, expiresAt });

  (await cookies()).set(AUTH_SESSION_COOKIE, token, {
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function clearAuthSession() {
  (await cookies()).delete(AUTH_SESSION_COOKIE);
}

export async function getDecodedSessionToken() {
  const session = (await cookies()).get(AUTH_SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  return verifySession(session);
}

export async function getCurrentUserFromSession() {
  const session = await getDecodedSessionToken();

  if (!session) {
    return null;
  }

  return getUserById(session.userId);
}

export async function getUserById(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return user;
}

function signSession(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createSessionSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySession(token: string) {
  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = createSessionSignature(encodedPayload);
    const expected = Buffer.from(expectedSignature);
    const actual = Buffer.from(signature);

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionPayload;

    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function createSessionSignature(encodedPayload: string) {
  return createHmac("sha256", requiredEnv("AUTH_SECRET", process.env.AUTH_SECRET))
    .update(encodedPayload)
    .digest("base64url");
}
