"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { MAX_CITY_LENGTH, MAX_STORE_NAME_LENGTH } from "@/lib/store";
import type { StoreInput } from "@/types/store";

import { updateStore } from "../actions";

type StoreFormProps = {
  store: StoreInput;
};

const fieldClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

const labelClass = "text-text-secondary text-xs font-semibold";

const StoreForm = ({ store }: StoreFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreInput>({ defaultValues: store });

  // The action returns instead of redirecting, so the toast still exists when the store page renders.
  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const result = await updateStore(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Profil toko diperbarui");
    router.push("/dashboard/store");
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="storeName" className={labelClass}>
          Nama toko
        </label>
        <input
          {...register("storeName", {
            maxLength: {
              value: MAX_STORE_NAME_LENGTH,
              message: `Nama toko maksimal ${MAX_STORE_NAME_LENGTH} karakter`,
            },
          })}
          id="storeName"
          placeholder="GitarMurah"
          className={fieldClass}
        />
        {errors.storeName && (
          <p className="text-button-primary text-xs">{errors.storeName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="city" className={labelClass}>
          Kota
        </label>
        <input
          {...register("city", {
            maxLength: {
              value: MAX_CITY_LENGTH,
              message: `Kota maksimal ${MAX_CITY_LENGTH} karakter`,
            },
          })}
          id="city"
          placeholder="Semarang"
          className={fieldClass}
        />
        {errors.city && <p className="text-button-primary text-xs">{errors.city.message}</p>}
      </div>

      <p className="text-text-secondary text-xs">
        Isi keduanya supaya pembeli melihat nama toko, misalnya GitarMurah_Semarang. Kosongkan
        untuk memakai nama akunmu.
      </p>

      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      <Button type="submit" size="form" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
};

export default StoreForm;
