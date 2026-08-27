import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import { parseId } from "@/lib/api";
import { requireUser } from "@/lib/auth/guards";
import {
  PAYMENT_LABEL,
  PAYMENT_STATUS_LABEL,
  formatOrderDate,
  isOrderPaid,
} from "@/lib/orders";
import { getOrder } from "@/lib/queries";
import { storeLabel } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { OrderStatus, PaymentMethod } from "@/types/order";
import { PaymentStatus } from "@/types/payment";
import { Role } from "@/types/user";

import OrderShipping from "../components/OrderShipping";
import ReviewSection from "../components/ReviewSection";
import StatusActions from "../components/StatusActions";
import StatusBadge from "../components/StatusBadge";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Detail Pesanan",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const OrderDetailPage = async ({ params }: PageProps) => {
  const session = await requireUser();

  const id = parseId((await params).id);
  if (!id) notFound();

  const order = await getOrder(id);
  if (!order) notFound();

  // An order only exists for its two parties; anyone else gets the same page as a missing row.
  const side =
    order.merchantId === session.userId
      ? Role.MERCHANT
      : order.buyerId === session.userId
        ? Role.BUYER
        : null;

  if (!side) notFound();

  // Only the seller side owns a storefront, so the buyer name stays plain text.
  const counterparty =
    side === Role.MERCHANT
      ? { label: "Pembeli", name: order.buyer.name, href: null }
      : {
          label: "Penjual",
          name: storeLabel(order.merchant),
          href: `/dashboard/merchant/${order.merchantId}`,
        };

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <div className="mb-[21px] flex items-center justify-between gap-2">
        <h1 className="text-text-primary text-[20px] font-extrabold">
          Pesanan #{order.id}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <ul className="mb-[21px] flex flex-col gap-2">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="bg-quarternary flex items-center justify-between gap-3 rounded-xl px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <Link
                href={`/dashboard/product/${item.productId}`}
                className="text-text-primary truncate text-sm font-semibold active:opacity-80"
              >
                {item.name}
              </Link>
              <span className="text-text-secondary text-xs">
                {formatPrice(item.price)} × {item.quantity}
              </span>
            </div>
            <span className="text-text-primary shrink-0 text-sm font-bold">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-divider mb-[21px] border-y py-[12px]">
        <OrderShipping order={order} />
      </div>

      <dl className="mb-[21px] flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-secondary">{counterparty.label}</dt>
          <dd className="text-text-primary font-semibold">
            {counterparty.href ? (
              <Link href={counterparty.href} className="underline-offset-2 active:underline">
                {counterparty.name}
              </Link>
            ) : (
              counterparty.name
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Dipesan</dt>
          <dd className="text-text-primary font-semibold">
            {formatOrderDate(order.createdAt)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Pembayaran</dt>
          <dd className="text-text-primary font-semibold">
            {PAYMENT_LABEL[order.paymentMethod]}
          </dd>
        </div>
        {/* Only a card order has a gateway state worth showing; the others settle off-platform. */}
        {order.paymentMethod === PaymentMethod.CARD && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Status bayar</dt>
            <dd className="text-text-primary font-semibold">
              {PAYMENT_STATUS_LABEL[order.payment?.status ?? PaymentStatus.REQUIRES_PAYMENT]}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-text-secondary">Total barang</dt>
          <dd className="text-text-primary font-semibold">
            {formatPrice(order.subtotal)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">
            Ongkos kirim
            {order.shippingCourier ? ` · ${order.shippingCourier}` : ""}
          </dt>
          <dd className="text-text-primary font-semibold">
            {formatPrice(order.shippingCost)}
          </dd>
        </div>
        {order.shippingEta && (
          <p className="text-text-secondary text-xs">{order.shippingEta}</p>
        )}
        {order.protectionFee > 0 && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Perlindungan ekstra</dt>
            <dd className="text-text-primary font-semibold">
              {formatPrice(order.protectionFee)}
            </dd>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Voucher {order.voucherCode}</dt>
            <dd className="text-text-primary font-semibold">
              - {formatPrice(order.discount)}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-text-secondary">Total</dt>
          <dd className="text-button-primary font-bold">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <StatusActions
        orderId={order.id}
        status={order.status}
        side={side}
        paid={isOrderPaid(order)}
      />

      {side === Role.BUYER && order.status === OrderStatus.COMPLETED && (
        <ReviewSection order={order} />
      )}
    </PageContainer>
  );
};

export default OrderDetailPage;
