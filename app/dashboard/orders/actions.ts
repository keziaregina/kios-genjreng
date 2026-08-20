"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { nextStatuses } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";
import type { ActionResult } from "@/types/action";
import { OrderStatus } from "@/types/order";
import { Role } from "@/types/user";

const MAX_QUANTITY = 99;

// A misfiring button should not be able to open a hundred orders a minute.
const orderLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

const FAILURES: Record<string, string> = {
  NOT_FOUND: "Pesanan tidak ditemukan",
  PRODUCT_NOT_FOUND: "Produk tidak ditemukan",
  OWN_PRODUCT: "Tidak bisa membeli produk sendiri",
  OUT_OF_STOCK: "Stok tidak mencukupi",
  ILLEGAL_MOVE: "Status pesanan tidak bisa diubah ke sana",
};

function failureMessage(error: unknown): string | undefined {
  return error instanceof Error ? FAILURES[error.message] : undefined;
}

function revalidateOrders(productIds: number[]) {
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/store/orders");
  productIds.forEach((id) => revalidatePath(`/dashboard/product/${id}`));
}

export async function createOrder(
  productId: number,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(productId) || productId <= 0) {
    return { ok: false, message: FAILURES.PRODUCT_NOT_FOUND };
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return { ok: false, message: `Jumlah harus antara 1 dan ${MAX_QUANTITY}` };
  }

  const key = `order:${session.userId}`;
  if (!orderLimiter.check(key).allowed) {
    return { ok: false, message: "Terlalu banyak pesanan, coba lagi sebentar lagi." };
  }

  let orderId: number;

  try {
    orderId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true, userId: true },
      });

      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (product.userId === session.userId) throw new Error("OWN_PRODUCT");

      // Putting the stock test in the WHERE clause is what stops two buyers claiming the last unit.
      const claimed = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });

      if (claimed.count === 0) throw new Error("OUT_OF_STOCK");

      const order = await tx.order.create({
        data: {
          buyerId: session.userId,
          merchantId: product.userId,
          total: product.price * quantity,
          items: {
            create: [
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity,
              },
            ],
          },
        },
        select: { id: true },
      });

      return order.id;
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[createOrder]", error);
    return { ok: false, message: "Gagal membuat pesanan" };
  }

  orderLimiter.record(key);
  revalidateOrders([productId]);
  redirect(`/dashboard/orders/${orderId}`);
}

export async function updateOrderStatus(
  orderId: number,
  next: OrderStatus,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { ok: false, message: FAILURES.NOT_FOUND };
  }

  let productIds: number[] = [];

  try {
    productIds = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          buyerId: true,
          merchantId: true,
          status: true,
          items: { select: { productId: true, quantity: true } },
        },
      });

      if (!order) throw new Error("NOT_FOUND");

      // A merchant can also be somebody else's buyer, so the row decides the side, not the session role.
      const side =
        order.merchantId === session.userId
          ? Role.MERCHANT
          : order.buyerId === session.userId
            ? Role.BUYER
            : null;

      if (!side) throw new Error("NOT_FOUND");
      if (!nextStatuses(side, order.status).includes(next)) {
        throw new Error("ILLEGAL_MOVE");
      }

      await tx.order.update({ where: { id: orderId }, data: { status: next } });

      for (const item of order.items) {
        if (next === OrderStatus.CANCELLED) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        // Sales are counted only at the final status, which has no move out of it, so nothing double counts.
        if (next === OrderStatus.COMPLETED) {
          await tx.product.update({
            where: { id: item.productId },
            data: { soldCount: { increment: item.quantity } },
          });
        }
      }

      return order.items.map((item) => item.productId);
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[updateOrderStatus]", error);
    return { ok: false, message: "Gagal mengubah status pesanan" };
  }

  revalidateOrders(productIds);
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { ok: true };
}
