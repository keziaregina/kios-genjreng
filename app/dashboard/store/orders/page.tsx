import type { Metadata } from "next";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import OrderCard from "@/app/dashboard/orders/components/OrderCard";
import OrderShipping from "@/app/dashboard/orders/components/OrderShipping";
import StatusActions from "@/app/dashboard/orders/components/StatusActions";
import { requireMerchant } from "@/lib/auth/guards";
import { isOrderPaid } from "@/lib/orders";
import { getOrdersByMerchant } from "@/lib/queries";
import { Role } from "@/types/user";

export const metadata: Metadata = {
  title: "Pesanan Masuk",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const StoreOrdersPage = async () => {
  const session = await requireMerchant();
  const orders = await getOrdersByMerchant(session.userId);

  return (
    <PageContainer>
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Pesanan Masuk
      </h1>

      {orders.length === 0 ? (
        <p className="text-text-secondary text-sm">Belum ada pesanan masuk.</p>
      ) : (
        <ul className="flex flex-col gap-[11px]">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              counterparty={`Pembeli: ${order.buyer.name}`}
            >
              <OrderShipping order={order} />
              <StatusActions
                orderId={order.id}
                status={order.status}
                side={Role.MERCHANT}
                paid={isOrderPaid(order)}
              />
            </OrderCard>
          ))}
        </ul>
      )}
    </PageContainer>
  );
};

export default StoreOrdersPage;
