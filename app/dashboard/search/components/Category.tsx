"use client";

import { Button } from "@/components/ui/button";
import { categories } from "@/lib/placeholder";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type category = {
	id: number
	name: string;
	image: string;
}

const Category = () => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	
	const params = new URLSearchParams(searchParams);
	const handleSelectCategory = (name: string) => {
		console.log(params.get('category') == name)
		if (params.get('category') == name) {
			params.delete("category");
			router.replace(`${pathname}?${params.toString()}`)
		} else {
			params.set('category', name);
			router.replace(`${pathname}?${params.toString()}`)
		}
	}

  return (
    <div className="flex gap-[12px] w-80% overflow-x-scroll relative">
      {categories.map((item: category) => {
        return (
          <Button
            key={item.id}
						onClick={() => handleSelectCategory(item.name)}
            variant={params.get('category') == item.name ? "default" : "selected"}
            className={`rounded-2xl cursor-pointer py-6 px-1 flex items-center ${params.get('category') == item.name && "hover:bg-button-primary"}`}
          >
            <div
              style={{
                boxShadow: `
									inset 0 4px 10px rgba(0,0,0,0.2),
									inset 0 -4px 10px rgba(0,0,0,0.2),
									inset 4px 0 10px rgba(0,0,0,0.2),
									inset -4px 0 10px rgba(0,0,0,0.2)
								`,
              }}
              className="w-10 h-10 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 flex w-full h-full justify-center items-center">
                <Image
                  src={item.image}
                  height={100}
                  width={100}
                  alt={item.name}
                  className="h-full w-auto"
                />
              </div>
            </div>
            <p className="px-5">{item.name}</p>
          </Button>
        );
      })}
    </div>
  );
};

export default Category;
