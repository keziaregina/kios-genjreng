import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { apiError, badRequest } from "@/lib/api";
import { restoreOrder } from "@/lib/order-cancel";
import { prisma } from "@/lib/prisma";
import { revalidateOrders } from "@/lib/revalidate";
import { stripe, webhookSecret } from "@/lib/stripe/client";
import { OrderStatus } from "@/types/order";
import { PaymentStatus } from "@/types/payment";

// The Stripe SDK needs Node crypto, so this handler opts out of the Edge runtime.
export const runtime = "nodejs";

// A settled or rolled-back payment never moves again, so a redelivered event finds nothing left to do.
const SETTLED: PaymentStatus[] = [
  PaymentStatus.SUCCEEDED,
  PaymentStatus.FAILED,
  PaymentStatus.CANCELLED,
];

function findPayment(intentId: string) {
  return prisma.payment.findUnique({
    where: { stripePaymentIntentId: intentId },
    select: {
      id: true,
      status: true,
      orders: {
        select: { id: true, status: true, items: { select: { productId: true } } },
      },
    },
  });
}

async function markSucceeded(intentId: string) {
  const payment = await findPayment(intentId);
  if (!payment || SETTLED.includes(payment.status)) return [];

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCEEDED },
    });

    await tx.order.updateMany({
      where: { paymentId: payment.id, status: OrderStatus.PENDING },
      data: { status: OrderStatus.CONFIRMED },
    });
  });

  return payment.orders;
}

async function markFailed(intentId: string) {
  const payment = await findPayment(intentId);
  if (!payment || SETTLED.includes(payment.status)) return [];

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });

    // A buyer may have cancelled one order already, and restoring its stock twice would invent inventory.
    for (const order of payment.orders) {
      if (order.status !== OrderStatus.CANCELLED) await restoreOrder(tx, order.id);
    }

    await tx.order.updateMany({
      where: { paymentId: payment.id, status: { not: OrderStatus.CANCELLED } },
      data: { status: OrderStatus.CANCELLED },
    });
  });

  return payment.orders;
}

async function markProcessing(intentId: string) {
  const payment = await findPayment(intentId);
  if (!payment || payment.status !== PaymentStatus.REQUIRES_PAYMENT) return [];

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.PROCESSING },
  });

  return payment.orders;
}

export async function POST(request: Request) {
  try {
    // Stripe sends no cookie, so the signature over the raw body is this route's only guard — do not add getSession().
    const raw = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) return badRequest("Missing stripe-signature header");

    let event: Stripe.Event;

    try {
      event = stripe().webhooks.constructEvent(raw, signature, webhookSecret());
    } catch {
      return badRequest("Invalid Stripe signature");
    }

    let touched: { id: number; items: { productId: number }[] }[] = [];

    switch (event.type) {
      case "payment_intent.succeeded":
        touched = await markSucceeded(event.data.object.id);
        break;
      case "payment_intent.payment_failed":
        touched = await markFailed(event.data.object.id);
        break;
      case "payment_intent.processing":
        touched = await markProcessing(event.data.object.id);
        break;
    }

    if (touched.length > 0) {
      revalidateOrders(touched.flatMap((order) => order.items.map((item) => item.productId)));
      touched.forEach((order) => revalidatePath(`/dashboard/orders/${order.id}`));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return apiError("POST /api/stripe/webhook", error);
  }
}
