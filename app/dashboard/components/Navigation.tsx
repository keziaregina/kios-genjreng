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

const Navigation = ({ role }: { role: Role }) => {
  const pathname = usePathname();

  if (pathname === "/dashboard/profile") return null;

  const center = centerItem[role];
  const CenterIcon = center.icon;

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
          aria-label={center.label}
          className="text-text-primary bg-button-secondary flex h-14 w-14 items-center justify-center rounded-md"
        >
          <CenterIcon />
        </Link>
        {trailingItems.map(renderTab)}
      </div>
    </nav>
  );
};

export default Navigation;
