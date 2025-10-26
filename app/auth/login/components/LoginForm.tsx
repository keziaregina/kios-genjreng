"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LoginForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault();
    console.log(form);
    router.push('/dashboard')
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-[30px] px-10">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="text-text-primary bg-tertiary/35 p-5 rounded-2xl border-none focus:outline-none focus:ring-0 focus:outline-offset-0 font-bold text-xs"
          value={form.username}
          onChange={handleChangeEvent}
        />
        <input
          type="text"
          name="password"
          placeholder="Password"
          className="text-text-primary bg-tertiary/35 p-5 rounded-2xl border-none focus:outline-none focus:ring-0 focus:outline-offset-0 font-bold text-xs"
          value={form.password}
          onChange={handleChangeEvent}
        />
      </div>
      <div className="text-text-primary w-full text-end px-10 mt-[17px] font-semibold text-xs hover:underline">
        <Link href={"/"} className="">
          Lupa Password?
        </Link>
      </div>

      <div className="mt-[54px] flex flex-col gap-8 items-center px-10 w-full">
        <Button className="w-full py-7 cursor-pointer" type="submit">
          Masuk
        </Button>

        <span className="text-text-primary text-sm">atau</span>

        <Button
          type="button"
          className="w-full py-7 cursor-pointer bg-tertiary/35 hover:bg-button-primary"
        >
          Masuk dengan Google
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
