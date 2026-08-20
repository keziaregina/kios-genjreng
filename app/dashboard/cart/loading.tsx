import React from "react";

import PageContainer from "@/app/dashboard/components/PageContainer";

// Cart rows come from a per-request query, so the segment shows its own skeleton instead of a blank shell.
const Loading = () => (
  <PageContainer>
    <div className="bg-quarternary mb-[21px] h-[24px] w-[140px] animate-pulse rounded-md" />
    <div className="flex flex-col gap-[11px]">
      {[0, 1, 2].map((row) => (
        <div key={row} className="bg-quarternary h-[80px] animate-pulse rounded-xl" />
      ))}
    </div>
  </PageContainer>
);

export default Loading;
