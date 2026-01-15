import React, { useContext, useMemo } from "react";
import { AlertTriangle, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { ReviewNote } from "../types";
import { ReviewContext } from "../context/review-context";
import { t } from "../utils/i18n";

interface ActivityHeatmapProps {
  notes: ReviewNote[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ notes }) => {
  const { openNote } = useContext(ReviewContext);
  // Generate last 12 weeks of data
  const heatmapData = useMemo(() => {
    const weeks: { date: Date; count: number; level: number }[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count reviews by date
    const reviewCounts: Record<string, number> = {};
    notes.forEach((note) => {
      const reviewDate = new Date(note.lastReviewed);
      const dateStr = reviewDate.toDateString();
      reviewCounts[dateStr] = (reviewCounts[dateStr] || 0) + 1;
    });

    // Find max count for scaling
    const maxCount = Math.max(1, ...Object.values(reviewCounts));

    // Generate 12 weeks of data
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83); // 12 weeks ago
    // Align to start of week (Sunday)
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let week = 0; week < 12; week++) {
      const weekData: { date: Date; count: number; level: number }[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        const count = reviewCounts[date.toDateString()] || 0;
        const level =
          count === 0
            ? 0
            : count <= maxCount * 0.25
            ? 1
            : count <= maxCount * 0.5
            ? 2
            : count <= maxCount * 0.75
            ? 3
            : 4;
        weekData.push({ date, count, level });
      }
      weeks.push(weekData);
    }

    return weeks;
  }, [notes]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalReviews = 0;
    let last30DaysReviews = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    // Calculate total reviews
    notes.forEach((note) => {
      totalReviews += note.reviewCount;
      const reviewDate = new Date(note.lastReviewed);
      if (reviewDate >= thirtyDaysAgo) {
        last30DaysReviews += 1;
      }
    });

    // Calculate streaks based on review dates
    const reviewDates = new Set<string>();
    notes.forEach((note) => {
      const date = new Date(note.lastReviewed);
      reviewDates.add(date.toDateString());
    });

    // Sort dates and calculate streaks
    const sortedDates = Array.from(reviewDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if today or yesterday has reviews
      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();

      if (
        reviewDates.has(todayStr) ||
        reviewDates.has(yesterdayStr)
      ) {
        let streakDate = reviewDates.has(todayStr) ? today : yesterday;
        currentStreak = 0;

        while (reviewDates.has(streakDate.toDateString())) {
          currentStreak++;
          streakDate = new Date(streakDate);
          streakDate.setDate(streakDate.getDate() - 1);
        }
      }

      // Calculate longest streak
      let streak = 0;
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          streak = 1;
        } else {
          const prevDate = new Date(sortedDates[i - 1]);
          prevDate.setDate(prevDate.getDate() - 1);
          if (sortedDates[i].toDateString() === prevDate.toDateString()) {
            streak++;
          } else {
            longestStreak = Math.max(longestStreak, streak);
            streak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, streak);
    }

    return { totalReviews, last30DaysReviews, currentStreak, longestStreak };
  }, [notes]);

  // Success rate estimation based on streak and difficulty
  const successRate = useMemo(() => {
    if (notes.length === 0) return 0;

    let successScore = 0;
    notes.forEach((note) => {
      // Higher streak and lower difficulty = higher success
      const streakBonus = Math.min(note.streakCount / 5, 1); // max 1
      const difficultyBonus = (6 - note.difficulty) / 5; // difficulty 1 = 1, difficulty 5 = 0.2
      successScore += (streakBonus * 0.6 + difficultyBonus * 0.4);
    });

    return Math.round((successScore / notes.length) * 100);
  }, [notes]);

  // Notes at risk (high difficulty or broken streak)
  const atRiskNotes = useMemo(() => {
    return notes
      .filter((note) => note.difficulty >= 4 || (note.streakCount === 0 && note.reviewCount > 0))
      .sort((a, b) => b.difficulty - a.difficulty)
      .slice(0, 5);
  }, [notes]);

  // 7-day forecast
  const forecast = useMemo(() => {
    const days: { date: Date; count: number; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();

      const count = notes.filter((note) => {
        const reviewDate = new Date(note.nextReview);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.toDateString() === dateStr;
      }).length;

      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      days.push({
        date,
        count,
        label: i === 0 ? "Auj" : i === 1 ? "Dem" : dayNames[date.getDay()],
      });
    }

    return days;
  }, [notes]);

  // Maturity distribution
  const maturityDistribution = useMemo(() => {
    let newNotes = 0; // interval <= 3
    let learning = 0; // interval 4-14
    let mature = 0; // interval > 14

    notes.forEach((note) => {
      if (note.interval <= 3) newNotes++;
      else if (note.interval <= 14) learning++;
      else mature++;
    });

    const total = notes.length || 1;
    return {
      new: { count: newNotes, percent: Math.round((newNotes / total) * 100) },
      learning: { count: learning, percent: Math.round((learning / total) * 100) },
      mature: { count: mature, percent: Math.round((mature / total) * 100) },
    };
  }, [notes]);

  const getLevelColor = (level: number) => {
    const colors = [
      "bg-neutral-100 dark:bg-neutral-800", // 0 - no activity
      "bg-green-200 dark:bg-green-900", // 1 - low
      "bg-green-400 dark:bg-green-700", // 2 - medium
      "bg-green-500 dark:bg-green-600", // 3 - high
      "bg-green-600 dark:bg-green-500", // 4 - very high
    ];
    return colors[level] || colors[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  return (
    <div className="space-y-4">
      {/* Stats Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Activity & Heatmap Box */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {t("review_activity") || "Activité"}
            </h4>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.totalReviews}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("total_reviews") || "Total"}
              </div>
            </div>
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.last30DaysReviews}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("last_30_days") || "30 jours"}
              </div>
            </div>
            <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {stats.currentStreak}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("current_streak") || "Série"}
              </div>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {stats.longestStreak}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("longest_streak") || "Record"}
              </div>
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="overflow-x-auto py-2">
            <div className="flex gap-1 justify-center">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      style={{ width: '12px', height: '12px' }}
                      className={`rounded-sm cursor-pointer hover:scale-110 transition-transform ${
                        isFuture(day.date)
                          ? "bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700"
                          : getLevelColor(day.level)
                      } ${
                        isToday(day.date)
                          ? "ring-2 ring-blue-500 ring-offset-1"
                          : ""
                      }`}
                      title={`${day.date.toLocaleDateString()}: ${day.count} ${
                        day.count === 1 ? "review" : "reviews"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{t("less") || "-"}</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                style={{ width: '10px', height: '10px' }}
                className={`rounded-sm ${getLevelColor(level)}`}
              />
            ))}
            <span>{t("more") || "+"}</span>
          </div>
        </div>

        {/* Success Rate + Maturity Distribution */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Performance
            </h4>
          </div>

          {/* Success Rate Circle */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-neutral-200 dark:text-neutral-700"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${successRate * 1.76} 176`}
                  className={successRate >= 70 ? "text-green-500" : successRate >= 40 ? "text-yellow-500" : "text-red-500"}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {successRate}%
                </span>
              </div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Taux de réussite
            </div>
          </div>

          {/* Maturity Distribution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">Nouvelles (≤3j)</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{maturityDistribution.new.count}</span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 dark:bg-red-500 rounded-full transition-all"
                style={{ width: `${maturityDistribution.new.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">En cours (4-14j)</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{maturityDistribution.learning.count}</span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 dark:bg-yellow-500 rounded-full transition-all"
                style={{ width: `${maturityDistribution.learning.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">Matures (&gt;14j)</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{maturityDistribution.mature.count}</span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 dark:bg-green-500 rounded-full transition-all"
                style={{ width: `${maturityDistribution.mature.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Prévision 7 jours
            </h4>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-1 h-24 mb-2">
            {forecast.map((day, index) => {
              const maxCount = Math.max(...forecast.map((d) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t transition-all ${
                      index === 0
                        ? "bg-blue-500"
                        : "bg-blue-300 dark:bg-blue-700"
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.count} reviews`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
            {forecast.map((day, index) => (
              <div key={index} className="flex-1 text-center">
                <div>{day.label}</div>
                <div className="font-medium text-neutral-700 dark:text-neutral-300">{day.count}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* At-Risk Notes */}
      {atRiskNotes.length > 0 && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
              Notes à risque ({atRiskNotes.length})
            </h4>
          </div>
          <div className="space-y-2">
            {atRiskNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => openNote(note)}
                className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate flex-1">
                  {note.title}
                </span>
                <div className="flex items-center gap-2 ml-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    note.difficulty >= 4
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}>
                    Diff: {note.difficulty}
                  </span>
                  {note.streakCount === 0 && note.reviewCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      Streak cassé
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
