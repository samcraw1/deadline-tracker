"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Shield } from "lucide-react";

type RiskItem = {
  id: string;
  client_name: string;
  notice_type: string;
  due_date: string;
  days_until_due: number;
  risk_score: number;
  risk_level: string;
  status: string;
};

export function RiskDashboard() {
  const [items, setItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/risk-score")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Loading risk analysis...</CardContent>
      </Card>
    );

  const critical = items.filter((i) => i.risk_level === "critical");
  const high = items.filter((i) => i.risk_level === "high");

  const riskColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-red-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-green-100 text-green-800 border-green-300",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          AI Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">{critical.length} Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">{high.length} High Risk</span>
          </div>
        </div>
        <div className="space-y-2">
          {items.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <span className="font-medium">{item.client_name}</span>
                <span className="text-muted-foreground mx-2">—</span>
                <span className="text-sm">{item.notice_type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {item.days_until_due > 0 ? `${item.days_until_due}d left` : `${Math.abs(item.days_until_due)}d overdue`}
                </span>
                <Badge className={riskColors[item.risk_level] ?? ""}>
                  {item.risk_level.toUpperCase()} ({item.risk_score})
                </Badge>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No pending deadlines to analyze.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
