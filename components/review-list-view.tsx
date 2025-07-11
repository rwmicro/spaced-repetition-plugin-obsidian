import React, { useContext, useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Clock,
  BarChart2,
  Filter,
  BookOpen,
  Flame,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { ReviewContext } from "../context/review-context";
import { ReviewCard } from "./review-card";

export const ReviewListView: React.FC = () => {
  const { notes, updateNote, deleteNote, openNote } = useContext(ReviewContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "nextReview" | "difficulty" | "streakCount"
  >("nextReview");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes.filter((note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterOverdue) {
      const now = new Date();
      filtered = filtered.filter((note) => new Date(note.nextReview) <= now);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "nextReview":
          return (
            new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
          );
        case "difficulty":
          return b.difficulty - a.difficulty;
        case "streakCount":
          return b.streakCount - a.streakCount;
        default:
          return 0;
      }
    });
  }, [notes, searchTerm, sortBy, filterOverdue]);

  const stats = useMemo(() => {
    const now = new Date();
    const overdue = notes.filter((n) => new Date(n.nextReview) <= now).length;
    const today = notes.filter((n) => {
      const reviewDate = new Date(n.nextReview);
      return reviewDate.toDateString() === now.toDateString();
    }).length;
    const avgDifficulty =
      notes.length > 0
        ? notes.reduce((sum, n) => sum + n.difficulty, 0) / notes.length
        : 0;

    return { overdue, today, avgDifficulty, total: notes.length };
  }, [notes]);

  const handleSelectNote = (noteId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(noteId);
    } else {
      newSelected.delete(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedNotes.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedNotes.size} selected note(s) from the review system?`
    );
    if (!confirmed) return;

    for (const noteId of selectedNotes) {
      await deleteNote(noteId);
    }
    setSelectedNotes(new Set());
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(new Set(filteredAndSortedNotes.map((note) => note.id)));
    } else {
      setSelectedNotes(new Set());
    }
  };

  const isAllSelected =
    filteredAndSortedNotes.length > 0 &&
    selectedNotes.size === filteredAndSortedNotes.length;
  const isPartiallySelected =
    selectedNotes.size > 0 &&
    selectedNotes.size < filteredAndSortedNotes.length;

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className=" border-b border-neutral-300 dark:border-neutral-500 p-4">
        <h2 className="text-2xl font-bold  mb-4">Spaced Repetition Reviews</h2>

        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
          <div className="bg-neutral-100 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <Clock size={16} />
              <span className="text-xs font-medium">Overdue</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
              {stats.overdue}
            </p>
          </div>
          <div className="bg-neutral-100  rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Clock size={16} />
              <span className="text-xs font-medium">Today</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
              {stats.today}
            </p>
          </div>
          <div className="bg-neutral-100  rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <BarChart2 size={16} />
              <span className="text-xs font-medium">Avg Difficulty</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
              {stats.avgDifficulty.toFixed(1)}
            </p>
          </div>
          <div className="bg-neutral-100  rounded-lg p-3">
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <BookOpen size={16} />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
              {stats.total}
            </p>
          </div>
        </div>

        {/* Controls - Mobile Responsive */}
        <div className="flex gap-3 mb-4">
          {selectedNotes.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-3 bg-red-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors min-h-[44px]"
            >
              <Trash2 size={16} />
              <span>Delete Selected ({selectedNotes.size})</span>
            </button>
          )}

          {/* Search Bar */}
          <div className="flex items-center relative w-full border border-neutral-200 dark:border-neutral-600 rounded-lg  focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden">
            <span
              className="px-3 flex items-center justify-center focus:outline-none"
              onClick={() => {
                // Focus the input when the button is clicked
                const input = document.getElementById("review-search-input");
                if (input) input.focus();
              }}
              tabIndex={-1}
            >
              <Search className="text-neutral-400" size={18} />
            </span>
            <input
              id="review-search-input"
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full py-3 px-2 outline-none border-transparent bg-transparent min-h-[44px]"
            />
          </div>

          {/* Filter Controls - Stack on Mobile */}
            <div className="relative flex-1" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 border dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] flex items-center justify-between bg-white dark:bg-gray-800 text-left"
              >
                <div className="flex items-center space-x-2">
                  {sortBy === "nextReview" && <Clock size={16} />}
                  {sortBy === "difficulty" && <BarChart2 size={16} />}
                  {sortBy === "streakCount" && <Flame size={16} />}
                  <span>
                    {sortBy === "nextReview" && "Next Review"}
                    {sortBy === "difficulty" && "Difficulty"}
                    {sortBy === "streakCount" && "Streak"}
                  </span>
                </div>
                <ChevronDown size={16} className={`transform transition-transform ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-neutral-600 rounded shadow-lg z-50">
                  <button
                    onClick={() => {
                      setSortBy("nextReview");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Clock size={16} />
                    <span>Next Review</span>
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("difficulty");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <BarChart2 size={16} />
                    <span>Difficulty</span>
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("streakCount");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Flame size={16} />
                    <span>Streak</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setFilterOverdue(!filterOverdue)}
              className={`px-4 py-3 rounded-lg flex items-center justify-center space-x-2 min-h-[44px] transition-colors
                                    ${
                                      filterOverdue
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    }`}
            >
              <Filter size={18} />
              <span>Overdue Only</span>
            </button>
        </div>
      </div>

      {/* Notes Table - Responsive */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedNotes.length === 0 ? (
          <div className="text-center py-12 ">
            {searchTerm || filterOverdue
              ? "No notes match your filters"
              : "No notes in review system yet"}
          </div>
        ) : (
          <div className="rounded-md border border-neutral-200 dark:border-neutral-700 m-2 md:m-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="h-12 md:h-14 px-2 md:px-4 text-left align-middle">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isPartiallySelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="cursor-pointer w-4 h-4 md:w-5 md:h-5"
                      />
                    </th>
                    <th className="h-12 md:h-14 px-2 md:px-4 text-left align-middle font-medium ">
                      <span
                        onClick={() => setSortBy("nextReview")}
                        className="flex items-center space-x-1  font-semibold hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer text-sm md:text-base"
                      >
                        <span>Title</span>
                      </span>
                    </th>
                    <th className="h-12 md:h-14 px-2 md:px-4 text-left align-middle font-medium ">
                      <span
                        onClick={() => setSortBy("nextReview")}
                        className="flex items-center space-x-1  font-semibold hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer text-sm md:text-base"
                      >
                        <Clock size={14} />
                        <span className="hidden sm:inline">Next Review</span>
                        <span className="sm:hidden">Next</span>
                      </span>
                    </th>
                    <th className="h-12 md:h-14 px-2 md:px-4 text-left align-middle font-medium ">
                      <span
                        onClick={() => setSortBy("difficulty")}
                        className="flex items-center space-x-1  font-semibold hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer text-sm md:text-base"
                      >
                        <BarChart2 size={14} />
                        <span className="hidden sm:inline">Difficulty</span>
                        <span className="sm:hidden">Diff</span>
                      </span>
                    </th>
                    <th className="h-12 md:h-14 px-2 md:px-4 text-left align-middle font-medium ">
                      <span
                        onClick={() => setSortBy("streakCount")}
                        className="flex items-center space-x-1  font-semibold hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer text-sm md:text-base"
                      >
                        <Flame size={14} />
                        <span>Streak</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedNotes.map((note) => (
                    <ReviewCard
                      key={note.id}
                      note={note}
                      onOpenNote={openNote}
                      selected={selectedNotes.has(note.id)}
                      onSelectChange={(checked: boolean) =>
                        handleSelectNote(note.id, checked)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
