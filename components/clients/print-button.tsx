"use client";

export function PrintButton() {
  return (
    <div className="no-print mb-6 flex justify-end">
      <button
        onClick={() => window.print()}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
      >
        Print Report
      </button>
    </div>
  );
}
