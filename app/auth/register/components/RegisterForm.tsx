"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Role } from "@/types/user";

import { register as registerAccount } from "../../actions";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const fieldClass =
  "text-text-primary bg-tertiary/35 p-5 rounded-2xl border-none focus:outline-none focus:ring-0 focus:outline-offset-0 font-bold text-xs";

const roleOptions = [
  { value: Role.BUYER, label: "Saya mau beli" },
  { value: Role.MERCHANT, label: "Saya mau jualan" },
];

const RegisterForm = () => {
  const [role, setRole] = useState<Role>(Role.BUYER);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    const result = await registerAccount({
      name: values.name,
      email: values.email,
      password: values.password,
      role,
    });

    // Only a failure comes back — the action redirects on success.
    if (!result.ok) setServerError(result.message);
  });

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <div className="flex flex-col gap-[30px] px-10">
        <div className="flex gap-4">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={cn(
                buttonVariants({
                  variant: role === option.value ? "default" : "selected",
                }),
                "flex-1 rounded-2xl py-7 text-xs font-bold",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <input
            {...register("name", { required: "Nama wajib diisi" })}
            type="text"
            placeholder="Nama"
            autoComplete="name"
            className={fieldClass}
          />
          {errors.name && (
            <p className="text-button-primary text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            {...register("email", { required: "Email wajib diisi" })}
            type="email"
            placeholder="Email"
            autoComplete="email"
            className={fieldClass}
          />
          {errors.email && (
            <p className="text-button-primary text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            {...register("password", {
              required: "Password wajib diisi",
              minLength: { value: 8, message: "Password minimal 8 karakter" },
            })}
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            className={fieldClass}
          />
          {errors.password && (
            <p className="text-button-primary text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            {...register("confirmPassword", {
              required: "Konfirmasi password wajib diisi",
              validate: (value) =>
                value === watch("password") || "Password tidak sama",
            })}
            type="password"
            placeholder="Konfirmasi Password"
            autoComplete="new-password"
            className={fieldClass}
          />
          {errors.confirmPassword && (
            <p className="text-button-primary text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-button-primary text-xs">{serverError}</p>
        )}
      </div>

      <div className="mt-[54px] flex w-full flex-col items-center gap-8 px-10">
        <Button className="w-full cursor-pointer py-7" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Daftar"}
        </Button>

        <p className="text-text-secondary text-xs">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-button-primary font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
