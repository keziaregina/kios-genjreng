import type { Prisma } from "@/lib/generated/prisma/client";

// Cancelling has to undo everything checkout claimed, and both the merchant action and the failed-payment webhook need it.
export async function restoreOrder(
  tx: Prisma.TransactionClient,
  orderId: number,
): Promise<number[]> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      items: { select: { productId: true, quantity: true } },
      redemption: { select: { id: true, voucherId: true } },
    },
  });

  if (!order) return [];

  for (const item of order.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }

  // Without this the buyer's one-per-account redemption stays burnt on an order they never received.
  if (order.redemption) {
    await tx.voucherRedemption.delete({ where: { id: order.redemption.id } });
    await tx.voucher.update({
      where: { id: order.redemption.voucherId },
      data: { usedCount: { decrement: 1 } },
    });
  }

  return order.items.map((item) => item.productId);
}
