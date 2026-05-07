import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────

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
  "pumpkin",
  "goblin",
  "witch",
  "horseman",
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

// ─── Tables ──────────────────────────────────────────────

// Synced from Clerk. Anyone authenticated is admin.
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID (string, not uuid)
  email: text("email").notNull(),
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
  orderNumber: text("order_number").notNull(), // human-readable, e.g. NHF-0247
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
