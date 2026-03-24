"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Send } from "lucide-react";
import { addDeadlineComment } from "@/actions/deadlines";
import { toast } from "sonner";

type ActivityItem = {
  id: string;
  type: "status_change" | "comment" | "assignment";
  content: string;
  user_name: string | null;
  created_at: string;
  metadata: Record<string, string> | null;
};

export function DeadlineActivity({
  deadlineId,
  activities,
}: {
  deadlineId: string;
  activities: ActivityItem[];
}) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddComment() {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await addDeadlineComment(deadlineId, comment.trim());
      setComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  }

  const typeIcons: Record<string, React.ReactNode> = {
    status_change: <Clock className="h-3.5 w-3.5 text-blue-500" />,
    comment: <MessageSquare className="h-3.5 w-3.5 text-gray-500" />,
    assignment: <Clock className="h-3.5 w-3.5 text-purple-500" />,
  };

  const typeBadgeColors: Record<string, string> = {
    status_change: "bg-blue-50 text-blue-700 border-blue-200",
    comment: "bg-gray-50 text-gray-700 border-gray-200",
    assignment: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[60px] text-sm"
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={loading || !comment.trim()}
            className="self-end"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity yet.
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="mt-0.5">{typeIcons[item.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {item.user_name ?? "System"}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${typeBadgeColors[item.type] ?? ""}`}
                    >
                      {item.type === "status_change"
                        ? "Status"
                        : item.type === "comment"
                        ? "Comment"
                        : "Assignment"}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
