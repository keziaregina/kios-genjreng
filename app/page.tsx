import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import LoginButton from "./components/LoginButton";

export default function Home() {

  return (
    <div className="relative min-h-screen w-full text-inter">
      <Image
        src="/landing_page1.png"
        alt="Gitar"
        width={1000}
        height={1000}
        className="absolute h-full w-full object-cover -z-10"
      />

      <div className="absolute h-[600px]"></div>
      <div className="absolute w-full h-full inset-0 bg-gradient-to-t from-primary via-transparent to-transparent from-20% to-40% z-0" />
      <div className="absolute w-full px-6 pb-12 text-center z-20">

        <div className="flex justify-center mb-4">
          <span className="mx-1 h-2 w-2 rounded-full bg-gray-400"></span>
          <span className="mx-1 h-2 w-2 rounded-full bg-button-primary"></span>
          <span className="mx-1 h-2 w-2 rounded-full bg-gray-400"></span>
        </div>

        <h1 className="text-white text-xl font-bold mb-2">
          Temukan gitar favoritmu
        </h1>

        <p className="text-gray-300 text-sm mb-6">
          Menyediakan pilihan gitar terlengkap dengan harga yang terjangkau
        </p>

        {/* Button */}
        <LoginButton />
      </div>
    </div>
  );
}
