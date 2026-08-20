import type { Metadata } from "next";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { requireUser } from "@/lib/auth/guards";
import { cartTotal, groupByMerchant, hasStockIssue } from "@/lib/cart";
import { getCart } from "@/lib/queries";

import CartGroup from "./components/CartGroup";
import CheckoutBar from "./components/CheckoutBar";
import EmptyCart from "./components/EmptyCart";

export const metadata: Metadata = {
  title: "Keranjang",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const CartPage = async () => {
  const session = await requireUser();
  const items = await getCart(session.userId);

  const groups = groupByMerchant(items);
  const blocked = items.some(hasStockIssue);

  return (
    <PageContainer>
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Keranjang
      </h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="flex flex-col gap-[21px]">
          {groups.map((group) => (
            <CartGroup key={group.merchant.id} group={group} />
          ))}

          <CheckoutBar
            total={cartTotal(items)}
            groupCount={groups.length}
            blocked={blocked}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default CartPage;
