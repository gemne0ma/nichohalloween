"use server";

import { db } from "@/db";
import { tokenOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendOrderConfirmation } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";

export async function resendConfirmationEmail(orderId: string) {
  await requireAdmin();
  const rows = await db
    .select({
      purchaserEmail: tokenOrders.purchaserEmail,
      purchaserName: tokenOrders.purchaserName,
      orderNumber: tokenOrders.orderNumber,
      tokensPurchased: tokenOrders.tokensPurchased,
      amountPaid: tokenOrders.amountPaid,
    })
    .from(tokenOrders)
    .where(eq(tokenOrders.id, orderId))
    .limit(1);

  if (rows.length === 0) {
    throw new Error("Order not found");
  }

  const order = rows[0];

  await sendOrderConfirmation({
    to: order.purchaserEmail,
    name: order.purchaserName,
    orderNumber: order.orderNumber,
    tokens: order.tokensPurchased,
    amountPaid: order.amountPaid,
  });

  return { success: true, email: order.purchaserEmail };
}
