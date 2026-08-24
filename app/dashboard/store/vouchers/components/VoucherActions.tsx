"use client";

import React, { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/types/action";

import { deleteVoucher, toggleVoucherActive } from "../actions";

type VoucherActionsProps = {
  voucherId: number;
  isActive: boolean;
};

const VoucherActions = ({ voucherId, isActive }: VoucherActionsProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const run = (action: () => Promise<ActionResult>, done: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(done);
      else toast.error(result.message);
      setOpen(false);
    });
  };

  return (
    <div className="flex flex-wrap gap-[11px]">
      <Button
        type="button"
        size="sm"
        variant="selected"
        disabled={pending}
        onClick={() =>
          run(
            () => toggleVoucherActive(voucherId, !isActive),
            isActive ? "Voucher dinonaktifkan" : "Voucher diaktifkan",
          )
        }
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-button-primary"
            disabled={pending}
          >
            Hapus
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus voucher ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Voucher akan hilang dari daftar. Pesanan lama yang sudah memakainya
              tetap menyimpan diskonnya sendiri.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                run(() => deleteVoucher(voucherId), "Voucher dihapus");
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoucherActions;
