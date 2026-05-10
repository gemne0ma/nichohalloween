import { stripe } from "@/lib/stripe";
import { formatCents } from "@/lib/bundles";
import { db } from "@/db";
import { tokenOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

// The success page receives ?session_id= from Stripe redirect.
// We fetch the session from Stripe for customer details, then look up
// the order number from our database. The order number is the critical
// piece, it's what the customer shows at the Token Booth on the day.
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let orderDetails: {
    name: string;
    email: string;
    tokens: number;
    amountPaid: number;
    orderNumber: string | null;
  } | null = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const nameField = session.custom_fields?.find(
        (f) => f.key === "purchaser_name"
      );

      let orderNumber: string | null = null;
      try {
        const order = await db
          .select({ orderNumber: tokenOrders.orderNumber })
          .from(tokenOrders)
          .where(eq(tokenOrders.stripeSessionId, sessionId))
          .limit(1);
        orderNumber = order[0]?.orderNumber ?? null;
      } catch {
        // DB lookup failed, not critical
      }

      orderDetails = {
        name:
          nameField?.text?.value ??
          session.customer_details?.name ??
          "there",
        email: session.customer_details?.email ?? "",
        tokens: Number(session.metadata?.tokens ?? 0),
        amountPaid: session.amount_total ?? 0,
        orderNumber,
      };
    } catch {
      // Session lookup failed, show generic success
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Ghost celebration polaroid */}
        <div className="inline-block rotate-1 bg-bone p-3 pb-10 shadow-[3px_5px_16px_rgba(26,26,26,0.18),1px_2px_4px_rgba(26,26,26,0.1)] mb-10 max-w-[200px]">
          <img
            src="/payup.png"
            alt="Ghost celebrating"
            className="w-full"
          />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-moss text-center mt-2">
            You legend
          </p>
        </div>

        <h1 className="font-display font-bold text-5xl md:text-6xl text-ink mb-4 tracking-tight">
          You&apos;re in.
        </h1>

        {orderDetails ? (
          <>
            <p className="font-body text-xl text-ink-soft mb-8 leading-relaxed">
              {orderDetails.tokens} tokens secured, {orderDetails.name}. A confirmation email is on its way to{" "}
              <span className="font-mono text-sm text-ink">{orderDetails.email}</span>.
            </p>

            {orderDetails.orderNumber && (
              <div className="bg-forest-deep p-6 mb-6 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist mb-2">
                  Your order number
                </p>
                <p className="font-mono text-3xl md:text-4xl text-bone tracking-wider font-bold">
                  {orderDetails.orderNumber}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist mt-2">
                  Show this at the Token Booth
                </p>
              </div>
            )}

            <div className="bg-bone p-6 mb-8 text-left border border-dotted border-mist">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rust-deep mb-4">
                Order summary
              </p>
              {orderDetails.orderNumber && (
                <div className="flex justify-between py-2 border-b border-dotted border-mist">
                  <span className="font-mono text-xs uppercase tracking-wider text-moss">Order</span>
                  <span className="font-mono text-sm text-ink font-bold">{orderDetails.orderNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-dotted border-mist">
                <span className="font-mono text-xs uppercase tracking-wider text-moss">Tokens</span>
                <span className="font-display text-lg text-ink">{orderDetails.tokens}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-mono text-xs uppercase tracking-wider text-moss">Paid</span>
                <span className="font-display text-lg text-ink">{formatCents(orderDetails.amountPaid)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="font-body text-xl text-ink-soft mb-8 leading-relaxed">
            Your tokens are confirmed. Check your email for the order details.
          </p>
        )}

        <div className="bg-bone p-6 mb-10 text-left border border-dotted border-mist">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rust-deep mb-3">
            What happens next
          </p>
          <p className="font-body text-base text-ink-soft leading-relaxed">
            Bring your confirmation email to the Token Booth at the festival entrance on Saturday 24 October.
            Show your order number, and we&apos;ll hand you your physical tokens. That&apos;s it.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] bg-forest-deep text-bone px-8 py-3 hover:bg-rust transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
