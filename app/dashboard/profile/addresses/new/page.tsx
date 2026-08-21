import type { Metadata } from "next";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import { requireUser } from "@/lib/auth/guards";

import AddressForm from "../components/AddressForm";

export const metadata: Metadata = {
  title: "Tambah Alamat",
};

const NewAddressPage = async () => {
  await requireUser();

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Tambah Alamat
      </h1>

      <AddressForm />
    </PageContainer>
  );
};

export default NewAddressPage;
