import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { parseId } from "@/lib/api";
import { requireMerchant } from "@/lib/auth/guards";
import { getVoucher } from "@/lib/queries";

import VoucherForm from "../../components/VoucherForm";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Ubah Voucher",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const EditVoucherPage = async ({ params }: PageProps) => {
  const session = await requireMerchant();

  const id = parseId((await params).id);
  if (!id) notFound();

  // Someone else's voucher reads the same as a missing one.
  const voucher = await getVoucher(id, session.userId);
  if (!voucher) notFound();

  return (
    <PageContainer>
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Ubah Voucher
      </h1>

      <VoucherForm voucher={voucher} />
    </PageContainer>
  );
};

export default EditVoucherPage;
