"use client";

import { Calendar } from "lucide-react";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title = "Day Planner", children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-stone-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <Calendar size={18} className="text-stone-400" />
        <h1 className="text-sm font-semibold text-stone-700 tracking-tight">{title}</h1>
      </div>
      {children}
    </header>
  );
}
