import {
  Heart,
  Key,
  Lock,
  Clock3,
  Bookmark,
  ShieldCheck,
  ShoppingCart,
  CircleQuestionMark,
  InfoIcon,
  Copyright,
  User,
  type LucideIcon,
} from "lucide-react";
import React from "react";
import BackButton from "./components/BackButton";

type MenuItem = {
  name: string;
  icon: LucideIcon;
  url: string;
};

// The icon component is stored directly — no string-to-component lookup map.
const menu: MenuItem[] = [
  {
    name: "Favorit",
    icon: Heart,
    url: "",
  },
  {
    name: "Keranjang",
    icon: ShoppingCart,
    url: "",
  },
  {
    name: "Riwayat Pesanan",
    icon: Clock3,
    url: "",
  },
  {
    name: "Alamat Tersimpan",
    icon: Bookmark,
    url: "",
  },
  {
    name: "Privasi",
    icon: Lock,
    url: "",
  },
  {
    name: "Keamanan",
    icon: ShieldCheck,
    url: "",
  },
  {
    name: "Log Out",
    icon: Key,
    url: "",
  },
];

const Page = () => {
  return (
    <div className="flex flex-col h-screen relative">
      <BackButton />
      <div className="h-[30vh] w-full" />

      <div className="w-full justify-center flex items-center absolute top-56">
				<div className="bg-[#544E4E] w-[90%] h-[90px] rounded-[20px] flex justify-center items-center absolute -top-15 z-20">
					<div className="absolute -top-5 flex flex-col items-center gap-[10px]">
						<div className="border-2 border-black bg-[#273B4A] rounded-full w-[50px] h-[50px] flex justify-center items-center">
							<User size={40}/>

						</div>
						<p className="font-bold tracking-wide text-text-primary">Rena Azalea</p>
					</div>
				</div>

      </div>
      <div className="w-full flex-1 bg-[#2C2727] px-[33px] pt-[73px] relative rounded-t-2xl overflow-y-scroll">
        <ul className="flex flex-col text-text-primary gap-5 font-semibold mb-[54px]">
          {menu.map(({ name, icon: Icon }) => (
            <li key={name} className="flex gap-5">
              <Icon className="text-button-primary" />
              <p>{name}</p>
            </li>
          ))}
        </ul>

				<div className=" flex flex-col gap-2 text-[#A7A7A7] text-[10px] font-extrabold mb-[29px]">
					<div className="flex gap-[8px] items-center tracking-widest">
						<InfoIcon />
						<span>Versi 3.03</span>
					</div>
					<div className="flex gap-[8px] items-center tracking-widest">
						<CircleQuestionMark />
						<span>Kebijakan</span>
					</div>
				</div>

				<div className="border-t w-full border-[#656464]" />

				<div className="flex py-5 gap-[9px] text-[#A7A7A7] text-[10px] font-semibold justify-center items-center">
					<Copyright size={15}/>
					<span>Kios Genjreng 2022</span>
				</div>
      </div>
    </div>
  );
};

export default Page;
