"use client";

import { useMemo, useEffect, useState } from "react";
import { format } from "date-fns";
import { useDroppable } from "@dnd-kit/core";
import { Droplets } from "lucide-react";
import { TimeBlock, Holiday, DayWeather } from "@/types";
import { HourSlot } from "@/components/planner/hour-slot";
import { TimeBlockCard } from "@/components/planner/time-block-card";
import { getWeatherInfo } from "@/lib/weather-utils";

interface DayColumnProps {
  date: Date;
  blocks: TimeBlock[];
  isToday: boolean;
  onSlotClick: (date: string, hour: number) => void;
  onBlockClick: (block: TimeBlock) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  holidays?: Holiday[];
  weather?: DayWeather;
}

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 56; // h-14

export function DayColumn({
  date,
  blocks,
  isToday,
  onSlotClick,
  onBlockClick,
  selectedDate,
  onSelectDate,
  holidays,
  weather,
}: DayColumnProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayName = format(date, "EEE");
  const dayNum = format(date, "d");
  const isSelected = selectedDate === dateStr;

  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = START_HOUR; i < END_HOUR; i++) {
      h.push(i);
    }
    return h;
  }, []);

  // Current time indicator for today
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (!isToday) return;
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [isToday]);

  const currentTimeTop = useMemo(() => {
    if (!isToday) return null;
    const h = now.getHours() + now.getMinutes() / 60;
    if (h < START_HOUR || h > END_HOUR) return null;
    return (h - START_HOUR) * HOUR_HEIGHT;
  }, [isToday, now]);

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null;
  const WeatherIcon = weatherInfo?.icon;

  return (
    <div ref={setNodeRef} className={`flex flex-col border-r border-stone-100 last:border-r-0 min-w-0 transition-colors ${isOver ? "bg-blue-50/40" : ""}`}>
      {/* Column header */}
      <button
        type="button"
        onClick={() => onSelectDate(dateStr)}
        className={`flex flex-col items-center py-2 border-b border-stone-200 transition-all duration-150 ${
          isSelected ? "bg-stone-50" : "hover:bg-stone-50/50"
        }`}
      >
        <span className={`text-[10px] uppercase tracking-wider font-medium ${isToday ? "text-blue-500" : "text-stone-400"}`}>
          {dayName}
        </span>
        <span
          className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
            isToday
              ? "bg-blue-500 text-white"
              : isSelected
              ? "bg-stone-200 text-stone-800"
              : "text-stone-700"
          }`}
        >
          {dayNum}
        </span>

        {/* Weather */}
        {weather && WeatherIcon && weatherInfo && (
          <div className="flex items-center gap-1 mt-1.5">
            <WeatherIcon size={16} className={weatherInfo.color} />
            <span className="text-[11px] font-medium text-stone-600 tabular-nums">
              {weather.tempMax}°/{weather.tempMin}°
            </span>
            {weather.precipProbability > 30 && (
              <span className="flex items-center gap-px text-[10px] text-blue-500 font-medium">
                <Droplets size={10} />
                {weather.precipProbability}%
              </span>
            )}
          </div>
        )}

        {/* Holiday badge */}
        {holidays && holidays.length > 0 && (
          <span className="mt-1 text-[9px] font-medium text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full truncate max-w-full">
            {holidays[0].name}
          </span>
        )}
      </button>

      {/* Time grid with block overlay */}
      <div className="relative flex-1">
        {/* Hour slots */}
        {hours.map((hour) => (
          <HourSlot
            key={hour}
            hour={hour}
            date={dateStr}
            onClick={onSlotClick}
          />
        ))}

        {/* Time block cards */}
        {blocks.map((block) => (
          <TimeBlockCard key={block.id} block={block} onClick={onBlockClick} />
        ))}

        {/* Current time indicator */}
        {currentTimeTop !== null && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
              <div className="flex-1 h-[2px] bg-red-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
