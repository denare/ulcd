# ULCD — UDOM Lecturers Contact Directory

UniConnect helps students find published UDOM lecturer profiles by name, course code, or department. Public access does not require an account. Contact details are shown only when they have been verified and explicitly published.

## What is included

- Responsive public directory, lecturer profiles, department pages, and course pages.
- Supabase-backed search, authentication, and administrative CRUD screens.
- Contact verification/publication workflow and public correction reports.
- CSV import validation and an import template at [`public/ulcd-import-template.csv`](./public/ulcd-import-template.csv).
- Ordered Supabase migrations, including RLS policies and public-safe RPC functions.
- CIVE programme/course catalogue seed data. No lecturer names or personal contact details are seeded.

The CIVE course list is directory search data, not a complete programme handbook. Course-to-lecturer assignments and contact records must be added by an authorized administrator and verified before publication.

## Local development

Requirements: Node.js 20 or later, npm, and a Supabase project.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set the Supabase project URL and public anon key:

   ```sh
   cp .env.example .env.local
   ```

   These are browser-visible public credentials. Never put a Supabase service-role key in this Vite application.

3. Apply the files in `supabase/migrations/` in filename order. With the Supabase CLI installed, link the project and push the migrations:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   supabase secrets set SUBMISSION_HASH_SECRET=YOUR_LONG_RANDOM_SECRET
   supabase functions deploy submit-correction-report
   ```

   Alternatively, run each migration file in order using the Supabase SQL Editor.

4. Start the development server:

   ```sh
   npm run dev
   ```

## Create the first administrator

Create the administrator account using Supabase Authentication, then run this SQL in the Supabase SQL Editor. Replace the UUID with the Auth user's ID:

```sql
INSERT INTO public.admin_profiles (user_id, institution_id, role, is_active)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  institutions.id,
  'institution_admin',
  true
FROM public.institutions
WHERE slug = 'udom';
```

Only run this for an account whose identity and authority have been confirmed. The client does not contain a service-role key; database RLS is responsible for protecting administrative operations.

## CSV import

Use the header-only CSV template at `public/ulcd-import-template.csv`. The accepted columns are:

`title,first_name,middle_name,last_name,display_name,department_slug,mobile_phone,office_phone,email`

The import screen validates rows before submission. Imported profiles remain drafts, and imported contacts remain private and unverified. An administrator must confirm authorization/consent, verify the data, and publish it explicitly.

## Checks

```sh
npm run build
npm test
npm run lint
```

The project also declares Playwright scripts. End-to-end tests require a configured browser installation and, for database-backed journeys, a test Supabase project.

## Deployment

Deploy the Vite project to Vercel (or another static host) with the repository root as the project directory and the build command `npm run build`. Vercel should use `dist` as the output directory. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as deployment environment variables, then apply the Supabase migrations separately. The included [`vercel.json`](./vercel.json) rewrites client-side routes to `index.html`.

Configure the Supabase Auth site's production URL and allowed redirect URLs in the Supabase dashboard. The report Edge Function uses Supabase's server-side `SUPABASE_SERVICE_ROLE_KEY` and the `SUBMISSION_HASH_SECRET`; neither belongs in the Vite environment or browser. Do not treat successful frontend deployment as confirmation that a production database, report function, or administrator account has been configured.

## Current operational limits

- A live Supabase project and approved directory data are required for database-backed search and admin operations.
- Public correction reports require the deployed `submit-correction-report` Edge Function and its server-side fingerprint secret.
- The repository contains CIVE course seed data only; it deliberately contains no real lecturer contacts.
- No production deployment is claimed.
