import type {
  Category,
  Product as ProductModel,
} from "@/lib/generated/prisma/client";

import type { PublicUser } from "./user";

/** Row shape of `Product`. Derived from prisma/schema.prisma — never hand-edit. */
export type Product = ProductModel;

/** What `lib/queries.ts` returns: relations loaded, seller password stripped. */
export type ProductWithRelations = Product & {
  category: Category;
  user: PublicUser;
};
