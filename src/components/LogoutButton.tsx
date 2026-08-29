"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

export function LogoutButton() {
  function handleLogout() {
    logout();
    // Hard navigate so no in-app fallback session/data sticks around
    window.location.replace("/welcome");
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
