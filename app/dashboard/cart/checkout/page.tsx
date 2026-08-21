import { Info } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import { requireUser } from "@/lib/auth/guards";
import { groupByMerchant, hasStockIssue } from "@/lib/cart";
import { getAddresses, getCart } from "@/lib/queries";

import CheckoutForm from "./components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const CheckoutPage = async () => {
  const session = await requireUser();
  const items = await getCart(session.userId);

  // Nothing here is worth reviewing if the cart cannot be ordered, so the buyer is sent back to fix it.
  if (items.length === 0 || items.some(hasStockIssue)) redirect("/dashboard/cart");

  const groups = groupByMerchant(items);
  const addresses = await getAddresses(session.userId);

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <div className="relative mb-[21px] flex items-center justify-center">
        <h1 className="text-text-primary text-[20px] font-extrabold">Checkout</h1>
        <Info aria-hidden className="text-text-primary absolute right-0 size-6" />
      </div>

      <div className="border-divider mb-[21px] w-full border-t" />

      <CheckoutForm groups={groups} addresses={addresses} />
    </PageContainer>
  );
};

export default CheckoutPage;
