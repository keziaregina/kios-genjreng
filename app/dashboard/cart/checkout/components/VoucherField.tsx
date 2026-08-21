import { Ticket } from "lucide-react";
import React from "react";

// The voucher engine is not built yet, so the field is shown disabled rather than promising a discount.
const VoucherField = () => (
  <div className="bg-quarternary flex w-full items-center gap-3 rounded-xl px-5 py-[15px] opacity-70">
    <Ticket aria-hidden className="text-text-secondary size-5 shrink-0" />
    <input
      disabled
      placeholder="Masukkan kode voucher"
      aria-label="Kode voucher"
      className="placeholder:text-text-secondary text-text-primary w-full bg-transparent text-sm font-semibold outline-0"
    />
    <span className="text-text-secondary shrink-0 text-[10px] font-bold">
      Segera hadir
    </span>
  </div>
);

export default VoucherField;
