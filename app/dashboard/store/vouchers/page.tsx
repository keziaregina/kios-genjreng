import { Pencil, Ticket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";
import { requireMerchant } from "@/lib/auth/guards";
import { getVouchersByMerchant } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

import VoucherActions from "./components/VoucherActions";

export const metadata: Metadata = {
  title: "Voucher Toko",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

function discountLabel(voucher: { discountType: string; amount: number }) {
  return voucher.discountType === "PERCENTAGE"
    ? `${voucher.amount}%`
    : formatPrice(voucher.amount);
}

const VouchersPage = async () => {
  const session = await requireMerchant();
  const vouchers = await getVouchersByMerchant(session.userId);

  return (
    <PageContainer>
      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Voucher Toko
      </h1>

      {vouchers.length === 0 ? (
        <div className="flex flex-col items-center gap-[11px] py-[48px] text-center">
          <Ticket className="text-text-secondary size-10" />
          <h2 className="text-text-primary text-base font-bold">Belum ada voucher</h2>
          <p className="text-text-secondary text-sm">
            Buat kode promo untuk menarik pembeli.
          </p>
          <Button asChild size="form" className="mt-[11px]">
            <Link href="/dashboard/store/vouchers/new">Tambah Voucher</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-[11px]">
          <ul className="flex flex-col gap-[11px]">
            {vouchers.map((voucher) => (
              <li
                key={voucher.id}
                className="bg-quarternary flex flex-col gap-2 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-[11px]">
                  <span className="text-text-primary truncate text-sm font-bold">
                    {voucher.code}
                  </span>
                  <span
                    className={`shrink-0 rounded-[4px] px-2 py-1 text-[10px] font-bold ${
                      voucher.isActive
                        ? "bg-button-primary text-text-primary"
                        : "bg-surface text-text-secondary"
                    }`}
                  >
                    {voucher.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  <Link
                    href={`/dashboard/store/vouchers/${voucher.id}/edit`}
                    aria-label={`Ubah voucher ${voucher.code}`}
                    className="ml-auto shrink-0"
                  >
                    <Pencil size={16} className="text-text-secondary" />
                  </Link>
                </div>

                <p className="text-text-primary text-sm font-semibold">
                  Diskon {discountLabel(voucher)}
                  {voucher.minPurchase > 0 &&
                    ` · Min. belanja ${formatPrice(voucher.minPurchase)}`}
                </p>
                <p className="text-text-secondary text-xs">
                  Dipakai {voucher.usedCount}
                  {voucher.usageLimit !== null ? `/${voucher.usageLimit}` : ""} kali
                  {voucher.expiresAt &&
                    ` · Berlaku sampai ${voucher.expiresAt.toLocaleDateString("id-ID")}`}
                </p>

                <VoucherActions voucherId={voucher.id} isActive={voucher.isActive} />
              </li>
            ))}
          </ul>

          <Button asChild size="form" className="mt-[11px]">
            <Link href="/dashboard/store/vouchers/new">Tambah Voucher</Link>
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default VouchersPage;
