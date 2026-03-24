"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  FileText,
  Bell,
  Settings,
  Plus,
  Search,
  Calendar,
  Columns,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function navigate(path: string) {
    router.push(path);
    setOpen(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/")}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => navigate("/clients")}>
            <Users className="mr-2 h-4 w-4" /> Clients
          </CommandItem>
          <CommandItem onSelect={() => navigate("/deadlines")}>
            <CalendarClock className="mr-2 h-4 w-4" /> Deadlines
          </CommandItem>
          <CommandItem onSelect={() => navigate("/calendar")}>
            <Calendar className="mr-2 h-4 w-4" /> Calendar View
          </CommandItem>
          <CommandItem onSelect={() => navigate("/kanban")}>
            <Columns className="mr-2 h-4 w-4" /> Kanban Board
          </CommandItem>
          <CommandItem onSelect={() => navigate("/notice-types")}>
            <FileText className="mr-2 h-4 w-4" /> Notice Types
          </CommandItem>
          <CommandItem onSelect={() => navigate("/alerts")}>
            <Bell className="mr-2 h-4 w-4" /> Alerts
          </CommandItem>
          <CommandItem onSelect={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigate("/clients/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add New Client
          </CommandItem>
          <CommandItem onSelect={() => navigate("/clients/import")}>
            <Search className="mr-2 h-4 w-4" /> Import Clients
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
