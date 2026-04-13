"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { NoteSection } from "@/types";

export function useNoteSections() {
  const { client, userId, loading: authLoading } = useSupabase();
  const [sections, setSections] = useState<NoteSection[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!client || !userId) return;

    const { data } = await client
      .from("note_sections")
      .select("id, name, sort_order, created_at")
      .order("sort_order");

    setSections(data ?? []);
    setLoading(false);
  }, [client, userId]);

  useEffect(() => {
    if (!authLoading && client) refetch();
  }, [authLoading, client, refetch]);

  const createSection = useCallback(
    async (name: string) => {
      if (!client || !userId) return;

      const { data: last } = await client
        .from("note_sections")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const record = {
        id: crypto.randomUUID(),
        user_id: userId,
        name,
        sort_order: ((last?.sort_order as number) ?? -1) + 1,
        created_at: new Date().toISOString(),
      };
      await client.from("note_sections").insert(record);
      await refetch();
      return record;
    },
    [client, userId, refetch]
  );

  const renameSection = useCallback(
    async (id: string, name: string) => {
      if (!client) return;
      await client.from("note_sections").update({ name }).eq("id", id);
      await refetch();
    },
    [client, refetch]
  );

  const deleteSection = useCallback(
    async (id: string) => {
      if (!client) return;
      // note_pages cascade via FK ON DELETE CASCADE
      await client.from("note_sections").delete().eq("id", id);
      await refetch();
    },
    [client, refetch]
  );

  return { sections, loading, createSection, renameSection, deleteSection, refetch };
}
