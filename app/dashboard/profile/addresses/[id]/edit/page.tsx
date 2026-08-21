import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import { parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import { getAddress } from "@/lib/queries";

import AddressForm from "../../components/AddressForm";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Ubah Alamat",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const EditAddressPage = async ({ params }: PageProps) => {
  const session = await requireUser();

  const id = parseId((await params).id);
  if (!id) notFound();

  // Someone else's address reads the same as a missing one.
  const address = await getAddress(id, session.userId);
  if (!address) notFound();

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Ubah Alamat
      </h1>

      <AddressForm address={address} />
    </PageContainer>
  );
};

export default EditAddressPage;
