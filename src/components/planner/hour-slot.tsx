"use client";

import { Plus } from "lucide-react";

interface HourSlotProps {
  hour: number;
  date: string;
  onClick: (date: string, hour: number) => void;
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function HourSlot({ hour, date, onClick }: HourSlotProps) {
  return (
    <div
      className="h-14 border-b border-stone-100/80 flex items-start group cursor-pointer hover:bg-blue-50/30 transition-all duration-150"
      onClick={() => onClick(date, hour)}
    >
      <span className="text-[10px] text-stone-400 w-8 pt-1 text-right pr-2 shrink-0 select-none tabular-nums font-medium">
        {formatHour(hour)}
      </span>
      <div className="flex-1 h-full relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Plus size={14} className="text-stone-300" />
        </div>
      </div>
    </div>
  );
}
