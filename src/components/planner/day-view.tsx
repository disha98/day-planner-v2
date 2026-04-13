"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Clock, CalendarX2, Plus, Droplets } from "lucide-react";
import { TimeBlock, Category, Holiday, DayWeather } from "@/types";
import { useTasks } from "@/lib/hooks/use-tasks";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskInput } from "@/components/tasks/task-input";
import { DailyNotes } from "@/components/notes/daily-notes";
import { getWeatherInfo } from "@/lib/weather-utils";

interface DayViewProps {
  date: Date;
  blocks: TimeBlock[];
  blocksLoading?: boolean;
  categories: Category[];
  onEditBlock: (block: TimeBlock) => void;
  onAddBlock: () => void;
  holidays?: Map<string, Holiday[]>;
  weather?: Map<string, DayWeather>;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${period}`;
}

export function DayView({ date, blocks, blocksLoading = false, categories, onEditBlock, onAddBlock, holidays, weather }: DayViewProps) {
  const dateStr = format(date, "yyyy-MM-dd");

  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(dateStr);

  const dayBlocks = useMemo(() => {
    return blocks
      .filter((b) => b.date === dateStr)
      .sort((a, b) => a.start_hour - b.start_hour);
  }, [blocks, dateStr]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.sort_order - b.sort_order);
  }, [tasks]);

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      updateTask(id, { completed: task.completed ? 0 : 1 });
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  const dayHolidays = holidays?.get(dateStr);
  const dayWeather = weather?.get(dateStr);
  const weatherInfo = dayWeather ? getWeatherInfo(dayWeather.weatherCode) : null;
  const WeatherIcon = weatherInfo?.icon;

  return (
    <div className="flex gap-8 p-6 max-w-5xl mx-auto">
      {/* Left column — Schedule */}
      <div className="flex-1 max-w-xl">
        {/* Holiday banner */}
        {dayHolidays && dayHolidays.length > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-pink-50 border border-pink-100 rounded-xl">
            <span className="text-sm">🎉</span>
            <span className="text-sm font-medium text-pink-700">
              {dayHolidays.map((h) => h.name).join(", ")}
            </span>
          </div>
        )}

        {/* Weather card */}
        {dayWeather && WeatherIcon && weatherInfo && (
          <div className={`flex items-center gap-4 mb-3 px-4 py-3.5 rounded-xl border ${weatherInfo.bgColor} ${weatherInfo.borderColor}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${weatherInfo.bgColor}`}>
              <WeatherIcon size={24} className={weatherInfo.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-stone-800 tabular-nums">
                  {dayWeather.tempMax}°
                </span>
                <span className="text-sm text-stone-400 tabular-nums">
                  / {dayWeather.tempMin}°
                </span>
                <span className="text-sm font-medium text-stone-600">
                  {weatherInfo.label}
                </span>
              </div>
              {dayWeather.precipProbability > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Droplets size={12} className="text-blue-400" />
                  <span className="text-xs text-stone-500">
                    {dayWeather.precipProbability}% chance of precipitation
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400" />
            <h2 className="text-base font-semibold text-stone-800">Schedule</h2>
            {!blocksLoading && dayBlocks.length > 0 && (
              <span className="text-xs text-stone-400 tabular-nums">
                {dayBlocks.length}
              </span>
            )}
          </div>
        </div>

        {blocksLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : dayBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
              <CalendarX2 className="w-6 h-6 text-stone-300" />
            </div>
            <span className="text-sm font-medium text-stone-500">No events scheduled</span>
            <span className="text-xs text-stone-400 mt-1">Click below to add one</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => onEditBlock(block)}
                className="flex items-stretch rounded-xl border border-stone-200/80 bg-white hover:shadow-md hover:border-stone-300/80 transition-all duration-200 cursor-pointer text-left group"
              >
                {/* Color bar */}
                <div
                  className="w-1 rounded-l-xl flex-shrink-0"
                  style={{
                    backgroundColor: block.category_color || "#a8a29e",
                  }}
                />

                {/* Content */}
                <div className="px-4 py-3 flex-1 min-w-0">
                  <p className="text-xs text-stone-400 font-medium tabular-nums">
                    {formatHour(block.start_hour)} &ndash; {formatHour(block.end_hour)}
                  </p>
                  <p className="text-sm font-semibold text-stone-800 mt-0.5 truncate group-hover:text-stone-900">
                    {block.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {block.category_name && (
                      <span
                        className="inline-block text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: block.category_color
                            ? `${block.category_color}12`
                            : "#f5f5f4",
                          color: block.category_color || "#78716c",
                        }}
                      >
                        {block.category_name}
                      </span>
                    )}
                    {block.meeting_url && (
                      <a
                        href={block.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium px-1.5 py-0.5 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Join meeting
                      </a>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Add event button */}
        <button
          onClick={onAddBlock}
          className="flex items-center gap-1.5 mt-3 px-3 py-2 text-sm text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all duration-150 border border-dashed border-stone-200 hover:border-stone-300 w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add event
        </button>
      </div>

      {/* Right column — Tasks & Notes */}
      <div className="w-80 flex-shrink-0">
        {/* Tasks section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-stone-800">Tasks</h2>
            {!tasksLoading && sortedTasks.length > 0 && (
              <span className="text-xs text-stone-400 tabular-nums">
                {sortedTasks.length}
              </span>
            )}
          </div>

          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="skeleton h-8 w-full" />
              ))}
            </div>
          ) : sortedTasks.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 px-2 text-center">No tasks for today</p>
          ) : (
            <div className="flex flex-col">
              {sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          <TaskInput
            onAdd={createTask}
            categories={categories}
            selectedDate={dateStr}
          />
        </div>

        {/* Notes section */}
        <div className="mt-6">
          <DailyNotes selectedDate={dateStr} />
        </div>
      </div>
    </div>
  );
}
