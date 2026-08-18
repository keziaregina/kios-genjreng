import {
  Heart,
  Key,
  Lock,
  Clock3,
  Bookmark,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  CircleQuestionMark,
  InfoIcon,
  Copyright,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import React from "react";

import { logout } from "@/app/auth/actions";
import { getCurrentUser, requireUser } from "@/lib/auth/guards";
import { Role } from "@/types/user";

import BackButton from "./components/BackButton";
import { becomeMerchant } from "./actions";

export const metadata: Metadata = {
  title: "Profil",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

type MenuItem = {
  name: string;
  icon: LucideIcon;
  url?: string;
  action?: () => Promise<void>;
};

const buyerMenu: MenuItem[] = [
  { name: "Favorit", icon: Heart },
  { name: "Keranjang", icon: ShoppingCart },
  { name: "Riwayat Pesanan", icon: Clock3 },
  { name: "Alamat Tersimpan", icon: Bookmark },
  { name: "Buka Toko", icon: Store, action: becomeMerchant },
  { name: "Privasi", icon: Lock },
  { name: "Keamanan", icon: ShieldCheck },
  { name: "Log Out", icon: Key, action: logout },
];

const merchantMenu: MenuItem[] = [
  { name: "Toko Saya", icon: Store, url: "/dashboard/store" },
  { name: "Produk Saya", icon: Package, url: "/product" },
  { name: "Riwayat Pesanan", icon: Clock3 },
  { name: "Privasi", icon: Lock },
  { name: "Keamanan", icon: ShieldCheck },
  { name: "Log Out", icon: Key, action: logout },
];

const Page = async () => {
  const session = await requireUser();
  const user = await getCurrentUser();
  const menu = session.role === Role.MERCHANT ? merchantMenu : buyerMenu;

  return (
    <div className="relative flex h-screen flex-col">
      <BackButton />
      <div className="h-[30vh] w-full" />

      <div className="absolute top-56 flex w-full items-center justify-center">
        <div className="bg-quarternary absolute -top-15 z-20 flex h-[90px] w-[90%] items-center justify-center rounded-[20px]">
          <div className="absolute -top-5 flex flex-col items-center gap-[10px]">
            <div className="bg-avatar-bg flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-black">
              <User size={40} />
            </div>
            <p className="text-text-primary font-bold tracking-wide">
              {user?.name ?? "Pengguna"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface relative w-full flex-1 overflow-y-scroll rounded-t-2xl px-[33px] pt-[73px]">
        <ul className="text-text-primary mb-[54px] flex flex-col gap-5 font-semibold">
          {menu.map(({ name, icon: Icon, url, action }) => (
            <li key={name} className="flex gap-5">
              {action ? (
                <form action={action} className="flex gap-5">
                  <Icon className="text-button-primary" />
                  <button type="submit" className="cursor-pointer">
                    {name}
                  </button>
                </form>
              ) : url ? (
                <Link href={url} className="flex gap-5">
                  <Icon className="text-button-primary" />
                  <p>{name}</p>
                </Link>
              ) : (
                <>
                  <Icon className="text-button-primary" />
                  <p>{name}</p>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="text-text-secondary mb-[29px] flex flex-col gap-2 text-[10px] font-extrabold">
          <div className="flex items-center gap-[8px] tracking-widest">
            <InfoIcon />
            <span>Versi 3.03</span>
          </div>
          <div className="flex items-center gap-[8px] tracking-widest">
            <CircleQuestionMark />
            <span>Kebijakan</span>
          </div>
        </div>

        <div className="border-divider w-full border-t" />

        <div className="text-text-secondary flex items-center justify-center gap-[9px] py-5 text-[10px] font-semibold">
          <Copyright size={15} />
          <span>Kios Genjreng 2022</span>
        </div>
      </div>
    </div>
  );
};

export default Page;
