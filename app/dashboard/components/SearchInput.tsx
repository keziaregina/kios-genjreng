"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import React, { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";

const SearchInput = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Typing from the dashboard lands on the search page, so the target route is fixed.
  // Seeded from the URL so the box still shows the term after a reload or a chip click.
  const [search, setSearch] = useState(searchParams.get("query") ?? "");

  const pushQuery = (term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    router.replace(`/dashboard/search?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback(pushQuery, 500);

  const handleClearSearch = () => {
    setSearch("");
    handleSearch.cancel();
    pushQuery("");
  };

  return (
    <div className="bg-quarternary text-text-primary relative mb-[21px] flex w-full items-center rounded-xl">
      <input
        onChange={(event) => {
          setSearch(event.target.value);
          handleSearch(event.target.value);
        }}
        type="text"
        value={search}
        name="search"
        aria-label="Cari gitar"
        placeholder="Cari merk apa?"
        className="placeholder:text-text-secondary w-full bg-transparent px-5 py-[15px] pr-12 text-sm font-semibold outline-0"
      />
      {search ? (
        <Button
          onClick={handleClearSearch}
          variant="ghost"
          size="icon-sm"
          aria-label="Hapus pencarian"
          className="text-text-secondary absolute right-3 hover:bg-transparent"
        >
          <X />
        </Button>
      ) : (
        <Search
          className="text-text-secondary absolute right-5"
          size={15}
        />
      )}
    </div>
  );
};

/**
 * useSearchParams() opts the whole route out of static rendering unless it sits
 * under a Suspense boundary, so the boundary ships with the component instead of
 * being re-declared at every call site.
 */
const SearchInputBoundary = () => (
  <Suspense
    fallback={<div className="bg-quarternary mb-[21px] h-[50px] w-full rounded-xl" />}
  >
    <SearchInput />
  </Suspense>
);

export default SearchInputBoundary;
