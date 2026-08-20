import type { Metadata } from "next";
import React from "react";

import { inter } from "@/app/ui/font";
import { requireUser } from "@/lib/auth/guards";
import { getOrdersByBuyer } from "@/lib/queries";
import { Role } from "@/types/user";

import OrderCard from "./components/OrderCard";
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
    <div className={`px-[26px] py-[24px] ${inter.className}`}>
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
            </OrderCard>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
