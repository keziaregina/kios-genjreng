import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { getPayment } from "@/lib/queries";
import { stripe } from "@/lib/stripe/client";
import { formatPrice } from "@/lib/utils";
import { PaymentStatus } from "@/types/payment";

import PaymentForm from "./components/PaymentForm";

export const metadata: Metadata = {
  title: "Pembayaran",
};

// The intent is fetched from Stripe per request, so nothing here may be cached.
export const dynamic = "force-dynamic";

type PayPageProps = { params: Promise<{ id: string }> };

const PayPage = async ({ params }: PayPageProps) => {
  const session = await requireUser();
  const id = parseId((await params).id);

  if (id === null) notFound();

  const payment = await getPayment(id, session.userId);

  if (!payment?.stripePaymentIntentId) notFound();
  // A settled payment has nothing left to confirm, so the buyer is sent to the receipt instead.
  if (payment.status !== PaymentStatus.REQUIRES_PAYMENT) {
    redirect("/dashboard/orders");
  }

  const intent = await stripe().paymentIntents.retrieve(
    payment.stripePaymentIntentId,
  );

  if (!intent.client_secret) notFound();

  return (
    <PageContainer className="flex flex-col gap-[21px]">
      <div>
        <h1 className="text-text-primary text-lg font-bold">Bayar Pesanan</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Pesanan sudah dibuat dan menunggu pembayaran {formatPrice(payment.amount)}.
        </p>
      </div>

      <PaymentForm clientSecret={intent.client_secret} total={payment.amount} />
    </PageContainer>
  );
};

export default PayPage;
