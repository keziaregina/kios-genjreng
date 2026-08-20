import React from "react";

import { requireUser } from "@/lib/auth/guards";
import { getCartItemCount } from "@/lib/queries";
import { Role } from "@/types/user";

import ChatSheet from "./components/ChatSheet";
import Navigation from "./components/Navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  // Middleware only checks the signature, so the revocable check runs once here for every dashboard route.
  const session = await requireUser();
  // Only the buyer nav owns a cart button, so the merchant shell skips the count query entirely.
  const cartCount =
    session.role === Role.BUYER ? await getCartItemCount(session.userId) : 0;

  return (
    <div className="bg-primary flex min-h-screen w-full flex-col">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <ChatSheet />
      <Navigation role={session.role} cartCount={cartCount} />
    </div>
  );
};

export default Layout;
