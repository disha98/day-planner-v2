"use client";

import { useMemo, useCallback } from "react";
import { addDays, format, isToday } from "date-fns";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { TimeBlock, Holiday, DayWeather } from "@/types";
import { DayColumn } from "@/components/planner/day-column";

interface WeeklyGridProps {
  weekStart: Date;
  blocks: TimeBlock[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onSlotClick: (date: string, hour: number) => void;
  onBlockClick: (block: TimeBlock) => void;
  onUpdateBlock?: (id: string, data: Partial<TimeBlock>) => void;
  holidays?: Map<string, Holiday[]>;
  weather?: Map<string, DayWeather>;
}

export function WeeklyGrid({
  weekStart,
  blocks,
  selectedDate,
  onSelectDate,
  onSlotClick,
  onBlockClick,
  onUpdateBlock,
  holidays,
  weather,
}: WeeklyGridProps) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const blocksByDate = useMemo(() => {
    const map: Record<string, TimeBlock[]> = {};
    for (const block of blocks) {
      if (!map[block.date]) map[block.date] = [];
      map[block.date].push(block);
    }
    return map;
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onUpdateBlock) return;
    const blockId = active.id as string;
    const newDate = over.id as string;
    const block = blocks.find((b) => b.id === blockId);
    if (block && block.date !== newDate) {
      onUpdateBlock(blockId, { date: newDate });
    }
  }, [blocks, onUpdateBlock]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 flex-1 overflow-y-auto border-t border-stone-200">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return (
            <DayColumn
              key={dateStr}
              date={day}
              blocks={blocksByDate[dateStr] ?? []}
              isToday={isToday(day)}
              onSlotClick={onSlotClick}
              onBlockClick={onBlockClick}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              holidays={holidays?.get(dateStr)}
              weather={weather?.get(dateStr)}
            />
          );
        })}
      </div>
    </DndContext>
  );
}
