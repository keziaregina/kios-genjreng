import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type SectionHeaderProps = {
  title: string;
  href: string;
};

// "lihat semua" reruns the same page with a sort, so a preview strip never dead-ends.
const SectionHeader = ({ title, href }: SectionHeaderProps) => (
  <div className="mb-[9px] flex items-center justify-between">
    <h2 className="text-text-primary text-[16px] font-extrabold">{title}</h2>
    <Link
      href={href}
      className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-[11px]"
    >
      lihat semua
      <ChevronRight size={14} />
    </Link>
  </div>
);

export default SectionHeader;
