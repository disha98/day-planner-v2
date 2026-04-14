"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { Task } from "@/types";

export function useTasks(date?: string) {
  const { client, userId, loading: authLoading } = useSupabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!client || !userId) return;
    setLoading(true);

    let query = client
      .from("tasks")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .order("sort_order");

    if (date) {
      query = query.eq("date", date);
    }

    const { data } = await query;

    const enriched: Task[] = (data ?? []).map((r: Record<string, unknown>) => {
      const cat = r.categories as { name: string; color: string } | null;
      return {
        id: r.id as string,
        title: r.title as string,
        completed: r.completed as number,
        priority: r.priority as Task["priority"],
        date: r.date as string | null,
        sort_order: r.sort_order as number,
        category_id: r.category_id as string | null,
        category_name: cat?.name ?? null,
        category_color: cat?.color ?? null,
        created_at: r.created_at as string,
        updated_at: r.updated_at as string,
      };
    });

    setTasks(enriched);
    setLoading(false);
  }, [client, userId, date]);

  useEffect(() => {
    if (!authLoading && client) fetchTasks();
  }, [authLoading, client, fetchTasks]);

  const createTask = useCallback(
    async (data: {
      title: string;
      priority?: string;
      date?: string;
      category_id?: string;
    }) => {
      if (!client || !userId) return;

      // Get max sort_order for this user
      const { data: last } = await client
        .from("tasks")
        .select("sort_order")
        .eq("user_id", userId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        user_id: userId,
        title: data.title,
        completed: 0,
        priority: data.priority || "medium",
        date: data.date || null,
        sort_order: ((last?.sort_order as number) ?? -1) + 1,
        category_id: data.category_id || null,
        created_at: now,
        updated_at: now,
      };
      await client.from("tasks").insert(record);
      await fetchTasks();
      return record;
    },
    [client, userId, fetchTasks]
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      if (!client) return;
      const { category_name, category_color, ...storable } = data;
      await client
        .from("tasks")
        .update({ ...storable, updated_at: new Date().toISOString() })
        .eq("id", id);
      await fetchTasks();
    },
    [client, fetchTasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!client) return;
      await client.from("tasks").delete().eq("id", id);
      await fetchTasks();
    },
    [client, fetchTasks]
  );

  const reorderTasks = useCallback(
    async (orderedIds: string[]) => {
      if (!client) return;
      const now = new Date().toISOString();
      const updates = orderedIds.map((id, i) => ({
        id,
        sort_order: i,
        updated_at: now,
      }));
      // Supabase upsert to batch update sort orders
      await client.from("tasks").upsert(updates, { onConflict: "id" });
      await fetchTasks();
    },
    [client, fetchTasks]
  );

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    refetch: fetchTasks,
  };
}
