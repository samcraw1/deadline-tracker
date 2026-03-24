import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal — Deadline Tracker",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4" style={{ backgroundColor: "#003366" }}>
        <h1 className="text-lg font-bold text-white">Compliance Portal</h1>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
