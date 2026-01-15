import React, { useState, useMemo } from "react";
import { Plus, Calendar } from "lucide-react";
import { t, getFormattedDate } from "../utils/i18n";

interface AddNoteModalProps {
  noteTitle: string;
  onAdd: (interval: number) => void;
  onCancel: () => void;
}

const INTERVAL_PRESETS = [
  { value: 1, label: "1" },
  { value: 3, label: "3" },
  { value: 7, label: "7" },
  { value: 14, label: "14" },
  { value: 30, label: "30" },
];

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  noteTitle,
  onAdd,
  onCancel,
}) => {
  const [selectedInterval, setSelectedInterval] = useState(1);

  const firstReviewDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + selectedInterval);
    return date;
  }, [selectedInterval]);

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">
        {t('add_note_to_sr')}
      </h2>

      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{t('note')}:</p>
        <p className="font-medium text-base md:text-lg bg-gray-100 dark:bg-gray-800 p-3 rounded-lg break-words">
          {noteTitle}
        </p>
      </div>

      {/* Interval selector */}
      <div className="mb-4">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{t('first_review_in')}:</p>
        <div className="flex flex-wrap gap-2">
          {INTERVAL_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setSelectedInterval(preset.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                selectedInterval === preset.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {preset.label} {preset.value === 1 ? t('day') : t('days')}
            </button>
          ))}
        </div>
      </div>

      {/* Preview of first review date */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
        <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
        <span>
          {t('next_review')}: <strong className="text-gray-800 dark:text-gray-200">{getFormattedDate(firstReviewDate)}</strong>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors min-h-[44px] font-medium"
        >
          {t('cancel')}
        </button>
        <button
          onClick={() => onAdd(selectedInterval)}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 min-h-[44px] font-medium"
        >
          <Plus size={18} />
          <span>{t('add_to_reviews')}</span>
        </button>
      </div>
    </div>
  );
};
