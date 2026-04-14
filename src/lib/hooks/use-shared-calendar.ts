"use client";

import { useState, useEffect, useCallback } from "react";
import { TimeBlock, Task } from "@/types";

interface SharedData {
  blocks: TimeBlock[];
  tasks: Task[];
  ownerId: string | null;
}

export function useSharedCalendar(token: string | null, weekStartStr: string) {
  const [data, setData] = useState<SharedData>({ blocks: [], tasks: [], ownerId: null });
  const [loading, setLoading] = useState(false);

  const fetchShared = useCallback(async () => {
    if (!token) {
      setData({ blocks: [], tasks: [], ownerId: null });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/share/${token}?weekStart=${weekStartStr}`
      );
      if (res.ok) {
        const json = await res.json();
        setData({
          blocks: json.blocks ?? [],
          tasks: json.tasks ?? [],
          ownerId: json.ownerId ?? null,
        });
      } else {
        setData({ blocks: [], tasks: [], ownerId: null });
      }
    } catch {
      setData({ blocks: [], tasks: [], ownerId: null });
    } finally {
      setLoading(false);
    }
  }, [token, weekStartStr]);

  useEffect(() => {
    fetchShared();
  }, [fetchShared]);

  return {
    sharedBlocks: data.blocks,
    sharedTasks: data.tasks,
    sharedOwnerId: data.ownerId,
    sharedLoading: loading,
  };
}
