"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types/category";

import { createProduct, updateProduct } from "../actions";
import ImageField from "./ImageField";

type ProductFormValues = {
  name: string;
  price: string;
  categoryId: string;
  weight: string;
  description: string;
  warranty: string;
  material: string;
  color: string;
  stock: string;
};

type EditableProduct = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  image: string | null;
  weight: number | null;
  description: string | null;
  warranty: string | null;
  material: string | null;
  color: string | null;
  stock: number;
};

type ProductFormProps = {
  categories: Category[];
  product?: EditableProduct;
};

const fieldClass =
  "bg-quarternary text-text-primary focus:ring-button-primary/40 w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2";

const labelClass = "text-text-secondary text-xs font-semibold";

const ProductForm = ({ categories, product }: ProductFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name ?? "",
      price: product ? String(product.price) : "",
      categoryId: product ? String(product.categoryId) : "",
      weight: product?.weight != null ? String(product.weight) : "",
      description: product?.description ?? "",
      warranty: product?.warranty ?? "",
      material: product?.material ?? "",
      color: product?.color ?? "",
      stock: product ? String(product.stock) : "",
    },
  });

  const canSubmit = categories.length > 0;

  // A file input cannot ride react-hook-form, so the action takes FormData instead of an object.
  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("price", values.price);
    formData.set("categoryId", values.categoryId);
    formData.set("weight", values.weight);
    formData.set("description", values.description);
    formData.set("warranty", values.warranty);
    formData.set("material", values.material);
    formData.set("color", values.color);
    formData.set("stock", values.stock);
    if (image) formData.set("image", image);

    if (!product) {
      const result = await createProduct(formData);
      if (result && !result.ok) setServerError(result.message);
      return;
    }

    formData.set("id", String(product.id));
    if (removeImage) formData.set("removeImage", "1");

    const result = await updateProduct(formData);
    if (result && !result.ok) setServerError(result.message);
  });

  const handleClearImage = () => {
    setImage(null);
    setRemoveImage(true);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>
          Nama produk
        </label>
        <input
          {...register("name", { required: "Nama produk wajib diisi" })}
          id="name"
          placeholder="Contoh: Yamaha F310"
          className={fieldClass}
        />
        {errors.name && (
          <p className="text-button-primary text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="price" className={labelClass}>
          Harga (Rp)
        </label>
        <input
          {...register("price", {
            required: "Harga wajib diisi",
            min: { value: 0, message: "Harga tidak boleh negatif" },
          })}
          id="price"
          type="number"
          min={0}
          placeholder="1500000"
          className={fieldClass}
        />
        {errors.price && (
          <p className="text-button-primary text-xs">{errors.price.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="categoryId" className={labelClass}>
          Kategori
        </label>
        <Controller
          control={control}
          name="categoryId"
          rules={{ required: "Kategori wajib dipilih" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-button-primary text-xs">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="weight" className={labelClass}>
          Berat satuan (kg)
        </label>
        <input
          {...register("weight", {
            min: { value: 0, message: "Berat tidak boleh negatif" },
          })}
          id="weight"
          type="number"
          min={0}
          placeholder="15"
          className={fieldClass}
        />
        {errors.weight && (
          <p className="text-button-primary text-xs">{errors.weight.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="warranty" className={labelClass}>
          Garansi
        </label>
        <input
          {...register("warranty")}
          id="warranty"
          placeholder="1 bulan"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="material" className={labelClass}>
          Material
        </label>
        <input
          {...register("material")}
          id="material"
          placeholder="Rosewood"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="color" className={labelClass}>
          Warna
        </label>
        <input
          {...register("color")}
          id="color"
          placeholder="Natural"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClass}>
          Deskripsi
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={3}
          placeholder="Dibuat dengan teknik pembuatan gitar Yamaha untuk seri premium"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="stock" className={labelClass}>
          Stok
        </label>
        <input
          {...register("stock", {
            min: { value: 0, message: "Stok tidak boleh negatif" },
          })}
          id="stock"
          type="number"
          min={0}
          placeholder="10"
          className={fieldClass}
        />
        {errors.stock && (
          <p className="text-button-primary text-xs">{errors.stock.message}</p>
        )}
      </div>

      <ImageField
        file={image}
        existingUrl={removeImage ? null : (product?.image ?? null)}
        onChange={setImage}
        onClear={handleClearImage}
        onReject={setImageError}
        error={imageError}
      />

      {serverError && <p className="text-button-primary text-xs">{serverError}</p>}

      {!canSubmit && (
        <p className="text-text-secondary text-xs">
          Butuh minimal 1 kategori. Jalankan `pnpm prisma db seed`.
        </p>
      )}

      <Button type="submit" size="form" disabled={isSubmitting || !canSubmit}>
        {isSubmitting
          ? "Menyimpan..."
          : product
            ? "Simpan Perubahan"
            : "Tambah Produk"}
      </Button>
    </form>
  );
};

export default ProductForm;
