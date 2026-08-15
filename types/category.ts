import type {
  Category as CategoryModel,
  Product,
} from "@/lib/generated/prisma/client";

/** Row shape of `Category`. Derived from prisma/schema.prisma — never hand-edit. */
export type Category = CategoryModel;

/** `Category` loaded with `include: { products: true }`. */
export type CategoryWithProducts = Category & {
  products: Product[];
};
