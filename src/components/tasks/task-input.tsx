"use client";

import { useState, useRef } from "react";
import { Category } from "@/types";
import { Plus, ChevronDown } from "lucide-react";

interface TaskInputProps {
  onAdd: (data: {
    title: string;
    priority?: string;
    date?: string;
    category_id?: string;
  }) => void;
  categories: Category[];
  selectedDate: string | null;
}

const priorities = [
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "low", label: "Low", color: "bg-blue-500" },
] as const;

export function TaskInput({ onAdd, categories, selectedDate }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [categoryId, setCategoryId] = useState<string>("");
  const [showPriority, setShowPriority] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd({
      title: trimmed,
      priority,
      date: selectedDate ?? undefined,
      category_id: categoryId || undefined,
    });

    setTitle("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedPriority = priorities.find((p) => p.value === priority)!;
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5">
      <Plus className="w-4 h-4 text-stone-400 flex-shrink-0" />

      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task..."
        className="flex-1 text-sm bg-transparent text-stone-800 placeholder:text-stone-400 outline-none"
      />

      {/* Priority selector */}
      <div className="relative" ref={priorityRef}>
        <button
          onClick={() => {
            setShowPriority(!showPriority);
            setShowCategory(false);
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-stone-500 hover:bg-stone-100 transition-colors"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${selectedPriority.color}`}
          />
          <ChevronDown className="w-3 h-3" />
        </button>

        {showPriority && (
          <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-lg border border-stone-200/80 shadow-lg py-1 z-20">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setPriority(p.value);
                  setShowPriority(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left hover:bg-stone-50 transition-colors ${
                  priority === p.value
                    ? "text-stone-800 font-medium"
                    : "text-stone-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category picker */}
      {categories.length > 0 && (
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => {
              setShowCategory(!showCategory);
              setShowPriority(false);
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-stone-500 hover:bg-stone-100 transition-colors"
          >
            {selectedCategory ? (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
            ) : (
              <span className="w-2 h-2 rounded-full bg-stone-300" />
            )}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showCategory && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-stone-200/80 shadow-lg py-1 z-20">
              <button
                onClick={() => {
                  setCategoryId("");
                  setShowCategory(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left hover:bg-stone-50 transition-colors ${
                  !categoryId
                    ? "text-stone-800 font-medium"
                    : "text-stone-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-stone-300" />
                None
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryId(cat.id);
                    setShowCategory(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left hover:bg-stone-50 transition-colors ${
                    categoryId === cat.id
                      ? "text-stone-800 font-medium"
                      : "text-stone-600"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
