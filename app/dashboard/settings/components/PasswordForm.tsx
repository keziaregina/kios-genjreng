"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { MIN_PASSWORD_LENGTH } from "@/lib/account";
import type { PasswordInput } from "@/types/account";

import { changePassword } from "../actions";

const fieldClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

const labelClass = "text-text-secondary text-xs font-semibold";

const PasswordForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordInput>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Nothing on screen reads the password, so a success only has to empty the three boxes.
  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const result = await changePassword(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    toast.success("Password diganti, perangkat lain harus masuk lagi");
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="currentPassword" className={labelClass}>
          Password lama
        </label>
        <input
          {...register("currentPassword", { required: "Password lama wajib diisi" })}
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          className={fieldClass}
        />
        {errors.currentPassword && (
          <p className="text-button-primary text-xs">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="newPassword" className={labelClass}>
          Password baru
        </label>
        <input
          {...register("newPassword", {
            required: "Password baru wajib diisi",
            minLength: {
              value: MIN_PASSWORD_LENGTH,
              message: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter`,
            },
          })}
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
        />
        {errors.newPassword && (
          <p className="text-button-primary text-xs">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className={labelClass}>
          Ulangi password baru
        </label>
        <input
          {...register("confirmPassword", {
            required: "Konfirmasi password wajib diisi",
            validate: (value) =>
              value === watch("newPassword") || "Konfirmasi password tidak sama",
          })}
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
        />
        {errors.confirmPassword && (
          <p className="text-button-primary text-xs">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      <Button type="submit" size="form" disabled={isSubmitting}>
        {isSubmitting ? "Mengganti..." : "Ganti Password"}
      </Button>
    </form>
  );
};

export default PasswordForm;
