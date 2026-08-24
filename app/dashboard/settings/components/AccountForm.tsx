"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { EMAIL_PATTERN, MAX_NAME_LENGTH } from "@/lib/account";
import type { AccountInput } from "@/types/account";

import { updateAccount } from "../actions";

type AccountFormProps = {
  account: AccountInput;
};

const fieldClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

const labelClass = "text-text-secondary text-xs font-semibold";

const AccountForm = ({ account }: AccountFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountInput>({ defaultValues: account });

  // The page stays put after saving, so a refresh is what pulls the new name into the greeting.
  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const result = await updateAccount(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Akun diperbarui");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>
          Nama
        </label>
        <input
          {...register("name", {
            required: "Nama wajib diisi",
            maxLength: {
              value: MAX_NAME_LENGTH,
              message: `Nama maksimal ${MAX_NAME_LENGTH} karakter`,
            },
          })}
          id="name"
          placeholder="Nama lengkapmu"
          className={fieldClass}
        />
        {errors.name && (
          <p className="text-button-primary text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          {...register("email", {
            required: "Email wajib diisi",
            pattern: { value: EMAIL_PATTERN, message: "Format email tidak valid" },
          })}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          className={fieldClass}
        />
        {errors.email && (
          <p className="text-button-primary text-xs">{errors.email.message}</p>
        )}
      </div>

      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      <Button type="submit" size="form" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan Akun"}
      </Button>
    </form>
  );
};

export default AccountForm;
