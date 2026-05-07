import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { normalizePrivateKey, requiredEnv } from "@/lib/env";

export function getFirebaseAdminApp() {
  return getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: requiredEnv(
            "FIREBASE_PROJECT_ID",
            process.env.FIREBASE_PROJECT_ID
          ),
          clientEmail: requiredEnv(
            "FIREBASE_CLIENT_EMAIL",
            process.env.FIREBASE_CLIENT_EMAIL
          ),
          privateKey: requiredEnv(
            "FIREBASE_PRIVATE_KEY",
            normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
          )
        })
      });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
