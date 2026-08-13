import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  boolean,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────

export const mediaCategoryEnum = pgEnum("media_category", [
  "gallery",
  "sponsor",
  "auction",
  "vendor",
  "other",
]);

export const taskBucketEnum = pgEnum("task_bucket", [
  "sponsorship",
  "auction",
  "vendors",
  "attractions",
  "marketing",
  "build",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "blocked",
  "done",
]);

export const sponsorTierEnum = pgEnum("sponsor_tier", [
  "gold",
  "silver",
  "bronze",
]);

export const auctionStatusEnum = pgEnum("auction_status", [
  "pending",
  "received",
  "listed",
  "sold",
]);

export const bundleTypeEnum = pgEnum("bundle_type", [
  "BUNDLE_25",
  "BUNDLE_50",
  "BUNDLE_100",
  "BUNDLE_200",
]);

// Outreach pipeline for businesses we ask to donate auction lots.
// Separate from auction_status, which tracks the item once it exists.
export const prospectStatusEnum = pgEnum("prospect_status", [
  "not_contacted",
  "contacted",
  "waiting_on_reply",
  "agreed_to_donate",
  "item_received",
  "declined",
]);

// ─── Tables ──────────────────────────────────────────────

// Synced from Clerk on admin login. Anyone authenticated is admin.
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID (string, not uuid)
  email: text("email").notNull(),
  name: text("name"), // display name, synced from Clerk
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  bucket: taskBucketEnum("bucket").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ownerId: text("owner_id").references(() => users.id),
  assignedTo: text("assigned_to").references(() => users.id),
  dueDate: date("due_date"),
  status: taskStatusEnum("status").default("todo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const vendors = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  category: text("category"),
  quotedAmount: integer("quoted_amount"), // cents
  booked: boolean("booked").default(false).notNull(),
  paid: boolean("paid").default(false).notNull(),
  invoiceUrl: text("invoice_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sponsors = pgTable("sponsors", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull(),
  contact: text("contact"),
  email: text("email"),
  tier: sponsorTierEnum("tier"),
  committedAmount: integer("committed_amount"), // cents
  paidAmount: integer("paid_amount").default(0), // cents
  logoUrl: text("logo_url"),
  thanked: boolean("thanked").default(false).notNull(),
  notes: text("notes"),
  // Controls the public /sponsors page. Off by default: a sponsor exists in
  // the register long before anyone agrees to being listed publicly.
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const auctionItems = pgTable("auction_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  classroom: text("classroom"),
  itemName: text("item_name").notNull(),
  donor: text("donor"),
  estimatedValue: integer("estimated_value"), // cents
  photoUrl: text("photo_url"),
  status: auctionStatusEnum("status").default("pending").notNull(),
  platformListingUrl: text("platform_listing_url"), // 32auctions URL
  currentHighBid: integer("current_high_bid"), // cents, cached, optional
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tokenOrders = pgTable("token_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeSessionId: text("stripe_session_id").unique(),
  purchaserEmail: text("purchaser_email").notNull(),
  purchaserName: text("purchaser_name").notNull(),
  bundleType: bundleTypeEnum("bundle_type").notNull(),
  tokensPurchased: integer("tokens_purchased").notNull(),
  amountPaid: integer("amount_paid").notNull(), // cents
  // Issued by the database, not by application code. The default calls
  // nextval() on token_order_number_seq, so two concurrent webhook
  // deliveries can never be handed the same number. Unique is the backstop.
  // Insert without it and read it back with .returning().
  orderNumber: text("order_number")
    .notNull()
    .unique()
    .default(
      sql`'NHF-' || lpad(nextval('token_order_number_seq')::text, 4, '0')`
    ), // human-readable, e.g. NHF-0247
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const attractions = pgTable("attractions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  imageUrl: text("image_url"),
  sponsorId: uuid("sponsor_id").references(() => sponsors.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Media (photos, logos, documents uploaded to R2) ─────

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: text("filename").notNull(),
  r2Key: text("r2_key").notNull().unique(), // e.g. 2026/sponsor/logo-acme.png
  fileType: text("file_type").notNull(), // MIME type
  fileSize: integer("file_size").notNull(), // bytes
  uploadedBy: text("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  festivalYear: integer("festival_year").notNull(), // e.g. 2026
  category: mediaCategoryEnum("category").notNull(),
  caption: text("caption"),
  altText: text("alt_text"),
});

// ─── Tags (controlled vocabulary for task categorisation) ─

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // e.g. "Vendors"
  slug: text("slug").notNull().unique(), // e.g. "vendors"
  color: text("color"), // optional hex for UI pill colour
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Classroom lot quotas ────────────────────────────────

// Each classroom owes 10 lots at a minimum of $100 each. The lots go
// straight to Air Auctioneer and are not tracked here. This table exists to
// answer one question in October: has each classroom delivered?
export const classroomLots = pgTable("classroom_lots", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // K-1, Y2, 3-4, 5-6
  sortOrder: integer("sort_order").default(0).notNull(),
  targetItems: integer("target_items").default(10).notNull(),
  itemsReceived: integer("items_received").default(0).notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Auction prospects (business outreach tracker) ───────

// Private. Businesses the committee approaches for auction donations.
// Contact details and internal notes on local businesses, so this never
// renders on a public page. Rows are never deleted: 'declined' closes
// a business out and keeps the record of having asked.
export const auctionProspects = pgTable("auction_prospects", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull(),
  status: prospectStatusEnum("status").default("not_contacted").notNull(),
  suburb: text("suburb"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  notes: text("notes"),
  // What they have donated, and what it is worth. Cents, never a float.
  item: text("item"),
  itemValueCents: integer("item_value_cents"),
  // Who is chasing it. Defaults to whoever created the row, reassignable.
  owner: text("owner").references(() => users.id),
  doNotContact: boolean("do_not_contact").default(false).notNull(),
  // Stamped by the server on every status change, not editable by hand.
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Join table: many tasks to many tags
export const taskTags = pgTable(
  "task_tags",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.tagId] })]
);
