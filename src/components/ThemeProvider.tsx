"use client";

import { useEffect } from "react";

const STORAGE_KEY = "sahayak-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isDark = stored === "dark";

    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return children;
}
