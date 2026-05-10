import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { BUNDLES, type BundleType } from "@/lib/bundles";

// POST /api/checkout
// Creates a Stripe Checkout session for a token bundle purchase.
export async function POST(req: NextRequest) {
  try {
    const { bundleType } = (await req.json()) as { bundleType: string };

    // Validate bundle type
    if (!bundleType || !(bundleType in BUNDLES)) {
      return NextResponse.json(
        { error: "Invalid bundle type" },
        { status: 400 }
      );
    }

    const bundle = BUNDLES[bundleType as BundleType];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `${bundle.tokens} Token Bundle`,
              description: `Nicho Halloween Festival 2026. ${bundle.tokens} tokens for use at the festival.`,
            },
            unit_amount: bundle.prePurchaseCents,
          },
          quantity: 1,
        },
      ],
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
        bundleType,
        tokens: String(bundle.tokens),
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
