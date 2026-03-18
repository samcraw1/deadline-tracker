import { differenceInDays } from "date-fns";

export function DeadlineCountdown({ dueDate }: { dueDate: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const days = differenceInDays(due, today);

  if (days < 0) {
    return (
      <span className="font-bold" style={{ color: "#DC3545" }}>
        {Math.abs(days)}d overdue!
      </span>
    );
  }

  if (days === 0) {
    return <span className="font-medium" style={{ color: "#DC3545" }}>Due today</span>;
  }

  if (days <= 7) {
    return <span className="font-medium" style={{ color: "#DC3545" }}>{days}d left</span>;
  }

  if (days <= 30) {
    return <span className="font-medium" style={{ color: "#d97706" }}>{days}d left</span>;
  }

  return <span style={{ color: "#28A745" }}>{days}d left</span>;
}
