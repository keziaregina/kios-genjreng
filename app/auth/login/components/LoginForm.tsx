"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { login } from "../../actions";

type LoginFormValues = {
  email: string;
  password: string;
};

const fieldClass =
  "text-text-primary bg-tertiary/35 p-5 rounded-2xl border-none focus:outline-none focus:ring-0 focus:outline-offset-0 font-bold text-xs";

const LoginForm = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    const result = await login(values);

    // Only a failure comes back — the action redirects on success.
    if (!result.ok) setServerError(result.message);
  });

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <div className="flex flex-col gap-[30px] px-10">
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
            {...register("password", { required: "Password wajib diisi" })}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className={fieldClass}
          />
          {errors.password && (
            <p className="text-button-primary text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-button-primary text-xs">{serverError}</p>
        )}
      </div>

      <div className="text-text-primary mt-[17px] w-full px-10 text-end text-xs font-semibold hover:underline">
        <Link href={"/"}>Lupa Password?</Link>
      </div>

      <div className="mt-[54px] flex w-full flex-col items-center gap-8 px-10">
        <Button className="w-full cursor-pointer py-7" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>

        <span className="text-text-primary text-sm">atau</span>

        <Button
          type="button"
          disabled
          title="Belum tersedia"
          className="bg-tertiary/35 hover:bg-button-primary w-full py-7"
        >
          Masuk dengan Google
        </Button>

        <p className="text-text-secondary text-xs">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-button-primary font-semibold hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
