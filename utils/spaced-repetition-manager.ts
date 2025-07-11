import { App, TFile, Notice, Plugin } from 'obsidian';
import { ReviewNote, ReviewDifficulty, PluginSettings, SpacedRepetitionData, ReviewNoteData } from '../types';

export class SpacedRepetitionManager {
    private app: App;
    private settings: PluginSettings;
    private data: SpacedRepetitionData;
    private plugin: Plugin;
    private eventTarget: EventTarget;

    constructor(app: App, settings: PluginSettings, plugin: Plugin) {
        this.app = app;
        this.settings = settings;
        this.plugin = plugin;
        this.eventTarget = new EventTarget();
        this.data = {
            notes: {},
            version: '1.0.0',
            lastUpdated: new Date().toISOString()
        };
        this.loadData();
    }

    // Event handling methods
    on(event: string, callback: EventListener) {
        this.eventTarget.addEventListener(event, callback);
    }

    off(event: string, callback: EventListener) {
        this.eventTarget.removeEventListener(event, callback);
    }

    private emit(event: string, data?: any) {
        const customEvent = new CustomEvent(event, { detail: data });
        this.eventTarget.dispatchEvent(customEvent);
    }

    private async loadData() {
        try {
            // Use Obsidian's built-in data persistence
            const savedData = await this.plugin.loadData();
            if (savedData && savedData.spacedRepetitionData) {
                this.data = savedData.spacedRepetitionData;
            } else {
                // Migrate from old file-based system if it exists
                await this.migrateFromFileSystem();
                // Also migrate from frontmatter if necessary
                await this.migrateFromFrontmatter();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données de répétition espacée:', error);
            // Initialize with default data
            this.data = {
                notes: {},
                version: '1.0.0',
                lastUpdated: new Date().toISOString()
            };
        }
    }

    private async migrateFromFileSystem() {
        try {
            // Try to load from old file-based system
            const dataFile = this.app.vault.getAbstractFileByPath(this.settings.dataFilePath) as TFile;
            if (dataFile) {
                const content = await this.app.vault.read(dataFile);
                const oldData = JSON.parse(content);
                if (oldData && oldData.notes) {
                    this.data = oldData;
                    // Save using new system
                    await this.saveData();
                    console.log('Migrated data from old file-based system');
                }
            }
        } catch (error) {
            console.error('Error migrating from file system:', error);
        }
    }

    private async migrateFromFrontmatter() {
        const files = this.app.vault.getMarkdownFiles();
        let migrated = false;
        
        for (const file of files) {
            const metadata = this.app.metadataCache.getFileCache(file);
            if (metadata?.frontmatter?.['spaced-repetition']) {
                const reviewData = metadata.frontmatter['spaced-repetition'];
                
                // Ajouter aux données si pas déjà présent
                if (!this.data.notes[file.path]) {
                    this.data.notes[file.path] = {
                        filePath: file.path,
                        dateAdded: reviewData.dateAdded || new Date().toISOString(),
                        lastReviewed: reviewData.lastReviewed || new Date().toISOString(),
                        nextReview: reviewData.nextReview || new Date().toISOString(),
                        interval: reviewData.interval || 1,
                        difficulty: reviewData.difficulty || 3,
                        reviewCount: reviewData.reviewCount || 0,
                        streakCount: reviewData.streakCount || 0
                    };
                    migrated = true;
                }
                
                // Optionnel: Supprimer le frontmatter après migration
                // await this.removeFrontmatterData(file);
            }
        }
        
        if (migrated) {
            await this.saveData();
        }
    }

    private async saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            
            // Use Obsidian's built-in data persistence
            const currentData = await this.plugin.loadData() || {};
            currentData.spacedRepetitionData = this.data;
            await this.plugin.saveData(currentData);
            
            // Emit data changed event
            this.emit('dataChanged');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données:', error);
        }
    }

    async getAllNotes(): Promise<ReviewNote[]> {
        const notes: ReviewNote[] = [];
        
        for (const [filePath, noteData] of Object.entries(this.data.notes)) {
            // Vérifier si le fichier existe encore
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (file instanceof TFile) {
                const note: ReviewNote = {
                    id: filePath,
                    title: file.basename,
                    filePath: filePath,
                    dateAdded: new Date(noteData.dateAdded),
                    lastReviewed: new Date(noteData.lastReviewed),
                    nextReview: new Date(noteData.nextReview),
                    interval: noteData.interval,
                    difficulty: noteData.difficulty,
                    reviewCount: noteData.reviewCount,
                    streakCount: noteData.streakCount
                };
                notes.push(note);
            } else {
                // Supprimer les notes dont les fichiers n'existent plus
                delete this.data.notes[filePath];
            }
        }
        
        // Sauvegarder si des notes ont été supprimées
        if (Object.keys(this.data.notes).length !== notes.length) {
            await this.saveData();
        }
        
        return notes;
    }

    async getNotesToReview(): Promise<ReviewNote[]> {
        const allNotes = await this.getAllNotes();
        const now = new Date();
        return allNotes
            .filter(note => new Date(note.nextReview) <= now)
            .slice(0, this.settings.maxNotesPerDay);
    }

    async addNoteToReview(file: TFile, initialInterval: number): Promise<void> {
        const now = new Date();
        const nextReview = new Date(now.getTime() + initialInterval * 24 * 60 * 60 * 1000);
        
        this.data.notes[file.path] = {
            filePath: file.path,
            dateAdded: now.toISOString(),
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
            interval: initialInterval,
            difficulty: 3,
            reviewCount: 0,
            streakCount: 0
        };

        await this.saveData();
    }

    async reviewNote(noteId: string, difficulty: ReviewDifficulty | 'postpone'): Promise<void> {
        const noteData = this.data.notes[noteId];
        if (!noteData) return;

        const file = this.app.vault.getAbstractFileByPath(noteId);
        if (!(file instanceof TFile)) return;

        const now = new Date();
        let newInterval = noteData.interval;
        let newDifficulty = noteData.difficulty;
        let newStreak = noteData.streakCount;

        if (difficulty === 'postpone') {
            // Postpone to tomorrow
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            noteData.nextReview = tomorrow.toISOString();
        } else {
            // Calculate new interval based on difficulty
            if (difficulty === 'again') {
                newInterval = 1;
                newDifficulty = Math.min(5, noteData.difficulty + 1) as 1 | 2 | 3 | 4 | 5;
                newStreak = 0;
            } else if (difficulty === 'hard') {
                newInterval = Math.max(1, Math.round(noteData.interval * 0.8));
                newStreak++;
            } else if (difficulty === 'good') {
                // Ensure progression: minimum 2 days for good reviews
                newInterval = Math.max(noteData.interval + 1, Math.round(noteData.interval * 1.5));
                newStreak++;
            } else if (difficulty === 'easy') {
                // Easy gets a bigger boost
                newInterval = Math.max(noteData.interval + 2, Math.round(noteData.interval * 2.0));
                newDifficulty = Math.max(1, noteData.difficulty - 1) as 1 | 2 | 3 | 4 | 5;
                newStreak++;
            }

            const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
            noteData.nextReview = nextReview.toISOString();
            noteData.lastReviewed = now.toISOString();
            noteData.interval = newInterval;
            noteData.difficulty = newDifficulty;
            noteData.reviewCount++;
            noteData.streakCount = newStreak;
        }

        await this.saveData();
    }

    async removeNoteFromReview(noteId: string): Promise<void> {
        // Supprimer des données
        delete this.data.notes[noteId];
        await this.saveData();
    }

    // Méthode utilitaire pour nettoyer les anciens frontmatters (optionnel)
    async cleanupFrontmatter(file: TFile): Promise<void> {
        try {
            const content = await this.app.vault.read(file);
            const yaml = require('js-yaml');
            
            // Parse existing frontmatter
            const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
            const match = content.match(frontmatterRegex);
            
            if (match) {
                const existingFrontmatter = yaml.load(match[1]) || {};
                const bodyContent = content.substring(match[0].length);
                
                // Supprimer les données de répétition espacée
                delete existingFrontmatter['spaced-repetition'];
                
                // Recréer le contenu
                let newContent = bodyContent;
                if (Object.keys(existingFrontmatter).length > 0) {
                    newContent = `---\n${yaml.dump(existingFrontmatter)}---${bodyContent}`;
                }
                
                await this.app.vault.modify(file, newContent);
            }
        } catch (error) {
            console.error('Erreur lors du nettoyage du frontmatter:', error);
        }
    }

    // Méthode pour obtenir les statistiques
    getStats() {
        const notes = Object.values(this.data.notes);
        const now = new Date();
        
        return {
            total: notes.length,
            overdue: notes.filter(n => new Date(n.nextReview) <= now).length,
            today: notes.filter(n => {
                const reviewDate = new Date(n.nextReview);
                return reviewDate.toDateString() === now.toDateString();
            }).length,
            avgDifficulty: notes.length > 0 
                ? notes.reduce((sum, n) => sum + n.difficulty, 0) / notes.length 
                : 0
        };
    }

    // Méthode pour exporter les données
    async exportData(): Promise<string> {
        return JSON.stringify(this.data, null, 2);
    }

    // Méthode pour importer les données
    async importData(jsonData: string): Promise<void> {
        try {
            const importedData: SpacedRepetitionData = JSON.parse(jsonData);
            
            // Valider la structure des données
            if (importedData.notes && typeof importedData.notes === 'object') {
                this.data = {
                    ...importedData,
                    lastUpdated: new Date().toISOString()
                };
                await this.saveData();
                new Notice('Données importées avec succès !');
            } else {
                throw new Error('Format de données invalide');
            }
        } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            new Notice('Erreur lors de l\'importation des données');
            throw error;
        }
    }

    // Méthode pour forcer la migration depuis les frontmatters
    async migrateAllFromFrontmatter(): Promise<void> {
        await this.migrateFromFrontmatter();
        new Notice('Migration terminée !');
    }
}