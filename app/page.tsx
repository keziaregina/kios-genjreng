import Image from "next/image";
import LoginButton from "./components/LoginButton";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen bg-primary text-white">
      <div className="relative w-full h-[60vh]">
        <Image
          src="/landing_page1.png"
          alt="Gitar"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 w-full h-40 bg-linear-to-t from-primary to-transparent"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex gap-2 mb-3">
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Temukan gitar favoritmu</h1>
        <p className="text-gray-400 text-sm">
          Menyediakan pilihan gitar terlengkap dengan harga yang terjangkau
        </p>
      </div>

      <div className="p-6">
        <LoginButton />
      </div>
    </div>
  );
}
