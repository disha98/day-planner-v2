"use client";

import { Task } from "@/types";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { Trash2, Check } from "lucide-react";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const isCompleted = task.completed === 1;

  return (
    <div className="group flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-stone-50 transition-all duration-150">
      {/* Custom checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          isCompleted
            ? "bg-stone-700 border-stone-700"
            : "border-stone-300 hover:border-stone-400 hover:bg-stone-50"
        }`}
        style={{ width: 18, height: 18 }}
      >
        {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      {/* Title */}
      <span
        className={`flex-1 text-sm leading-snug transition-all duration-200 ${
          isCompleted
            ? "line-through text-stone-400 opacity-50"
            : "text-stone-700"
        }`}
      >
        {task.title}
      </span>

      {/* Category dot */}
      {task.category_color && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-white"
          style={{ backgroundColor: task.category_color }}
          title={task.category_name || ""}
        />
      )}

      {/* Priority badge */}
      <PriorityBadge priority={task.priority} />

      {/* Delete button - visible on hover */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 p-1 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
