# JBA Student Portal

Digital student portal for Jakarta Beauty Academy B2B grooming classes.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS and shadcn/ui-style components
- Firebase Phone Auth for student OTP
- Supabase PostgreSQL and private Storage for class data and before/after photos

## Local Setup

Install dependencies once a Node package manager is available:

```bash
npm install
npm run dev
```

Copy the environment template and fill in Firebase and Supabase credentials:

```bash
cp .env.example .env.local
```

Apply the initial Supabase schema from `supabase/schema.sql`.

## Current Scaffold

- Branded landing page
- Firebase Phone OTP student login
- HTTP-only Firebase session cookie for server-side route protection
- Supabase-backed profile onboarding
- Protected class registration entry point
- Placeholder pre-test, waiting, and post-test pages
- Placeholder admin dashboard and class creation page
- Firebase client/admin helpers
- Supabase browser/server/admin clients
- Initial database schema and storage bucket definition

## Firebase Phone Auth Notes

Enable Phone authentication in the Firebase console, then add your local and
production domains to Firebase Authentication's authorized domains.

For local development, fill these values in `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Firebase's client SDK sends the SMS OTP. After verification, the app exchanges
the Firebase ID token for the `jba_session` HTTP-only cookie through
`/api/auth/session`.
