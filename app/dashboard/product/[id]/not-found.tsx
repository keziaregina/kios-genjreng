import Link from "next/link";
import React from "react";

import { inter } from "@/app/ui/font";

const NotFound = () => (
  <div className={`px-[26px] py-[24px] ${inter.className}`}>
    <h1 className="text-text-primary text-[20px] font-extrabold">
      Produk tidak ditemukan
    </h1>
    <p className="text-text-secondary mt-2 text-sm">
      Produk ini sudah tidak dijual atau tautannya salah.
    </p>
    <Link
      href="/dashboard"
      className="bg-button-primary text-text-primary mt-[21px] inline-flex rounded-xl px-4 py-3 text-sm font-semibold"
    >
      Kembali ke Beranda
    </Link>
  </div>
);

export default NotFound;
