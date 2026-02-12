import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Snippet {
    id: string;
    content: string;
    coachName: string;
    date: number; // timestamp
    tags?: string[];
}

const STORAGE_KEY = '@aura_snippets';
const CHATS_KEY = '@aura_chats';
const SCHEDULE_KEY = '@aura_schedule';
const QUOTES_KEY = '@aura_quotes';

export interface ChatSession {
    id: string;
    coachId: string;
    title: string;
    messages: any[];
    lastModified: number;
    preview: string;
}

export interface TimeBlock {
    id: string;
    time: string; // e.g. "09:00 - 10:00"
    activity: string;
    category?: string; // 'Work', 'Health', 'Study', 'Meal', 'Routine', 'Leisure'
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    description?: string;
    isAiGenerated?: boolean;
    isCompleted?: boolean; // Legacy/Compat check
}

export interface LifestyleLog {
    date: string; // YYYY-MM-DD
    skinCare: {
        morning: boolean;
        night: boolean;
    };
    nutrition: {
        waterLiters: number;
        calories?: number;
    };
    hairCare: {
        washDay: boolean;
    };
}

export interface Quote {
    id: string;
    text: string;
    author: string;
    isCustom: boolean;
}

export const StorageService = {
    // --- Snippets ---
    async saveSnippet(snippet: Omit<Snippet, 'id' | 'date'>): Promise<Snippet> {
        const newSnippet: Snippet = {
            ...snippet,
            id: Date.now().toString(),
            date: Date.now(),
        };

        const existing = await this.getSnippets();
        const updated = [newSnippet, ...existing];

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newSnippet;
    },

    async getSnippets(): Promise<Snippet[]> {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Failed to load snippets', e);
            return [];
        }
    },

    async deleteSnippet(id: string): Promise<void> {
        const existing = await this.getSnippets();
        const updated = existing.filter(s => s.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    // --- Chat Sessions ---
    async saveChat(session: ChatSession): Promise<void> {
        const chats = await this.getChats();
        const existingIndex = chats.findIndex(c => c.id === session.id);

        let updatedChats;
        if (existingIndex >= 0) {
            updatedChats = [...chats];
            updatedChats[existingIndex] = session;
        } else {
            updatedChats = [session, ...chats];
        }

        // Sort by recency
        updatedChats.sort((a, b) => b.lastModified - a.lastModified);

        await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(updatedChats));
    },

    async getChats(): Promise<ChatSession[]> {
        try {
            const json = await AsyncStorage.getItem(CHATS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Failed to load chats', e);
            return [];
        }
    },

    async getChat(id: string): Promise<ChatSession | undefined> {
        const chats = await this.getChats();
        return chats.find(c => c.id === id);
    },

    async deleteChat(id: string): Promise<void> {
        const chats = await this.getChats();
        const updated = chats.filter(c => c.id !== id);
        await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(updated));
    },

    // --- Schedule ---
    async getSchedule(date?: string): Promise<TimeBlock[]> {
        try {
            if (date) {
                const key = `${SCHEDULE_KEY}_${date}`;
                const json = await AsyncStorage.getItem(key);
                return json ? JSON.parse(json) : [];
            } else {
                const json = await AsyncStorage.getItem(SCHEDULE_KEY);
                return json ? JSON.parse(json) : [];
            }
        } catch (e) {
            return [];
        }
    },

    async saveSchedule(schedule: TimeBlock[], date?: string): Promise<void> {
        if (date) {
            const key = `${SCHEDULE_KEY}_${date}`;
            await AsyncStorage.setItem(key, JSON.stringify(schedule));
        } else {
            await AsyncStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
        }
    },

    // --- Lifestyle ---
    async getLifestyle(date: string): Promise<LifestyleLog | null> {
        try {
            const key = `@aura_lifestyle_${date}`;
            const json = await AsyncStorage.getItem(key);
            return json ? JSON.parse(json) : null;
        } catch (e) {
            return null;
        }
    },

    async saveLifestyle(log: LifestyleLog): Promise<void> {
        const key = `@aura_lifestyle_${log.date}`;
        await AsyncStorage.setItem(key, JSON.stringify(log));
    },

    /**
     * Helper to get stats for the last 7 days including today.
     * Returns an array of completion percentages and study hours.
     */
    async getWeeklyStats(): Promise<{ date: string, completion: number, studyHours: number, dayName: string }[]> {
        const stats = [];
        const today = new Date();

        // Go back 6 days + today = 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

            // Get Schedule
            const blocks = await this.getSchedule(dateStr);
            const totalTasks = blocks.length;
            const completedTasks = blocks.filter(b => b.status === 'completed').length;
            const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // Calculate Study Hours
            let hours = 0;
            blocks.forEach(b => {
                const isStudy = b.category?.toLowerCase().includes('study') || b.category?.toLowerCase().includes('deep work');
                if (isStudy && b.status === 'completed') {
                    // Parse time "09:00 - 10:00"
                    const parts = b.time.split('-');
                    if (parts.length === 2) {
                        const start = parts[0].trim(); // "09:00"
                        const end = parts[1].trim();   // "10:00"

                        const startH = parseInt(start.split(':')[0]);
                        const endH = parseInt(end.split(':')[0]);

                        if (!isNaN(startH) && !isNaN(endH)) {
                            let diff = endH - startH;
                            if (diff < 0) diff += 24;
                            hours += diff;
                        }
                    }
                }
            });

            stats.push({
                date: dateStr,
                dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
                completion,
                studyHours: hours
            });
        }
        return stats;
    },

    // --- Quotes ---
    async getQuotes(): Promise<Quote[]> {
        try {
            const json = await AsyncStorage.getItem(QUOTES_KEY);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            return [];
        }
    },

    async saveQuote(text: string, author: string = 'Me'): Promise<Quote> {
        const newQuote: Quote = {
            id: Date.now().toString(),
            text,
            author,
            isCustom: true
        };
        const existing = await this.getQuotes();
        const updated = [newQuote, ...existing];
        await AsyncStorage.setItem(QUOTES_KEY, JSON.stringify(updated));
        return newQuote;
    },

    async deleteQuote(id: string): Promise<void> {
        const existing = await this.getQuotes();
        const updated = existing.filter(q => q.id !== id);
        await AsyncStorage.setItem(QUOTES_KEY, JSON.stringify(updated));
    },

    async updateQuote(id: string, newText: string): Promise<Quote | null> {
        const existing = await this.getQuotes();
        const index = existing.findIndex(q => q.id === id);
        if (index === -1) return null;

        const updatedQuote = { ...existing[index], text: newText };
        existing[index] = updatedQuote;

        await AsyncStorage.setItem(QUOTES_KEY, JSON.stringify(existing));
        return updatedQuote;
    }
};

// Backwards compatibility alias
export const SnippetService = StorageService;
