import React from "react";
import { Plus } from "lucide-react";

interface AddNoteModalProps {
  noteTitle: string;
  onAdd: (interval: number) => void;
  onCancel: () => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  noteTitle,
  onAdd,
  onCancel,
}) => {

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">
        Add Note to Spaced Repetition
      </h2>

      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Note:</p>
        <p className="font-medium text-base md:text-lg bg-gray-100 dark:bg-gray-800 p-3 rounded-lg break-words">
          {noteTitle}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px] font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => onAdd(1)}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 min-h-[44px] font-medium"
        >
          <Plus size={18} />
          <span>Add to Reviews</span>
        </button>
      </div>
    </div>
  );
};
