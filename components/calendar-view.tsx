import React, { useContext, useMemo, useState } from "react";
import {
  Clock,
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
} from "lucide-react";
import { ReviewContext } from "../context/review-context";
import { ReviewNote } from "../types";
import { t, getDayNames, getFormattedDateRange, getFormattedDate } from "../utils/i18n";

export const CalendarView: React.FC = () => {
  const { notes, openNote } = useContext(ReviewContext);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  // Get current week dates starting from today
  const getWeekDates = (weekOffset: number = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // Start from today for current week, adjust for other weeks
    startOfWeek.setDate(today.getDate() + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const dayNames = getDayNames();

  // Group notes by day
  const notesByDay = useMemo(() => {
    const grouped: { [key: string]: ReviewNote[] } = {};
    
    weekDates.forEach(date => {
      const dateStr = date.toDateString();
      grouped[dateStr] = [];
    });

    notes.forEach(note => {
      const reviewDate = new Date(note.nextReview);
      const dateStr = reviewDate.toDateString();
      if (grouped[dateStr]) {
        grouped[dateStr].push(note);
      }
    });

    return grouped;
  }, [notes, weekDates]);

  // Calculate stats
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    return date < today;
  };

  const getFolderColor = (filePath: string) => {
    const folder = filePath.split('/').slice(0, -1).join('/');
    const hash = folder.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", 
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 2: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case 3: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 4: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 5: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const getWeekRangeText = () => {
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    return getFormattedDateRange(startDate, endDate);
  };

  if (viewMode === 'table') {
    return (
      <div className="h-full overflow-hidden flex flex-col">
        {/* Header with Stats and View Toggle */}
        <div className="border-b border-neutral-300 dark:border-neutral-500 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{t('spaced_repetition_reviews')}</h2>
            <button
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Calendar size={16} />
              {t('calendar_view')}
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            <div className="bg-neutral-100 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <Clock size={16} />
                <span className="text-xs font-medium">{t('overdue')}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
                {stats.overdue}
              </p>
            </div>
            <div className="bg-neutral-100 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Clock size={16} />
                <span className="text-xs font-medium">{t('today')}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
                {stats.today}
              </p>
            </div>
            <div className="bg-neutral-100 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <BarChart2 size={16} />
                <span className="text-xs font-medium">{t('avg_difficulty')}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
                {stats.avgDifficulty.toFixed(1)}
              </p>
            </div>
            <div className="bg-neutral-100 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <BookOpen size={16} />
                <span className="text-xs font-medium">{t('total')}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('note')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('folder')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('next_review')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('difficulty')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('streak')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {notes.map(note => {
                  const folder = note.filePath.split('/').slice(0, -1).join('/') || t('root');
                  const reviewDate = new Date(note.nextReview);
                  const isOverdue = reviewDate < new Date();
                  
                  return (
                    <tr 
                      key={note.id} 
                      onClick={() => openNote(note)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{note.title}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getFolderColor(note.filePath)}`}>
                          {folder}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-neutral-900 dark:text-neutral-100'}`}>
                          {getFormattedDate(reviewDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(note.difficulty)}`}>
                          {note.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">{note.streakCount}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {notes.length === 0 && (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                {t('no_notes_in_system')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header with Stats and Navigation */}
      <div className="border-b border-neutral-300 dark:border-neutral-500 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t('spaced_repetition_reviews')}</h2>
          <button
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <List size={16} />
            {t('table_view')}
          </button>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center justify-center mb-4 gap-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-lg font-semibold min-w-[200px] text-center">
            {getWeekRangeText()}
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Stats */}
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
          <div className="bg-neutral-100 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Clock size={16} />
              <span className="text-xs font-medium">Today</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
              {stats.today}
            </p>
          </div>
          <div className="bg-neutral-100 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <BarChart2 size={16} />
              <span className="text-xs font-medium">Avg Difficulty</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
              {stats.avgDifficulty.toFixed(1)}
            </p>
          </div>
          <div className="bg-neutral-100 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <BookOpen size={16} />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-xl md:text-2xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
              {stats.total}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden p-4" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 h-full">
            {weekDates.map((date, index) => {
              const dayNotes = notesByDay[date.toDateString()] || [];
              const isTodayDate = isToday(date);
              const isOverdueDate = isOverdue(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`border rounded-lg p-3 flex flex-col ${
                    isTodayDate 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                  style={{ 
                    height: 'calc((100vh - 390px) / 1)',
                    minHeight: '400px'
                  }}
                >
                  {/* Day Header */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className={`text-sm font-medium ${
                        isTodayDate ? "text-blue-700 dark:text-blue-300" : "text-neutral-600 dark:text-neutral-400"
                      }`}>
                        {dayNames[index]}
                      </div>
                      <div className={`text-lg font-bold ${
                        isTodayDate ? "text-blue-900 dark:text-blue-100" : "text-neutral-900 dark:text-neutral-100"
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>
                    {dayNotes.length > 0 && (
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isOverdueDate && !isTodayDate 
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                          : "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                      }`}>
                        {dayNotes.length} {dayNotes.length === 1 ? t('note') : t('notes')}
                      </div>
                    )}
                  </div>

                  {/* Notes List */}
                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayNotes.map(note => {
                      const folder = note.filePath.split('/').slice(0, -1).join('/') || t('root');
                      return (
                        <div
                          key={note.id}
                          onClick={() => openNote(note)}
                          className={`p-2 rounded cursor-pointer hover:bg-opacity-80 transition-colors ${getFolderColor(note.filePath)}`}
                        >
                          <div className="text-sm font-medium truncate" title={note.title}>
                            {note.title}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs opacity-75">
                              {folder}
                            </div>
                            <div className="text-xs opacity-75">
                              {t('streak')}: {note.streakCount}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {dayNotes.length === 0 && (
                      <div className="text-sm text-neutral-400 dark:text-neutral-600 text-center py-4">
                        {t('no_reviews_scheduled')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};