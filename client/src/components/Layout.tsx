import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StarBackground from "./StarBackground";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-50">
      <StarBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow p-4 md:p-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
