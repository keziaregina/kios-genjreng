import type {
  Order as OrderModel,
  OrderItem as OrderItemModel,
  Product,
} from "@/lib/generated/prisma/client";

import type { Payment } from "./payment";
import type { Review } from "./review";
import type { PublicUser } from "./user";

// Re-exported from the standalone enums file so Edge code can read it without pulling in the Prisma client.
export { OrderStatus, PaymentMethod } from "@/lib/generated/prisma/enums";

/** Row shape of `Order`. Derived from prisma/schema.prisma — never hand-edit. */
export type Order = OrderModel;

/** Row shape of `OrderItem`. Derived from prisma/schema.prisma — never hand-edit. */
export type OrderItem = OrderItemModel;

/** What `lib/queries.ts` returns: items joined back to the catalogue, both parties stripped to public fields. */
export type OrderWithRelations = Order & {
  items: (OrderItem & { product: Product })[];
  buyer: PublicUser;
  merchant: PublicUser;
  reviews: Pick<Review, "productId">[];
  payment: Pick<Payment, "status"> | null;
};
