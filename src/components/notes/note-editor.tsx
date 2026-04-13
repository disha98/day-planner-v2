"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileText } from "lucide-react";
import { NotePage } from "@/types";

interface NoteEditorProps {
  page: NotePage | null;
  onUpdateDebounced: (id: string, data: { title?: string; content?: string }) => void;
}

export function NoteEditor({ page, onUpdateDebounced }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Only reset when switching to a different page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setTitle(page?.title ?? "");
    setContent(page?.content ?? "");
  }, [page?.id]);

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (page) onUpdateDebounced(page.id, { title: val });
    },
    [page, onUpdateDebounced]
  );

  const handleContentChange = useCallback(
    (val: string) => {
      setContent(val);
      if (page) onUpdateDebounced(page.id, { content: val });
    },
    [page, onUpdateDebounced]
  );

  if (!page) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
          <FileText size={24} className="text-stone-300" />
        </div>
        <p className="text-sm font-medium text-stone-500">Select a page to start writing</p>
        <p className="text-xs text-stone-400 mt-1">Choose a page from the sidebar, or create a new one</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 min-w-0">
      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Page title"
        className="text-lg font-semibold text-stone-800 placeholder:text-stone-300 border-0 border-b border-transparent focus:border-stone-200 focus:outline-none pb-2 mb-4 bg-transparent transition-colors"
      />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Start writing..."
        className="flex-1 text-sm text-stone-700 placeholder:text-stone-400 resize-none focus:outline-none bg-transparent leading-relaxed"
      />
      {page.updated_at && (
        <p className="text-xs text-stone-400 mt-4">
          Last updated: {new Date(page.updated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
