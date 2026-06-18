"use client";
import { useEffect } from "react";
import { ConfigDB } from "@/config/themeCustomizerConfig";

export default function ThemeSetter() {
  useEffect(() => {
    setTimeout(() => {
      !ConfigDB.PrimaryColor && document.documentElement.style.setProperty("--theme-default", "#00968a");
      !ConfigDB.SecondaryColor && document.documentElement.style.setProperty("--theme-default2", "#00968a");
    }, 0.1);
  }, []);
  return null;
}
