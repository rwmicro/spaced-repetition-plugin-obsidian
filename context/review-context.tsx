import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ReviewNote, ReviewDifficulty } from '../types';
import { SpacedRepetitionManager } from '../utils/spaced-repetition-manager';

interface ReviewContextType {
    notes: ReviewNote[];
    updateNote: (noteId: string, difficulty: ReviewDifficulty | 'postpone') => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    refreshNotes: () => Promise<void>;
    openNote: (note: ReviewNote) => Promise<void>;
}

export const ReviewContext = createContext<ReviewContextType>({
    notes: [],
    updateNote: async () => {},
    deleteNote: async () => {},
    refreshNotes: async () => {},
    openNote: async () => {}
});

interface ReviewStateProviderProps {
    children: ReactNode;
    manager: SpacedRepetitionManager;
    onOpenNote: (note: ReviewNote) => Promise<void>;
}

export const ReviewStateProvider: React.FC<ReviewStateProviderProps> = ({ children, manager, onOpenNote }) => {
    const [notes, setNotes] = useState<ReviewNote[]>([]);

    const refreshNotes = async () => {
        const allNotes = await manager.getAllNotes();
        setNotes(allNotes);
    };

    useEffect(() => {
        refreshNotes();
        
        // Listen for data changes from the manager
        const handleDataChange = () => {
            refreshNotes();
        };
        
        manager.on('dataChanged', handleDataChange);
        
        // Cleanup
        return () => {
            manager.off('dataChanged', handleDataChange);
        };
    }, [manager]);

    const updateNote = async (noteId: string, difficulty: ReviewDifficulty | 'postpone') => {
        await manager.reviewNote(noteId, difficulty);
        // No need to call refreshNotes here as it will be triggered by the 'dataChanged' event
    };

    const deleteNote = async (noteId: string) => {
        await manager.removeNoteFromReview(noteId);
        // No need to call refreshNotes here as it will be triggered by the 'dataChanged' event
    };

    const openNote = async (note: ReviewNote) => {
        await onOpenNote(note);
    };

    return (
        <ReviewContext.Provider value={{ notes, updateNote, deleteNote, refreshNotes, openNote }}>
            {children}
        </ReviewContext.Provider>
    );
};  