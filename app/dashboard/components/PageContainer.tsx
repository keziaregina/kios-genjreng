import React from "react";

import { inter } from "@/app/ui/font";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

// Every dashboard page sits on the same gutter, so the shell is declared once instead of per route.
const PageContainer = ({ children, className }: PageContainerProps) => (
  <div className={cn("px-[26px] py-[24px]", inter.className, className)}>{children}</div>
);

export default PageContainer;
