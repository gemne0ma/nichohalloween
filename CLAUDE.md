# Nicho Halloween Festival . CLAUDE.md

This is the project brief Claude reads at the start of every session. Read it before suggesting any change. Update it when scope changes.

**Last verified against the repo: 12 August 2026**, at commit `e7414fe`. Sections 2, 4, 5, 6, 7, 8, 9, 11 and 13 were corrected that day, after a full read of `db/schema.ts`, `package.json`, the route tree and the git log. Where this file and the code disagree, the code is right. Say so and fix the file.

---

## 1. What this project is

A custom-built website for the **Nicho Halloween Festival**, an annual community fundraiser at Nicholson Street Public School in **Balmain East, Sydney**. The festival is in its **37th year in 2026**, runs **Saturday 24 October 2026, 3-7pm**, on the school grounds. Around 80 children attend the school; the festival pulls in the wider Inner West community. Raises ~$50,000 a year.

**Heritage matters.** This isn't a new festival looking for an identity. It's a beloved 36-year tradition getting an elevated visual refresh. The previous site (nicho.com.au/halloween2025) was on Wix, with purple/bats/moon clip-art aesthetic. The 2026 brand is a complete refresh: country, considered, golden-hour, ghosts in a field. **Country Almanac mood.** The new poster is the brief, not the old logo.

The site does **two jobs**:

1. **Public-facing**: marketing, sells token bundles via Stripe Checkout, showcases attractions, sponsors and silent auction lots.
2. **Admin dashboard**: lets the four committee members (Gemma + 3 co-leads) plan and run the event. Tasks, vendors, sponsors, auction items, token orders view with CSV export.

That's it. No event-night app, no QR scanning, no door check-in. On the night, a volunteer at the token booth has a printed list of orders and a stack of tokens. Pre-paid customers show their email, get crossed off, get tokens. Walk-ups pay via Square. **Anything beyond this is v2.**

---

## 2. Locked decisions (do not relitigate without explicit user permission)

| Decision | Locked answer |
|---|---|
| **Stack** | Next.js 16 (App Router) on Vercel. React 19. Neon Postgres. Clerk 7 for auth. Stripe Checkout for payments. Resend for email. Cloudflare R2 for file storage. Tailwind CSS 3. TypeScript throughout. |
| **Payments** | Stripe Checkout (hosted). Site never touches card data. **Festival runs its own dedicated Stripe account in P&C's name**, separate from the school's Wix Payments setup which is used for everything else (school P&C general site, other school ticketing). Two parallel payment streams, both into the same P&C bank account, treasurer reconciles each separately. Confirmed with treasurer 6 May. |
| **Token model** | Physical tokens. Site sells bundles, customer gets plain confirmation email with order number. On the night, customer shows email at token booth, volunteer crosses off the printed list, hands over physical tokens. **No QR codes. No scanning. No event-night app.** |
| **POS at stalls** | Square, off-the-shelf. Reconciled by CSV after the event. **Do not build POS.** |
| **Silent auction** | Hybrid. Read-only showcase page on our site. Bidding lives on an external platform (TBD, evaluating 32auctions, Galabid, Trellis). Bidders click "Place a bid", open external platform in new tab. **Do not build bidding.** |
| **Aesthetic** | "Country Almanac" mood. Cream/forest/rust palette. IM Fell English SC display, Cormorant Garamond body, Special Elite mono. Real photography. **No purple gradients, no clip-art, no neon, no cartoon Halloween.** |
| **Roles** | One: `admin`. Public is unauthenticated. No volunteer role. No door check-in. |
| **Domain** | TBC. Probably `nichohalloween.com.au`. Buy through Vercel or Cloudflare. **Festival site is standalone, not hosted on or linked to the school's Wix site.** Confirmed with treasurer 6 May. |
| **Build window** | Five weeks of build + one buffer week. Ship by mid-June 2026 (faster than original plan because door check-in dropped). Iterate June to August. Sales open September. Event 24 October. |

If asked to change anything in this table, **stop and confirm** with the user before proceeding.

**Version note (corrected 12 August 2026).** Earlier versions of this table said "Next.js 14". That was never true of the shipped code. Commit `10c96c7` on 7 May 2026 moved the project to Next.js 16, React 19 and Clerk 7, before any real feature work landed. `package.json` pins `next: ^16.2.5`, `react: ^19.2.6`, `@clerk/nextjs: ^7.3.2`. Trust `package.json`, not prose.

### `middleware.ts` is deprecated in Next 16. We are not renaming it before the festival.

Next 16 deprecated the `middleware` file convention in favour of `proxy`, and every build prints a warning about it. **Leave the rename until after 24 October 2026.**

The reasoning:

- `middleware.ts` is what gates every `/admin` route against the `ADMIN_EMAILS` allowlist. It works, it is deployed, it has been running in production since May.
- A deprecation warning is not a breakage. Next 16 still runs the file, and the build output confirms it: `ƒ Proxy (Middleware)`.
- Renaming touches the auth path. The downside of getting it wrong is locked-out committee members or, worse, an exposed admin dashboard, during the weeks when sponsors and ticket buyers are actually using the site.
- There is no deadline pressure. The rename can happen in November alongside any other upkeep.

**This applies to the middleware-to-proxy rename specifically, not to dependencies generally.** `package.json` pins `next: ^16.2.5`, so patch and minor updates within 16.x are permitted and will be picked up by a plain `npm install`. Nothing here forbids that. What it forbids is renaming the auth entry point while the site is taking money.

If a future session offers to "fix the deprecation warning", say no and point at this section.

---

## 2a. Stack rationale (so future-you doesn't relitigate)

**This is a React app, built with Next.js 16 (App Router).** That word "Next.js" is React under the hood. We're not in HTML-and-jQuery territory.

The reasoning, recorded once, so we don't redo it:

- **Multi-user with auth, dynamic data, real money** is exactly the use case Next.js exists for. Plain HTML wouldn't carry it.
- **Server Components + Server Actions** mean components can talk to Postgres directly. No separate API server. Less code, fewer moving parts.
- **File-system routing** matches the mental model. `/admin/tasks/sponsorship` is `app/admin/tasks/sponsorship/page.tsx`. No router config.
- **Clerk + Stripe + Resend** all have first-class Next.js integrations. Webhooks are just `app/api/stripe/webhook/route.ts`. Five minutes of setup, not five hours.
- **Vercel deployment is `git push`.** Free tier covers this, edge network so it's fast in Sydney.
- **Claude Code's training data is rich on Next.js.** Suggestions will be high quality. SvelteKit, Remix, Astro all viable; Next.js wins on ecosystem depth.

**The mockup at `nicho_mockup.html` (project root) is plain HTML on purpose.** It's a visual prototype, not the site. You rebuild each screen as a React component in Next.js, using the mockup as the design reference. Don't try to port the HTML file directly. Treat it like a Figma file.

**Things to expect that will feel slightly weird at first**:

- **TypeScript everywhere.** It catches bugs but adds friction for the first week. Worth it because we're handling real money and a typed schema means you can't send dollars when you meant cents. Stick with it. Ask Claude Code to explain types when they're confusing.
- **Server vs Client Components.** Default is Server (runs on server, can hit the database). Add `"use client"` at the top of any file that uses `useState`, `useEffect`, `onClick`, or anything that needs the browser. Yes this is annoying for the first ten files. No there's no shortcut.
- **JSX, not HTML.** `class` becomes `className`, `for` becomes `htmlFor`, inline styles take an object. Otherwise it reads like HTML.

**Why not the alternatives** (recorded so we don't relitigate):

| Option | Why not |
|---|---|
| Plain HTML + jQuery | Wouldn't carry a multi-user dashboard. Public site alone might work; admin definitely wouldn't. |
| WordPress + plugins | Would technically work; developer experience would be miserable; doesn't suit vibe-coding in Claude Code. |
| Plain React + Vite + Express | More flexible, more separation, more code, more decisions. Next.js's opinionated structure saves weeks on a scoped project. |
| Remix / React Router v7 | Excellent alternative. Marginal call. Picked Next.js for ecosystem depth and Vercel ergonomics. |
| SvelteKit | Lovely framework, smaller ecosystem, Clerk support lags. More "stuck" moments likely. |
| Astro | Perfect for the public side, wrong shape for the dashboard. Two stacks or fight the framework. |
| No-code (Squarespace + Humanitix + Notion + Square) | Already considered and rejected by user; custom build is partly motivated by wanting to learn. |

If a future session suggests changing the framework, **stop and confirm with Gemma.** Mid-build framework changes are how 6-week projects become 16-week projects.

---

## 3. Out of scope (resist these)

These have been explicitly excluded from v1. If they come up mid-build, say no, log them in `IDEAS_V2.md`, and move on.

- Live Square POS integration. Reconcile by CSV.
- Custom-built silent auction bidding (accounts, bid placement, real-time updates, winner notifications, payment, item collection). Use Galabid/32auctions.
- **Door check-in / QR scanning / event-night app of any kind.** The token booth on the night uses a printed list, a pen, and a Square reader. Don't reintroduce this.
- Volunteer self-signup roster. Use a Google Sheet.
- Sponsor self-service portal.
- In-app messaging or comments.
- Mobile app. The site is mobile-responsive, that's enough.
- Real-time token balance tracking.
- Multi-event support. This site runs one festival, this year. 2027 is a fork.

---

## 4. Tech stack reference

These are the versions actually pinned in `package.json` as at 12 August 2026.

```
Frontend:    Next.js 16.2.5 (App Router), React 19.2.6, TypeScript 5, Tailwind CSS 3.4.17
Backend:     Next.js Route Handlers / Server Actions
Database:    Neon Postgres (ap-southeast-2, Sydney)
ORM:         Drizzle 0.36.4, drizzle-kit 0.28.1
Auth:        Clerk 7.3.2
Payments:    Stripe 17.4.0 (Checkout + webhooks)
Email:       Resend 4.1.0
File storage: Cloudflare R2, via @aws-sdk/client-s3 (S3-compatible API)
Deployment:  Vercel (auto-deploy from main branch)
CSV export:  Hand-rolled in the browser, no library
```

**File storage is Cloudflare R2, not Vercel Blob.** Decided 11 May, built the same day. Zero egress fees and Cloudflare already holds the DNS. Uploads go browser-direct to R2 via presigned PUT URLs, which sidesteps Vercel's 4.5MB serverless body limit. See `lib/r2.ts`.

**CSV export needs no library.** `json2csv` and `papaparse` were both considered and neither was installed. The orders export is about fifteen lines of string-joining in `app/admin/orders/OrdersList.tsx`, running in the browser off data already on the page. Don't add a dependency for this.

Cost: under $20/year fixed + Stripe fees (1.75% + 30c per AU transaction). R2 sits inside the free tier at this volume.

---

## 5. Data model (ten tables)

Get this right and the rest is paint.

The original seven are below, followed by the three added on 11 May 2026 (`media`, `tags`, `task_tags`). `db/schema.ts` is the source of truth.

```typescript
users
  // Synced from Clerk on every admin page load. See lib/sync-user.ts.
  // Single role: admin, gated by the ADMIN_EMAILS allowlist.
  id            text (Clerk user ID)
  email         text
  name          text        // display name, for assignee dropdowns. Added 11 May.
  created_at    timestamptz

tasks
  id            uuid pk
  bucket        enum('sponsorship' | 'auction' | 'vendors' | 'attractions' | 'marketing' | 'build')
  title         text
  description   text
  owner_id      uuid fk -> users.id     // who created it
  assigned_to   uuid fk -> users.id     // who has to do it. Added 11 May.
  due_date      date
  status        enum('todo' | 'in_progress' | 'blocked' | 'done')
  notes         text
  created_at    timestamptz
  updated_at    timestamptz

vendors
  id              uuid pk
  name            text
  contact_name    text
  email           text
  phone           text
  category        text
  quoted_amount   integer (cents)
  booked          boolean
  paid            boolean
  invoice_url     text
  notes           text
  created_at      timestamptz

sponsors
  id                  uuid pk
  business_name       text
  contact             text
  email               text
  tier                enum('gold' | 'silver' | 'bronze')
  committed_amount    integer (cents)
  paid_amount         integer (cents)
  logo_url            text
  thanked             boolean
  notes               text
  created_at          timestamptz

auction_items
  id                      uuid pk
  classroom               text
  item_name               text
  donor                   text
  estimated_value         integer (cents)
  photo_url               text
  status                  enum('pending' | 'received' | 'listed' | 'sold')
  platform_listing_url    text  // Galabid/32auctions URL
  current_high_bid        integer (cents, optional, cached)
  notes                   text
  created_at              timestamptz

token_orders
  id                      uuid pk
  stripe_session_id       text unique
  purchaser_email         text
  purchaser_name          text
  bundle_type             enum('BUNDLE_25' | 'BUNDLE_50' | 'BUNDLE_100' | 'BUNDLE_200')
  tokens_purchased        integer
  amount_paid             integer (cents)
  order_number            text  // human-readable, e.g. NHF-0247, generated sequentially. This is what appears on the email and the printed list.
  created_at              timestamptz
  // No redeemed_at, no redeemed_by_user_id. Event-night reconciliation is paper-based.

attractions
  // Mostly static, drives the public page
  id            uuid pk
  name          text
  description   text
  location      text
  image_url     text
  sponsor_id    uuid nullable fk -> sponsors.id

// ── Added 11 May 2026 ──

media
  // Every file uploaded to Cloudflare R2. See lib/r2.ts and app/admin/media/.
  id              uuid pk
  filename        text
  r2_key          text unique   // e.g. 2026/sponsor/1746950400-logo-acme.png
  file_type       text          // MIME type
  file_size       integer       // bytes
  uploaded_by     text fk -> users.id
  uploaded_at     timestamptz
  festival_year   integer       // e.g. 2026, so 2027 can filter cleanly
  category        enum('gallery' | 'sponsor' | 'auction' | 'vendor' | 'other')
  caption         text
  alt_text        text

tags
  // Controlled vocabulary for task categorisation. Seven seeded by db/seed-tags.ts.
  id            uuid pk
  name          text unique
  slug          text
  color         text          // hex from the site palette
  created_at    timestamptz

task_tags
  // Join table. Composite PK, cascade deletes both ways.
  task_id       uuid fk -> tasks.id
  tag_id        uuid fk -> tags.id
```

**Sponsor tiers are `gold | silver | bronze`.** The old `pumpkin/goblin/witch/horseman` enum was corrected in the database and in `db/schema.ts`. `HANDOFF_WEEK2.md` flags this as a critical outstanding bug. It is fixed. Ignore that entry.

Bundles are an enum, hardcoded in the app. **Do not make bundles configurable in v1.** Pricing carries a **15% pre-purchase discount** (the carrot to drive online sales) versus at-the-festival full price. The discount is baked into the displayed price; we don't show "was/now" pricing.

```typescript
// Token bundles. AT-FESTIVAL price is what families pay at the door (Square).
// PRE-PURCHASE price is what we charge online (15% less, the discount).
const BUNDLES = {
  BUNDLE_25:  { tokens: 25,  at_festival_cents: 2500,  pre_purchase_cents: 2125  },
  BUNDLE_50:  { tokens: 50,  at_festival_cents: 5000,  pre_purchase_cents: 4250  },
  BUNDLE_100: { tokens: 100, at_festival_cents: 10000, pre_purchase_cents: 8500  },
  BUNDLE_200: { tokens: 200, at_festival_cents: 20000, pre_purchase_cents: 17000 },
};
```

The website only sells at the pre-purchase price (no full-price online option). Square at the festival sells at full price.

---

## 6. Routes / page structure

Built and live unless marked otherwise. This list matches the `next build` route output as at 12 August 2026.

```
/                              public homepage                          BUILT
/attractions                   public attractions list                  BUILT
/tokens                        public token bundles + buy flow          BUILT
/auction                       public silent auction showcase           BUILT
/sponsors                      public sponsor wall                      BUILT
/faq                           public FAQ, native details/summary       BUILT
/map                           public site map                          PLACEHOLDER, awaiting the PDF
/checkout/success              post-Stripe success, shows order number  BUILT
/checkout/cancel               post-Stripe cancel                       BUILT

/sign-in                       Clerk sign-in (catch-all route)          BUILT
/sign-up                       Clerk sign-up (catch-all route)          BUILT
/unauthorised                  logged in but not on ADMIN_EMAILS        BUILT

/admin                         admin dashboard home                     BUILT
/admin/tasks                   tasks board, all buckets                 BUILT
/admin/tasks/[bucket]          tasks board, single bucket               BUILT
/admin/vendors                 vendors register                         BUILT
/admin/sponsors                sponsors register                        BUILT
/admin/auction                 auction items register                   BUILT
/admin/orders                  token orders, search + CSV export        BUILT
/admin/media                   R2 media library                         BUILT

/api/checkout                  creates the Stripe Checkout session      BUILT
/api/stripe/webhook            Stripe webhook handler (POST)            BUILT
/api/upload/presign            returns a presigned R2 PUT URL           BUILT
/api/upload/save               writes the media row after upload        BUILT
```

Two corrections to earlier versions of this list:

- **There is no `/login` route.** Clerk's sign-in lives at `/sign-in`.
- **There is no `/api/orders/export` route.** CSV export is a client-side function in `app/admin/orders/OrdersList.tsx` that builds the file from data already loaded on the page. Simpler, and it never needed to be a route.

Not built, and the only two public pages outstanding:

- **`/gallery`**, the public photo gallery reading `media` rows tagged `gallery` for a festival year. Third and lowest priority of the R2 work; the admin half shipped without it.
- **`/map`** proper. The page exists but is a 19-line placeholder with no PDF and no download button. Blocked on someone producing the actual site map.

---

## 7. Aesthetic system

**Don't use Tailwind defaults for typography or colours.** Override with the project palette.

```css
/* tailwind.config.ts colours */
paper:        '#F4EBD9'   // primary background
paper-deep:   '#E8DCC0'   // alternating rows, sidebar bg
bone:         '#EDE3CE'   // card background, secondary surface
ink:          '#1A1A1A'   // primary text, borders
ink-soft:     '#3A3A3A'   // secondary text
forest:       '#2D3A2E'   // primary accent, dark surfaces
forest-deep:  '#1F2A20'   // deepest forest
moss:         '#5A6B4F'   // muted text, dividers
rust:         '#B85C2E'   // accent, links, CTAs
rust-deep:    '#8B3F1F'   // hover states, eyebrows
pumpkin:      '#D87A3F'   // sparingly. final-resort accent
plum:         '#4A2942'   // for moments
mist:         '#A8AC9F'   // dotted dividers, subtle borders
```

Fonts. **The shipped fonts are not the ones originally specced.** IM Fell English SC, Cormorant Garamond and Special Elite were the early direction and were never used. What's actually loaded, self-hosted from `public/` via `next/font/local`:

```typescript
// TrenchSlab Variable  -> font-display. Headings, titles, big numbers.
// Alpino Variable      -> font-body and font-mono. Body text, plus eyebrows
//                         and metadata in uppercase with wide tracking.
// Telma Variable       -> font-telma. Accent italic, taglines.
```

**Hard rules**:
- No system sans (Inter, Roboto, Helvetica, Arial). Never. Even for "small text."
- No black backgrounds. The site is cream.
- No clip art. No cartoon ghosts/bats/witches/jack-o-lanterns.
- Real photography only. Phone snaps from past festivals are fine, stock photos are not.
- Generous whitespace.
- The mockup at `/mnt/user-data/outputs/nicho_mockup.html` is the visual source of truth. Match it.

---

## 8. Build sequence

**Status as at 12 August 2026: Weeks 1 to 5 are complete. The build is in the buffer/polish phase.**

The original plan ran five weeks plus a buffer, shipping mid-June. That happened, and then some. Everything below is checked off against the actual repo, not against memory. Two items were dropped or deferred and are marked as such.

The remaining work is the buffer-week list at the bottom, plus the two outstanding pages named in section 6 (`/gallery` and a real `/map`).

### Week 1: Foundations . DONE
- [x] Scaffold Next.js + TypeScript + Tailwind
- [x] Connect Neon Postgres, set up Drizzle, push schema
- [x] Install Clerk, single admin role via `ADMIN_EMAILS` allowlist
- [x] Install Stripe SDK, Resend SDK
- [x] Clerk auth routes at `/sign-in` and `/sign-up` (not `/login`)
- [x] Deploy to Vercel
- [x] Define design tokens in Tailwind config, load fonts via next/font/local
- [x] Write `globals.css` with palette and base styles
- **Goal met.** Note: fonts landed as TrenchSlab, Alpino and Telma, self-hosted from `public/`. The IM Fell / Cormorant / Special Elite trio named in section 7 was never used.

### Week 2: Public site . DONE, except the map
- [x] Build homepage from mockup (`/`), plus a long tail of mobile hero work
- [x] Build attractions page (`/attractions`)
- [x] Build auction showcase page (`/auction`) with mock data
- [x] Build sponsors page (`/sponsors`)
- [x] Build FAQ page (`/faq`), native `<details>`/`<summary>` accordion, scrapbook photos
- [x] Build tokens page (`/tokens`)
- [x] Mobile nav menu in `SiteNav`
- [ ] **Build map page (`/map`) with downloadable PDF.** Still a placeholder. Blocked on the artwork.
- **Goal met apart from the map.** Mobile testing on real devices happened for the homepage; the rest was checked in dev tools only.

**The tokens page has diverged from the mockup.** The mockup called for a dark forest panel with a roman-numeral explainer. What shipped is a ticket-stub design: perforated rust stubs, drop shadows, hover lift. Gemma's call, made while building.

Read the two sources for what they are. **The live site records what is built. The mockup records the original design intent.** Where they disagree, that is a live question for Gemma, not a bug to auto-fix. Raise it, don't silently reconcile it in either direction.

### Week 3: Tickets + Stripe (HIGHEST RISK) . DONE, live with real money
- [x] Build tokens page (`/tokens`) with bundle cards
- [x] Wire up "Buy" button to create Stripe Checkout session (`/api/checkout`)
- [x] Build `/api/stripe/webhook` handler
  - [x] Verify webhook signature
  - [x] Insert into `token_orders` table
  - [x] Generate sequential human-readable order number (NHF-0001 etc)
  - [x] Send confirmation email via Resend with order number, name, bundle, event details
  - [x] Log every webhook attempt for debugging
- [x] Build `/checkout/success` and `/checkout/cancel` pages
- [x] **Tested end-to-end with real transactions**
- [x] "Resend confirmation email" admin action (`resendConfirmationEmail` in `app/admin/orders/actions.ts`)
- **Goal met.** Production webhook points at `https://nichohalloween.com.au/api/stripe/webhook`. Sender is `hello@nichohalloween.com.au` on a verified Resend domain.

### Week 4: Admin dashboard shell . DONE
- [x] Build `/admin` layout with sidebar navigation
- [x] Build dashboard home with stat tiles and task buckets
- [x] Tasks board proven end-to-end: list, create, inline edit, mark done, delete
- **Goal met.** The pattern was then cloned across every other register.

### Week 5: Remaining registers . DONE
- [x] Tasks for all six buckets, at `/admin/tasks` and `/admin/tasks/[bucket]`
- [x] Vendors register (`/admin/vendors`)
- [x] Sponsors register (`/admin/sponsors`), logo upload via R2
- [x] Auction items register (`/admin/auction`), photo upload + `platform_listing_url`
- [x] Token orders list (`/admin/orders`), search + CSV export button
- [x] Media library (`/admin/media`), not in the original plan
- **Goal met.** Every register is real CRUD against Postgres, no placeholders.

### Beyond the original plan, shipped 11 May

- [x] **Task assignment, tagging and filtering.** `assigned_to` on tasks, `tags` + `task_tags` join tables, seven seeded tags, filter bar by assignee and tag, coloured tag pills.
- [x] **Task assignment emails.** Fires via Resend only when the assignee changes, and never when assigning to yourself. Fire-and-forget, so email failures can't block a save.
- [x] **Clerk user auto-sync.** `lib/sync-user.ts` upserts the current user on every admin page load, so committee members populate assignee dropdowns without manual setup.
- [x] **Cloudflare R2 uploads and media library.** Presigned PUT URLs so the browser uploads direct to R2, client-side EXIF stripping via canvas redraw, 25MB cap, `media` table, library with year and category filters, caption and alt-text editing, download and delete.

### Buffer week . IN PROGRESS, this is the remaining work
- [ ] Real photography uploaded
- [ ] Real sponsor logos
- [ ] Real auction items entered
- [ ] Public gallery page (`/gallery`), the last piece of the R2 work
- [ ] Real site map PDF, replacing the `/map` placeholder
- [ ] Copy edit pass
- [ ] Accessibility pass (keyboard nav, focus states, alt text, colour contrast)
- [ ] Security pass (auth on every admin route, webhook signature verification, no secrets in client code)
- [ ] P&C treasurer sign-off
- [ ] Soft launch announcement

---

## 9. Critical risks to mitigate during build

### Admin auth is three layers deep (build note, not a risk)

Worth knowing before touching any of it, because the layers look redundant and aren't:

1. **`middleware.ts`** runs `clerkMiddleware`, matches `/admin(.*)` and `/api/orders(.*)`, checks the signed-in email against `ADMIN_EMAILS`, and either redirects to `/unauthorised` or returns a 403 for API routes. The Stripe webhook is explicitly exempt because it authenticates by signature, not by session.
2. **`app/admin/layout.tsx`** calls `currentUser()` and redirects to `/sign-in` if absent. Also where `syncUser` runs.
3. **`requireAdmin()` in `lib/auth.ts`** is called at the top of every server action, because server actions can be invoked directly and must not trust that middleware ran.

Removing any one of these leaves a real hole. See also the `middleware.ts` note in section 2.

### Stripe webhook reliability
**The single biggest failure mode.** If a webhook fails, someone pays and gets no ticket.

- Verify webhook signatures on every request
- Log every webhook attempt to a `webhook_log` table (or at minimum, console + Vercel logs)
- Build idempotency: same `stripe_session_id` should never create duplicate orders
- Build admin "resend confirmation email" button that takes a Stripe session ID, looks up the order, resends the email
- Test failure modes deliberately (kill the webhook handler, then resend from Stripe dashboard)

### Gotcha: the Stripe webhook endpoint and the SDK are on different API versions

**This is deliberate. Do not "fix" it before the festival.**

- The live webhook endpoint in the Stripe dashboard is pinned to `2026-07-29.dahlia`.
- The SDK in `lib/stripe.ts` is pinned to `2025-02-24.acacia` (`stripe@17.7.0`).

The endpoint pin decides the shape of the event payload Stripe delivers, so the
webhook already receives Dahlia-shaped Checkout Sessions and reads them with
Acacia-generation types. That is safe here because **none of the fields we read
changed** across Basil, Clover or Dahlia: `id`, `metadata`, `amount_total`,
`customer_details.email`, `customer_details.name`, `custom_fields`. Checked
against the changelogs on 13 August 2026.

The Checkout fields that were removed in those releases are `shipping_details`
(Basil) and `currency_conversion` (Clover). We read neither.

**Bump in November, after the festival:** `stripe@22.5.0`, which pins
`2026-07-29.dahlia` and matches the endpoint. That is five majors in one jump,
so do it on its own with a real test purchase afterwards, not in a busy week.

**`ui_mode` enum values changed in Dahlia.** `hosted`, `embedded` and `custom`
were removed in favour of `hosted_page`, `embedded_page` and `elements`.
Setting an old value now fails the API call. Our `checkout.sessions.create`
never passes `ui_mode`, which is why this has not bitten us. **Do not copy
`ui_mode` from an older Stripe example or blog post.**

### Event-night operations
**With door check-in dropped, the failure mode shrinks dramatically. No app on the night.**

- Morning of the event: admin logs into dashboard, hits "Export CSV" on `/admin/orders`, prints it
- Token booth has: printed list, stack of physical tokens, pen, Square reader for walk-ups
- Pre-paid customer shows email, volunteer crosses off order number, hands over tokens
- Walk-up customer pays via Square, gets tokens directly
- Mitigation: print the list the morning of the event (not the day before, in case last-minute orders), bring a backup PDF on a phone

### Privacy
**We handle parents' email addresses and payment data, for an event with children.**

- Privacy policy page on the site
- Stripe handles PCI (we never touch card data)
- Order numbers are sequential and not sensitive (they appear on the printed list)
- Don't store data we don't need
- Purge `token_orders.purchaser_email` after event reconciliation if treasurer agrees

### Scope creep mid-build
**Every "wouldn't it be cool if..." costs a week.**

- If a new idea comes up, write it in `IDEAS_V2.md` and keep building
- The mockup is the spec. If something isn't in the mockup, it isn't in v1.

---

## 10. Working with Gemma (Claude-specific guidance)

Gemma is the user. She is the founder of Neoma, a Sydney AI capability and workforce reskilling consultancy. She is building this site herself in Claude Code, learning as she goes.

**Style preferences (apply throughout the codebase)**:

- **No em-dashes anywhere**. Replace with `.` for new sentences or `,` for continuations. This applies to comments, docs, copy, error messages, everything.
- **No AI-typical transition phrases**. No "Let's dive in", "Picture this", "It's worth noting", etc.
- **Direct, commercially sharp**. Skip fluff. Code comments explain *why*, not *what*.
- **Skeptical and accuracy-driven**. If something looks wrong in the data or design, flag it. Don't assume.
- **No consultant jargon**. Plain words.
- **Cite when claiming facts**. If recommending a library, version, or pattern based on something specific, link to docs.

**When she's vibe-coding**:

- Help her understand *why* a piece of code works, not just write it
- Suggest the simplest implementation first, then explain when more complexity might be needed
- Push back on premature abstraction (DRY principles, generic frameworks, etc.). Most of this codebase will only run once, on one festival.
- Surface tradeoffs honestly. "This works but is fragile because X" is more useful than "looks good!"

**When she gets stuck**:

- First check if it's a scope problem (often is, refer back to "Out of scope")
- Then check if it's a missing decision (refer to "Decisions still to make" in spec)
- Only then check if it's a technical problem

---

## 11. Decisions still to make

Update this list as decisions land. Strike through, don't delete.

- [ ] Token equivalent dollar value at stalls (1 token = $1.00 implied from 100-pack-at-$100; confirm stall pricing aligns. E.g. inflatable = 4 tokens means $4 to enter.)
- [ ] Auction platform (evaluating 32auctions, Galabid, Trellis. Assigned to Gemma.) Still open, and it now blocks the "Place a bid" buttons on `/auction`, which have nowhere to point.
- [ ] Site map artwork, which blocks the `/map` page.

**Resolved:**
- ~~Domain name~~ Resolved. **`nichohalloween.com.au`**, live, Cloudflare DNS in front of Vercel hosting.
- ~~Email sender address~~ Resolved. **`hello@nichohalloween.com.au`**, domain verified in Resend with DKIM and SPF in Cloudflare DNS.
- ~~Social media links in footer~~ Resolved 10 May, shipped in commit `1f8366d`.
- ~~File storage provider~~ Resolved 11 May. **Cloudflare R2**, not Vercel Blob. Zero egress fees, and Cloudflare already holds the DNS.
- ~~Sponsor tier names~~ Resolved 8 May. **Gold / Silver / Bronze.** (Earlier drafts had Pumpkin/Goblin/Witch/Horseman and Platinum/Gold/Bronze. Gold/Silver/Bronze is confirmed.)
- ~~Token bundle structure~~ Resolved 6 May. Match the historical model: 25/50/100/200 packs with 15% pre-purchase discount.
- ~~Sponsor tier pricing~~ Suggested: Gold $6,600 / Silver $3,500 / Bronze $1,800 (based on 2025 actuals). Confirm with treasurer before sponsor outreach in June.
- ~~P&C treasurer name + Stripe access~~ Resolved 6 May. Festival runs its own Stripe account in P&C's name, alongside the school's existing Wix Payments. Treasurer happy with parallel payment streams.
- ~~Festival on Wix vs standalone domain~~ Resolved 6 May. Standalone domain, separate from school Wix.

---

## 12. FAQ content (lifted from existing site, refreshed for 2026)

This is the canonical FAQ list for the `/faq` page. Lifted and rewritten from the previous nicho.com.au/halloween2025 FAQs (which had been refined over 36 years of running the festival, so the *questions* are real). Tone: friendly, plain, no consultant jargon, no AI transition phrases. Match the rest of the site's writing voice.

```
Q: How do I get to Nicholson Street Public School?
A: We're at 23 Nicholson Street, Balmain East. The 442 bus runs from QVB to Balmain East
   Ferry Wharf. Ferries dock at Balmain East Wharf, then it's a five-minute walk up to the
   school. Street parking is limited and timed. There's no light rail or train. Check the
   442 timetable and ferry services at transportnsw.info.

Q: What are tokens?
A: Tokens are how you pay for everything at the festival. Attractions, food, drinks, games,
   the lot. No cash exchanges hands at any stall. Most attractions cost 2 to 5 tokens. You
   buy tokens at the door (cash or card via Square), or pre-purchase online and save 15%.

Q: Why pre-purchase tokens online?
A: You save 15% off the festival-day price, and you skip the queue at the token booth.
   Pre-purchase closes at midnight on the day before the festival.

Q: How do I collect my pre-purchased tokens?
A: Bring your confirmation email to the Token Booth at the festival entrance on the day.
   We'll find your order, hand you the matching number of physical tokens, and you're off.
   Refunds are only available if the festival is cancelled. Tokens aren't redeemable for cash.

Q: Can I buy tokens on the day?
A: Yes. The Token Booth opens at 3pm and runs throughout the festival. Pay by cash or card.
   Day-of pricing is the full price (the 15% pre-purchase discount only applies online).

Q: Is the venue accessible?
A: Yes, the festival is an accessible event. Most attractions are stroller and wheelchair
   accessible. A small number sit at the top of stairs. The site map (download here)
   shows accessible routes.

Q: What if it rains?
A: The Nicho Halloween Festival is an all-weather event and has run every year except
   during COVID. In the unlikely event of cancellation we'll post on this site and on the
   school Facebook page.

Q: Are dogs welcome?
A: We love dogs but the festival isn't dog-friendly. Crowds, queues, and small children in
   costume aren't a great combination for most pets. Assistance dogs are always welcome.

Q: Will there be photography?
A: Yes, we'll have a photographer on site. By attending the festival you're consenting to
   incidental photography for festival promotion. If you'd prefer your child not be
   photographed, let a volunteer know on the day and we'll make a note.

Q: Are there food allergies catered for?
A: All food at the festival has allergen labelling. The kitchen handles common allergens
   (gluten, dairy, nuts) but cross-contamination is possible in a busy festival kitchen,
   so we can't guarantee allergen-free food. Bring backups for severe allergies.

Q: What's age-appropriate?
A: Most attractions are suitable from age 4 up. The Haunted House has gentle scares
   suitable for ages 5+. The 'Mini Monsters' zone is dedicated to under-5s with
   age-appropriate games and craft.

Q: What if my child gets lost?
A: We have a designated 'Lost & Found' tent (marked on the site map) staffed throughout
   the festival. Lost children are taken there immediately and announcements made over the
   PA. Brief your child to find a volunteer (we'll be in high-vis vests).

Q: Can I volunteer?
A: Yes please! Email volunteers@nichohalloween.com.au or sign up via the school P&C.
```

If a question comes up that isn't covered here, add it. The list is allowed to grow.

---

## 13. Reference files

Paths corrected 12 August 2026. These files live in the project root, not under `/mnt/user-data/`, which was a sandbox path from the original planning sessions and doesn't exist on Gemma's machine.

| File | Purpose |
|---|---|
| `nicho_mockup.html` | The original design intent, all screens. The live site records what is built. Where the two disagree, ask Gemma. |
| `nicho_spec_v1.docx` | Full spec doc, working brief, decisions log |
| `nicho_week1_build_prompts.docx` | The Week 1 build prompts, kept for reference |
| `SESSION_HANDOVER.md` | Running log of what shipped, session by session. **Read this one for current state.** |
| `HANDOFF_WEEK2.md` | Week 2 handoff, written 8 May. Historical. Its design-system tables are still useful. |
| `public/Halloween.png` | The festival poster, used as the homepage hero |

---

✦ ✦ ✦

*If you are an instance of Claude reading this for the first time: hello. Read the mockup before suggesting any UI. Read the spec before suggesting any feature. The user is doing this in evenings and weekends alongside running her own company, so every line of code that ships saves her a Saturday.*
