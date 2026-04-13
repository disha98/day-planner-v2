"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TimeBlock, Category } from "@/types";

interface TimeBlockModalProps {
  open: boolean;
  onClose: () => void;
  block?: TimeBlock | null;
  date: string;
  hour?: number;
  categories: Category[];
  onSave: (data: {
    title: string;
    description?: string;
    meeting_url?: string;
    date: string;
    start_hour: number;
    end_hour: number;
    category_id?: string;
  }) => void;
  onDelete?: (id: string) => void;
}

function formatHourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function buildHourOptions() {
  const options: { value: string; label: string }[] = [];
  for (let h = 6; h <= 22; h++) {
    options.push({ value: String(h), label: formatHourLabel(h) });
  }
  return options;
}

export function TimeBlockModal({
  open,
  onClose,
  block,
  date,
  hour,
  categories,
  onSave,
  onDelete,
}: TimeBlockModalProps) {
  const isEditing = !!block;
  const defaultStart = hour ?? block?.start_hour ?? 9;
  const defaultEnd = block?.end_hour ?? Math.min(defaultStart + 1, 22);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [blockDate, setBlockDate] = useState(date);
  const [startHour, setStartHour] = useState(defaultStart);
  const [endHour, setEndHour] = useState(defaultEnd);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    if (open) {
      setTitle(block?.title ?? "");
      setDescription(block?.description ?? "");
      setMeetingUrl(block?.meeting_url ?? "");
      setBlockDate(block?.date ?? date);
      setStartHour(hour ?? block?.start_hour ?? 9);
      setEndHour(block?.end_hour ?? Math.min((hour ?? block?.start_hour ?? 9) + 1, 22));
      setCategoryId(block?.category_id ?? "");
    }
  }, [open, block, hour, date]);

  const hourOptions = buildHourOptions();

  const categoryOptions = [
    { value: "", label: "No category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  async function handleSave() {
    if (!title.trim()) return;
    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      meeting_url: meetingUrl.trim() || undefined,
      date: blockDate,
      start_hour: startHour,
      end_hour: endHour,
      category_id: categoryId || undefined,
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit time block" : "New time block"}
    >
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="text-base font-medium !py-2.5"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-stone-500">
            Description
          </label>
          <textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 transition-all duration-150 hover:border-stone-300 resize-none"
          />
        </div>

        <Input
          label="Meeting link"
          placeholder="https://zoom.us/j/... or https://meet.google.com/..."
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
        />

        <Input
          label="Date"
          type="date"
          value={blockDate}
          onChange={(e) => setBlockDate(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Start time"
            options={hourOptions}
            value={String(startHour)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setStartHour(val);
              if (endHour <= val) setEndHour(Math.min(val + 1, 22));
            }}
          />
          <Select
            label="End time"
            options={hourOptions.filter(
              (o) => Number(o.value) > startHour
            )}
            value={String(endHour)}
            onChange={(e) => setEndHour(Number(e.target.value))}
          />
        </div>

        <Select
          label="Category"
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-1">
          {isEditing && onDelete ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onDelete(block!.id);
                onClose();
              }}
            >
              <Trash2 size={13} />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
