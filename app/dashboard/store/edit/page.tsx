import type { Metadata } from "next";
import React from "react";

import BackButton from "@/app/dashboard/profile/components/BackButton";
import { inter } from "@/app/ui/font";
import { getCurrentUser, requireMerchant } from "@/lib/auth/guards";

import StoreForm from "../components/StoreForm";

export const metadata: Metadata = {
  title: "Profil Toko",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const EditStorePage = async () => {
  await requireMerchant();
  const user = await getCurrentUser();

  return (
    <div
      className={`bg-primary relative min-h-screen px-[26px] pt-[64px] pb-[24px] ${inter.className}`}
    >
      <BackButton />

      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Profil Toko
      </h1>

      <StoreForm
        store={{ storeName: user?.storeName ?? "", city: user?.city ?? "" }}
      />
    </div>
  );
};

export default EditStorePage;
