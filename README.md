# JBA Student Portal

Digital student portal for Jakarta Beauty Academy B2B grooming classes.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS and shadcn/ui-style components
- Fonnte WhatsApp OTP for first registration
- Phone number + password login after verification
- Supabase PostgreSQL and private Storage for class data and before/after photos

## Local Setup

Install dependencies once a Node package manager is available:

```bash
npm install
npm run dev
```

Copy the environment template and fill in Fonnte and Supabase credentials:

```bash
cp .env.example .env.local
```

Apply the initial Supabase schema from `supabase/schema.sql`.

## Current Scaffold

- Branded landing page
- Fonnte WhatsApp OTP registration and password login
- HTTP-only signed session cookie for server-side route protection
- Supabase-backed profile onboarding
- Protected class registration with class-code locking
- Gender-specific pre-test forms with private BEFORE photo uploads
- Separate admin login at `/admin/login` with class creation, trainer
  assignment, post-test toggle, registered student viewer, and submission
  viewer
- Waiting area after pre-test submission
- Post-test form with AFTER photo upload, dynamic trainer ratings, feedback,
  recommendation, testimonial, and content consent
- Supabase browser/server/admin clients
- Initial database schema and storage bucket definition

## Fonnte OTP Auth Notes

Students use OTP only during first registration. After OTP verification, they
create a password and can log in with phone + password without spending another
OTP.

For local development, fill these values in `.env.local`:

```bash
AUTH_SECRET=
FONNTE_TOKEN=
FONNTE_BASE_URL=https://api.fonnte.com
```

`AUTH_SECRET` should be a long random string. `FONNTE_TOKEN` comes from the
Fonnte dashboard API token page.

## Admin Setup Notes

Admin pages use a separate login from students:

```text
URL: /admin/login
Username: admin
Password: 2026
```

The admin dashboard currently supports:

- Creating classes with manual or generated class codes
- Viewing class status, student counts, and submission counts
- Opening or closing post-test access per class
- Adding/removing trainers, MCs, and partner team members per class
- Viewing registered students for a class
- Viewing pre-test and post-test submissions with signed BEFORE/AFTER photo
  links

## Student Flow Notes

Students must register with WhatsApp OTP, create a password, and complete
onboarding before class registration. The class registration page accepts
active/draft `class_code` values from Supabase and locks the student into their
first class registration.

The pre-test page renders fields from the student's `users.gender`:

- Female students answer grooming frequency, activities, expectations,
  obstacles, mandatory commitments, and upload a BEFORE photo.
- Male students answer grooming frequency, grooming habits, expectations,
  obstacles, mandatory commitments, skin type, social media willingness,
  upload timeline, and upload a BEFORE photo.

BEFORE photos are uploaded to the private `submission-photos` bucket at:

```text
classes/{class_id}/students/{user_id}/before.{ext}
```

Post-test access is controlled by the class admin toggle. When open, students
upload an AFTER photo, rate every assigned trainer/team member, submit feedback,
choose a recommendation, write a testimonial, and select content consent.

AFTER photos are uploaded to:

```text
classes/{class_id}/students/{user_id}/after.{ext}
```
