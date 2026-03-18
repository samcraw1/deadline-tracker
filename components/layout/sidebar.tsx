"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  FileText,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Deadlines", href: "/deadlines", icon: CalendarClock },
  { title: "Notice Types", href: "/notice-types", icon: FileText },
  { title: "Alerts", href: "/alerts", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({
  userRole,
  userEmail,
}: {
  userRole: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const visibleItems = navItems.filter((item) => {
    if (item.href === "/settings" && userRole !== "admin") return false;
    return true;
  });

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <Sidebar>
      <SidebarHeader
        className="p-6"
        style={{ borderBottom: "1px solid #1e40af" }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#0066CC",
            }}
          >
            <CalendarClock style={{ width: 20, height: 20, color: "#ffffff" }} />
          </div>
          <div>
            <div
              className="font-bold leading-tight"
              style={{ color: "#ffffff", fontSize: 16 }}
            >
              Deadline Tracker
            </div>
            <div style={{ color: "#93c5fd", fontSize: 12 }}>
              Compliance Manager
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: active ? "#1d4ed8" : "transparent",
                        color: active ? "#ffffff" : "#bfdbfe",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "#1e40af";
                          e.currentTarget.style.color = "#ffffff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#bfdbfe";
                        }
                      }}
                    >
                      <item.icon style={{ width: 18, height: 18 }} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter
        className="p-4"
        style={{ borderTop: "1px solid #1e40af" }}
      >
        <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
          {userEmail}
        </div>
        <div style={{ color: "#93c5fd", fontSize: 12, marginBottom: 12 }}>
          {userEmail}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            color: "#bfdbfe",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            marginLeft: -12,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#DC3545";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#bfdbfe";
          }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
