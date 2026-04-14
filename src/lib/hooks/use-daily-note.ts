"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabase } from "./use-supabase";

export function useDailyNote(date: string) {
  const { client, userId, loading: authLoading } = useSupabase();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const fetchNote = useCallback(async () => {
    if (!client || !userId) return;
    setLoading(true);

    const { data } = await client
      .from("daily_notes")
      .select("content")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    setContent(data?.content ?? "");
    setLoading(false);
  }, [client, userId, date]);

  useEffect(() => {
    if (!authLoading && client) fetchNote();
  }, [authLoading, client, fetchNote]);

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (!client || !userId) return;
        const now = new Date().toISOString();
        await client.from("daily_notes").upsert(
          {
            user_id: userId,
            date,
            content: newContent,
            updated_at: now,
            created_at: now,
          },
          { onConflict: "user_id,date" }
        );
      }, 500);
    },
    [client, userId, date]
  );

  return { content, loading, updateContent };
}
