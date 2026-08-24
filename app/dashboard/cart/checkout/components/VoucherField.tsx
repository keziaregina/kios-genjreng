"use client";

import { Ticket, X } from "lucide-react";
import React, { useState, useTransition } from "react";

import { formatPrice } from "@/lib/utils";

import { previewVoucher } from "../voucher-actions";

type VoucherFieldProps = {
  merchantId: number;
  subtotal: number;
  applied: { code: string; discount: number } | null;
  disabled: boolean;
  onApplied: (result: { code: string; discount: number } | null) => void;
};

// One "Terapkan" checks the code before checkout, but the final price is always recomputed server-side at submit.
const VoucherField = ({ merchantId, subtotal, applied, disabled, onApplied }: VoucherFieldProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const apply = () => {
    setError(null);
    startTransition(async () => {
      const result = await previewVoucher(merchantId, code, subtotal);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onApplied({ code: code.trim().toUpperCase(), discount: result.discount });
      setCode("");
    });
  };

  if (applied) {
    return (
      <div className="bg-quarternary flex w-full items-center gap-3 rounded-xl px-5 py-[15px]">
        <Ticket aria-hidden className="text-button-primary size-5 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-primary truncate text-sm font-semibold">
            {applied.code}
          </span>
          <span className="text-button-primary text-xs font-bold">
            Diskon {formatPrice(applied.discount)}
          </span>
        </div>
        <button
          type="button"
          aria-label="Hapus kode voucher"
          disabled={disabled}
          onClick={() => onApplied(null)}
        >
          <X className="text-text-secondary size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-quarternary flex w-full items-center gap-3 rounded-xl px-5 py-[15px]">
        <Ticket aria-hidden className="text-text-secondary size-5 shrink-0" />
        <input
          value={code}
          disabled={disabled || pending}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Masukkan kode promo"
          aria-label="Kode promo"
          className="placeholder:text-text-secondary text-text-primary w-full bg-transparent text-sm font-semibold outline-0"
        />
        <button
          type="button"
          disabled={disabled || pending || code.trim() === ""}
          onClick={apply}
          className="text-button-primary shrink-0 text-xs font-bold disabled:opacity-50"
        >
          {pending ? "Memeriksa..." : "Terapkan"}
        </button>
      </div>
      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default VoucherField;
