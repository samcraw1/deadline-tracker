"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { CalendarClock, Shield, BarChart3, Clock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen" style={{ borderLeft: "4px solid #0066CC" }}>
      {/* Left Brand Panel — 45% */}
      <div
        className="hidden lg:flex relative overflow-hidden flex-col justify-between p-14"
        style={{ width: "45%", backgroundColor: "#003366" }}
      >
        {/* Dot grid pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glowing horizontal accent line */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "45%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent)",
          }}
        />

        {/* Corner bracket — top left */}
        <div
          className="absolute"
          style={{
            top: 32,
            left: 32,
            width: 48,
            height: 48,
            borderLeft: "2px solid rgba(59,130,246,0.35)",
            borderTop: "2px solid rgba(59,130,246,0.35)",
          }}
        />
        {/* Corner bracket — bottom right */}
        <div
          className="absolute"
          style={{
            bottom: 32,
            right: 32,
            width: 48,
            height: 48,
            borderRight: "2px solid rgba(59,130,246,0.35)",
            borderBottom: "2px solid rgba(59,130,246,0.35)",
          }}
        />

        {/* Ambient glow */}
        <div
          className="absolute rounded-full"
          style={{
            top: "20%",
            right: "20%",
            width: 500,
            height: 500,
            backgroundColor: "rgba(59,130,246,0.06)",
            filter: "blur(100px)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              <CalendarClock style={{ width: 20, height: 20, color: "#60A5FA" }} />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "#FFFFFF" }}
            >
              Deadline Tracker
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10" style={{ maxWidth: 540 }}>
          <h1
            className="font-bold tracking-tight"
            style={{ fontSize: "3rem", lineHeight: 1.1, color: "#FFFFFF" }}
          >
            DOL retirement plan
            <br />
            compliance, <span style={{ color: "#60A5FA" }}>automated.</span>
          </h1>
          <p
            className="leading-relaxed"
            style={{ fontSize: "1.125rem", color: "#94A3B8", marginTop: 24 }}
          >
            Track every notice deadline across all your plans. Never miss a
            filing date again.
          </p>

          {/* Trust stats */}
          <div className="flex items-center gap-8" style={{ marginTop: 32 }}>
            <div className="flex items-center gap-2">
              <BarChart3 style={{ width: 16, height: 16, color: "#64748B" }} />
              <span style={{ fontSize: 14, color: "#64748B" }}>
                15 notice types tracked
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock style={{ width: 16, height: 16, color: "#64748B" }} />
              <span style={{ fontSize: 14, color: "#64748B" }}>
                Zero missed deadlines
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck style={{ width: 16, height: 16, color: "#64748B" }} />
              <span style={{ fontSize: 14, color: "#64748B" }}>
                SOC II certified
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10" style={{ fontSize: 14, color: "#475569" }}>
          &copy; {new Date().getFullYear()} Deadline Tracker
        </div>
      </div>

      {/* Right Login Panel — 55% */}
      <div
        className="flex flex-1 px-6"
        style={{
          backgroundColor: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center" style={{ marginBottom: 32 }}>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 36, height: 36, backgroundColor: "#003366" }}
            >
              <CalendarClock style={{ width: 18, height: 18, color: "#60A5FA" }} />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: "#003366" }}>
              Deadline Tracker
            </span>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
              border: "1px solid rgba(226,232,240,0.8)",
              padding: 40,
            }}
          >
            <div className="text-center" style={{ marginBottom: 32 }}>
              <h2 className="text-2xl font-bold" style={{ color: "#003366" }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
                Sign in to manage plan notice deadlines
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 20 }}>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "#334155" }}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                  style={{
                    height: 44,
                    borderRadius: 8,
                    borderColor: "#CBD5E1",
                    fontSize: 14,
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: "#334155" }}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                  style={{
                    height: 44,
                    borderRadius: 8,
                    borderColor: "#CBD5E1",
                    fontSize: 14,
                  }}
                />
              </div>

              {error && (
                <p
                  className="text-sm rounded-lg"
                  style={{
                    color: "#DC2626",
                    backgroundColor: "#FEF2F2",
                    padding: "10px 12px",
                    marginBottom: 20,
                  }}
                >
                  {error}
                </p>
              )}

              {/* ERISA badge */}
              <div
                className="flex items-center justify-center gap-2"
                style={{ padding: "4px 0", marginBottom: 16 }}
              >
                <Shield style={{ width: 14, height: 14, color: "#94A3B8" }} />
                <span
                  className="font-medium"
                  style={{ fontSize: 12, color: "#94A3B8" }}
                >
                  ERISA & DOL Compliant
                </span>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={loading}
                className="font-semibold transition-all"
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: loading ? "#93C5FD" : "#0066CC",
                  color: "#FFFFFF",
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#002244";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#0066CC";
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
