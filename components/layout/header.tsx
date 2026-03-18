"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader({ userName, userEmail }: { userName: string; userEmail: string }) {
  return (
    <header
      className="flex items-center gap-4 px-6"
      style={{
        backgroundColor: "#003366",
        padding: "16px 24px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <SidebarTrigger style={{ color: "#ffffff" }} />
      <div className="flex-1" />
      <span style={{ color: "#e5e7eb", fontSize: 13 }}>
        {userEmail}
      </span>
    </header>
  );
}
