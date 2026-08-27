import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Status Pembayaran",
};

type ReturnPageProps = {
  searchParams: Promise<{ redirect_status?: string }>;
};

// Stripe sends the buyer back here with a hint, not a receipt, so the copy is written per redirect_status.
const MESSAGES: Record<string, { title: string; body: string }> = {
  succeeded: {
    title: "Pembayaran berhasil",
    body: "Pesanan kamu sudah dibayar dan menunggu penjual mengirim barang.",
  },
  processing: {
    title: "Pembayaran diproses",
    body: "Bank masih memproses pembayaran. Status pesanan akan berubah otomatis.",
  },
  requires_payment_method: {
    title: "Pembayaran gagal",
    body: "Kartu ditolak. Pesanan dibatalkan dan stok dikembalikan.",
  },
};

const FALLBACK = {
  title: "Status pembayaran belum pasti",
  body: "Cek halaman Pesanan sebentar lagi untuk status terbaru.",
};

const PaymentReturnPage = async ({ searchParams }: ReturnPageProps) => {
  await requireUser();

  const status = (await searchParams).redirect_status ?? "";
  // The webhook is what actually settles the payment, so this page only reports and never writes.
  const message = MESSAGES[status] ?? FALLBACK;

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
