"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { formatAddress } from "@/lib/addresses";
import { requireUser } from "@/lib/auth/guards";
import { groupByMerchant } from "@/lib/cart";
import {
  MAX_NOTE_LENGTH,
  findCourier,
  orderTotal,
  protectionFee,
} from "@/lib/checkout";
import { restoreOrder } from "@/lib/order-cancel";
import { MAX_QUANTITY } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { cartInclude } from "@/lib/queries";
import { createRateLimiter } from "@/lib/rate-limit";
import { revalidateCart, revalidateOrders } from "@/lib/revalidate";
import { storeLabel } from "@/lib/store";
import { stripe, toStripeAmount } from "@/lib/stripe/client";
import { computeDiscount, normalizeVoucherCode } from "@/lib/vouchers";
import type { ActionResult } from "@/types/action";
import type { CheckoutInput } from "@/types/checkout";
import { OrderStatus, PaymentMethod } from "@/types/order";
import { PaymentStatus } from "@/types/payment";

const MAX_CART_ITEMS = 20;

// A stuck plus button should not be able to rewrite the cart a thousand times a minute.
const cartLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
const checkoutLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

const FAILURES: Record<string, string> = {
  PRODUCT_NOT_FOUND: "Produk tidak ditemukan",
  ITEM_NOT_FOUND: "Barang tidak ada di keranjang",
  OWN_PRODUCT: "Tidak bisa membeli produk sendiri",
  OUT_OF_STOCK: "Stok tidak mencukupi",
  STOCK_CHANGED: "Stok berubah saat checkout, periksa keranjangmu.",
  EMPTY_CART: "Keranjang masih kosong",
  CART_FULL: `Keranjang penuh, maksimal ${MAX_CART_ITEMS} produk`,
  LIMIT_REACHED: "Jumlah sudah mencapai batas stok",
  ADDRESS_NOT_FOUND: "Alamat pengiriman tidak ditemukan",
  BAD_PAYMENT: "Metode pembayaran tidak dikenal",
  MISSING_GROUP: "Ada penjual yang belum dipilih pengirimannya",
  COURIER_NOT_FOUND: "Kurir tidak tersedia",
  NOTE_TOO_LONG: `Catatan maksimal ${MAX_NOTE_LENGTH} karakter`,
  VOUCHER_NOT_FOUND: "Kode voucher tidak ditemukan",
  VOUCHER_EXPIRED: "Voucher sudah kedaluwarsa",
  VOUCHER_MIN_PURCHASE: "Belanja belum mencapai minimum voucher ini",
  VOUCHER_USAGE_LIMIT: "Voucher sudah mencapai batas pemakaian",
  VOUCHER_ALREADY_USED: "Kamu sudah pernah memakai voucher ini",
};

const PAYMENT_METHODS: PaymentMethod[] = Object.values(PaymentMethod);

function failureMessage(error: unknown): string | undefined {
  return error instanceof Error ? FAILURES[error.message] : undefined;
}

function validItemIds(itemIds: unknown): itemIds is number[] {
  if (!Array.isArray(itemIds)) return false;
  if (itemIds.length === 0 || itemIds.length > MAX_CART_ITEMS) return false;
  if (new Set(itemIds).size !== itemIds.length) return false;
  return itemIds.every((id) => Number.isInteger(id) && id > 0);
}

function invalidQuantity(quantity: number) {
  return !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY;
}

export async function addToCart(
  productId: number,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(productId) || productId <= 0) {
    return { ok: false, message: FAILURES.PRODUCT_NOT_FOUND };
  }
  if (invalidQuantity(quantity)) {
    return { ok: false, message: `Jumlah harus antara 1 dan ${MAX_QUANTITY}` };
  }

  const key = `cart:${session.userId}`;
  if (!cartLimiter.check(key).allowed) {
    return {
      ok: false,
      message: "Terlalu banyak perubahan keranjang, coba lagi sebentar lagi.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true, userId: true, stock: true },
      });

      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (product.userId === session.userId) throw new Error("OWN_PRODUCT");
      if (product.stock === 0) throw new Error("OUT_OF_STOCK");

      const existing = await tx.cartItem.findUnique({
        where: { userId_productId: { userId: session.userId, productId } },
        select: { quantity: true },
      });

      if (!existing) {
        const items = await tx.cartItem.count({ where: { userId: session.userId } });
        if (items >= MAX_CART_ITEMS) throw new Error("CART_FULL");
      }

      // Computing the merged value instead of incrementing is what keeps the stock ceiling honest.
      const ceiling = Math.min(product.stock, MAX_QUANTITY);
      if (existing && existing.quantity >= ceiling) throw new Error("LIMIT_REACHED");

      await tx.cartItem.upsert({
        where: { userId_productId: { userId: session.userId, productId } },
        create: {
          userId: session.userId,
          productId,
          quantity: Math.min(quantity, ceiling),
        },
        update: {
          quantity: Math.min((existing?.quantity ?? 0) + quantity, ceiling),
        },
      });
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[addToCart]", error);
    return { ok: false, message: "Gagal mengubah keranjang" };
  }

  cartLimiter.record(key);
  revalidateCart();
  return { ok: true };
}

export async function updateCartItemQuantity(
  itemId: number,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }
  if (invalidQuantity(quantity)) {
    return { ok: false, message: `Jumlah harus antara 1 dan ${MAX_QUANTITY}` };
  }

  const key = `cart:${session.userId}`;
  if (!cartLimiter.check(key).allowed) {
    return {
      ok: false,
      message: "Terlalu banyak perubahan keranjang, coba lagi sebentar lagi.",
    };
  }

  // Filtering by the joined stock means a stale stepper can never park a quantity above what the merchant has.
  const updated = await prisma.cartItem.updateMany({
    where: {
      id: itemId,
      userId: session.userId,
      product: { stock: { gte: quantity } },
    },
    data: { quantity },
  });

  if (updated.count === 0) {
    const owned = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: session.userId },
      select: { id: true },
    });

    return {
      ok: false,
      message: owned ? FAILURES.OUT_OF_STOCK : FAILURES.ITEM_NOT_FOUND,
    };
  }

  cartLimiter.record(key);
  revalidateCart();
  return { ok: true };
}

export async function removeCartItem(itemId: number): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }

  const removed = await prisma.cartItem.deleteMany({
    where: { id: itemId, userId: session.userId },
  });

  if (removed.count === 0) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }

  revalidateCart();
  return { ok: true };
}

// The cart deletes what the buyer ticked, so one round trip clears the whole selection.
export async function removeCartItems(itemIds: number[]): Promise<ActionResult> {
  const session = await requireUser();

  if (!validItemIds(itemIds)) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }

  const removed = await prisma.cartItem.deleteMany({
    where: { id: { in: itemIds }, userId: session.userId },
  });

  if (removed.count === 0) {
    return { ok: false, message: FAILURES.ITEM_NOT_FOUND };
  }

  revalidateCart();
  return { ok: true };
}

export async function clearCart(): Promise<ActionResult> {
  const session = await requireUser();

  await prisma.cartItem.deleteMany({ where: { userId: session.userId } });

  revalidateCart();
  return { ok: true };
}

// Buying now is a one-item checkout, so it parks the pick in the cart and hands the same reviewed flow the id.
export async function buyNow(
  productId: number,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(productId) || productId <= 0) {
    return { ok: false, message: FAILURES.PRODUCT_NOT_FOUND };
  }
  if (invalidQuantity(quantity)) {
    return { ok: false, message: `Jumlah harus antara 1 dan ${MAX_QUANTITY}` };
  }

  const key = `cart:${session.userId}`;
  if (!cartLimiter.check(key).allowed) {
    return {
      ok: false,
      message: "Terlalu banyak perubahan keranjang, coba lagi sebentar lagi.",
    };
  }

  let itemId: number;

  try {
    itemId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true, userId: true, stock: true },
      });

      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (product.userId === session.userId) throw new Error("OWN_PRODUCT");
      if (product.stock === 0) throw new Error("OUT_OF_STOCK");

      const existing = await tx.cartItem.findUnique({
        where: { userId_productId: { userId: session.userId, productId } },
        select: { id: true },
      });

      if (!existing) {
        const items = await tx.cartItem.count({ where: { userId: session.userId } });
        if (items >= MAX_CART_ITEMS) throw new Error("CART_FULL");
      }

      // Buy now states a quantity rather than adding to one, so the row is set instead of merged.
      const item = await tx.cartItem.upsert({
        where: { userId_productId: { userId: session.userId, productId } },
        create: {
          userId: session.userId,
          productId,
          quantity: Math.min(quantity, product.stock, MAX_QUANTITY),
        },
        update: { quantity: Math.min(quantity, product.stock, MAX_QUANTITY) },
        select: { id: true },
      });

      return item.id;
    });
  } catch (error) {
    const message = failureMessage(error);
    if (message) return { ok: false, message };

    console.error("[buyNow]", error);
    return { ok: false, message: "Gagal menyiapkan checkout" };
  }

  cartLimiter.record(key);
  revalidateCart();
  redirect(`/dashboard/cart/checkout?items=${itemId}`);
}

export async function checkout(input: CheckoutInput): Promise<ActionResult> {
  const session = await requireUser();

  if (!Number.isInteger(input.addressId) || input.addressId <= 0) {
    return { ok: false, message: FAILURES.ADDRESS_NOT_FOUND };
  }
  if (!PAYMENT_METHODS.includes(input.paymentMethod)) {
    return { ok: false, message: FAILURES.BAD_PAYMENT };
  }
  if (!validItemIds(input.itemIds)) {
    return { ok: false, message: FAILURES.EMPTY_CART };
  }

  const key = `checkout:${session.userId}`;
  if (!checkoutLimiter.check(key).allowed) {
    return { ok: false, message: "Terlalu banyak checkout, coba lagi sebentar lagi." };
  }

  let orderIds: number[] = [];
  let productIds: number[] = [];
  let paymentId: number | null = null;
  let paymentLines: { name: string; total: number }[] = [];

  try {
    const created = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: input.addressId, userId: session.userId },
      });

      if (!address) throw new Error("ADDRESS_NOT_FOUND");

      const items = await tx.cartItem.findMany({
        where: { userId: session.userId, id: { in: input.itemIds } },
        include: cartInclude,
        orderBy: { productId: "asc" },
      });

      if (items.length === 0) throw new Error("EMPTY_CART");
      if (items.length !== input.itemIds.length) throw new Error("ITEM_NOT_FOUND");

      for (const item of items) {
        if (item.product.userId === session.userId) throw new Error("OWN_PRODUCT");

        // Claiming in productId order stops two overlapping carts from locking each other in reverse.
        const claimed = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (claimed.count === 0) throw new Error("STOCK_CHANGED");
      }

      const ids: number[] = [];
      const lines: { name: string; total: number }[] = [];
      let amount = 0;

      for (const group of groupByMerchant(items)) {
        // The form only names a courier; every rupiah is recomputed here so a patched payload cannot set its own price.
        const draft = input.groups.find(
          (entry) => entry.merchantId === group.merchant.id,
        );

        if (!draft) throw new Error("MISSING_GROUP");

        const courier = findCourier(draft.courierId);
        if (!courier) throw new Error("COURIER_NOT_FOUND");

        const note = String(draft.note ?? "").trim();
        if (note.length > MAX_NOTE_LENGTH) throw new Error("NOTE_TOO_LONG");

        let discount = 0;
        let voucherCode: string | null = null;
        let voucherId: number | null = null;

        if (draft.voucherCode) {
          const code = normalizeVoucherCode(draft.voucherCode);
          const voucher = await tx.voucher.findUnique({
            where: { userId_code: { userId: group.merchant.id, code } },
          });

          if (!voucher || !voucher.isActive) throw new Error("VOUCHER_NOT_FOUND");
          if (voucher.expiresAt && voucher.expiresAt < new Date()) {
            throw new Error("VOUCHER_EXPIRED");
          }
          if (group.subtotal < voucher.minPurchase) throw new Error("VOUCHER_MIN_PURCHASE");
          if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
            throw new Error("VOUCHER_USAGE_LIMIT");
          }

          // usedCount is store-wide, so the per-buyer redemption row is what makes one code one use per account.
          const redeemed = await tx.voucherRedemption.findUnique({
            where: {
              voucherId_buyerId: { voucherId: voucher.id, buyerId: session.userId },
            },
            select: { id: true },
          });
          if (redeemed) throw new Error("VOUCHER_ALREADY_USED");

          // Claimed the same way stock is: an atomic increment inside the transaction stops a race from over-redeeming.
          const claimed = await tx.voucher.updateMany({
            where: {
              id: voucher.id,
              ...(voucher.usageLimit !== null ? { usedCount: { lt: voucher.usageLimit } } : {}),
            },
            data: { usedCount: { increment: 1 } },
          });
          if (claimed.count === 0) throw new Error("VOUCHER_USAGE_LIMIT");

          discount = computeDiscount(voucher, group.subtotal);
          voucherCode = voucher.code;
          voucherId = voucher.id;
        }

        const costs = {
          subtotal: group.subtotal,
          shippingCost: courier.cost,
          protectionFee: protectionFee(draft.protection === true),
          discount,
        };

        const total = orderTotal(costs);
        amount += total;

        const order = await tx.order.create({
          data: {
            buyerId: session.userId,
            merchantId: group.merchant.id,
            subtotal: costs.subtotal,
            shippingCourier: courier.name,
            shippingCost: costs.shippingCost,
            shippingEta: courier.eta,
            protectionFee: costs.protectionFee,
            discount: costs.discount,
            voucherCode,
            note: note === "" ? null : note,
            paymentMethod: input.paymentMethod,
            shipRecipient: address.recipient,
            shipPhone: address.phone,
            shipAddress: formatAddress(address),
            total,
            items: {
              create: group.items.map((item) => ({
                productId: item.productId,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
              })),
            },
          },
          select: { id: true },
        });

        // The unique pair is the real lock: a concurrent second redemption fails the insert and rolls the order back.
        if (voucherId !== null) {
          await tx.voucherRedemption.create({
            data: { voucherId, buyerId: session.userId, orderId: order.id },
          });
        }

        ids.push(order.id);
        lines.push({ name: `Pesanan #${order.id} · ${storeLabel(group.merchant)}`, total });
      }

      // A multi-merchant cart splits into several orders but is paid once, so one Payment row owns them all.
      let paymentId: number | null = null;

      if (input.paymentMethod === PaymentMethod.CARD) {
        const payment = await tx.payment.create({
          data: { buyerId: session.userId, amount },
          select: { id: true },
        });

        await tx.order.updateMany({
          where: { id: { in: ids } },
          data: { paymentId: payment.id },
        });

        paymentId = payment.id;
      }

      // Only the ordered rows leave; anything the buyer left unticked stays in the cart.
      await tx.cartItem.deleteMany({
        where: { userId: session.userId, id: { in: input.itemIds } },
      });

      return {
        ids,
        productIds: items.map((item) => item.productId),
        paymentId,
        lines,
      };
    });

    orderIds = created.ids;
    productIds = created.productIds;
    paymentId = created.paymentId;
    paymentLines = created.lines;
  } catch (error) {
    const message = failureMessage(error);
    if (message) {
      revalidateCart();
      return { ok: false, message };
    }

    console.error("[checkout]", error);
    return { ok: false, message: "Gagal memproses checkout" };
  }

  // The session is created outside the transaction, otherwise a call across the internet holds every claimed row locked.
  if (paymentId !== null) {
    let checkoutUrl: string;

    try {
      const origin = await appOrigin();

      const checkoutSession = await stripe().checkout.sessions.create({
        mode: "payment",
        client_reference_id: String(paymentId),
        metadata: { paymentId: String(paymentId) },
        // The intent is minted by Stripe, so the id it will report back is stamped here rather than looked up later.
        payment_intent_data: { metadata: { paymentId: String(paymentId) } },
        line_items: paymentLines.map((line) => ({
          quantity: 1,
          price_data: {
            currency: "idr",
            unit_amount: toStripeAmount(line.total),
            product_data: { name: line.name },
          },
        })),
        success_url: `${origin}/dashboard/cart/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard/orders`,
      });

      if (!checkoutSession.url) throw new Error("NO_CHECKOUT_URL");

      await prisma.payment.update({
        where: { id: paymentId },
        data: { stripeCheckoutSessionId: checkoutSession.id },
      });

      checkoutUrl = checkoutSession.url;
    } catch (error) {
      console.error("[checkout:session]", error);
      await releaseUnpaidCheckout(paymentId, orderIds);
      revalidateCart();
      revalidateOrders(productIds);
      return { ok: false, message: "Gagal menyiapkan pembayaran kartu" };
    }

    checkoutLimiter.record(key);
    revalidateCart();
    revalidateOrders(productIds);
    // Payment happens on Stripe's own page now, so the buyer leaves the app instead of confirming an Element here.
    redirect(checkoutUrl);
  }

  checkoutLimiter.record(key);
  revalidateCart();
  revalidateOrders(productIds);
  redirect(orderIds.length === 1 ? `/dashboard/orders/${orderIds[0]}` : "/dashboard/orders");
}

// Stripe Checkout only takes absolute URLs, and the app declares no canonical origin, so the request's own host is used.
async function appOrigin() {
  const list = await headers();
  const host = list.get("host") ?? "localhost:3000";
  const proto = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// The orders exist but no session does, so they are rolled back the same way a failed payment rolls them back.
async function releaseUnpaidCheckout(paymentId: number, orderIds: number[]) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const orderId of orderIds) {
        await restoreOrder(tx, orderId);
      }

      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.CANCELLED },
      });
    });
  } catch (error) {
    console.error("[checkout:release]", error);
  }
}
