import type { Metadata } from "next";

import RegisterForm from "./components/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar",
};

const RegisterPage = () => {
  return (
    <div className="bg-primary flex min-h-screen flex-col gap-[54px] py-20">
      <header className="flex w-full flex-col items-center justify-center gap-2">
        <h1 className="text-button-primary text-[22px] font-bold">
          Bikin Akun Dulu Yuk
        </h1>
        <h2 className="text-secondary w-[60%] text-center text-[15px]">
          Mau beli gitar atau mau jualan gitar?
        </h2>
      </header>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
