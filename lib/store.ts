import type { StoreStats } from "@/types/store";

export const MAX_STORE_NAME_LENGTH = 40;
export const MAX_CITY_LENGTH = 40;

// A store identity only replaces the personal name once both halves are set, so a half-filled row still reads as a name.
export function storeLabel(user: {
  storeName: string | null;
  city: string | null;
  name: string;
}): string {
  return user.storeName && user.city ? `${user.storeName}_${user.city}` : user.name;
}

// Buyers judge a shop by its whole shelf, so the header sums what the product rows already carry.
export function storeStats(
  products: { rating: number | null; reviewCount: number; soldCount: number }[],
): StoreStats {
  let reviewCount = 0;
  let ratingSum = 0;
  let soldCount = 0;

  for (const product of products) {
    soldCount += product.soldCount;
    if (product.rating === null || product.reviewCount === 0) continue;
    reviewCount += product.reviewCount;
    ratingSum += product.rating * product.reviewCount;
  }

  return {
    productCount: products.length,
    soldCount,
    reviewCount,
    rating: reviewCount > 0 ? ratingSum / reviewCount : null,
  };
}
