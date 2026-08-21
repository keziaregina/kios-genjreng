import type { Metadata } from "next";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import { requireUser } from "@/lib/auth/guards";
import { groupByMerchant } from "@/lib/cart";
import { getCart } from "@/lib/queries";

import CartList from "./components/CartList";

export const metadata: Metadata = {
  title: "Keranjang",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const CartPage = async () => {
  const session = await requireUser();
  const items = await getCart(session.userId);

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <CartList groups={groupByMerchant(items)} />
    </PageContainer>
  );
};

export default CartPage;
