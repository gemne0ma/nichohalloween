# Session Handover. Last updated 12 August 2026

Read this at the start of the next session. It covers what's shipped, what's outstanding, and the state of the working environment.

**Current state: repo at commit `e7414fe`, working tree clean, production build passing on macOS.**

---

## Read this first. August 2026 status

Three months passed between the 11 May session and the 12 August one. Nothing was built in between. The August session was spent recovering the project, not extending it.

**What happened on 12 August:**

- The local working copy was found gutted. Every source file under `app/`, `db/`, `lib/` and `public/` was gone, leaving empty directories. The local `.git` had been stripped of its objects, refs and HEAD, so nothing was recoverable locally. Everything was timestamped 3 July 12:59, which reads as one bulk operation rather than hand deletion.
- The same event hit the parent `claude-projects/node_modules`, which is down to a single file across the whole tree. **The Neoma site in that folder still needs its own `npm install` and has not been checked.**
- The code was recovered by cloning `https://github.com/gemne0ma/nichohalloween.git` and restoring the working tree. `.env.local` survived locally and was preserved. Nothing was lost: the only local file not in the repo was `.env.local`, and the only tracked file that differed was `tsconfig.json`, by a single Windows CRLF line ending.
- The project moved from Windows to macOS, so `npm install` was re-run to get the right platform binaries. `@esbuild/win32-x64` is gone, replaced by `@esbuild/darwin-arm64`, plus `@img/sharp-darwin-arm64` and `@next/swc-darwin-arm64`.
- **`drizzle-kit push` now works from this machine.** The Windows esbuild binary was what blocked it. Known issue 4 in the May version of this file is resolved.

**One fix was needed to get the build green.** `claude-projects/node_modules/@types/yauzl` was left as an empty directory by the same deletion. TypeScript treats any folder under `@types` as an implicit type library, looks for `index.d.ts`, finds nothing, and fails the build with `Cannot find type definition file for 'yauzl'`. Removing the empty directory fixed it. If the error comes back after an `npm install` in the parent folder, that's the cause.

**The docs were corrected on 12 August**, because `CLAUDE.md` and this file both understated what was built and named the wrong Next.js version. Both now match the repo.

---

## Everything built to date

The full picture, verified against the repo on 12 August rather than carried over from memory.

**Public site.** Homepage with countdown and poster hero, attractions, tokens with live Stripe buy flow, auction showcase with mock lots, sponsors, FAQ as a native `<details>` accordion with scrapbook photos, checkout success and cancel. Mobile nav menu works. `/map` is still a 19-line placeholder.

**Payments.** Live and taking real money since May. `/api/checkout` creates the session, `/api/stripe/webhook` verifies the signature, writes the `token_orders` row, generates the sequential `NHF-0001` order number and sends the Resend confirmation. Admin can resend a confirmation from `/admin/orders`.

**Admin.** Dashboard home, tasks board across all six buckets with assignment, tags and filtering, plus vendors, sponsors, auction items, token orders with search and CSV export, and the R2 media library. Every register is real CRUD against Postgres.

**Auth.** Three layers, all of them load-bearing: `middleware.ts` for the `ADMIN_EMAILS` allowlist, `app/admin/layout.tsx` for the session check and user sync, and `requireAdmin()` at the top of every server action.

**Database.** Ten tables. The original seven plus `media`, `tags` and `task_tags`. Sponsor tiers are `gold | silver | bronze`; the old `pumpkin/goblin/witch/horseman` enum is long gone, whatever `HANDOFF_WEEK2.md` says.

---

## What got shipped in the 10-11 May session

### 1. Stripe payments pipeline (end-to-end, production)

The full payment flow is live and tested with real money:

- Stripe Checkout session created via `/api/checkout` (POST)
- Webhook at `/api/stripe/webhook` receives `checkout.session.completed`
- Webhook inserts into `token_orders` table, generates sequential order number (NHF-0001 etc)
- Confirmation email sent via Resend from `hello@nichohalloween.com.au`
- Success page at `/checkout/success` shows order number and order summary

**Key fix during session**: the Stripe webhook was pointed at `localhost:3000` (dev). Had to create a new webhook endpoint in the Stripe dashboard pointing at `https://nichohalloween.com.au/api/stripe/webhook` with the `checkout.session.completed` event, then update `STRIPE_WEBHOOK_SECRET` in Vercel env vars with the new signing secret.

**Another fix**: `STRIPE_SECRET_KEY` in Vercel had a leading `=` from copy-pasting the whole `.env.local` line. Deleted and re-added without the `=`.

### 2. Resend email domain verified

Domain `nichohalloween.com.au` verified in Resend. DKIM and SPF records added to Cloudflare DNS. Sender address is `Nicho Halloween Festival <hello@nichohalloween.com.au>`. Configured in `lib/email.ts`.

### 3. Favicon

Replaced the Vercel default. Custom ghost icon at `app/icon.png` (512x512, transparent background). Cropped from the original 1200x1200 poster ghost using Python PIL.

### 4. Mobile hero image

Created `public/Halloween-mobile.png`, a portrait crop of the desktop hero focused on the yellow-hat ghost. The homepage uses responsive background images:
- Mobile: `bg-[url('/Halloween-mobile.png')]`
- Desktop: `md:bg-[url('/Halloween.png')]`

### 5. Mobile hero layout reordering

The hero section elements display in different order on mobile vs desktop:
- **Mobile (DOM order)**: Plank > Date > Title > Meta > Countdown
- **Desktop (CSS order)**: Date(1) > Title(2) > Plank(3) > Meta(4) > Countdown(5)

This is controlled via `md:order-{n}` classes on each element. The section uses `justify-start pt-16` on mobile and `md:justify-center md:pt-8` on desktop.

**Current plank dimensions** (after multiple rounds of sizing):
- Mobile: `w-[clamp(340px,85vw,986px)] max-w-[92vw] h-[clamp(95px,28vw,448px)]`
- Desktop: `md:w-[clamp(314px,62vw,986px)] md:h-[clamp(134px,27vw,448px)]`

If the plank still looks off, the proportions to maintain are roughly 3:1 width-to-height.

### 6. Feature 1: Task assignment, tagging, and filtering

Full implementation of the task assignment and tagging system from `nicho_admin_brief_for_cowork.docx`.

**Schema changes** (already pushed to Neon via `drizzle-kit push`):
- `users` table: added `name` column (synced from Clerk)
- `tasks` table: added `assigned_to` column (FK to users)
- New `tags` table: `id`, `name`, `slug`, `color`, `created_at`
- New `task_tags` join table: `task_id`, `tag_id` (composite PK, cascade deletes)

**Seven tags seeded** (via `db/seed-tags.ts`, safe to re-run):
Vendors, Sponsors, Auction, Marketing, Logistics, Admin, Finance. Each has a colour from the site palette.

**User sync**: `lib/sync-user.ts` upserts the current Clerk user into the `users` table on every admin layout load. This means committee members auto-populate in assignee dropdowns the moment they visit any admin page. No manual user setup needed.

**Server actions** (`app/admin/tasks/actions.ts`):
- `createTask`: accepts `assignedTo` and `tagIds[]`, sets `ownerId` to current user
- `updateTask`: accepts `assignedTo` and `tagIds[]`, replaces tags via delete-and-reinsert
- Both send email notifications when assigning to someone other than yourself

**Queries** (`app/admin/queries.ts`):
- `getTasksByBucket`: joins users for assignee name, fetches tags via second query, returns enriched `TaskRow` type
- `getAdminUsers()`: returns all users for assignee dropdowns
- `getAllTags()`: returns all tags for tag pickers

**UI** (`app/admin/tasks/TaskBoard.tsx`):
- Filter bar: assignee dropdown + tag dropdown + clear filters button
- Create form: title, description, due date, assignee dropdown, tag checkboxes
- Edit form: same fields, pre-populated with current values
- Task rows: show tag pills (coloured) and assignee name
- Empty state message changes when filters are active

### 7. Task assignment email notifications

When a task is assigned to someone (create or edit), the assignee gets a branded email via Resend:
- Subject: "New task: {title}"
- Body: who assigned it, task title, workstream, due date
- Only fires when assigning to someone *other than yourself*
- Only fires when the assignee actually *changes* (re-saving without changing assignee won't spam)
- Fire-and-forget (errors logged, never block the task save)
- Email template in `lib/email.ts` (`sendTaskAssignment` function)

### 8. Sidebar homepage link

"Nicho Halloween Festival" text in the admin sidebar (both mobile and desktop) is now a link to `/` (the public homepage). Lets committee members jump out of admin to see the public site.

---

## Files changed this session

| File | What changed |
|---|---|
| `app/(public)/page.tsx` | Mobile hero: background image, layout reordering, plank sizing |
| `app/icon.png` | New favicon (512x512 ghost, transparent bg) |
| `public/Halloween-mobile.png` | New mobile hero crop |
| `db/schema.ts` | Added `name` to users, `assignedTo` to tasks, new `tags` + `taskTags` tables |
| `db/seed-tags.ts` | New file. Seeds 7 tags. Run with `npx tsx db/seed-tags.ts` |
| `lib/sync-user.ts` | New file. Upserts Clerk user on admin layout load |
| `lib/email.ts` | Added `sendTaskAssignment` function and email template |
| `app/admin/layout.tsx` | Calls `syncUser` on every admin page load |
| `app/admin/queries.ts` | Updated `getTasksByBucket` with joins, added `getAdminUsers`, `getAllTags` |
| `app/admin/tasks/actions.ts` | `createTask` and `updateTask` handle assignee + tags + email notifications |
| `app/admin/tasks/TaskBoard.tsx` | Full rewrite: assignee, tags, filters, tag pills |
| `app/admin/tasks/[bucket]/page.tsx` | Passes `adminUsers` and `allTags` to TaskBoard |
| `app/admin/components/AdminSidebar.tsx` | "Nicho Halloween Festival" links to `/` |
| `app/(public)/checkout/success/page.tsx` | Minor copy change ("We can't wait to see you!") |
| `lib/stripe.ts` | No changes, just read for reference |

---

## Feature 2: Photo and file uploads (Cloudflare R2). SHIPPED 11 May

This was listed as "queued next" in the May version of this file. It was built the same day, in commits `fab640c` and `c976eb5`. Two of the three priorities from `nicho_admin_brief_for_cowork.docx` are done.

**Built:**

- **Storage on Cloudflare R2** via the S3-compatible API (`@aws-sdk/client-s3`). Client and helpers in `lib/r2.ts`.
- **Presigned PUT uploads.** `/api/upload/presign` returns a URL valid for 10 minutes, the browser uploads direct to R2, then `/api/upload/save` writes the `media` row. Vercel's 4.5MB body limit never comes into it.
- **`media` table**, exactly as specced: filename, r2_key, file_type, file_size, uploaded_by, uploaded_at, festival_year, category, caption, alt_text.
- **Client-side EXIF stripping** in `app/admin/components/ImageUpload.tsx`, by redrawing the image to a canvas and re-exporting via `toBlob()`. GPS coordinates never leave the browser. PDFs skip this step.
- **Admin media library** at `/admin/media`, 313 lines in `MediaLibrary.tsx`. Filter by year and category, edit captions and alt text, download, delete.
- **Key structure** `{festivalYear}/{category}/{timestamp}-{filename}`, with the timestamp preventing collisions and filenames sanitised to lowercase alphanumerics.
- **25MB cap**, enforced client-side before the presigned URL is requested.

**Not built, and the only piece of this feature still outstanding:**

- **Public gallery page (`/gallery`).** A responsive grid of `media` rows with category `gallery`, filtered by festival year. It was the lowest of the three priorities and never started. There is no `/gallery` route.

**Quietly dropped:** auto-generated thumbnails for the library. The library renders full images through Next's `<Image>`, which is fine at current volume. Revisit if the library gets slow, not before.

---

## What's actually next

Nothing large is outstanding. The remaining work is content and polish, not features.

1. **Public gallery page** (`/gallery`), per above.
2. **Real `/map` page.** Blocked on someone producing the site map artwork. The page is a placeholder with no PDF and no download button.
3. **Auction platform decision.** Still open, and it now blocks the "Place a bid" buttons on `/auction`, which have nowhere to point. Assigned to Gemma.
4. **Real content.** Photography, sponsor logos, auction items. The upload tooling is built and waiting.
5. **Buffer-week passes** from `CLAUDE.md` section 8: copy edit, accessibility, security, treasurer sign-off, soft launch.

Sales open September. The event is 24 October.

---

## Known issues / things to check

1. **`middleware.ts` is deprecated in Next 16.** Every build prints a warning telling you to rename it to `proxy`. **Deliberately not doing this before the festival.** It gates admin auth, it works in production, and a deprecation warning is not a breakage. Revisit in November. This covers the rename only, not dependency updates in general. Full reasoning in `CLAUDE.md` section 2.
2. **Sandy's user record**: Sandy logged in before the `syncUser` code was deployed. She needs to visit any admin page once more to appear in assignee dropdowns. Unverified since May, and three months have passed, so she may well have visited by now. Check the assignee dropdown before chasing it.
3. **Plank sizing on mobile**: went through several rounds in May. Current values (85vw wide, 28vw tall) were never signed off by Gemma. Still unconfirmed.
4. **No drizzle migrations folder**: using `drizzle-kit push` (direct schema sync) rather than migration files. There is one hand-written `db/migrate-media.sql` from the R2 work. Fine at this scale, but if schema changes get more frequent, switch to `drizzle-kit generate` for versioned migrations.
5. **Parent `node_modules` is gutted.** `claude-projects/node_modules` has one file in the entire tree, from the same 3 July deletion. The Neoma site in that folder will not build until it gets its own `npm install`. Untouched so far except for removing the empty `@types/yauzl` directory that was breaking this project's build.
6. **The lockfile warning on every build.** Next detects both `claude-projects/package-lock.json` and this project's own, and picks the parent as the workspace root. Harmless, but it means the inferred root is wrong. Silenced by setting `turbopack.root` in `next.config.mjs` if it ever becomes annoying.
7. **14 npm vulnerabilities** (8 high) reported after the August `npm install`. Not triaged. Plain `npm audit fix` is worth a look before the site takes real traffic in September. `npm audit fix --force` bumps majors and should wait until after the festival.
8. **`nicho_admin_brief_for_cowork.docx` is not in the repo.** It's referenced throughout this file as the source for Features 1 and 2 but lives only in an old Cowork uploads folder. If the gallery page gets built from it, get a copy into the project root first.

---

## Decisions made this session

| Decision | Answer | Rationale |
|---|---|---|
| Tags: text array vs join table | **Join table** (`tags` + `task_tags`) | Rename tags, enforce vocabulary, query tag usage counts. 30 min more work, six years of cleaner data. |
| Image serving: Cloudflare Images vs Next.js Image | **Next.js Image pointing at R2** | Cloudflare Images is $5/month for a problem that doesn't exist at this scale. Revisit at 3000+ photos. |
| EXIF stripping: server-side vs client-side | **Client-side before upload** | Files go straight to R2 via presigned URL, so server never sees the raw file. Client-side stripping means GPS data never leaves the browser. |
| Task notification emails | **Fire-and-forget, only on assignee change, only to others** | Don't block task saves on email failures. Don't spam yourself. Don't spam on no-op edits. |

### Decisions made 12 August 2026

| Decision | Answer | Rationale |
|---|---|---|
| Recover from GitHub vs rebuild | **Clone and restore from `origin/main`** | The remote was intact and three commits ahead of what the docs described. Nothing local was worth keeping except `.env.local`. |
| Rename `middleware.ts` to `proxy.ts` for Next 16 | **No, not before 24 October** | It gates admin auth and works in production. A warning is not a breakage. Getting it wrong means locked-out admins or an exposed dashboard during ticket sales. Scoped to this rename only. `package.json` pins `^16.2.5`, so 16.x patch and minor updates remain fine. |
| Fix for the `yauzl` type error | **Delete the empty `@types/yauzl` directory** | It was deletion debris, not a real dependency. Cheaper and less invasive than adding an explicit `types` array to `tsconfig.json`. |

---

## Environment / deployment notes

- **Repo**: `https://github.com/gemne0ma/nichohalloween.git`, single `main` branch
- **Domain**: `nichohalloween.com.au` (live, Cloudflare DNS, Vercel hosting)
- **Stripe**: production keys in Vercel env vars. Webhook endpoint: `https://nichohalloween.com.au/api/stripe/webhook`
- **Resend**: domain verified, sending from `hello@nichohalloween.com.au`
- **Clerk**: `ADMIN_EMAILS` env var controls who gets admin access (comma-separated)
- **Cloudflare R2**: needs `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- **Deploy**: `git push` to main auto-deploys to Vercel
- **Database**: Neon Postgres, `ap-southeast-2` (Sydney). Connection string in `DATABASE_URL` env var.
- **Local machine**: macOS as of the August session, previously Windows. `.env.local` is gitignored and exists only on Gemma's machine. **It is not in the repo and not backed up anywhere.** If that file is lost, every key has to be reissued from Stripe, Clerk, Resend, Neon and Cloudflare.

---

## Git push commands (for Gemma's reference)

```
git add -A
git commit -m "your message here"
git push
```

No `&&` between commands. Gemma's terminal doesn't like chained commands.
