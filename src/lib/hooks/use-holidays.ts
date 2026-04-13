"use client";

import { useState, useEffect, useCallback } from "react";
import { Holiday } from "@/types";

export function useHolidays(countryCode: string = "US") {
  const [holidays, setHolidays] = useState<Map<string, Holiday[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchHolidays = useCallback(async () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];

    const map = new Map<string, Holiday[]>();

    await Promise.all(
      years.map(async (year) => {
        try {
          const res = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
          );
          if (!res.ok) return;
          const data: { date: string; name: string; localName: string }[] =
            await res.json();

          for (const h of data) {
            const existing = map.get(h.date) ?? [];
            existing.push({
              date: h.date,
              name: h.name,
              localName: h.localName,
            });
            map.set(h.date, existing);
          }
        } catch {
          // Silently fail — holidays are non-critical
        }
      })
    );

    setHolidays(map);
    setLoading(false);
  }, [countryCode]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return { holidays, loading };
}
