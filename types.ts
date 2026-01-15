export interface ReviewNote {
    id: string;
    title: string;
    filePath: string;
    dateAdded: Date;
    lastReviewed: Date;
    nextReview: Date;
    interval: number;
    difficulty: 1 | 2 | 3 | 4 | 5;
    reviewCount: number;
    streakCount: number;
}

export interface ReviewNoteData {
    filePath: string;
    dateAdded: string;
    lastReviewed: string;
    nextReview: string;
    interval: number;
    difficulty: 1 | 2 | 3 | 4 | 5;
    reviewCount: number;
    streakCount: number;
}

export interface SpacedRepetitionData {
    notes: Record<string, ReviewNoteData>;
    version: string;
    lastUpdated: string;
}

export interface PluginSettings {
    notificationEnabled: boolean;
    defaultInterval: number;
    maxNotesPerDay: number;
    reviewHotkey: string;
}

export type ReviewDifficulty = 'again' | 'hard' | 'good' | 'easy';