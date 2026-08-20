import type { Review as ReviewModel } from "@/lib/generated/prisma/client";

import type { PublicUser } from "./user";

/** Row shape of `Review`. Derived from prisma/schema.prisma — never hand-edit. */
export type Review = ReviewModel;

/** What `lib/queries.ts` returns: the writer stripped to public fields. */
export type ReviewWithBuyer = Review & { buyer: PublicUser };
