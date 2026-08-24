import type { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import { getCurrentUser } from "@/lib/auth/guards";

import AccountForm from "./components/AccountForm";
import PasswordForm from "./components/PasswordForm";

export const metadata: Metadata = {
  title: "Pengaturan",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  // The form needs the row anyway, so one load stands in for requireUser().
  const user = await getCurrentUser();
  if (!user) redirect("/auth/session-expired");

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Pengaturan
      </h1>

      <section className="mb-[32px] flex flex-col gap-[11px]">
        <h2 className="text-text-primary text-base font-bold">Akun</h2>
        <AccountForm account={{ name: user.name, email: user.email }} />
      </section>

      <section className="flex flex-col gap-[11px]">
        <h2 className="text-text-primary text-base font-bold">Ganti Password</h2>
        <p className="text-text-secondary text-xs">
          Mengganti password akan mengeluarkan akunmu dari perangkat lain.
        </p>
        <PasswordForm />
      </section>
    </PageContainer>
  );
};

export default SettingsPage;
