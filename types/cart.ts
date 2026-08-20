import type { CartItem as CartItemModel } from "@/lib/generated/prisma/client";

import type { ProductWithRelations } from "./product";
import type { PublicUser } from "./user";

/** Row shape of `CartItem`. Derived from prisma/schema.prisma — never hand-edit. */
export type CartItem = CartItemModel;

/** What `lib/queries.ts` returns: the live product joined, so price and stock are never stale. */
export type CartItemWithProduct = CartItem & { product: ProductWithRelations };

/** One checkout-bound slice of the cart — becomes exactly one `Order` row. */
export type CartGroup = {
  merchant: PublicUser;
  items: CartItemWithProduct[];
  subtotal: number;
};
