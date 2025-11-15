import React from "react";
import { Bolt } from "lucide-react";
import { inter } from "@/app/ui/font";
import { categories, popularly } from "@/lib/placeholder";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import SearchInput from "./components/SearchInput";

const Dashboard = () => {
  return (
    <div className={`px-[26px] py-[24px] ${inter.className}`}>
      <div className="flex justify-between items-center mb-[21px]">
        <div className="flex gap-0 flex-col font-bold">
          <span className="text-[15px] text-gray-500">Hai Rena,</span>
          <span className="text-lg text-white">mau cari apa?</span>
        </div>
        <Link href="/dashboard/settings">
          <Bolt color="white" />
        </Link>
      </div>

      {/* Search */}
      <SearchInput />

      <div className="flex flex-col gap-[11px] mb-[21px]">
        <div className="text-text-primary font-semibold">Cari tipe-mu</div>
        <div className="flex w-full overflow-x-scroll gap-[9px]">
          {categories.map((item) => {
            return (
              <Button className="px-7 py-6 rounded-2xl" key={item.id}>
                {item.name}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-[11px] mb-[21px]">
        <div>
          <div className="text-text-primary font-extrabold text-[20px]">
            Baru Datang Nih
          </div>
          <div className="text-text-secondary text-[12px]">
            Gitar baru bulan ini
          </div>
        </div>
        <div className="w-full h-[218px] bg-linear-to-t from-button-primary to-[#D77FA4] relative">
          <Image src={'/assets/terpopuler-guitar4.svg'} width={125} height={125} alt="" className="absolute right-0 -top-10 z-0"/>
          <Image src={'/assets/terpopuler-guitar3.svg'} width={150} height={150} alt="" className="absolute right-9 -top-14 z-10"/>
        </div>
      </div>
      <div className="flex flex-col gap-[11px]">
        <div>
          <div className="text-text-primary font-extrabold text-[18px]">
            Terpopuler
          </div>
          <div className="text-text-secondary text-[12px]">
            Berdasarkan rating user
          </div>
        </div>
        <div className="flex gap-[18px] overflow-x-scroll overflow-y-hidden">
          {popularly.map((item) => {
            return (
              <div key={item.id} className="pt-5 relative">
                <Image
                  src={item.image}
                  width={100}
                  height={100}
                  alt={item.name}
                  className="absolute inset-0"
                />
                <div className="h-[150px] w-[105px] bg-quarternary rounded-2xl" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
