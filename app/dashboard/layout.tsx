import React from "react";

import { getSession } from "@/lib/auth/guards";
import { Role } from "@/types/user";

import Navigation from "./components/Navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  return (
    <div className="bg-primary flex min-h-screen w-full flex-col">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Navigation role={session?.role ?? Role.BUYER} />
    </div>
  );
};

export default Layout;
