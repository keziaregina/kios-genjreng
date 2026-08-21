"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps = { className?: string };

// Pages that scroll under the chevron pin it themselves, so the default stays parked on the page corner.
const BackButton = ({ className }: BackButtonProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      aria-label="Kembali"
      className={cn(
        "text-text-primary absolute top-5 left-5 z-10 cursor-pointer p-0",
        className,
      )}
    >
      <ChevronLeft size={25} />
    </Button>
  );
};

export default BackButton;
