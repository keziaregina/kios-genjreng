import type {
  Product,
  User as UserModel,
} from "@/lib/generated/prisma/client";

/** Row shape of `User`. Derived from prisma/schema.prisma — never hand-edit. */
export type User = UserModel;

/** The only user shape allowed to cross the network — password stripped. */
export type PublicUser = Omit<User, "password">;

/** `User` loaded with `include: { products: true }`. */
export type UserWithProducts = User & {
  products: Product[];
};
