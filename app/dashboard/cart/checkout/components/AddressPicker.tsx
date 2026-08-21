"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatAddress } from "@/lib/addresses";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/address";

type AddressPickerProps = {
  addresses: Address[];
  selectedId: number | null;
  onSelect: (addressId: number) => void;
  disabled: boolean;
};

const AddressPicker = ({
  addresses,
  selectedId,
  onSelect,
  disabled,
}: AddressPickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = addresses.find((address) => address.id === selectedId);

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col gap-2 py-[12px]">
        <p className="text-text-primary text-sm font-semibold">Alamat</p>
        <p className="text-text-secondary text-xs">
          Belum ada alamat tersimpan. Tambahkan dulu supaya pesanan bisa dikirim.
        </p>
        <Button asChild size="sm" variant="selected" className="self-start">
          <Link href="/dashboard/profile/addresses/new">Tambah Alamat</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 py-[12px] text-left active:opacity-80 disabled:opacity-50"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-primary text-sm font-semibold">Alamat</span>
          <span className="text-text-secondary truncate text-xs">
            {selected ? formatAddress(selected) : "Pilih alamat pengiriman"}
          </span>
        </span>
        <ChevronRight size={16} className="text-text-secondary shrink-0" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="bg-primary border-divider max-h-[70dvh] overflow-y-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-text-primary">Pilih Alamat</SheetTitle>
            <SheetDescription className="text-text-secondary">
              Alamat ini yang dicetak pada pesanan.
            </SheetDescription>
          </SheetHeader>

          <ul className="flex flex-col gap-[11px] px-4 pb-6">
            {addresses.map((address) => (
              <li key={address.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(address.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left",
                    address.id === selectedId
                      ? "border-button-primary bg-quarternary"
                      : "border-divider",
                  )}
                >
                  <span className="text-text-primary text-sm font-bold">
                    {address.label}
                  </span>
                  <span className="text-text-primary text-xs font-semibold">
                    {address.recipient} · {address.phone}
                  </span>
                  <span className="text-text-secondary text-xs">
                    {formatAddress(address)}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="px-4 pb-6">
            <Button asChild size="form" variant="accent">
              <Link href="/dashboard/profile/addresses/new">Tambah Alamat Baru</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AddressPicker;
