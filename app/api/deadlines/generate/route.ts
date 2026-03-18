import { createClient } from "@/lib/supabase/server";
import { generateDeadlinesForClient } from "@/lib/deadline-engine";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, planYear } = await request.json();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const deadlines = await generateDeadlinesForClient(
    supabase,
    client as unknown as Client,
    planYear
  );

  return NextResponse.json({ generated: deadlines.length, deadlines });
}
