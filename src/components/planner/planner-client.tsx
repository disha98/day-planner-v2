"use client";

import { useState, useCallback } from "react";
import { startOfWeek, format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { WeeklyGrid } from "@/components/planner/weekly-grid";
import { ListView } from "@/components/planner/list-view";
import { DayView } from "@/components/planner/day-view";
import { DateNavigator } from "@/components/planner/date-navigator";
import { DayNavigator } from "@/components/planner/day-navigator";
import { TimeBlockModal } from "@/components/planner/time-block-modal";
import { useTimeBlocks } from "@/lib/hooks/use-time-blocks";
import { useCategories } from "@/lib/hooks/use-categories";
import { useHolidays } from "@/lib/hooks/use-holidays";
import { useWeather } from "@/lib/hooks/use-weather";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { TimeBlock } from "@/types";

type ViewType = "calendar" | "list" | "day";

export default function PlannerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const activeView: ViewType =
    viewParam === "calendar" || viewParam === "day" ? viewParam : "list";

  const now = new Date();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(now, { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    format(now, "yyyy-MM-dd")
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotHour, setSlotHour] = useState<number | undefined>();

  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const { blocks, createBlock, updateBlock, deleteBlock } = useTimeBlocks(weekStartStr);
  const { categories } = useCategories();
  const { countryCode, latitude, longitude, tempUnit } = usePreferences();
  const { holidays } = useHolidays(countryCode);
  const { weather } = useWeather(latitude, longitude, tempUnit);

  const handleSlotClick = useCallback((date: string, hour: number) => {
    setEditingBlock(null);
    setSlotDate(date);
    setSlotHour(hour);
    setModalOpen(true);
  }, []);

  const handleBlockClick = useCallback((block: TimeBlock) => {
    setEditingBlock(block);
    setSlotDate(block.date);
    setSlotHour(undefined);
    setModalOpen(true);
  }, []);

  const handleAddBlock = useCallback(() => {
    setEditingBlock(null);
    setSlotDate(selectedDate);
    setSlotHour(undefined);
    setModalOpen(true);
  }, [selectedDate]);

  const handleSave = useCallback(
    async (data: {
      title: string;
      description?: string;
      meeting_url?: string;
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
    },
    [editingBlock, updateBlock, createBlock]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteBlock(id);
      setModalOpen(false);
    },
    [deleteBlock]
  );

  const handleDayClick = useCallback((dateStr: string) => {
    router.push(`/day/${dateStr}`);
  }, [router]);

  const handleDayDateChange = useCallback((date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
  }, []);

  const selectedDateObj = parseISO(selectedDate);

  return (
    <>
      <Header
        title={
          activeView === "calendar" ? "Calendar" :
          activeView === "day" ? "Day" :
          "Upcoming"
        }
      >
        {activeView === "calendar" && (
          <DateNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
        )}
        {activeView === "day" && (
          <DayNavigator
            date={selectedDateObj}
            onDateChange={handleDayDateChange}
          />
        )}
      </Header>

      <div className="flex flex-1 overflow-hidden">
        {activeView === "calendar" && (
          <>
            <div className="flex-1 overflow-auto">
              <WeeklyGrid
                weekStart={weekStart}
                blocks={blocks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSlotClick={handleSlotClick}
                onBlockClick={handleBlockClick}
                onUpdateBlock={updateBlock}
                holidays={holidays}
                weather={weather}
              />
            </div>
            <Sidebar selectedDate={selectedDate} categories={categories} />
          </>
        )}

        {activeView === "list" && (
          <div className="flex-1 overflow-auto">
            <ListView
              weekStart={weekStart}
              blocks={blocks}
              categories={categories}
              onEditBlock={handleBlockClick}
              onDayClick={handleDayClick}
              onAddBlock={handleAddBlock}
              holidays={holidays}
              weather={weather}
            />
          </div>
        )}

        {activeView === "day" && (
          <div className="flex-1 overflow-auto">
            <DayView
              date={selectedDateObj}
              blocks={blocks}
              categories={categories}
              onEditBlock={handleBlockClick}
              onAddBlock={handleAddBlock}
              holidays={holidays}
              weather={weather}
            />
          </div>
        )}
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
