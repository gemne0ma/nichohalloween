import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { BUNDLES, type BundleType } from "@/lib/bundles";

// Hard cap per bundle line. Nobody is buying twenty 200-packs, and without a
// cap a crafted request could ask Stripe for a nonsense amount.
const MAX_QTY_PER_LINE = 20;

type CartLine = { bundleType: BundleType; quantity: number };

// POST /api/checkout
// Creates a Stripe Checkout session for one or more token bundles.
//
// Accepts either shape:
//   { items: [{ bundleType, quantity }, ...] }   the cart
//   { bundleType }                               a single bundle
//
// The single-bundle shape is kept so a browser holding the previous version
// of the tokens page mid-deploy still works instead of erroring at the till.
//
// Quantities come from the client. Prices never do: every unit_amount is read
// from BUNDLES on the server.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      items?: unknown;
      bundleType?: unknown;
    };

    let lines: CartLine[] = [];

    if (Array.isArray(body.items)) {
      for (const raw of body.items) {
        const item = raw as { bundleType?: unknown; quantity?: unknown };
        const bundleType = String(item.bundleType ?? "");
        const quantity = Number(item.quantity ?? 0);

        if (!(bundleType in BUNDLES)) {
          return NextResponse.json(
            { error: `Unknown bundle: ${bundleType}` },
            { status: 400 }
          );
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
          continue; // zero or junk quantity, just drop the line
        }
        if (quantity > MAX_QTY_PER_LINE) {
          return NextResponse.json(
            { error: `Maximum ${MAX_QTY_PER_LINE} of any one bundle` },
            { status: 400 }
          );
        }
        lines.push({ bundleType: bundleType as BundleType, quantity });
      }
    } else if (typeof body.bundleType === "string") {
      if (!(body.bundleType in BUNDLES)) {
        return NextResponse.json({ error: "Invalid bundle type" }, { status: 400 });
      }
      lines = [{ bundleType: body.bundleType as BundleType, quantity: 1 }];
    }

    if (lines.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // Collapse duplicates so the same bundle sent twice becomes one line.
    const merged = new Map<BundleType, number>();
    for (const l of lines) {
      merged.set(l.bundleType, (merged.get(l.bundleType) ?? 0) + l.quantity);
    }
    for (const [bundleType, qty] of merged) {
      if (qty > MAX_QTY_PER_LINE) {
        return NextResponse.json(
          { error: `Maximum ${MAX_QTY_PER_LINE} of any one bundle` },
          { status: 400 }
        );
      }
    }

    const cart = [...merged.entries()].map(([bundleType, quantity]) => ({
      bundleType,
      quantity,
      bundle: BUNDLES[bundleType],
    }));

    const totalTokens = cart.reduce((n, c) => n + c.bundle.tokens * c.quantity, 0);
    // "2 x 25, 1 x 200". What the booth list prints.
    const summary = cart.map((c) => `${c.quantity} x ${c.bundle.tokens}`).join(", ");
    // Machine readable, for the webhook: "BUNDLE_25:2,BUNDLE_200:1".
    const breakdown = cart.map((c) => `${c.bundleType}:${c.quantity}`).join(",");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cart.map((c) => ({
        price_data: {
          currency: "aud",
          product_data: {
            name: `${c.bundle.tokens} Token Bundle`,
            description: `Nicho Halloween Festival 2026. ${c.bundle.tokens} tokens for use at the festival.`,
          },
          unit_amount: c.bundle.prePurchaseCents,
        },
        quantity: c.quantity,
      })),
      // Collect customer email and name on the Stripe checkout page
      customer_creation: "if_required",
      custom_fields: [
        {
          key: "purchaser_name",
          label: { type: "custom", custom: "Your name (for token collection)" },
          type: "text",
        },
      ],
      metadata: {
        // Kept for single-bundle orders so nothing downstream loses meaning.
        bundleType: cart.length === 1 ? cart[0].bundleType : "",
        breakdown,
        summary,
        tokens: String(totalTokens),
      },
      success_url: `${req.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
