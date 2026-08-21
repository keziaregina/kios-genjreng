import type { Address as AddressModel } from "@/lib/generated/prisma/client";
import type { AddressFieldKey } from "@/lib/addresses";

/** Row shape of `Address`. Derived from prisma/schema.prisma — never hand-edit. */
export type Address = AddressModel;

/** What the address form sends: every column as a raw string, trimmed and checked server-side. */
export type AddressInput = Record<AddressFieldKey, string> & {
  note: string;
  isDefault: boolean;
};
