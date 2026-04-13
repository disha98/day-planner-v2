"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, Trash2, Plus } from "lucide-react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useCategories } from "@/lib/hooks/use-categories";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TodoInput } from "@/components/todos/todo-input";
import { Task } from "@/types";
import { format, parseISO } from "date-fns";

type Filter = "all" | "active" | "completed";

export function TodoView() {
  const [filter, setFilter] = useState<Filter>("all");
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const { categories } = useCategories();

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, { name: string; color: string; tasks: Task[] }> = {};
    const uncategorized: Task[] = [];

    for (const task of filteredTasks) {
      if (task.category_id && catMap.has(task.category_id)) {
        const cat = catMap.get(task.category_id)!;
        if (!groups[task.category_id]) {
          groups[task.category_id] = { name: cat.name, color: cat.color, tasks: [] };
        }
        groups[task.category_id].tasks.push(task);
      } else {
        uncategorized.push(task);
      }
    }

    const result = Object.entries(groups)
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([id, g]) => ({ id, ...g }));

    if (uncategorized.length > 0) {
      result.push({ id: "__uncategorized", name: "Uncategorized", color: "#a8a29e", tasks: uncategorized });
    }

    return result;
  }, [filteredTasks, catMap]);

  const [quickAdd, setQuickAdd] = useState("");

  const handleToggle = useCallback(
    (task: Task) => {
      updateTask(task.id, { completed: task.completed ? 0 : 1 });
    },
    [updateTask]
  );

  const handleQuickAdd = useCallback(() => {
    if (!quickAdd.trim()) return;
    createTask({ title: quickAdd.trim() });
    setQuickAdd("");
  }, [quickAdd, createTask]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton w-48 h-9" />
          <div className="skeleton w-24 h-9" />
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="skeleton w-32 h-5 mb-3" />
              <div className="space-y-1">
                <div className="skeleton w-full h-10" />
                <div className="skeleton w-full h-10" />
                <div className="skeleton w-3/4 h-10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-0.5 bg-stone-100 rounded-lg p-1">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-3.5 py-1.5 rounded-md capitalize transition-all duration-150 ${
                filter === f
                  ? "bg-white text-stone-800 shadow-sm font-medium"
                  : "text-stone-500 hover:text-stone-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <TodoInput categories={categories} onAdd={createTask} />
      </div>

      {/* Task groups */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-stone-300" />
          </div>
          <p className="text-sm font-medium text-stone-500">
            {filter === "completed"
              ? "No completed tasks yet"
              : filter === "active"
              ? "All caught up!"
              : "No tasks yet"}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {filter === "active"
              ? "Time to relax, or add more tasks below"
              : "Add one below to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.id}>
              {/* Category header */}
              <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-stone-100">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
                  {group.name}
                </span>
                <span className="text-[10px] text-stone-400 ml-auto tabular-nums font-medium">
                  {group.tasks.length}
                </span>
              </div>

              {/* Task rows */}
              <div className="space-y-0.5">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-50 transition-all duration-150"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(task)}
                      className={`flex-shrink-0 w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? "bg-stone-800 border-stone-800"
                          : "border-stone-300 hover:border-stone-400"
                      }`}
                    >
                      {task.completed ? (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      ) : null}
                    </button>

                    {/* Title */}
                    <span
                      className={`flex-1 text-sm truncate ${
                        task.completed
                          ? "line-through text-stone-400 opacity-60"
                          : "text-stone-800"
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Priority */}
                    <PriorityBadge priority={task.priority} />

                    {/* Date */}
                    {task.date && (
                      <span className="text-xs text-stone-400 flex-shrink-0">
                        {format(parseISO(task.date), "MMM d")}
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 p-1 rounded text-stone-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Always-visible quick add */}
      <div className="mt-6 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-dashed border-stone-200 bg-white/50 hover:border-stone-300 hover:bg-white transition-all duration-150">
        <Plus size={15} className="text-stone-400 flex-shrink-0" />
        <input
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd();
          }}
          placeholder="Add a task..."
          className="flex-1 text-sm focus:outline-none bg-transparent placeholder:text-stone-400"
        />
      </div>
    </div>
  );
}
