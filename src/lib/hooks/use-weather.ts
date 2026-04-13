"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DayWeather } from "@/types";

// Default: Chicago, USA
const DEFAULT_LAT = 41.8781;
const DEFAULT_LNG = -87.6298;

export function useWeather(
  latitude?: number,
  longitude?: number,
  tempUnit: "celsius" | "fahrenheit" = "celsius"
) {
  const [weather, setWeather] = useState<Map<string, DayWeather>>(new Map());
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const geoRequested = useRef(false);

  // Request geolocation on mount if no coords provided
  useEffect(() => {
    if (latitude && longitude) {
      setLocation({ lat: latitude, lng: longitude });
      return;
    }
    if (geoRequested.current) return;
    geoRequested.current = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Denied or unavailable — fall back to Chicago
          setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        },
        { timeout: 10000 }
      );
    } else {
      setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
    }
  }, [latitude, longitude]);

  const fetchWeather = useCallback(async () => {
    if (!location) return;

    try {
      const params = new URLSearchParams({
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        temperature_unit: tempUnit,
        forecast_days: "16",
        timezone: "auto",
      });

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );
      if (!res.ok) return;

      const data = await res.json();
      const { daily } = data;
      if (!daily?.time) return;

      const map = new Map<string, DayWeather>();
      for (let i = 0; i < daily.time.length; i++) {
        map.set(daily.time[i], {
          date: daily.time[i],
          tempMin: Math.round(daily.temperature_2m_min[i]),
          tempMax: Math.round(daily.temperature_2m_max[i]),
          weatherCode: daily.weather_code[i],
          precipProbability: daily.precipitation_probability_max[i] ?? 0,
        });
      }

      setWeather(map);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [location, tempUnit]);

  useEffect(() => {
    if (location) fetchWeather();
  }, [location, fetchWeather]);

  // Refresh every 3 hours
  useEffect(() => {
    if (!location) return;
    const interval = setInterval(fetchWeather, 3 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location, fetchWeather]);

  return { weather, loading };
}
