import { revalidatePath } from "next/cache";

// Buying touches both order lists and every product page involved, so the fan-out lives in one place.
export function revalidateOrders(productIds: number[]) {
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/store/orders");
  productIds.forEach((id) => revalidatePath(`/dashboard/product/${id}`));
}

export function revalidateCart() {
  revalidatePath("/dashboard/cart");
  revalidatePath("/dashboard", "layout");
}

// Checkout reads the same rows the address list writes, so editing one address refreshes both screens.
export function revalidateAddresses() {
  revalidatePath("/dashboard/profile/addresses");
  revalidatePath("/dashboard/cart/checkout");
}

// Checkout reads live vouchers, so editing one in the merchant panel refreshes checkout too.
export function revalidateVouchers() {
  revalidatePath("/dashboard/store/vouchers");
  revalidatePath("/dashboard/cart/checkout");
}

// A new review rewrites the product's rating, so both order surfaces and the product page go stale at once.
export function revalidateReview(orderId: number, productId: number) {
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/dashboard/product/${productId}`);
}
