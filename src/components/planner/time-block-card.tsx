"use client";

import { Video } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { TimeBlock } from "@/types";

interface TimeBlockCardProps {
  block: TimeBlock;
  onClick: (block: TimeBlock) => void;
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function TimeBlockCard({ block, onClick }: TimeBlockCardProps) {
  const HOUR_HEIGHT = 56; // h-14 = 56px
  const START_HOUR = 6;

  const top = (block.start_hour - START_HOUR) * HOUR_HEIGHT;
  const height = (block.end_hour - block.start_hour) * HOUR_HEIGHT;
  const isShort = block.end_hour - block.start_hour <= 1;

  const categoryColor = block.category_color ?? "#a8a29e"; // stone-400 fallback

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
  });

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : {};

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(block);
      }}
      {...listeners}
      {...attributes}
      className={`absolute left-8 right-1 rounded-lg px-2 py-1.5 text-left cursor-grab hover:shadow-md transition-all duration-150 overflow-hidden z-10 ${isDragging ? "opacity-50 shadow-lg scale-[1.02]" : "hover:brightness-[0.97]"}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        borderLeft: `3px solid ${categoryColor}`,
        backgroundColor: `${categoryColor}18`,
        ...dragStyle,
      }}
    >
      <p
        className={`text-xs font-medium text-stone-800 ${isShort ? "truncate" : ""}`}
      >
        {block.title}
      </p>
      {!isShort && (
        <>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {formatHour(block.start_hour)} - {formatHour(block.end_hour)}
          </p>
          {block.meeting_url && (
            <a
              href={block.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors w-fit"
            >
              <Video size={11} />
              Join
            </a>
          )}
        </>
      )}
      {isShort && block.meeting_url && (
        <a
          href={block.meeting_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 font-medium mt-0.5"
        >
          <Video size={10} />
          Join
        </a>
      )}
    </button>
  );
}
