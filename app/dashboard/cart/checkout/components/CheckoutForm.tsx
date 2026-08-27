"use client";

import React, { useState, useTransition } from "react";

import { checkout } from "@/app/dashboard/cart/actions";
import { useToast } from "@/components/ui/toast";
import {
  DEFAULT_COURIER_ID,
  findCourier,
  orderTotal,
  protectionFee,
} from "@/lib/checkout";
import type { Address } from "@/types/address";
import type { CartGroup } from "@/types/cart";
import type { CheckoutGroupInput } from "@/types/checkout";
import { PaymentMethod } from "@/types/order";

import AddressPicker from "./AddressPicker";
import CheckoutSummary from "./CheckoutSummary";
import MerchantSection from "./MerchantSection";
import PaymentPicker from "./PaymentPicker";

type CheckoutFormProps = {
  groups: CartGroup[];
  itemIds: number[];
  addresses: Address[];
};

// Every merchant block starts on the same courier, so a buyer who changes nothing still has a valid shipment.
function blankDraft(merchantId: number): CheckoutGroupInput {
  return {
    merchantId,
    courierId: DEFAULT_COURIER_ID,
    note: "",
    protection: false,
    voucherCode: null,
  };
}

function initialDrafts(groups: CartGroup[]): Record<number, CheckoutGroupInput> {
  return Object.fromEntries(
    groups.map((group) => [group.merchant.id, blankDraft(group.merchant.id)]),
  );
}

const CheckoutForm = ({ groups, itemIds, addresses }: CheckoutFormProps) => {
  const [drafts, setDrafts] = useState(() => initialDrafts(groups));
  const [addressId, setAddressId] = useState<number | null>(
    addresses[0]?.id ?? null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD,
  );
  const [discounts, setDiscounts] = useState<Record<number, number>>({});
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  // Another tab can add a merchant between renders, so a missing draft falls back instead of crashing.
  const draftFor = (merchantId: number) =>
    drafts[merchantId] ?? blankDraft(merchantId);

  const patchDraft = (merchantId: number, patch: Partial<CheckoutGroupInput>) => {
    setDrafts((current) => ({
      ...current,
      [merchantId]: { ...(current[merchantId] ?? blankDraft(merchantId)), ...patch },
    }));
  };

  const costs = groups.reduce(
    (sum, group) => {
      const draft = draftFor(group.merchant.id);
      return {
        subtotal: sum.subtotal + group.subtotal,
        shippingCost: sum.shippingCost + (findCourier(draft.courierId)?.cost ?? 0),
        protectionFee: sum.protectionFee + protectionFee(draft.protection),
        discount: sum.discount + (discounts[group.merchant.id] ?? 0),
      };
    },
    { subtotal: 0, shippingCost: 0, protectionFee: 0, discount: 0 },
  );

  const handleSubmit = () => {
    if (addressId === null) {
      toast.error("Pilih alamat pengiriman dulu");
      return;
    }

    startTransition(async () => {
      const result = await checkout({
        addressId,
        paymentMethod,
        itemIds,
        groups: groups.map((group) => draftFor(group.merchant.id)),
      });

      // Every method redirects on success, so only the failure branch ever comes back here.
      if (result && !result.ok) toast.error(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-[21px]">
      <p className="text-text-primary text-sm font-bold">Barang yang dibeli</p>

      {groups.map((group) => (
        <MerchantSection
          key={group.merchant.id}
          group={group}
          draft={draftFor(group.merchant.id)}
          disabled={pending}
          onChange={(patch) => patchDraft(group.merchant.id, patch)}
          voucherDiscount={discounts[group.merchant.id] ?? 0}
          onVoucherApplied={(result) =>
            setDiscounts((current) => ({
              ...current,
              [group.merchant.id]: result?.discount ?? 0,
            }))
          }
        />
      ))}

      <section className="flex flex-col">
        <p className="text-button-primary mb-2 text-xs font-semibold">
          Alamat &amp; Pembayaran
        </p>

        <AddressPicker
          addresses={addresses}
          selectedId={addressId}
          disabled={pending}
          onSelect={setAddressId}
        />

        <div className="border-divider w-full border-t" />

        <PaymentPicker
          value={paymentMethod}
          disabled={pending}
          onSelect={setPaymentMethod}
        />
      </section>

      <CheckoutSummary
        subtotal={costs.subtotal}
        shippingCost={costs.shippingCost}
        protectionFee={costs.protectionFee}
        discount={costs.discount}
        total={orderTotal(costs)}
        groupCount={groups.length}
        pending={pending}
        disabled={addresses.length === 0}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CheckoutForm;
