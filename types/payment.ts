import type { Payment as PaymentModel } from "@/lib/generated/prisma/client";

// Re-exported from the standalone enums file so Edge code can read it without pulling in the Prisma client.
export { PaymentStatus } from "@/lib/generated/prisma/enums";

/** Row shape of `Payment`. Derived from prisma/schema.prisma — never hand-edit. */
export type Payment = PaymentModel;
