import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies, headers } from "next/headers";

import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getBearerToken() {
  const authorization = (await headers()).get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export async function getCurrentUserFromBearerToken() {
  const token = await getBearerToken();

  if (!token) {
    return null;
  }

  const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);
  const supabase = createSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("firebase_uid", decodedToken.uid)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return user;
}

export async function getDecodedSessionToken() {
  const session = (await cookies()).get(AUTH_SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  return getFirebaseAdminAuth().verifySessionCookie(session, true);
}

export async function getCurrentUserFromSession() {
  const decodedToken = await getDecodedSessionToken();

  if (!decodedToken) {
    return null;
  }

  return getUserByDecodedToken(decodedToken);
}

export async function getUserByDecodedToken(decodedToken: DecodedIdToken) {
  const supabase = createSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("firebase_uid", decodedToken.uid)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return user;
}
