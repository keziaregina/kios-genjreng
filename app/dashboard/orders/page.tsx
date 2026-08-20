import type { Metadata } from "next";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { requireUser } from "@/lib/auth/guards";
import { getOrdersByBuyer } from "@/lib/queries";
import { Role } from "@/types/user";

import OrderCard from "./components/OrderCard";
import ReviewCta from "./components/ReviewCta";
import StatusActions from "./components/StatusActions";

export const metadata: Metadata = {
  title: "Riwayat Pesanan",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const OrdersPage = async () => {
  const session = await requireUser();
  const orders = await getOrdersByBuyer(session.userId);

  return (
    <PageContainer>
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Riwayat Pesanan
      </h1>

      {orders.length === 0 ? (
        <p className="text-text-secondary text-sm">Belum ada pesanan.</p>
      ) : (
        <ul className="flex flex-col gap-[11px]">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              counterparty={`Penjual: ${order.merchant.name}`}
            >
              <StatusActions
                orderId={order.id}
                status={order.status}
                side={Role.BUYER}
              />
              <ReviewCta order={order} />
            </OrderCard>
          ))}
        </ul>
      )}
    </PageContainer>
  );
};

export default OrdersPage;
