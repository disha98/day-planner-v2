"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Check, X, FolderOpen } from "lucide-react";
import { NoteSection } from "@/types";

interface SectionsPanelProps {
  sections: NoteSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function SectionsPanel({
  sections,
  selectedId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: SectionsPanelProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName("");
    setAdding(false);
  };

  const handleRename = () => {
    if (!editingId || !editName.trim()) return;
    onRename(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="w-44 border-r border-stone-200/80 flex flex-col bg-stone-50/30">
      <div className="px-3 py-3 border-b border-stone-200/80">
        <h3 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Sections
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`group flex items-center gap-2 px-3 py-1.5 mx-1 rounded-lg cursor-pointer transition-all duration-150 ${
              selectedId === section.id
                ? "bg-stone-200/60 text-stone-800 font-medium"
                : "text-stone-600 hover:bg-stone-100/80"
            }`}
            onClick={() => onSelect(section.id)}
          >
            {editingId === section.id ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 text-sm px-1.5 py-0.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button onClick={(e) => { e.stopPropagation(); handleRename(); }} className="text-green-600 hover:text-green-700">
                  <Check size={13} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-stone-400 hover:text-stone-600">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <>
                <FolderOpen size={14} className="flex-shrink-0 opacity-60" />
                <span className="text-sm truncate flex-1">{section.name}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(section.id);
                      setEditName(section.name);
                    }}
                    className="p-0.5 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-600"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${section.name}" and all its pages?`)) {
                        onDelete(section.id);
                      }
                    }}
                    className="p-0.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="px-2 py-2 border-t border-stone-200">
        {adding ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              placeholder="Section name"
              className="flex-1 text-sm px-2 py-1 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
              autoFocus
            />
            <button onClick={handleAdd} className="p-1 text-green-600"><Check size={14} /></button>
            <button onClick={() => { setAdding(false); setNewName(""); }} className="p-1 text-stone-400"><X size={14} /></button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 w-full px-1 py-1 rounded hover:bg-stone-100 transition-colors"
          >
            <Plus size={14} />
            New section
          </button>
        )}
      </div>
    </div>
  );
}
