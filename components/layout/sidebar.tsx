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
  Calendar,
  Columns,
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
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Kanban", href: "/kanban", icon: Columns },
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
        className="p-6 border-b border-sidebar-border"
      >
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full bg-sidebar-accent"
            style={{
              width: 40,
              height: 40,
            }}
          >
            <CalendarClock className="text-sidebar-accent-foreground" style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div
              className="font-bold leading-tight text-sidebar-foreground"
              style={{ fontSize: 16 }}
            >
              Deadline Tracker
            </div>
            <div className="text-sidebar-primary" style={{ fontSize: 12, opacity: 0.7 }}>
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
                        backgroundColor: active ? "var(--sidebar-accent)" : "transparent",
                        color: active ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)",
                        opacity: active ? 1 : 0.8,
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "var(--sidebar-accent)";
                          e.currentTarget.style.color = "var(--sidebar-accent-foreground)";
                          e.currentTarget.style.opacity = "1";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--sidebar-foreground)";
                          e.currentTarget.style.opacity = "0.8";
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
        className="p-4 border-t border-sidebar-border"
      >
        <div className="text-sidebar-foreground" style={{ fontSize: 13, fontWeight: 500 }}>
          {userEmail}
        </div>
        <div className="text-sidebar-foreground" style={{ fontSize: 12, marginBottom: 12, opacity: 0.7 }}>
          {userEmail}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            marginLeft: -12,
            opacity: 0.8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--destructive)";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--sidebar-foreground)";
            e.currentTarget.style.opacity = "0.8";
          }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
