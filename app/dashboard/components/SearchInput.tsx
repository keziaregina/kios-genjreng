"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);

  const handleSearch = useDebouncedCallback((term: string) => {
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, 1000);

  const handleClearSearch = () => {
    setSearch("")
    params.delete("query");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full relative bg-quarternary rounded-xl text-gray-300 mb-[21px]">
      {search == "" &&
        <span className="absolute inset-0 text-sm font-semibold flex justify-center items-center w-full pointer-events-none">Cari merk apa?</span>
      }
      <input
        onChange={(e) => {
          if (e.target.value != "") {
            setSearch(e.target.value);
          } else {
            setSearch("")
          }
          handleSearch(e.target.value);
        }}
        type="text"
        value={search}
        name="search"
        className="outline-0 px-5 py-[15px] w-[80%] font-semibold text-sm"
      />
      {search != "" ? (
        <Button
          onClick={() => handleClearSearch()} 
          variant={"ghost"}
          className="right-5 top-0 h-full py-0 my-0 bg-red-50">
          <X/>
        </Button>
      ) : (
        
        <Search
          color="gray"
          className="absolute right-5 top-0 h-full"
          size={15}
        />
      )}
    </div>
  );
};

export default SearchInput;
