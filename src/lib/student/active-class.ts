import { cookies } from "next/headers";

import {
  ACTIVE_CLASS_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS
} from "@/lib/auth/constants";
import {
  getStudentRegistrations,
  type StudentRegistrationWithClass
} from "@/lib/student/queries";

export async function getActiveClassIdFromCookie() {
  return (await cookies()).get(ACTIVE_CLASS_COOKIE)?.value ?? null;
}

export async function setActiveClassCookie(classId: string) {
  (await cookies()).set(ACTIVE_CLASS_COOKIE, classId, {
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function resolveStudentActiveRegistration(
  userId: string
): Promise<StudentRegistrationWithClass | null> {
  const registrations = await getStudentRegistrations(userId);

  if (registrations.length === 0) {
    return null;
  }

  const activeClassId = await getActiveClassIdFromCookie();

  if (activeClassId) {
    const matched = registrations.find(
      (registration) => registration.class_id === activeClassId
    );

    if (matched) {
      return matched;
    }
  }

  return registrations[0];
}
