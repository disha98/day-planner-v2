"use client";

import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export function useSupabase() {
  const { userId, isLoaded } = useAuth();

  return {
    client: supabase,
    userId: userId ?? null,
    loading: !isLoaded,
  };
}
