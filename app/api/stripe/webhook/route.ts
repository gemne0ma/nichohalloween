import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { tokenOrders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendOrderConfirmation } from "@/lib/email";
import type { BundleType } from "@/lib/bundles";
import { BUNDLES } from "@/lib/bundles";

// Stripe sends the raw body, not JSON. Next.js App Router gives us the raw
// request, so we read it as text and verify the signature ourselves.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Only handle completed checkout sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Idempotency: check if we already processed this session
    const existing = await db
      .select({ id: tokenOrders.id })
      .from(tokenOrders)
      .where(eq(tokenOrders.stripeSessionId, session.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Webhook: already processed session ${session.id}, skipping`);
      return NextResponse.json({ received: true });
    }

    // Extract data from session
    const bundleType = session.metadata?.bundleType as BundleType;
    const tokens = Number(session.metadata?.tokens);
    const amountPaid = session.amount_total ?? 0;
    const purchaserEmail =
      session.customer_details?.email ?? "unknown@example.com";

    // The custom field "purchaser_name" comes back in custom_fields array
    const nameField = session.custom_fields?.find(
      (f) => f.key === "purchaser_name"
    );
    const purchaserName =
      nameField?.text?.value ??
      session.customer_details?.name ??
      "Unknown";

    // Generate sequential order number: NHF-0001, NHF-0002, etc.
    const orderNumber = await generateOrderNumber();

    // Insert the order
    await db.insert(tokenOrders).values({
      stripeSessionId: session.id,
      purchaserEmail,
      purchaserName,
      bundleType,
      tokensPurchased: tokens,
      amountPaid,
      orderNumber,
    });

    console.log(
      `Webhook: order ${orderNumber} created. ${tokens} tokens for ${purchaserEmail}`
    );

    // Send confirmation email (don't let email failure break the webhook)
    try {
      await sendOrderConfirmation({
        to: purchaserEmail,
        name: purchaserName,
        orderNumber,
        tokens,
        amountPaid,
      });
      console.log(`Webhook: confirmation email sent to ${purchaserEmail}`);
    } catch (emailErr) {
      console.error(
        `Webhook: email failed for ${orderNumber}, order still saved:`,
        emailErr
      );
    }
  }

  return NextResponse.json({ received: true });
}

// Generate the next sequential order number.
// Uses a count query, so NHF-0001, NHF-0002, etc.
// Safe for this volume (max ~500 orders). For higher volume you'd use a
// Postgres sequence, but that's overkill here.
async function generateOrderNumber(): Promise<string> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(tokenOrders);
  const nextNum = (Number(result[0].count) || 0) + 1;
  return `NHF-${String(nextNum).padStart(4, "0")}`;
}
