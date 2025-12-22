// Application state management
import { Profile, Achievement, ContentItem, ValidationUtils } from '../models/dataModels.js';

export class AppState {
    constructor() {
        this.profile = null;
        this.achievements = [];
        this.content = [];
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.filteredContent = [];
        this.listeners = new Map();

        // Load persisted state on initialization
        this.loadPersistedState();
    }

    // Profile methods
    setProfile(profileData) {
        if (!profileData) {
            this.profile = null;
            this.notifyListeners('profile', null);
            return;
        }

        const profile = new Profile(profileData);
        const validation = profile.validate();

        if (!validation.isValid) {
            console.warn('Invalid profile data:', validation.errors);
            throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
        }

        this.profile = profile;
        this.notifyListeners('profile', this.profile);
        this.persistState();
    }

    getProfile() {
        return this.profile;
    }

    // Achievements methods
    setAchievements(achievementsData) {
        if (!achievementsData || !Array.isArray(achievementsData)) {
            this.achievements = [];
            this.notifyListeners('achievements', this.achievements);
            return;
        }

        const validation = ValidationUtils.validateAchievements(achievementsData);

        if (!validation.isValid) {
            console.warn('Invalid achievements data:', validation.errors);
            throw new Error(`Achievements validation failed: ${validation.errors.join(', ')}`);
        }

        this.achievements = achievementsData.map(data => new Achievement(data));
        this.notifyListeners('achievements', this.achievements);
        this.persistState();
    }

    getAchievements() {
        return this.achievements;
    }

    // Content methods
    setContent(contentData) {
        if (!contentData || !Array.isArray(contentData)) {
            this.content = [];
            this.updateFilteredContent();
            return;
        }

        const validation = ValidationUtils.validateContentItems(contentData);

        if (!validation.isValid) {
            console.warn('Invalid content data:', validation.errors);
            throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
        }

        this.content = contentData.map(data => new ContentItem(data));
        this.updateFilteredContent();
        this.notifyListeners('content', this.content);
        this.persistState();
    }

    getContent() {
        return this.content;
    }

    // Filter methods
    setCurrentFilter(filter) {
        const validFilters = ['all', 'talk', 'blog', 'whitepaper', 'article'];

        if (!validFilters.includes(filter)) {
            console.warn(`Invalid filter: ${filter}. Using 'all' instead.`);
            filter = 'all';
        }

        this.currentFilter = filter;
        this.currentPage = 1; // Reset to first page when filter changes
        this.updateFilteredContent();
        this.notifyListeners('filter', this.currentFilter);
        this.persistState();
    }

    getCurrentFilter() {
        return this.currentFilter;
    }

    // Pagination methods
    setCurrentPage(page) {
        const totalPages = this.getTotalPages();
        const newPage = Math.max(1, Math.min(page, totalPages || 1));

        if (this.currentPage !== newPage) {
            this.currentPage = newPage;
            this.notifyListeners('pagination', {
                currentPage: this.currentPage,
                totalPages: totalPages
            });
            this.persistState();
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getItemsPerPage() {
        return this.itemsPerPage;
    }

    // Get paginated content for current page
    getPaginatedContent() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredContent.slice(startIndex, endIndex);
    }

    // Filtered content methods
    getFilteredContent() {
        return this.filteredContent;
    }

    updateFilteredContent() {
        // Clear any cached data first to ensure fresh computation
        sessionStorage.removeItem('portfolioFilterCache');

        // Compute filtered content
        if (this.currentFilter === 'all') {
            this.filteredContent = [...this.content];
        } else {
            this.filteredContent = this.content.filter(item =>
                item.type === this.currentFilter
            );
        }

        // Sort by publication date (newest first) - optimized sorting
        this.filteredContent.sort((a, b) => {
            // Cache date objects to avoid repeated parsing
            if (!a._cachedDate) {
                a._cachedDate = a.publicationDate instanceof Date ? a.publicationDate : new Date(a.publicationDate || 0);
            }
            if (!b._cachedDate) {
                b._cachedDate = b.publicationDate instanceof Date ? b.publicationDate : new Date(b.publicationDate || 0);
            }
            return b._cachedDate - a._cachedDate;
        });

        // Reset to first page if current page is beyond available pages
        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = 1;
        }

        // Always notify listeners of the change
        this.notifyListeners('filteredContent', this.filteredContent);

        // Cache the computed data for performance
        this.cacheComputedData();
    }

    getTotalPages() {
        return Math.ceil(this.filteredContent.length / this.itemsPerPage);
    }

    // Event listener management
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // State persistence methods with caching
    persistState() {
        try {
            const stateToSave = {
                currentFilter: this.currentFilter,
                currentPage: this.currentPage,
                timestamp: Date.now()
            };
            localStorage.setItem('portfolioAppState', JSON.stringify(stateToSave));

            // Also cache computed data for performance
            this.cacheComputedData();
        } catch (error) {
            console.warn('Failed to persist state:', error);
        }
    }

    cacheComputedData() {
        try {
            // Cache filtered content to avoid recomputation
            const cacheData = {
                filteredContent: this.filteredContent.map(item => ({
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    publicationDate: item.publicationDate,
                    description: item.description,
                    externalLink: item.externalLink
                })),
                filter: this.currentFilter,
                timestamp: Date.now()
            };

            // Only cache if data is reasonable size
            const cacheString = JSON.stringify(cacheData);
            if (cacheString.length < 50000) { // 50KB limit
                sessionStorage.setItem('portfolioFilterCache', cacheString);
            }
        } catch (error) {
            console.warn('Failed to cache computed data:', error);
        }
    }

    loadCachedData() {
        try {
            const cached = sessionStorage.getItem('portfolioFilterCache');
            if (cached) {
                const cacheData = JSON.parse(cached);

                // Check if cache is still valid (5 minutes)
                if (Date.now() - cacheData.timestamp < 5 * 60 * 1000) {
                    // Check if filter matches
                    if (cacheData.filter === this.currentFilter) {
                        this.filteredContent = cacheData.filteredContent.map(data => new ContentItem(data));
                        return true;
                    }
                } else {
                    // Remove expired cache
                    sessionStorage.removeItem('portfolioFilterCache');
                }
            }
        } catch (error) {
            console.warn('Failed to load cached data:', error);
        }
        return false;
    }

    loadPersistedState() {
        try {
            const savedState = localStorage.getItem('portfolioAppState');
            if (savedState) {
                const state = JSON.parse(savedState);

                // Only restore preferences, not data
                if (state.currentFilter) {
                    this.currentFilter = state.currentFilter;
                }
                if (state.currentPage) {
                    this.currentPage = state.currentPage;
                }
            }
        } catch (error) {
            console.warn('Failed to load persisted state:', error);
        }
    }

    clearPersistedState() {
        try {
            localStorage.removeItem('portfolioAppState');
        } catch (error) {
            console.warn('Failed to clear persisted state:', error);
        }
    }

    // Utility methods
    reset() {
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.updateFilteredContent();
        this.notifyListeners('reset', null);
        this.persistState();
    }

    // Get state snapshot for debugging
    getStateSnapshot() {
        return {
            profile: this.profile,
            achievements: this.achievements,
            content: this.content,
            currentFilter: this.currentFilter,
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            filteredContentCount: this.filteredContent.length,
            totalPages: this.getTotalPages(),
            paginatedContent: this.getPaginatedContent()
        };
    }
}
