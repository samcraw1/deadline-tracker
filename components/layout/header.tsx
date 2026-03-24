"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search } from "lucide-react";

export function AppHeader({ userName, userEmail }: { userName: string; userEmail: string }) {
  return (
    <header
      className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 bg-primary"
      style={{
        padding: "12px 16px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <SidebarTrigger style={{ color: "#ffffff" }} />
      <button
        className="hidden sm:flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white hover:border-white/40 transition-colors"
        onClick={() => {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          );
        }}
      >
        <Search className="h-3 w-3" />
        <span>Search...</span>
        <kbd className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
          Ctrl+K
        </kbd>
      </button>
      <div className="flex-1" />
      <ThemeToggle />
      <span className="hidden sm:inline" style={{ color: "#e5e7eb", fontSize: 13 }}>
        {userEmail}
      </span>
    </header>
  );
}
