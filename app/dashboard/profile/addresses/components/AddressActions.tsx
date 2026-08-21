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

import { deleteAddress, setDefaultAddress } from "../actions";

type AddressActionsProps = {
  addressId: number;
  isDefault: boolean;
};

const AddressActions = ({ addressId, isDefault }: AddressActionsProps) => {
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
      {!isDefault && (
        <Button
          type="button"
          size="sm"
          variant="selected"
          disabled={pending}
          onClick={() =>
            run(() => setDefaultAddress(addressId), "Alamat utama diperbarui")
          }
        >
          Jadikan Utama
        </Button>
      )}

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
            <AlertDialogTitle>Hapus alamat ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Alamat akan hilang dari daftar. Pesanan lama tetap menyimpan
              alamatnya sendiri.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                run(() => deleteAddress(addressId), "Alamat dihapus");
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

export default AddressActions;
