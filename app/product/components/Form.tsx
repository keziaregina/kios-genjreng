"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";
import type { PublicUser } from "@/types/user";

import { createProduct } from "../actions";

type ProductFormValues = {
  name: string;
  price: string;
  categoryId: string;
  userId: string;
};

type ProductFormProps = {
  categories: Category[];
  users: PublicUser[];
};

const fieldClass =
  "bg-quarternary text-text-primary rounded-xl px-4 py-3 text-sm font-semibold outline-none";

const ProductForm = ({ categories, users }: ProductFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>();

  const canSubmit = categories.length > 0 && users.length > 0;

  const onSubmit = handleSubmit(async (values) => {
    const result = await createProduct({
      name: values.name,
      price: Number(values.price),
      categoryId: Number(values.categoryId),
      userId: Number(values.userId),
    });

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    setServerError(null);
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input
        {...register("name", { required: "Nama produk wajib diisi" })}
        placeholder="Nama produk"
        className={fieldClass}
      />
      {errors.name && (
        <p className="text-button-primary text-xs">{errors.name.message}</p>
      )}

      <input
        {...register("price", {
          required: "Harga wajib diisi",
          min: { value: 0, message: "Harga tidak boleh negatif" },
        })}
        type="number"
        min={0}
        placeholder="Harga"
        className={fieldClass}
      />
      {errors.price && (
        <p className="text-button-primary text-xs">{errors.price.message}</p>
      )}

      <select
        {...register("categoryId", { required: "Kategori wajib dipilih" })}
        className={fieldClass}
        defaultValue=""
      >
        <option value="" disabled>
          Pilih kategori
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        {...register("userId", { required: "Penjual wajib dipilih" })}
        className={fieldClass}
        defaultValue=""
      >
        <option value="" disabled>
          Pilih penjual
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      {!canSubmit && (
        <p className="text-text-secondary text-xs">
          Butuh minimal 1 kategori dan 1 user. Jalankan `pnpm prisma db seed`.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting || !canSubmit} className="py-6">
        {isSubmitting ? "Menyimpan..." : "Tambah Produk"}
      </Button>
    </form>
  );
};

export default ProductForm;
