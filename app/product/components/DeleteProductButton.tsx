"use client";

import { Trash2 } from "lucide-react";
import React, { useState } from "react";

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

import { deleteProduct } from "../actions";

type DeleteProductButtonProps = {
  productId: number;
  productName: string;
};

// Deleting is irreversible, so it happens behind a modal the merchant must answer.
const DeleteProductButton = ({
  productId,
  productName,
}: DeleteProductButtonProps) => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Radix closes on action click by default, but the modal must survive until the server answers.
  const handleDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    setPending(true);

    const result = await deleteProduct(productId);

    if (result && !result.ok) {
      setError(result.message);
      setPending(false);
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="form"
            className="text-button-primary"
          >
            <Trash2 size={18} />
            Hapus Produk
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{productName}&rdquo; akan dihapus permanen beserta fotonya.
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="selected" size="form" disabled={pending}>
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                variant="destructive"
                size="form"
                onClick={handleDelete}
                disabled={pending}
              >
                {pending ? "Menghapus..." : "Ya, hapus"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && <p className="text-button-primary text-xs">{error}</p>}
    </div>
  );
};

export default DeleteProductButton;
