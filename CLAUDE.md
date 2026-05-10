# Nicho Halloween Festival . CLAUDE.md

This is the project brief Claude reads at the start of every session. Read it before suggesting any change. Update it when scope changes.

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
| **Stack** | Next.js 14 (App Router) on Vercel. Neon Postgres. Clerk for auth. Stripe Checkout for payments. Resend for email. Tailwind CSS. TypeScript throughout. |
| **Payments** | Stripe Checkout (hosted). Site never touches card data. **Festival runs its own dedicated Stripe account in P&C's name**, separate from the school's Wix Payments setup which is used for everything else (school P&C general site, other school ticketing). Two parallel payment streams, both into the same P&C bank account, treasurer reconciles each separately. Confirmed with treasurer 6 May. |
| **Token model** | Physical tokens. Site sells bundles, customer gets plain confirmation email with order number. On the night, customer shows email at token booth, volunteer crosses off the printed list, hands over physical tokens. **No QR codes. No scanning. No event-night app.** |
| **POS at stalls** | Square, off-the-shelf. Reconciled by CSV after the event. **Do not build POS.** |
| **Silent auction** | Hybrid. Read-only showcase page on our site. Bidding lives on an external platform (TBD, evaluating 32auctions, Galabid, Trellis). Bidders click "Place a bid", open external platform in new tab. **Do not build bidding.** |
| **Aesthetic** | "Country Almanac" mood. Cream/forest/rust palette. IM Fell English SC display, Cormorant Garamond body, Special Elite mono. Real photography. **No purple gradients, no clip-art, no neon, no cartoon Halloween.** |
| **Roles** | One: `admin`. Public is unauthenticated. No volunteer role. No door check-in. |
| **Domain** | TBC. Probably `nichohalloween.com.au`. Buy through Vercel or Cloudflare. **Festival site is standalone, not hosted on or linked to the school's Wix site.** Confirmed with treasurer 6 May. |
| **Build window** | Five weeks of build + one buffer week. Ship by mid-June 2026 (faster than original plan because door check-in dropped). Iterate June to August. Sales open September. Event 24 October. |

If asked to change anything in this table, **stop and confirm** with the user before proceeding.

---

## 2a. Stack rationale (so future-you doesn't relitigate)

**This is a React app, built with Next.js 14 (App Router).** That word "Next.js" is React under the hood. We're not in HTML-and-jQuery territory.

The reasoning, recorded once, so we don't redo it:

- **Multi-user with auth, dynamic data, real money** is exactly the use case Next.js exists for. Plain HTML wouldn't carry it.
- **Server Components + Server Actions** mean components can talk to Postgres directly. No separate API server. Less code, fewer moving parts.
- **File-system routing** matches the mental model. `/admin/tasks/sponsorship` is `app/admin/tasks/sponsorship/page.tsx`. No router config.
- **Clerk + Stripe + Resend** all have first-class Next.js integrations. Webhooks are just `app/api/stripe/webhook/route.ts`. Five minutes of setup, not five hours.
- **Vercel deployment is `git push`.** Free tier covers this, edge network so it's fast in Sydney.
- **Claude Code's training data is rich on Next.js.** Suggestions will be high quality. SvelteKit, Remix, Astro all viable; Next.js wins on ecosystem depth.

**The mockup at `/mnt/user-data/outputs/nicho_mockup.html` is plain HTML on purpose.** It's a visual prototype, not the site. You rebuild each screen as a React component in Next.js, using the mockup as the design reference. Don't try to port the HTML file directly. Treat it like a Figma file.

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

```
Frontend:    Next.js 14 (App Router), TypeScript, Tailwind CSS
Backend:     Next.js API routes / Server Actions
Database:    Neon Postgres
ORM:         Drizzle (preferred) or Prisma
Auth:        Clerk
Payments:    Stripe Checkout + webhooks
Email:       Resend
File storage: Vercel Blob (for sponsor logos, attraction photos, auction item photos)
Deployment:  Vercel (auto-deploy from main branch)
Analytics:   Vercel Analytics (free tier)
CSV export:  json2csv or papaparse (for token orders printout)
```

Cost: under $20/year fixed + Stripe fees (1.75% + 30c per AU transaction).

---

## 5. Data model (seven tables)

Get this right and the rest is paint.

```typescript
users
  // Synced from Clerk. Single role: admin. Anyone authenticated is admin.
  id            uuid (Clerk user ID)
  email         text
  created_at    timestamptz

tasks
  id            uuid pk
  bucket        enum('sponsorship' | 'auction' | 'vendors' | 'attractions' | 'marketing' | 'build')
  title         text
  description   text
  owner_id      uuid fk -> users.id
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
```

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

```
/                              public homepage
/attractions                   public attractions list
/tokens                        public token bundles + buy flow (15% pre-purchase discount)
/auction                       public silent auction showcase (links out to 32auctions)
/sponsors                      public sponsor wall
/map                           public site map (downloadable PDF + visible inline)
/faq                           public FAQ
/checkout/success              post-Stripe success page (shows order number, mentions email)
/checkout/cancel               post-Stripe cancel page

/login                         Clerk login (public-accessible entry to admin)

/admin                         admin dashboard home (auth required)
/admin/tasks                   tasks board, all buckets
/admin/tasks/[bucket]          tasks board, single bucket
/admin/vendors                 vendors register
/admin/sponsors                sponsors register
/admin/auction                 auction items register
/admin/orders                  token orders list, with CSV export button

/api/stripe/webhook            Stripe webhook handler (POST)
/api/orders/export             returns CSV of all token orders (auth required)
```

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

Fonts (load via next/font):

```typescript
// IM Fell English SC for display headings
// Cormorant Garamond for body
// Special Elite for typewriter-style metadata, eyebrows, ticket numbers, dashboard data
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

Build in this order. Don't reorder without good reason. **5 weeks of build + buffer week. Ship by mid-June.**

### Week 1: Foundations
- [ ] Scaffold Next.js + TypeScript + Tailwind
- [ ] Connect Neon Postgres, set up Drizzle, run migrations
- [ ] Install Clerk, single admin role, create test users
- [ ] Install Stripe SDK, Resend SDK
- [ ] Set up `/login` route via Clerk
- [ ] Deploy to Vercel
- [ ] Define design tokens in Tailwind config, load fonts via next/font
- [ ] Write `globals.css` with palette and base styles
- **Goal**: log in, see "Hello {name}". Visual look right.

### Week 2: Public site
- [ ] Build homepage from mockup (`/`)
- [ ] Build attractions page (`/attractions`)
- [ ] Build auction showcase page (`/auction`) with mock data
- [ ] Build sponsors page (`/sponsors`)
- [ ] Build map page (`/map`) with downloadable PDF + visible inline
- [ ] Build FAQ page (`/faq`) with the lifted-and-refreshed FAQ list
- [ ] Mobile-responsive testing on real phones (iOS + Android)
- **Goal**: full public site looks like the mockup, mock data only.

### Week 3: Tickets + Stripe (HIGHEST RISK)
- [ ] Build tokens page (`/tokens`) with bundle cards
- [ ] Wire up "Buy" button to create Stripe Checkout session
- [ ] Build `/api/stripe/webhook` handler
  - [ ] Verify webhook signature
  - [ ] Insert into `token_orders` table
  - [ ] Generate sequential human-readable order number (NHF-0001 etc)
  - [ ] Send confirmation email via Resend with order number, name, bundle, event details
  - [ ] Log every webhook attempt for debugging
- [ ] Build `/checkout/success` and `/checkout/cancel` pages
- [ ] **Test end-to-end with real $1 transactions, multiple times**
- [ ] Build "resend confirmation email" admin button for failures
- **Goal**: real money flows in, real email arrives. Don't move on until rock-solid.

### Week 4: Admin dashboard shell
- [ ] Build `/admin` layout with sidebar navigation
- [ ] Build dashboard home with stat tiles, this-week tasks, sponsor pipeline (from mockup)
- [ ] Build tasks board for ONE bucket end-to-end (`/admin/tasks/sponsorship`)
  - [ ] List tasks
  - [ ] Create task
  - [ ] Edit task (inline)
  - [ ] Mark done (optimistic UI)
  - [ ] Delete task (with confirm)
- **Goal**: Tasks pattern proven. Other buckets clone from this.

### Week 5: Remaining registers
- [ ] Tasks for all six buckets
- [ ] Vendors register (`/admin/vendors`) - same CRUD pattern
- [ ] Sponsors register (`/admin/sponsors`) - same pattern + logo upload to Vercel Blob
- [ ] Auction items register (`/admin/auction`) - same pattern + photo upload + platform_listing_url
- [ ] Token orders list (`/admin/orders`) - search by name/email, **CSV export button** (this is what becomes the printed list on the night)
- [ ] Wire stat tiles on dashboard home to real counts
- **Goal**: full admin functionality, no placeholders.

### Buffer week (was Week 6, now buffer)
- [ ] Real photography uploaded
- [ ] Real sponsor logos
- [ ] Real auction items entered
- [ ] Copy edit pass
- [ ] Accessibility pass (keyboard nav, focus states, alt text, colour contrast)
- [ ] Security pass (auth on every admin route, webhook signature verification, no secrets in client code)
- [ ] P&C treasurer sign-off
- [ ] Soft launch announcement

---

## 9. Critical risks to mitigate during build

### Stripe webhook reliability
**The single biggest failure mode.** If a webhook fails, someone pays and gets no ticket.

- Verify webhook signatures on every request
- Log every webhook attempt to a `webhook_log` table (or at minimum, console + Vercel logs)
- Build idempotency: same `stripe_session_id` should never create duplicate orders
- Build admin "resend confirmation email" button that takes a Stripe session ID, looks up the order, resends the email
- Test failure modes deliberately (kill the webhook handler, then resend from Stripe dashboard)

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

- [ ] Domain name (probably `nichohalloween.com.au`)
- [ ] Email sender address (`tickets@...`, `hello@...`)
- [ ] Token equivalent dollar value at stalls (1 token = $1.00 implied from 100-pack-at-$100; confirm stall pricing aligns. E.g. inflatable = 4 tokens means $4 to enter.)
- [ ] Auction platform (evaluating 32auctions, Galabid, Trellis. Assigned to Gemma.)
- [ ] Social media links in homepage footer (Facebook, Instagram, others TBC). Need URLs from committee.

**Resolved:**
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

| File | Purpose |
|---|---|
| `/mnt/user-data/outputs/nicho_visual_direction.pdf` | Aesthetic direction, palette, typography rules, dos and don'ts |
| `/mnt/user-data/outputs/nicho_spec_v1.docx` | Full spec doc, working brief, decisions log |
| `/mnt/user-data/outputs/nicho_mockup.html` | **Visual source of truth.** All screens. Match this. |
| `/mnt/user-data/outputs/halloween_festival_plan.docx` | The committee's working plan, organised by workstream |
| `/mnt/user-data/uploads/Mix__Séance_Board___Halloween__1_.png` | The festival poster. The brief. |

---

✦ ✦ ✦

*If you are an instance of Claude reading this for the first time: hello. Read the mockup before suggesting any UI. Read the spec before suggesting any feature. The user is doing this in evenings and weekends alongside running her own company, so every line of code that ships saves her a Saturday.*
