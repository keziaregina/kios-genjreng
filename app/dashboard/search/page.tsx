import React from "react";
import SearchInput from "../components/SearchInput";
import { inter } from "@/app/ui/font";
import { Settings2Icon } from "lucide-react";
import Category from "./components/Category";
import Image from "next/image";
import PageDivider from "./components/PageDivider";

const SearchPage = async (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    category?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const category = searchParams?.category || "";

  return (
    <div className={`px-[26px] py-[24px] ${inter.className}`}>
      <SearchInput />
      <div className="flex gap-[8px] items-center mb-[9px]">
        <Category />
        <Settings2Icon size={70} color="#A7A7A7" />
      </div>

      <div className="w-full border-t border-[#2C2727]"></div>

      {query || category ? (
        <>
          {query && (
            <div className="mt-[14px]">
              <div className="text-text-primary">Hasil Pencarian : {query}</div>
            </div>

          )}
        </>
      ) : (
        <>
          <div className="mt-[14px]">
            <PageDivider title="Terpopuler" redirect={""} />

            <div className="flex flex-wrap text-text-primary gap-x-[28px] mt-8">
              <div className="flex-1 bg-[#2C2727] rounded-[10px] h-[168px] relative">
                <Image
                  src={"/assets/yamaha.png"}
                  alt=""
                  height={100}
                  width={100}
                  className="absolute h-full w-full bottom-5"
                />
              </div>
              <div className="flex-1 bg-[#2C2727] rounded-[10px] h-[168px] relative">
                <Image
                  src={"/assets/Gitarakustikcord.png"}
                  alt=""
                  height={100}
                  width={100}
                  className="absolute h-full w-full bottom-5"
                />
              </div>
            </div>
          </div>
          <div className="mt-[14px]">
            <PageDivider title="Harga Terjangkau" redirect="" />
            
          </div>
        </>
      ) 
      
      }
    </div>
  );
};

export default SearchPage;
