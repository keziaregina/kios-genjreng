"use client";

import {
  House,
  Search,
  ShoppingBasket,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { Role } from "@/types/user";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const leadingItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/dashboard/search", label: "Search", icon: Search },
];

const trailingItems: NavItem[] = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

// Merchants sell and buyers only browse, so the centre button differs per role.
const centerItem: Record<Role, NavItem> = {
  [Role.BUYER]: { href: "/dashboard/cart", label: "Cart", icon: ShoppingBasket },
  [Role.MERCHANT]: { href: "/dashboard/store", label: "Store", icon: Store },
};

type NavigationProps = {
  role: Role;
  cartCount?: number;
};

const Navigation = ({ role, cartCount = 0 }: NavigationProps) => {
  const pathname = usePathname();

  // The product detail page pins its own buy bar to the bottom, so two stacked bars never fight for it.
  if (
    pathname === "/dashboard/profile" ||
    pathname === "/dashboard/cart" ||
    pathname.startsWith("/dashboard/product/")
  ) {
    return null;
  }

  const center = centerItem[role];
  const CenterIcon = center.icon;
  const badge = center.href === "/dashboard/cart" && cartCount > 0;

  const renderTab = ({ href, label, icon: Icon }: NavItem) => {
    const active = pathname === href;

    return (
      <Link
        key={href}
        href={href}
        className="flex flex-col items-center justify-center"
      >
        <Icon className={cn(active ? "text-text-primary" : "text-text-secondary")} />
        <p
          className={cn(
            "text-sm",
            active ? "text-text-primary" : "text-text-secondary",
          )}
        >
          {label}
        </p>
      </Link>
    );
  };

  return (
    <nav className="sticky bottom-0">
      <div className="from-primary flex w-full items-center justify-around bg-linear-to-t from-75% to-transparent pt-[48px] pb-[24px]">
        {leadingItems.map(renderTab)}
        <Link
          href={center.href}
          aria-label={badge ? `Keranjang, ${cartCount} barang` : center.label}
          className="text-text-primary bg-button-secondary relative flex h-14 w-14 items-center justify-center rounded-md"
        >
          <CenterIcon />
          {badge && (
            <span className="bg-button-primary text-text-primary absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </Link>
        {trailingItems.map(renderTab)}
      </div>
    </nav>
  );
};

export default Navigation;
