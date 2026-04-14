"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabase } from "./use-supabase";
import { NotePage } from "@/types";

export function useNotePages(sectionId: string | null) {
  const { client, userId, loading: authLoading } = useSupabase();
  const [pages, setPages] = useState<NotePage[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const refetch = useCallback(async () => {
    if (!client || !userId || !sectionId) {
      setPages([]);
      setLoading(false);
      return;
    }

    const { data } = await client
      .from("note_pages")
      .select("id, section_id, title, content, sort_order, created_at, updated_at")
      .eq("user_id", userId)
      .eq("section_id", sectionId)
      .order("sort_order");

    setPages(data ?? []);
    setLoading(false);
  }, [client, userId, sectionId]);

  useEffect(() => {
    if (!authLoading && client) refetch();
    else if (!sectionId) {
      setPages([]);
      setLoading(false);
    }
  }, [authLoading, client, refetch, sectionId]);

  const createPage = useCallback(
    async (title: string = "Untitled") => {
      if (!client || !userId || !sectionId) return null;

      const { data: last } = await client
        .from("note_pages")
        .select("sort_order")
        .eq("user_id", userId)
        .eq("section_id", sectionId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        user_id: userId,
        section_id: sectionId,
        title,
        content: "",
        sort_order: ((last?.sort_order as number) ?? -1) + 1,
        created_at: now,
        updated_at: now,
      };
      await client.from("note_pages").insert(record);
      await refetch();
      return record;
    },
    [client, userId, sectionId, refetch]
  );

  const updatePage = useCallback(
    async (id: string, data: { title?: string; content?: string }) => {
      if (!client) return;
      await client
        .from("note_pages")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      await refetch();
    },
    [client, refetch]
  );

  const updatePageDebounced = useCallback(
    (id: string, data: { title?: string; content?: string }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (!client) return;
        await client
          .from("note_pages")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", id);
        await refetch();
      }, 500);
    },
    [client, refetch]
  );

  const deletePage = useCallback(
    async (id: string) => {
      if (!client) return;
      await client.from("note_pages").delete().eq("id", id);
      await refetch();
    },
    [client, refetch]
  );

  return { pages, loading, createPage, updatePage, updatePageDebounced, deletePage, refetch };
}
