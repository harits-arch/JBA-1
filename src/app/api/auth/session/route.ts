import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS
} from "@/lib/auth/constants";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing Firebase ID token." },
        { status: 400 }
      );
    }

    const firebaseAdminAuth = getFirebaseAdminAuth();
    const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, {
      expiresIn: AUTH_SESSION_MAX_AGE_SECONDS * 1000
    });

    const supabase = createSupabaseAdminClient();
    const phone = decodedToken.phone_number ?? null;
    const email = decodedToken.email ?? null;
    const authProfile = {
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {})
    };

    const { data: existingUser, error: readError } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", decodedToken.uid)
      .maybeSingle();

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    const { data: user, error: writeError } = existingUser
      ? await supabase
          .from("users")
          .update(authProfile)
          .eq("id", existingUser.id)
          .select("*")
          .single()
      : await supabase
          .from("users")
          .insert({
            firebase_uid: decodedToken.uid,
            role: "student",
            phone,
            email
          })
          .select("*")
          .single();

    if (writeError) {
      return NextResponse.json({ error: writeError.message }, { status: 500 });
    }

    (await cookies()).set(AUTH_SESSION_COOKIE, sessionCookie, {
      maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return NextResponse.json({
      user,
      nextPath: user.profile_completed ? "/class/register" : "/onboarding"
    });
  } catch (caughtError) {
    return NextResponse.json(
      {
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to create app session."
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  (await cookies()).delete(AUTH_SESSION_COOKIE);

  return NextResponse.json({ ok: true });
}
