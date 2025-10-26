"use client"

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LoginButton = () => {
  return (
    <Link href="/auth/login">
      <Button
        variant={"default"}
        className="text-white font-semibold px-6 py-3 rounded-lg w-full cursor-pointer"
      >
        Mulai
      </Button>
    </Link>
  );
};

export default LoginButton;
