# Nicho Halloween Festival. Week 2 Handoff

**Date:** 8 May 2026
**Purpose:** Complete context for the next Cowork session to pick up Week 2 (Public Site) without losing any ground.

Read `CLAUDE.md` first. It's the project bible. This doc supplements it with current build state and what's next.

---

## 1. What's done (Week 1 + partial Week 2)

### Infrastructure (all complete)
- Next.js project scaffolded with TypeScript + Tailwind
- Neon Postgres connected, Drizzle ORM configured, all 7 tables pushed
- Clerk auth installed, admin layout enforces auth via `currentUser()` in `app/admin/layout.tsx` (not middleware)
- Stripe SDK + Resend SDK installed (not wired yet, that's Week 3)
- Deployed to Vercel (auto-deploy from main)
- Local fonts loaded: TrenchSlab (display headings) and Alpino (body/mono) via `next/font/local`
- Telma font also loaded (used for tagline/accent italic)

### Admin dashboard (complete, ahead of schedule from Week 4)
- Full sidebar navigation with three sections (Overview, Workstreams, Registers)
- Dashboard home with stat tiles, 3 task buckets, 4 side cards
- All data hardcoded from the 2026 budget PDF and Steerco Meeting 1 wrap
- Task checkboxes are visual-only placeholders (no state). Real CRUD is Week 4.
- Sidebar links point to routes that don't exist yet. That's fine, they're Week 4-5.

### Public site (partially complete)
- **Homepage** `/` . DONE. Dark photo overlay treatment, light text on dark. Countdown component. Festival poster as background image (`/Halloween.png`).
- **Attractions** `/attractions` . JUST BUILT. 6 cards with gradient image placeholders, mockup layout. Needs Gemma's visual review.
- **Tokens** `/tokens` . Has real pricing from `lib/bundles.ts`. BUT the visual treatment doesn't match the mockup yet (mockup has dark forest panel, roman numeral explainer). Needs rebuild.
- **FAQ** `/faq` . All 13 questions with correct copy. BUT it's a flat list, not the accordion (`<details>/<summary>`) from the mockup. Needs rebuild.
- **Auction** `/auction` . Shell placeholder only. Needs full build from mockup.
- **Sponsors** `/sponsors` . Shell placeholder only. Needs full build from mockup.
- **Map** `/map` . Shell placeholder only. Needs full build from mockup.
- **Footer** (in `app/(public)/layout.tsx`). Basic. Mockup has a richer version with skull rule, title, meta, nav links, fine print on ink background.

---

## 2. What needs building (remaining Week 2 tasks)

Build these in order. The mockup at `nicho_mockup.html` in the project root is the visual source of truth for every page.

### 2a. Rebuild Tokens page to match mockup
The mockup tokens section has:
- Dark forest background panel (not cream like other sections)
- Section eyebrow in pumpkin: "Save 15% online"
- Title in bone: "Buy your tokens"
- Lede text in bone/muted
- 4 bundle cards on bone background with: big token number (display font), "TOKENS" label (mono), thin rule, price (display font), "at festival" price below
- 100-token bundle has "Most popular" badge and slight scale-up
- "How it works" explainer box below with roman numeral ordered list (i. ii. iii. iv. v.)
- Real pricing already exists in `lib/bundles.ts`

### 2b. Build Auction showcase page
The mockup has a SEPARATE SCREEN for auction (not just a section). Key elements:
- Same site nav but "Silent Auction" link is highlighted
- Hero header: eyebrow "Bidding open · closes Sunday 25 October at 9pm", title "The Silent Auction", subtitle
- Explainer box: italicised description + stats line (items count, raised so far, bidders)
- 6 sample auction lots in a 2-column grid. Each lot card has:
  - Image placeholder (colored gradient, 4:3 aspect)
  - "Hot lot" badge on one item (rust background)
  - Meta row: Lot number (left) + Classroom tag (right, bordered pill)
  - Title (display font)
  - Donor name (italic, moss)
  - Description
  - Bid row: Current bid amount (left, display font, forest) + Estimated value (right, italic)
  - "Place a bid" button (ink background, full width)
- "View all lots" CTA at bottom
- All data is mock. Bidding lives on external platform (TBD). "Place a bid" should eventually open new tab to external platform.

Sample lots from mockup:
1. Two Nights at Whale Beach (Kindergarten, Henderson Family, est $1,200)
2. Remedial Massage Package (Year 1, Balmain Wellness Co., est $450) . HOT LOT
3. Original Watercolour (Year 2, Esme Larkin, est $380)
4. Family Dinner for Six (Year 3, Trattoria di Mama, est $700)
5. Surfboard, hand-shaped (Year 4, Sea Shaper Studio, est $1,400)
6. Pottery Wheel Workshop (Year 5, Annandale Clay Works, est $320)

### 2c. Build Sponsors page
Mockup shows:
- Section eyebrow: "With thanks"
- Title: "Our Sponsors"
- Lede: "The festival exists because local businesses choose to back a small school. We are grateful for every one."
- Grid of sponsor logo tiles. Headline sponsor gets a 2-column, 2-row tile with rust border. Rest are regular 16:9 tiles with mist border.
- All placeholders for now. Real logos come later.

### 2d. Build Map page
Mockup shows:
- Eyebrow: "Find your way"
- Title: "The Festival Map"
- Lede about accessibility
- Bone-background card containing: 4:3 dashed placeholder area, "Download map PDF" CTA button
- Real map will be uploaded as PDF later and shown inline

### 2e. Rebuild FAQ as accordion
Current FAQ has correct copy but wrong visual treatment. Mockup uses:
- `<details>` / `<summary>` HTML elements (native accordion, no JS needed)
- Bone background on summary rows
- `+` indicator on right side, changes to `−` when open
- Hover state changes background to paper-deep
- Questions in display font, body text in body font
- Bordered top and bottom of the whole list, each item separated by ink border

### 2f. Upgrade footer
Current footer in `app/(public)/layout.tsx` is minimal. Mockup footer has:
- Ink (dark) background
- Skull rule: ☠ ☠ ☠ (rust colored, spaced)
- Festival title in display font (bone)
- Meta line: "37th year · Sat 24 October 2026 · 3 to 7pm · Nicholson Street Public School, Balmain East"
- Nav links row: FAQ, Map, Privacy, Contact P&C
- Fine print: "A community fundraiser by the Nicholson Street Public School, Balmain East P&C. Every dollar goes to the school."

### 2g. Final verification
- Every public page loads without error
- Nav highlights the correct link per page
- Mobile responsive check (at least test with browser dev tools)
- Consistent styling across all pages

---

## 3. Known bugs and issues to fix

### CRITICAL: Sponsor tier enum mismatch
The database schema in `db/schema.ts` line 30-35 still has the OLD sponsor tier enum:
```typescript
export const sponsorTierEnum = pgEnum("sponsor_tier", [
  "pumpkin", "goblin", "witch", "horseman",
]);
```
This needs to be changed to:
```typescript
export const sponsorTierEnum = pgEnum("sponsor_tier", [
  "gold", "silver", "bronze",
]);
```
**This requires a migration.** The enum was already pushed to Neon, so you'll need to either:
- Drop and recreate the enum (easiest since there's no real data yet), or
- Use `drizzle-kit push` with `--force` flag

The CLAUDE.md locked decisions table already says Gold/Silver/Bronze. The schema just wasn't updated.

### Homepage subtitle uses font-telma
The homepage subtitle line uses `font-telma` class. This works because Telma is loaded in `app/layout.tsx`. But `font-body` would be the standard for body text. The Telma usage is intentional for the tagline italic treatment, not a bug. Just be aware it exists.

### SiteNav has no mobile menu
The mobile menu button says "Menu" but doesn't do anything. It needs a slide-out or dropdown menu for mobile. Low priority for Week 2 but should be done before mobile testing.

### Attractions page: Willy Wonka apostrophe
Line 39 of attractions page uses `&apos;` in the data array string. This works in JSX output but is unusual for a data string. Should probably just be a regular apostrophe in the data, with JSX escaping only in the template.

---

## 4. File tree (current state)

```
nicho halloween/
├── CLAUDE.md                          # Project bible. Read first.
├── HANDOFF_WEEK2.md                   # This file
├── nicho_mockup.html                  # Visual source of truth (all screens)
├── package.json
├── tailwind.config.ts                 # Custom palette + font families
├── drizzle.config.ts
├── middleware.ts                       # Minimal Clerk middleware
├── tsconfig.json
├── next-env.d.ts
│
├── app/
│   ├── layout.tsx                     # Root layout. Loads TrenchSlab + Alpino + Telma fonts. ClerkProvider.
│   ├── globals.css                    # Base styles. Body font 22px Alpino. Headings TrenchSlab.
│   │
│   ├── (public)/                      # Route group for public pages
│   │   ├── layout.tsx                 # SiteNav + Footer wrapper
│   │   ├── page.tsx                   # Homepage (dark overlay, light text, countdown)
│   │   ├── attractions/page.tsx       # 6 cards, just built, needs review
│   │   ├── tokens/page.tsx            # Real pricing, needs visual rebuild
│   │   ├── auction/page.tsx           # Shell placeholder
│   │   ├── sponsors/page.tsx          # Shell placeholder
│   │   ├── map/page.tsx               # Shell placeholder
│   │   └── faq/page.tsx               # All 13 Qs, needs accordion rebuild
│   │
│   ├── admin/
│   │   ├── layout.tsx                 # Sidebar + main. Auth via currentUser().
│   │   ├── page.tsx                   # Full dashboard. Hardcoded data.
│   │   └── components/
│   │       ├── AdminSidebar.tsx       # Client component. Forest background.
│   │       └── DashboardCountdown.tsx # "X days to go" compact countdown.
│   │
│   ├── components/
│   │   ├── SiteNav.tsx                # Client component. Sticky nav. Active link highlighting.
│   │   └── Countdown.tsx              # Client component. Days/hours/mins/secs. Light-on-dark.
│   │
│   └── sign-in/[[...sign-in]]/page.tsx  # Clerk sign-in
│   └── sign-up/[[...sign-up]]/page.tsx  # Clerk sign-up
│
├── db/
│   ├── index.ts                       # Drizzle client connected to Neon
│   └── schema.ts                      # 7 tables. ⚠️ Sponsor tier enum needs migration (see bugs above)
│
├── lib/
│   ├── bundles.ts                     # Token bundle config with pricing (25/50/100/200)
│   ├── stripe.ts                      # Stripe client init (not wired yet)
│   └── resend.ts                      # Resend client init (not wired yet)
│
└── public/
    ├── Halloween.png                  # Festival poster photo (used as homepage background)
    ├── TrenchSlab_Complete/           # Display heading font (variable woff2)
    ├── Alpino_Complete/               # Body/mono font (variable woff2)
    └── Telma_Complete/                # Accent italic font (variable woff2)
```

---

## 5. Design system quick reference

### Colours (from `tailwind.config.ts`)
| Token | Hex | Use |
|---|---|---|
| paper | #F4EBD9 | Primary background |
| paper-deep | #E8DCC0 | Alternating rows, sidebar bg |
| bone | #EDE3CE | Card background, secondary surface |
| ink | #1A1A1A | Primary text, borders |
| ink-soft | #3A3A3A | Secondary text |
| forest | #2D3A2E | Primary accent, dark surfaces |
| forest-deep | #1F2A20 | Deepest dark (nav, footer) |
| moss | #5A6B4F | Muted text, dividers |
| rust | #B85C2E | Accent, links, CTAs |
| rust-deep | #8B3F1F | Hover states, eyebrows |
| pumpkin | #D87A3F | Sparingly. Countdown labels, highlights. |
| plum | #4A2942 | For moments (haunted house gradient) |
| mist | #A8AC9F | Dotted dividers, subtle borders |

### Fonts
| Class | Font | Use |
|---|---|---|
| font-display | TrenchSlab Variable | Headings, titles, big numbers |
| font-body | Alpino Variable | Body text, descriptions |
| font-mono | Alpino Variable | Eyebrows, metadata, labels, tracking-wide uppercase |
| font-telma | Telma Variable | Tagline/accent italic (homepage subtitle) |

### Mockup section pattern
Every public section follows this structure:
```
eyebrow  → font-mono, text-sm, uppercase, tracking-[0.3em], text-rust-deep
title    → font-display, text-6xl+, text-ink, text-center
lede     → font-telma italic OR font-body italic, text-xl, text-ink-soft, max-w-2xl, mx-auto
content  → specific to section
```

### Card pattern
```
container → bg-bone, border border-ink, overflow-hidden, hover:-translate-y-1
image     → aspect-[4/3], bg-gradient-to-br [color stops]
body      → p-6, border-t border-ink
eyebrow   → font-mono, text-xs, uppercase, tracking-[0.25em], text-rust-deep
title     → font-display, text-2xl, text-ink
desc      → font-body, text-base, text-ink-soft
meta      → mt-4, pt-3, border-t border-dotted border-mist, font-mono text-xs text-moss
```

---

## 6. Things NOT to do

These are from `CLAUDE.md` Section 3 but worth repeating because they've come up:

- Don't build bidding for the silent auction. External platform handles it.
- Don't build door check-in or QR scanning. Printed list + pen on the night.
- Don't build a volunteer roster. Google Sheet.
- Don't make token bundles configurable. They're hardcoded in `lib/bundles.ts`.
- Don't add new dependencies without good reason. The stack is locked.
- Don't use system sans fonts (Inter, Roboto, Helvetica). Ever.
- Don't use black backgrounds. The site is cream (except tokens panel which is forest, and footer which is ink).

---

## 7. After Week 2

Once all public pages match the mockup with mock data:

**Week 3 (HIGHEST RISK):** Stripe Checkout integration
- Wire "Buy" button on tokens page to create Stripe Checkout session
- Build webhook handler at `/api/stripe/webhook`
- Build success/cancel pages
- Send confirmation email via Resend
- Test with real $1 transactions, multiple times

**Week 4:** Admin dashboard CRUD
- Tasks board for all 6 buckets (prove pattern on one, clone to rest)
- Inline create/edit/delete with optimistic UI

**Week 5:** Remaining admin registers
- Vendors, Sponsors, Auction items, Token orders with CSV export
- Wire stat tiles to real database counts

---

*End of handoff. The mockup is the spec. Match it.*
