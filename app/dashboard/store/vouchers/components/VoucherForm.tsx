"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { MAX_VOUCHER_CODE_LENGTH } from "@/lib/vouchers";
import type { Voucher, VoucherInput } from "@/types/voucher";

import { createVoucher, updateVoucher } from "../actions";

type VoucherFormProps = {
  voucher?: Voucher;
};

const fieldClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

const labelClass = "text-text-secondary text-xs font-semibold";

function toDateInput(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

const VoucherForm = ({ voucher }: VoucherFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VoucherInput>({
    defaultValues: {
      code: voucher?.code ?? "",
      discountType: voucher?.discountType ?? "PERCENTAGE",
      amount: voucher ? String(voucher.amount) : "",
      maxDiscount: voucher?.maxDiscount !== null && voucher?.maxDiscount !== undefined
        ? String(voucher.maxDiscount)
        : "",
      minPurchase: voucher ? String(voucher.minPurchase) : "0",
      usageLimit: voucher?.usageLimit !== null && voucher?.usageLimit !== undefined
        ? String(voucher.usageLimit)
        : "",
      expiresAt: toDateInput(voucher?.expiresAt),
      isActive: voucher?.isActive ?? true,
    },
  });

  const discountType = watch("discountType");

  // The action returns instead of redirecting, so the toast still exists when the list renders.
  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const result = voucher
      ? await updateVoucher(voucher.id, values)
      : await createVoucher(values);

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success(voucher ? "Voucher diperbarui" : "Voucher disimpan");
    router.push("/dashboard/store/vouchers");
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="code" className={labelClass}>
          Kode voucher
        </label>
        <input
          {...register("code", {
            required: "Kode voucher wajib diisi",
            maxLength: {
              value: MAX_VOUCHER_CODE_LENGTH,
              message: `Kode voucher maksimal ${MAX_VOUCHER_CODE_LENGTH} karakter`,
            },
          })}
          id="code"
          placeholder="DISKON10"
          className={fieldClass}
        />
        {errors.code && <p className="text-button-primary text-xs">{errors.code.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="discountType" className={labelClass}>
          Tipe diskon
        </label>
        <Controller
          control={control}
          name="discountType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
              <SelectTrigger id="discountType" aria-label="Pilih tipe diskon">
                <SelectValue placeholder="Pilih tipe diskon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Persentase</SelectItem>
                <SelectItem value="FIXED">Nominal tetap</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="amount" className={labelClass}>
          {discountType === "PERCENTAGE" ? "Diskon (%)" : "Diskon (Rp)"}
        </label>
        <input
          {...register("amount", { required: "Nilai diskon wajib diisi" })}
          id="amount"
          type="number"
          inputMode="numeric"
          placeholder={discountType === "PERCENTAGE" ? "10" : "10000"}
          className={fieldClass}
        />
        {errors.amount && (
          <p className="text-button-primary text-xs">{errors.amount.message}</p>
        )}
      </div>

      {discountType === "PERCENTAGE" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="maxDiscount" className={labelClass}>
            Diskon maksimal (opsional)
          </label>
          <input
            {...register("maxDiscount")}
            id="maxDiscount"
            type="number"
            inputMode="numeric"
            placeholder="50000"
            className={fieldClass}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="minPurchase" className={labelClass}>
          Minimum belanja
        </label>
        <input
          {...register("minPurchase")}
          id="minPurchase"
          type="number"
          inputMode="numeric"
          placeholder="0"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="usageLimit" className={labelClass}>
          Batas pemakaian (opsional)
        </label>
        <input
          {...register("usageLimit")}
          id="usageLimit"
          type="number"
          inputMode="numeric"
          placeholder="Tanpa batas"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="expiresAt" className={labelClass}>
          Berlaku sampai (opsional)
        </label>
        <input {...register("expiresAt")} id="expiresAt" type="date" className={fieldClass} />
      </div>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="text-text-primary flex items-center gap-3 text-sm font-semibold">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={isSubmitting}
            />
            Aktif
          </label>
        )}
      />

      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      <Button type="submit" size="form" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan Voucher"}
      </Button>
    </form>
  );
};

export default VoucherForm;
