"use client";

import { X } from "lucide-react";

interface CalendarToggleProps {
  showMine: boolean;
  showShared: boolean;
  onToggleMine: () => void;
  onToggleShared: () => void;
  onRemoveShared: () => void;
  sharedColor: string;
}

export function CalendarToggle({
  showMine,
  showShared,
  onToggleMine,
  onToggleShared,
  onRemoveShared,
  sharedColor,
}: CalendarToggleProps) {
  return (
    <div className="flex items-center gap-3 border-l border-stone-200 pl-3 ml-1">
      <label className="flex items-center gap-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showMine}
          onChange={onToggleMine}
          className="w-3.5 h-3.5 rounded accent-stone-600"
        />
        <span className="text-xs font-medium text-stone-600">My Calendar</span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showShared}
          onChange={onToggleShared}
          className="w-3.5 h-3.5 rounded"
          style={{ accentColor: sharedColor }}
        />
        <span className="text-xs font-medium" style={{ color: sharedColor }}>
          Shared
        </span>
      </label>
      <button
        onClick={onRemoveShared}
        className="p-1 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        title="Remove shared calendar"
      >
        <X size={12} />
      </button>
    </div>
  );
}
