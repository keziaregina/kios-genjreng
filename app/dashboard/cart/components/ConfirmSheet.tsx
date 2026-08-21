"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type ConfirmSheetProps = {
  open: boolean;
  pending: boolean;
  title: string;
  question?: string;
  confirmLabel?: string;
  pendingLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  children: React.ReactNode;
};

// Both delete paths ask the same question, so the sheet shell is declared once and only its preview differs.
const ConfirmSheet = ({
  open,
  pending,
  title,
  question = "Yakin mau dihapus?",
  confirmLabel = "Ya, hapus",
  pendingLabel = "Menghapus...",
  onOpenChange,
  onConfirm,
  children,
}: ConfirmSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="bottom"
      showCloseButton={false}
      aria-describedby={undefined}
      className="bg-surface gap-0 rounded-t-2xl border-0 px-[26px] pt-[12px] pb-[24px]"
    >
      <div className="bg-text-secondary mx-auto h-1 w-10 shrink-0 rounded-full" />

      <SheetTitle className="text-text-primary mt-[18px] mb-[21px] text-center text-lg font-extrabold">
        {title}
      </SheetTitle>

      {children}

      <div className="border-divider my-[18px] w-full border-t" />

      <p className="text-text-primary mb-[14px] text-sm font-semibold">{question}</p>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="accent"
          size="form"
          className="flex-1"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          Tidak
        </Button>
        <Button
          type="button"
          size="form"
          className="flex-[1.6]"
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
);

export default ConfirmSheet;
