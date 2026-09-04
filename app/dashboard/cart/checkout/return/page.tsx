import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { requireUser } from "@/lib/auth/guards";
import { getPaymentBySession } from "@/lib/queries";
import { stripe } from "@/lib/stripe/client";

export const metadata: Metadata = {
  title: "Status Pembayaran",
};

// The session is fetched from Stripe per request, so nothing here may be cached.
export const dynamic = "force-dynamic";

type ReturnPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

// Stripe sends the buyer back here with a session, not a receipt, so the copy is written per payment_status.
const MESSAGES: Record<string, { title: string; body: string }> = {
  paid: {
    title: "Pembayaran berhasil",
    body: "Pesanan kamu sudah dibayar dan menunggu penjual mengirim barang.",
  },
  unpaid: {
    title: "Pembayaran diproses",
    body: "Bank masih memproses pembayaran. Status pesanan akan berubah otomatis.",
  },
  no_payment_required: {
    title: "Pembayaran selesai",
    body: "Tidak ada tagihan yang perlu dibayar untuk pesanan ini.",
  },
};

const FALLBACK = {
  title: "Status pembayaran belum pasti",
  body: "Cek halaman Pesanan sebentar lagi untuk status terbaru.",
};

const PaymentReturnPage = async ({ searchParams }: ReturnPageProps) => {
  const session = await requireUser();
  const sessionId = (await searchParams).session_id;

  if (!sessionId) notFound();

  // The session id travels in a URL anyone could type, so the row behind it must still belong to this buyer.
  const payment = await getPaymentBySession(sessionId, session.userId);
  if (!payment) notFound();

  const checkoutSession = await stripe().checkout.sessions.retrieve(sessionId);
  // The webhook is what actually settles the payment, so this page only reports and never writes.
  const message = MESSAGES[checkoutSession.payment_status] ?? FALLBACK;

  return (
    <PageContainer>
      <h1 className="text-text-primary text-lg font-bold">{message.title}</h1>
      <p className="text-text-secondary mt-2 text-sm">{message.body}</p>

      <Link
        href="/dashboard/orders"
        className="bg-button-primary text-text-primary mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-bold"
      >
        Lihat Pesanan
      </Link>
    </PageContainer>
  );
};

export default PaymentReturnPage;
