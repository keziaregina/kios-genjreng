import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import BackButton from "@/app/dashboard/profile/components/BackButton";
import { inter } from "@/app/ui/font";
import { parseId } from "@/lib/api";
import { requireMerchant } from "@/lib/auth/guards";
import { getCategories, getProduct } from "@/lib/queries";

import DeleteProductButton from "../../components/DeleteProductButton";
import ProductForm from "../../components/Form";

export const metadata: Metadata = {
  title: "Edit Produk",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const EditProductPage = async ({ params }: PageProps) => {
  const session = await requireMerchant();

  const id = parseId((await params).id);
  if (!id) notFound();

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  // A merchant editing someone else's product should see the same page as one that never existed.
  if (!product || product.userId !== session.userId) notFound();

  return (
    <div
      className={`bg-primary relative min-h-screen px-[26px] pt-[64px] pb-[24px] ${inter.className}`}
    >
      <BackButton />

      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Edit Produk
      </h1>

      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          image: product.image,
          weight: product.weight,
          description: product.description,
          warranty: product.warranty,
          material: product.material,
          color: product.color,
          stock: product.stock,
        }}
      />

      <div className="mt-[18px]">
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>
    </div>
  );
};

export default EditProductPage;
