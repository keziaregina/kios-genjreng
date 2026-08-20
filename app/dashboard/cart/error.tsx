"use client";

import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";
import { Button } from "@/components/ui/button";

// The raw message can carry query details, so the boundary shows a fixed line and offers a retry.
const Error = ({ reset }: { error: Error; reset: () => void }) => (
  <PageContainer>
    <h1 className="text-text-primary mb-[21px] text-[20px] font-extrabold">Keranjang</h1>
    <p className="text-text-secondary mb-[11px] text-sm">Gagal memuat keranjang.</p>
    <Button type="button" size="form" onClick={reset}>
      Coba lagi
    </Button>
  </PageContainer>
);

export default Error;
