import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { getPayment } from "@/lib/queries";
import { stripe } from "@/lib/stripe/client";
import { PaymentStatus } from "@/types/payment";

export const metadata: Metadata = {
  title: "Pembayaran",
};

// The session is fetched from Stripe per request, so nothing here may be cached.
export const dynamic = "force-dynamic";

type PayPageProps = { params: Promise<{ id: string }> };

// Stripe hosts the payment page, so this route only hands the buyer back to the session checkout created.
const PayPage = async ({ params }: PayPageProps) => {
  const session = await requireUser();
  const id = parseId((await params).id);

  if (id === null) notFound();

  const payment = await getPayment(id, session.userId);

  if (!payment?.stripeCheckoutSessionId) notFound();
  // A settled payment has nothing left to confirm, so the buyer is sent to the receipt instead.
  if (payment.status !== PaymentStatus.REQUIRES_PAYMENT) redirect("/dashboard/orders");

  const checkoutSession = await stripe().checkout.sessions.retrieve(
    payment.stripeCheckoutSessionId,
  );

  // An expired session cannot be reopened, and the webhook has already rolled its orders back.
  if (checkoutSession.status !== "open" || !checkoutSession.url) {
    redirect("/dashboard/orders");
  }

  redirect(checkoutSession.url);
};

export default PayPage;
