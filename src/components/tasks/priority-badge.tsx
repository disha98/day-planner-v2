"use client";

const config = {
  high: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    label: "High",
  },
  medium: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    label: "Medium",
  },
  low: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
    label: "Low",
  },
};

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { dot, text, bg, label } = config[priority];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${bg} ${text}`}
    >
      <span className={`w-1 h-1 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
