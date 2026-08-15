"use client";

import React from "react";
import { House, Search, ShoppingBasket, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();

  if (pathname === "/dashboard/profile") return null;

  return (
    <nav className="sticky bottom-0">
      <div className="flex pt-[48px] pb-[24px] bg-linear-to-t from-primary to-transparent from-75% w-full justify-around items-center">
        <Link href="/dashboard" className="flex flex-col items-center justify-center">
          <House className="text-text-secondary"/>
          <p className="text-sm text-text-secondary">Home</p>
        </Link>
        <Link href="/dashboard/search" className="flex flex-col items-center justify-center">
          <Search className="text-text-secondary"/>
          <p className="text-sm text-text-secondary">Search</p>
        </Link>
        <Link href="/dashboard/store" className="text-text-primary w-14 h-14 bg-button-secondary flex justify-center items-center rounded-md">
          <Store/>
        </Link>
        <Link href="/dashboard/cart" className="flex flex-col items-center justify-center">
          <ShoppingBasket  className="text-text-secondary"/>
          <p className="text-sm text-text-secondary">Cart</p>
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center justify-center">
          <User  className="text-text-secondary"/>
          <p className="text-sm text-text-secondary">Profile</p>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
