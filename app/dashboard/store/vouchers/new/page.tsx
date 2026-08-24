import type { Metadata } from "next";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { requireMerchant } from "@/lib/auth/guards";

import VoucherForm from "../components/VoucherForm";

export const metadata: Metadata = {
  title: "Tambah Voucher",
};

const NewVoucherPage = async () => {
  await requireMerchant();

  return (
    <PageContainer>
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Tambah Voucher
      </h1>

      <VoucherForm />
    </PageContainer>
  );
};

export default NewVoucherPage;
