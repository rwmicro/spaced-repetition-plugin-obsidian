import React from "react";
import { ReviewNote } from "../types";
import { formatDistanceToNow } from "../utils/date-utils";

interface ReviewCardProps {
  note: ReviewNote;
  onOpenNote: (note: ReviewNote) => void;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ note, onOpenNote, selected = false, onSelectChange }) => {
  const isOverdue = new Date(note.nextReview) < new Date();

  return (
    <tr
      className={`
                border-b border-neutral-200 dark:border-neutral-700 hover:text-blue-600
                cursor-pointer transition-colors
                ${isOverdue ? "bg-red-50 dark:bg-red-900/20" : ""}
            `}
    >
      <td className="pl-2 md:pl-6 py-2">
        <input 
          type="checkbox" 
          checked={selected}
          onChange={(e) => onSelectChange?.(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer w-4 h-4 md:w-5 md:h-5"
        />
      </td>
      <td className="h-12 md:h-14 px-2 md:px-4 align-middle" onClick={() => onOpenNote(note)}>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOverdue ? "bg-red-500" : "bg-blue-500"
            }`}
          />
          <span className="font-medium transition-colors text-sm md:text-base truncate">
            {note.title}
          </span>
        </div>
      </td>
      <td
        className="h-12 md:h-14 px-2 md:px-4 align-middle text-xs md:text-sm text-neutral-500"
        onClick={() => onOpenNote(note)}
      >
        <span className="block truncate">{formatDistanceToNow(note.nextReview)}</span>
      </td>
      <td
        className="h-12 md:h-14 px-2 md:px-4 align-middle text-xs md:text-sm text-neutral-500"
        onClick={() => onOpenNote(note)}
      >
        {note.difficulty}/5
      </td>
      <td
        className="h-12 md:h-14 px-2 md:px-4 align-middle text-xs md:text-sm text-neutral-500"
        onClick={() => onOpenNote(note)}
      >
        {note.streakCount}
      </td>
    </tr>
  );
};
