import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    // <div className="min-h-screen w-screen text-text-primary flex flex-col relative">
    //   <Image src="/landing_page1.png" alt="Main Guitar" className="w-full h-[473px] absolute top-0 left-0 object-cover" width={1000} height={1000}/>
    //   <div className="h-[50%] w-full absolute bottom-0 left-0 bg-gradient-to-b from-transparent via-transparent to-primary from-10% via-15% to-30% flex flex-col items-center justify-end z-10 border-2 border-red-400 text-center">
    //     <div className="w-[80%] flex flex-col gap-10 items-center justify-center py-10">
    //       <h2 className="text-[25px] font-bold">Temukan genjrengan favoritmu</h2>
    //       <p className="text-inter text-text-secondary text-[12px]">Menyediakan pilihan gitar terlengkap dengan harga yang terjangkau.</p>
    //       <Button className="w-full">Mulai</Button>
    //     </div>
    //   </div>
    // </div>
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
        <Button
          variant={"default"}
          className="text-white font-semibold px-6 py-3 rounded-lg w-full"
        >
          Mulai
        </Button>
      </div>
    </div>
  );
}
