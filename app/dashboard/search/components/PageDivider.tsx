"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const PageDivider = (props: {title: string, redirect: string}) => {
	const router = useRouter();

	const handleRedirect = (href: string) => {
		router.push(`/dashboard/${href}`)
	}
  return (
    <div className="mb-[9px] flex justify-between items-center">
      <h1 className="text-text-primary text-[15px] font-extrabold">
        {props.title}
      </h1>
      <Button
				onClick={() => {handleRedirect(props.redirect)}}
        variant={"ghost"}
        className="px-0 hover:bg-transparent text-[#A7A7A7] hover:text-[#cec4c4]"
      >
        <span className="text-[8px]">lihat semua</span>
        <ChevronRight size={15} />
      </Button>
    </div>
  );
};

export default PageDivider;
