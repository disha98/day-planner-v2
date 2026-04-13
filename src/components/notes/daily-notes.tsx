"use client";

import { useState, useRef, useEffect } from "react";
import { useDailyNote } from "@/lib/hooks/use-daily-note";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

interface DailyNotesProps {
  selectedDate: string;
}

export function DailyNotes({ selectedDate }: DailyNotesProps) {
  const { content, loading, updateContent } = useDailyNote(selectedDate);
  const [isOpen, setIsOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="border-t border-stone-100 mt-2">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-stone-50 rounded-lg transition-all duration-150"
      >
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`} />
        <FileText className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Notes</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 slide-down">
          {loading ? (
            <div className="skeleton h-20 w-full" />
          ) : (
            <div className="bg-stone-50/80 rounded-lg border border-stone-200/60 p-3">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Write your notes for the day..."
                className="w-full bg-transparent text-sm text-stone-700 placeholder:text-stone-400 outline-none resize-none leading-relaxed min-h-[80px]"
                rows={3}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
