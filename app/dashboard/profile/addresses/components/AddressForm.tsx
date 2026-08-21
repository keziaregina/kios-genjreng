"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { ADDRESS_FIELDS, MAX_ADDRESS_NOTE_LENGTH } from "@/lib/addresses";
import type { Address, AddressInput } from "@/types/address";

import { createAddress, updateAddress } from "../actions";

type AddressFormProps = {
  address?: Address;
};

const fieldClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

const labelClass = "text-text-secondary text-xs font-semibold";

const AddressForm = ({ address }: AddressFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    defaultValues: {
      label: address?.label ?? "",
      recipient: address?.recipient ?? "",
      phone: address?.phone ?? "",
      street: address?.street ?? "",
      village: address?.village ?? "",
      district: address?.district ?? "",
      city: address?.city ?? "",
      postalCode: address?.postalCode ?? "",
      note: address?.note ?? "",
      isDefault: address?.isDefault ?? false,
    },
  });

  // The action returns instead of redirecting, so the toast still exists when the list renders.
  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const result = address
      ? await updateAddress(address.id, values)
      : await createAddress(values);

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success(address ? "Alamat diperbarui" : "Alamat disimpan");
    router.push("/dashboard/profile/addresses");
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      {ADDRESS_FIELDS.map((field) => (
        <div key={field.key} className="flex flex-col gap-2">
          <label htmlFor={field.key} className={labelClass}>
            {field.label}
          </label>
          {field.multiline ? (
            <textarea
              {...register(field.key, {
                required: `${field.label} wajib diisi`,
                maxLength: {
                  value: field.max,
                  message: `${field.label} maksimal ${field.max} karakter`,
                },
              })}
              id={field.key}
              rows={3}
              placeholder={field.placeholder}
              className={`${fieldClass} resize-none`}
            />
          ) : (
            <input
              {...register(field.key, {
                required: `${field.label} wajib diisi`,
                maxLength: {
                  value: field.max,
                  message: `${field.label} maksimal ${field.max} karakter`,
                },
              })}
              id={field.key}
              placeholder={field.placeholder}
              className={fieldClass}
            />
          )}
          {errors[field.key] && (
            <p className="text-button-primary text-xs">
              {errors[field.key]?.message}
            </p>
          )}
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className={labelClass}>
          Catatan untuk kurir (opsional)
        </label>
        <textarea
          {...register("note", {
            maxLength: {
              value: MAX_ADDRESS_NOTE_LENGTH,
              message: `Catatan maksimal ${MAX_ADDRESS_NOTE_LENGTH} karakter`,
            },
          })}
          id="note"
          rows={2}
          placeholder="Contoh: rumah pagar hijau, titip ke satpam"
          className={`${fieldClass} resize-none`}
        />
        {errors.note && (
          <p className="text-button-primary text-xs">{errors.note.message}</p>
        )}
      </div>

      <Controller
        control={control}
        name="isDefault"
        render={({ field }) => (
          <label className="text-text-primary flex items-center gap-3 text-sm font-semibold">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={isSubmitting}
            />
            Jadikan alamat utama
          </label>
        )}
      />

      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      <Button type="submit" size="form" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan Alamat"}
      </Button>
    </form>
  );
};

export default AddressForm;
