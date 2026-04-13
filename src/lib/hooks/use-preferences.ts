"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { UserPreferences } from "@/types";

const DEFAULTS: Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at"> = {
  country_code: "US",
  latitude: 41.8781,
  longitude: -87.6298,
  temp_unit: "celsius",
};

export function usePreferences() {
  const { client, userId, loading: authLoading } = useSupabase();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!client || !userId) return;

    const { data } = await client
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setPreferences(data as UserPreferences);
    } else {
      // Create default preferences
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        user_id: userId,
        ...DEFAULTS,
        created_at: now,
        updated_at: now,
      };
      await client.from("user_preferences").insert(record);
      setPreferences(record as UserPreferences);
    }
    setLoading(false);
  }, [client, userId]);

  useEffect(() => {
    if (!authLoading && client) refetch();
  }, [authLoading, client, refetch]);

  const updatePreferences = useCallback(
    async (data: Partial<Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (!client || !userId || !preferences) return;
      await client
        .from("user_preferences")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      setPreferences({ ...preferences, ...data });
    },
    [client, userId, preferences]
  );

  return {
    preferences,
    loading,
    updatePreferences,
    // Convenience getters with defaults
    countryCode: preferences?.country_code ?? DEFAULTS.country_code,
    latitude: preferences?.latitude ?? DEFAULTS.latitude,
    longitude: preferences?.longitude ?? DEFAULTS.longitude,
    tempUnit: preferences?.temp_unit ?? DEFAULTS.temp_unit,
  };
}
