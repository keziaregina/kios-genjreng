import type { CartGroup, CartItemWithProduct } from "@/types/cart";

export function cartItemTotal(item: CartItemWithProduct) {
  return item.product.price * item.quantity;
}

export function cartTotal(items: CartItemWithProduct[]) {
  return items.reduce((sum, item) => sum + cartItemTotal(item), 0);
}

// The cart page and checkout split the same way, so what a buyer sees grouped is what actually gets ordered.
export function groupByMerchant(items: CartItemWithProduct[]): CartGroup[] {
  const groups = new Map<number, CartGroup>();

  for (const item of items) {
    const merchant = item.product.user;
    const group = groups.get(merchant.id) ?? { merchant, items: [], subtotal: 0 };

    group.items.push(item);
    group.subtotal += cartItemTotal(item);
    groups.set(merchant.id, group);
  }

  return [...groups.values()];
}

export function hasStockIssue(item: CartItemWithProduct) {
  return item.quantity > item.product.stock;
}
