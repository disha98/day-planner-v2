"use client";

import { useState, useEffect, useCallback } from "react";
import { addDays, format } from "date-fns";
import { useSupabase } from "./use-supabase";
import { TimeBlock } from "@/types";

export function useTimeBlocks(weekStart: string) {
  const { client, userId, loading: authLoading } = useSupabase();
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = useCallback(async () => {
    if (!client || !userId || !weekStart) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const weekEnd = format(addDays(new Date(weekStart), 6), "yyyy-MM-dd");

    const { data } = await client
      .from("time_blocks")
      .select("*, categories(name, color)")
      .eq("user_id", userId)
      .gte("date", weekStart)
      .lte("date", weekEnd)
      .order("start_hour");

    const enriched: TimeBlock[] = (data ?? []).map(
      (r: Record<string, unknown>) => {
        const cat = r.categories as { name: string; color: string } | null;
        return {
          id: r.id as string,
          title: r.title as string,
          description: r.description as string | null,
          meeting_url: r.meeting_url as string | null,
          date: r.date as string,
          start_hour: r.start_hour as number,
          end_hour: r.end_hour as number,
          category_id: r.category_id as string | null,
          category_name: cat?.name ?? null,
          category_color: cat?.color ?? null,
          created_at: r.created_at as string,
          updated_at: r.updated_at as string,
        };
      }
    );

    setBlocks(enriched);
    setLoading(false);
  }, [client, userId, weekStart]);

  useEffect(() => {
    if (!authLoading && client) fetchBlocks();
  }, [authLoading, client, fetchBlocks]);

  const createBlock = useCallback(
    async (data: {
      title: string;
      description?: string;
      meeting_url?: string;
      date: string;
      start_hour: number;
      end_hour: number;
      category_id?: string;
    }) => {
      if (!client || !userId) return;
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        user_id: userId,
        title: data.title,
        description: data.description || null,
        meeting_url: data.meeting_url || null,
        date: data.date,
        start_hour: data.start_hour,
        end_hour: data.end_hour,
        category_id: data.category_id || null,
        created_at: now,
        updated_at: now,
      };
      await client.from("time_blocks").insert(record);
      await fetchBlocks();
      return record;
    },
    [client, userId, fetchBlocks]
  );

  const updateBlock = useCallback(
    async (id: string, data: Partial<TimeBlock>) => {
      if (!client) return;
      const { category_name, category_color, ...storable } = data;
      await client
        .from("time_blocks")
        .update({ ...storable, updated_at: new Date().toISOString() })
        .eq("id", id);
      await fetchBlocks();
    },
    [client, fetchBlocks]
  );

  const deleteBlock = useCallback(
    async (id: string) => {
      if (!client) return;
      await client.from("time_blocks").delete().eq("id", id);
      await fetchBlocks();
    },
    [client, fetchBlocks]
  );

  return {
    blocks,
    loading,
    createBlock,
    updateBlock,
    deleteBlock,
    refetch: fetchBlocks,
  };
}
