"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { Category } from "@/types";

const DEFAULT_CATEGORIES = [
  { name: "Work", color: "#3B82F6" },
  { name: "Personal", color: "#8B5CF6" },
  { name: "Health", color: "#10B981" },
  { name: "Learning", color: "#F59E0B" },
  { name: "Errands", color: "#EF4444" },
  { name: "Holidays", color: "#EC4899" },
];

export function useCategories() {
  const { client, userId, loading: authLoading } = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!client || !userId) return;

    // Seed defaults if empty
    const { count } = await client
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count === 0) {
      const now = new Date().toISOString();
      const seeds = DEFAULT_CATEGORIES.map((c) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        name: c.name,
        color: c.color,
        created_at: now,
      }));
      const { error: insertError } = await client.from("categories").insert(seeds);
      if (insertError) console.error("categories insert error:", insertError);
    }

    const { data, error: selectError } = await client
      .from("categories")
      .select("id, name, color, created_at")
      .eq("user_id", userId)
      .order("name");

    if (selectError) console.error("categories select error:", selectError);
    setCategories(data ?? []);
    setLoading(false);
  }, [client, userId]);

  useEffect(() => {
    if (!authLoading && client) refetch();
  }, [authLoading, client, refetch]);

  return { categories, loading, refetch };
}
