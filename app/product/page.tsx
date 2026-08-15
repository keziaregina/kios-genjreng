import type { Metadata } from "next";

import { inter } from "@/app/ui/font";
import { getCategories, getProducts, getUsers } from "@/lib/queries";

import ProductForm from "./components/Form";

export const metadata: Metadata = {
  title: "Produk",
};

// Prisma reads are invisible to Next's cache, so without this the page would be
// prerendered once at build time and never reflect later writes.
export const dynamic = "force-dynamic";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function ProductPage() {
  // Server Component: query the database directly. No HTTP hop to our own API.
  const [products, categories, users] = await Promise.all([
    getProducts(),
    getCategories(),
    getUsers(),
  ]);

  return (
    <div
      className={`bg-primary min-h-screen px-[26px] py-[24px] ${inter.className}`}
    >
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Produk
      </h1>

      {products.length === 0 ? (
        <p className="text-text-secondary mb-[21px] text-sm">
          Belum ada produk.
        </p>
      ) : (
        <ul className="mb-[21px] flex flex-col gap-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="bg-quarternary text-text-primary flex items-center justify-between rounded-xl px-4 py-3"
            >
              <span className="font-semibold">{product.name}</span>
              <span className="text-text-secondary text-xs">
                {product.category.name} · {priceFormatter.format(product.price)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <ProductForm categories={categories} users={users} />
    </div>
  );
}
