"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";

interface TodoInputProps {
  categories: Category[];
  onAdd: (data: { title: string; priority?: string; date?: string; category_id?: string }) => void;
}

export function TodoInput({ categories, onAdd }: TodoInputProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      priority,
      date: date || undefined,
      category_id: categoryId || undefined,
    });
    setTitle("");
    setPriority("medium");
    setCategoryId("");
    setDate("");
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} />
        Add Task
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2.5 shadow-sm">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Task title..."
        className="flex-1 text-sm focus:outline-none min-w-0"
        autoFocus
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="text-xs border border-stone-200 rounded px-1.5 py-1 bg-white text-stone-600"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="text-xs border border-stone-200 rounded px-1.5 py-1 bg-white text-stone-600"
      >
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="text-xs border border-stone-200 rounded px-1.5 py-1 bg-white text-stone-600"
      />
      <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!title.trim()}>
        Add
      </Button>
      <button onClick={() => setOpen(false)} className="text-xs text-stone-400 hover:text-stone-600 px-1">
        Cancel
      </button>
    </div>
  );
}
