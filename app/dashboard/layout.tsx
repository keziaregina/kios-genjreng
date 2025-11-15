import React from "react";
import Navigation from "./components/Navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-primary w-full flex flex-col">
			<main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
