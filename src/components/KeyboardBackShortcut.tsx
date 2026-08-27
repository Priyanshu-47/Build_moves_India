"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardBackShortcut() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        router.back();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
