import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";

// Checkout reads the cart and the address book per request, so the segment shows its own skeleton.
const Loading = () => (
  <PageContainer className="pt-[64px]">
    <div className="bg-quarternary mx-auto mb-[21px] h-[24px] w-[120px] animate-pulse rounded-md" />
    <div className="flex flex-col gap-[11px]">
      {[0, 1].map((row) => (
        <div key={row} className="bg-quarternary h-[120px] animate-pulse rounded-xl" />
      ))}
      <div className="bg-quarternary h-[56px] animate-pulse rounded-xl" />
    </div>
  </PageContainer>
);

export default Loading;
