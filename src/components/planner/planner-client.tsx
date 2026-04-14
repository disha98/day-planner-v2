"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { useSharedCalendar } from "@/lib/hooks/use-shared-calendar";
import { useSupabase } from "@/lib/hooks/use-supabase";
import { ShareButton } from "@/components/planner/share-button";
import { CalendarToggle } from "@/components/planner/calendar-toggle";
import { TimeBlock } from "@/types";

const SHARED_COLOR = "#6366f1"; // indigo-500

type ViewType = "calendar" | "list" | "day";

export default function PlannerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const sharedTokenFromUrl = searchParams.get("shared");
  const activeView: ViewType =
    viewParam === "calendar" || viewParam === "day" ? viewParam : "list";

  // Persist shared token in localStorage
  const [sharedToken, setSharedToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("sharedCalendarToken");
  });

  useEffect(() => {
    if (sharedTokenFromUrl) {
      localStorage.setItem("sharedCalendarToken", sharedTokenFromUrl);
      setSharedToken(sharedTokenFromUrl);
    }
  }, [sharedTokenFromUrl]);

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

  // Toggle state for calendar visibility
  const [showMine, setShowMine] = useState(true);
  const [showShared, setShowShared] = useState(true);

  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const { blocks, createBlock, updateBlock, deleteBlock } = useTimeBlocks(weekStartStr);
  const { categories } = useCategories();
  const { countryCode, latitude, longitude, tempUnit } = usePreferences();
  const { holidays } = useHolidays(countryCode);
  const { weather } = useWeather(latitude, longitude, tempUnit);

  // Current user ID for comparing against shared calendar owner
  const { userId } = useSupabase();

  // Shared calendar data
  const { sharedBlocks, sharedTasks, sharedOwnerId } = useSharedCalendar(
    sharedToken,
    weekStartStr
  );

  // If the shared calendar belongs to the current user, don't show it as shared
  const isOwnShare = !!(userId && sharedOwnerId && userId === sharedOwnerId);

  // Tag shared blocks with the fixed color and a shared marker
  const taggedSharedBlocks: TimeBlock[] = useMemo(
    () =>
      isOwnShare
        ? []
        : sharedBlocks.map((b) => ({
            ...b,
            id: `shared-${b.id}`,
            category_color: SHARED_COLOR,
            category_name: "Shared",
          })),
    [sharedBlocks, isOwnShare]
  );

  const effectiveSharedTasks = isOwnShare ? [] : sharedTasks;

  // Merge blocks based on toggle state
  const visibleBlocks = useMemo(() => {
    const result: TimeBlock[] = [];
    if (showMine) result.push(...blocks);
    if (showShared && sharedToken && !isOwnShare) result.push(...taggedSharedBlocks);
    return result;
  }, [blocks, taggedSharedBlocks, showMine, showShared, sharedToken, isOwnShare]);

  const handleSlotClick = useCallback((date: string, hour: number) => {
    setEditingBlock(null);
    setSlotDate(date);
    setSlotHour(hour);
    setModalOpen(true);
  }, []);

  const handleBlockClick = useCallback((block: TimeBlock) => {
    // Don't allow editing shared blocks
    if (block.id.startsWith("shared-")) return;
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

  const handleRemoveShared = useCallback(() => {
    localStorage.removeItem("sharedCalendarToken");
    setSharedToken(null);
  }, []);

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
        <div className="flex items-center gap-3">
          {activeView === "calendar" && (
            <DateNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
          )}
          {activeView === "day" && (
            <DayNavigator
              date={selectedDateObj}
              onDateChange={handleDayDateChange}
            />
          )}
          {sharedToken && !isOwnShare && (
            <CalendarToggle
              showMine={showMine}
              showShared={showShared}
              onToggleMine={() => setShowMine((v) => !v)}
              onToggleShared={() => setShowShared((v) => !v)}
              onRemoveShared={handleRemoveShared}
              sharedColor={SHARED_COLOR}
            />
          )}
          <ShareButton />
        </div>
      </Header>

      <div className="flex flex-1 overflow-hidden">
        {activeView === "calendar" && (
          <>
            <div className="flex-1 overflow-auto">
              <WeeklyGrid
                weekStart={weekStart}
                blocks={visibleBlocks}
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
              blocks={visibleBlocks}
              categories={categories}
              onEditBlock={handleBlockClick}
              onDayClick={handleDayClick}
              onAddBlock={handleAddBlock}
              holidays={holidays}
              weather={weather}
              sharedTasks={showShared && sharedToken && !isOwnShare ? effectiveSharedTasks : []}
              sharedColor={SHARED_COLOR}
            />
          </div>
        )}

        {activeView === "day" && (
          <div className="flex-1 overflow-auto">
            <DayView
              date={selectedDateObj}
              blocks={visibleBlocks}
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
