import { MapPin, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import BackButton from "@/app/dashboard/profile/components/BackButton";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/addresses";
import { requireUser } from "@/lib/auth/guards";
import { getAddresses } from "@/lib/queries";

import AddressActions from "./components/AddressActions";

export const metadata: Metadata = {
  title: "Alamat Tersimpan",
};

// Prisma reads are invisible to Next's cache, so the page must render per request.
export const dynamic = "force-dynamic";

const AddressesPage = async () => {
  const session = await requireUser();
  const addresses = await getAddresses(session.userId);

  return (
    <PageContainer className="relative pt-[64px]">
      <BackButton />

      <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">
        Alamat Tersimpan
      </h1>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-[11px] py-[48px] text-center">
          <MapPin className="text-text-secondary size-10" />
          <h2 className="text-text-primary text-base font-bold">
            Belum ada alamat
          </h2>
          <p className="text-text-secondary text-sm">
            Tambahkan alamat supaya pesananmu bisa dikirim.
          </p>
          <Button asChild size="form" className="mt-[11px]">
            <Link href="/dashboard/profile/addresses/new">Tambah Alamat</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-[11px]">
          <ul className="flex flex-col gap-[11px]">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="bg-quarternary flex flex-col gap-2 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-[11px]">
                  <span className="text-text-primary truncate text-sm font-bold">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="bg-button-primary text-text-primary shrink-0 rounded-[4px] px-2 py-1 text-[10px] font-bold">
                      Utama
                    </span>
                  )}
                  <Link
                    href={`/dashboard/profile/addresses/${address.id}/edit`}
                    aria-label={`Ubah alamat ${address.label}`}
                    className="ml-auto shrink-0"
                  >
                    <Pencil size={16} className="text-text-secondary" />
                  </Link>
                </div>

                <p className="text-text-primary text-sm font-semibold">
                  {address.recipient} · {address.phone}
                </p>
                <p className="text-text-secondary text-xs">
                  {formatAddress(address)}
                </p>
                {address.note && (
                  <p className="text-text-secondary text-xs italic">
                    {address.note}
                  </p>
                )}

                <AddressActions
                  addressId={address.id}
                  isDefault={address.isDefault}
                />
              </li>
            ))}
          </ul>

          <Button asChild size="form" className="mt-[11px]">
            <Link href="/dashboard/profile/addresses/new">Tambah Alamat</Link>
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default AddressesPage;
