"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="no-print gap-1.5 text-muted-foreground"
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}
