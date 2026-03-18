"use client";

import { useState } from "react";
import { regenerateDeadlinesAction } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function RegenerateButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      await regenerateDeadlinesAction(clientId);
      toast.success("Deadlines regenerated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleRegenerate} disabled={loading}>
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      Regenerate Deadlines
    </Button>
  );
}
