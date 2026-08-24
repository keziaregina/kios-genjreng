"use client";

import { Store } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  MAX_NOTE_LENGTH,
  PROTECTION_DESCRIPTION,
  PROTECTION_FEE,
  PROTECTION_LABEL,
} from "@/lib/checkout";
import { storeLabel } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import type { CartGroup } from "@/types/cart";
import type { CheckoutGroupInput } from "@/types/checkout";

import CheckoutItemRow from "./CheckoutItemRow";
import CourierPicker from "./CourierPicker";
import VoucherField from "./VoucherField";

type MerchantSectionProps = {
  group: CartGroup;
  draft: CheckoutGroupInput;
  onChange: (patch: Partial<CheckoutGroupInput>) => void;
  voucherDiscount: number;
  onVoucherApplied: (result: { code: string; discount: number } | null) => void;
  disabled: boolean;
};

const noteClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full resize-none rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

const MerchantSection = ({
  group,
  draft,
  onChange,
  voucherDiscount,
  onVoucherApplied,
  disabled,
}: MerchantSectionProps) => (
  <section className="flex flex-col gap-[11px]">
    <div className="flex items-center gap-3">
      <Store aria-hidden className="text-text-primary size-6 shrink-0" />
      <Link
        href={`/dashboard/merchant/${group.merchant.id}`}
        className="text-text-primary truncate text-sm font-bold underline-offset-2 active:underline"
      >
        {storeLabel(group.merchant)}
      </Link>
    </div>

    <ul className="flex flex-col gap-[11px]">
      {group.items.map((item) => (
        <CheckoutItemRow key={item.id} item={item} />
      ))}
    </ul>

    <div className="flex flex-col gap-2">
      <label htmlFor={`note-${group.merchant.id}`} className="text-text-secondary text-xs font-semibold">
        Tambah catatan ke penjual
      </label>
      <textarea
        id={`note-${group.merchant.id}`}
        rows={2}
        maxLength={MAX_NOTE_LENGTH}
        value={draft.note}
        disabled={disabled}
        placeholder="Contoh: tolong bungkus tambahan bubble wrap"
        className={noteClass}
        onChange={(event) => onChange({ note: event.target.value })}
      />
    </div>

    <label className="flex items-start gap-3">
      <Checkbox
        className="mt-0.5"
        checked={draft.protection}
        disabled={disabled}
        onCheckedChange={(checked) => onChange({ protection: checked === true })}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-text-primary text-sm font-semibold">
          {PROTECTION_LABEL}
        </span>
        <span className="text-text-secondary text-xs">{PROTECTION_DESCRIPTION}</span>
      </span>
      <span className="text-button-primary shrink-0 text-sm font-bold">
        {formatPrice(PROTECTION_FEE)}
      </span>
    </label>

    <CourierPicker
      value={draft.courierId}
      disabled={disabled}
      onChange={(courierId) => onChange({ courierId })}
    />

    <VoucherField
      merchantId={group.merchant.id}
      subtotal={group.subtotal}
      applied={draft.voucherCode ? { code: draft.voucherCode, discount: voucherDiscount } : null}
      disabled={disabled}
      onApplied={(result) => {
        onChange({ voucherCode: result?.code ?? null });
        onVoucherApplied(result);
      }}
    />
  </section>
);

export default MerchantSection;
