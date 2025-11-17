"use client";
import Footer from "@/components/Common/Footer";
import { useEffect, useState } from "react";
import TapToTop from "@/layout/TapToTop";
import Customizer from "@/layout/customizer/Customizer";
import Header from "@/layout/header";
import Sidebar from "@/layout/sidebar";

export default function RootLayout({ children }) {
  const [toggle, setToggle] = useState();

  const handleResize = () => {
    if (window.innerWidth > 991) {
      setToggle(true);
    } else {
      setToggle(false);
    }
  };
  useEffect(() => {
    setToggle(window.innerWidth > 991);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className='page-wrapper'>
      <Header setToggle={setToggle} toggle={toggle} />
      <div className='page-body-wrapper'>
        <Sidebar toggle={toggle} setToggle={setToggle} />
        <div className='page-body'>{children}</div>
        <Footer />
      </div>
      <TapToTop />
      <Customizer />
    </div>
  );
}
