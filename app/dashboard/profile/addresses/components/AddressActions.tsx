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
import type { ActionResult } from "@/types/action";

import { deleteAddress, setDefaultAddress } from "../actions";

type AddressActionsProps = {
  addressId: number;
  isDefault: boolean;
};

const AddressActions = ({ addressId, isDefault }: AddressActionsProps) => {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message);
      setOpen(false);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-[11px]">
        {!isDefault && (
          <Button
            type="button"
            size="sm"
            variant="selected"
            disabled={pending}
            onClick={() => run(() => setDefaultAddress(addressId))}
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
                  run(() => deleteAddress(addressId));
                }}
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default AddressActions;
