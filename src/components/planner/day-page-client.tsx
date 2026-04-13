"use client";

import { useState, useCallback } from "react";
import { parseISO, isValid, format, startOfWeek } from "date-fns";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DayNavigator } from "@/components/planner/day-navigator";
import { DayView } from "@/components/planner/day-view";
import { TimeBlockModal } from "@/components/planner/time-block-modal";
import { useTimeBlocks } from "@/lib/hooks/use-time-blocks";
import { useCategories } from "@/lib/hooks/use-categories";
import { useHolidays } from "@/lib/hooks/use-holidays";
import { useWeather } from "@/lib/hooks/use-weather";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { TimeBlock } from "@/types";

interface DayPageClientProps {
  dateParam: string;
}

export default function DayPageClient({ dateParam }: DayPageClientProps) {
  const router = useRouter();
  const date = parseISO(dateParam);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [slotDate, setSlotDate] = useState(dateParam);
  const [slotHour, setSlotHour] = useState<number | undefined>();

  const weekStartStr = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const { blocks, createBlock, updateBlock, deleteBlock } = useTimeBlocks(weekStartStr);
  const { categories } = useCategories();
  const { countryCode, latitude, longitude, tempUnit } = usePreferences();
  const { holidays } = useHolidays(countryCode);
  const { weather } = useWeather(latitude, longitude, tempUnit);

  const handleBlockClick = useCallback((block: TimeBlock) => {
    setEditingBlock(block);
    setSlotDate(block.date);
    setSlotHour(undefined);
    setModalOpen(true);
  }, []);

  const handleAddBlock = useCallback(() => {
    setEditingBlock(null);
    setSlotDate(dateParam);
    setSlotHour(undefined);
    setModalOpen(true);
  }, [dateParam]);

  const handleSave = useCallback(async (data: {
    title: string;
    description?: string;
    date: string;
    start_hour: number;
    end_hour: number;
    category_id?: string;
  }) => {
    if (editingBlock) {
      await updateBlock(editingBlock.id, data);
    } else {
      await createBlock(data);
    }
    setModalOpen(false);
  }, [editingBlock, updateBlock, createBlock]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteBlock(id);
    setModalOpen(false);
  }, [deleteBlock]);

  const handleDateChange = useCallback((newDate: Date) => {
    router.push(`/day/${format(newDate, "yyyy-MM-dd")}`);
  }, [router]);

  if (!isValid(date)) {
    return (
      <div className="flex h-screen items-center justify-center text-stone-500 text-sm">
        Invalid date. Use format: /day/2026-04-01
      </div>
    );
  }

  return (
    <>
      <Header title="Day">
        <DayNavigator date={date} onDateChange={handleDateChange} />
      </Header>

      <div className="flex-1 overflow-auto">
        <DayView
          date={date}
          blocks={blocks}
          categories={categories}
          onEditBlock={handleBlockClick}
          onAddBlock={handleAddBlock}
          holidays={holidays}
          weather={weather}
        />
      </div>

      <TimeBlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        block={editingBlock}
        date={slotDate}
        hour={slotHour}
        categories={categories}
        onSave={handleSave}
        onDelete={editingBlock ? handleDelete : undefined}
      />
    </>
  );
}
