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

type CheckoutPageProps = { searchParams: Promise<{ items?: string }> };

// The cart tells us which rows were ticked; an absent list still means the whole cart.
function parseItemIds(raw: string | undefined): number[] | null {
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((part) => Number(part))
    .filter((id) => Number.isInteger(id) && id > 0);
  return ids.length === 0 ? null : ids;
}

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const session = await requireUser();
  const cart = await getCart(session.userId);

  const wanted = parseItemIds((await searchParams).items);
  const items = wanted ? cart.filter((item) => wanted.includes(item.id)) : cart;

  // Nothing here is worth reviewing if the cart cannot be ordered, so the buyer is sent back to fix it.
  if (items.length === 0 || items.some(hasStockIssue)) redirect("/dashboard/cart");

  const groups = groupByMerchant(items);
  const itemIds = items.map((item) => item.id);
  const addresses = await getAddresses(session.userId);

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <div className="relative mb-[21px] flex items-center justify-center">
        <h1 className="text-text-primary text-[20px] font-extrabold">Checkout</h1>
        <Info aria-hidden className="text-text-primary absolute right-0 size-6" />
      </div>

      <div className="border-divider mb-[21px] w-full border-t" />

      <CheckoutForm groups={groups} itemIds={itemIds} addresses={addresses} />
    </PageContainer>
  );
};

export default CheckoutPage;
