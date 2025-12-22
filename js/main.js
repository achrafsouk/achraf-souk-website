// Main application entry point
import { HeroComponent } from './components/hero.js';
import { AchievementsComponent } from './components/achievements.js';
import { ContentComponent } from './components/content.js';
import { AppState } from './state/appState.js';
import { sampleData } from './data/sampleData.js';
import { PerformanceMonitor, BundleOptimizer } from './utils/performance.js';

class PortfolioApp {
    constructor() {
        this.state = new AppState();
        this.components = {};
        this.isInitialized = false;
        this.performanceMonitor = new PerformanceMonitor();
        this.init();
    }

    async init() {
        try {
            // Start performance monitoring
            const initStart = performance.now();

            // Set up resource hints for better performance
            this.performanceMonitor.setupResourceHints();
            BundleOptimizer.preloadCriticalModules();

            // Validate DOM elements are available
            this.validateRequiredElements();

            // Initialize components first (before setting state)
            await this.initializeComponents();

            // Initialize application state with sample data
            this.state.setProfile(sampleData.profile);
            this.state.setAchievements(sampleData.achievements);
            this.state.setContent(sampleData.content);

            // Render all components after state is set
            await this.render();
            
            // Ensure content component renders with initial "all" filter
            if (this.components.content) {
                await this.components.content.render();
            }

            // Set up event listeners
            this.setupEventListeners();

            // Set up cross-component communication
            this.setupComponentIntegration();

            // Mark as initialized
            this.isInitialized = true;

            // Record initialization time
            const initTime = performance.now() - initStart;
            this.performanceMonitor.recordMetric('AppInitialization', initTime);

            console.log(`Portfolio app initialized successfully in ${initTime.toFixed(2)}ms`);
            
            // Announce to screen readers that the page is ready
            this.announcePageReady();

            // Clean up any unused resources
            this.scheduleCleanup();
        } catch (error) {
            console.error('Error initializing portfolio app:', error);
            this.handleInitializationError(error);
        }
    }

    scheduleCleanup() {
        // Schedule cleanup of unused resources after 30 seconds
        setTimeout(() => {
            this.performCleanup();
        }, 30000);
    }

    performCleanup() {
        // Clean up any cached data that's no longer needed
        try {
            // Clear old image cache entries
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('img_cache_')) {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const data = JSON.parse(cached);
                        // Remove cache older than 24 hours
                        if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            });

            // Clear old session cache
            const sessionKeys = Object.keys(sessionStorage);
            sessionKeys.forEach(key => {
                if (key.includes('Cache')) {
                    const cached = sessionStorage.getItem(key);
                    if (cached) {
                        try {
                            const data = JSON.parse(cached);
                            // Remove cache older than 5 minutes
                            if (Date.now() - data.timestamp > 5 * 60 * 1000) {
                                sessionStorage.removeItem(key);
                            }
                        } catch (e) {
                            // Remove invalid cache entries
                            sessionStorage.removeItem(key);
                        }
                    }
                }
            });
        } catch (error) {
            console.warn('Error during cleanup:', error);
        }
    }

    validateRequiredElements() {
        const requiredElements = [
            'profile-image',
            'profile-fallback', 
            'linkedin-link',
            'achievements-grid',
            'content-grid',
            'pagination-controls'
        ];

        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
        }
    }

    async initializeComponents() {
        try {
            // Initialize all components immediately for proper initial rendering
            this.components.hero = new HeroComponent(this.state);
            this.components.achievements = new AchievementsComponent(this.state);
            this.components.content = new ContentComponent(this.state);
            
            // Verify components initialized correctly
            Object.entries(this.components).forEach(([name, component]) => {
                if (!component) {
                    throw new Error(`Failed to initialize ${name} component`);
                }
            });
        } catch (error) {
            throw new Error(`Component initialization failed: ${error.message}`);
        }
    }

    setupComponentIntegration() {
        // Set up state change listeners for cross-component updates
        this.state.addEventListener('filter', () => {
            // When filter changes, ensure pagination is updated
            this.updateComponentStates();
        });

        this.state.addEventListener('pagination', () => {
            // When pagination changes, update URL if needed (for bookmarking)
            this.updateUrlState();
        });

        // Set up intersection observer for smooth scrolling enhancements
        this.setupScrollObserver();
    }

    updateComponentStates() {
        // Ensure all components are in sync with state changes
        Object.values(this.components).forEach(component => {
            if (component.updateFromState) {
                component.updateFromState();
            }
        });
    }

    updateUrlState() {
        // Update URL parameters for bookmarking (without page reload)
        const currentFilter = this.state.getCurrentFilter();
        const currentPage = this.state.getCurrentPage();
        
        const url = new URL(window.location);
        
        if (currentFilter !== 'all') {
            url.searchParams.set('filter', currentFilter);
        } else {
            url.searchParams.delete('filter');
        }
        
        if (currentPage > 1) {
            url.searchParams.set('page', currentPage.toString());
        } else {
            url.searchParams.delete('page');
        }
        
        // Update URL without triggering page reload
        window.history.replaceState({}, '', url);
    }

    setupScrollObserver() {
        // Set up intersection observer for section visibility
        const sections = document.querySelectorAll('section[id]');
        
        if (sections.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Update active section for navigation
                    this.updateActiveSection(entry.target.id);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    updateActiveSection(sectionId) {
        // Update any navigation indicators if they exist
        const navLinks = document.querySelectorAll(`a[href="#${sectionId}"]`);
        navLinks.forEach(link => {
            // Remove active class from all nav links
            document.querySelectorAll('a[href^="#"]').forEach(l => l.classList.remove('active'));
            // Add active class to current section link
            link.classList.add('active');
        });
    }

    announcePageReady() {
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        announcement.textContent = 'Portfolio page loaded successfully. Navigate using tab key or section headings.';
        document.body.appendChild(announcement);
        
        // Remove announcement after screen readers have processed it
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 3000);
    }

    handleInitializationError(error) {
        // Display user-friendly error message
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.innerHTML = `
            <h2>Unable to load portfolio</h2>
            <p>There was an error loading the portfolio content. Please refresh the page or try again later.</p>
            <details>
                <summary>Technical details</summary>
                <pre>${error.message}</pre>
            </details>
        `;
        
        // Insert error message at the beginning of body
        document.body.insertBefore(errorContainer, document.body.firstChild);
    }

    async render() {
        if (!this.isInitialized && !this.components.hero) {
            console.warn('Cannot render: components not initialized');
            return;
        }

        try {
            // Render components in sequence with error handling
            const renderPromises = [
                this.renderComponent('hero'),
                this.renderComponent('achievements'), 
                this.renderComponent('content')
            ];

            await Promise.all(renderPromises);
            
            // After all components render, set up cross-component interactions
            this.finalizeComponentIntegration();
            
        } catch (error) {
            console.error('Error during component rendering:', error);
            this.handleRenderError(error);
        }
    }

    async renderComponent(componentName) {
        try {
            const component = this.components[componentName];
            if (component && component.render) {
                await component.render();
                console.log(`${componentName} component rendered successfully`);
            } else {
                throw new Error(`Component ${componentName} not found or missing render method`);
            }
        } catch (error) {
            console.error(`Error rendering ${componentName} component:`, error);
            // Continue with other components even if one fails
        }
    }

    finalizeComponentIntegration() {
        // Ensure all interactive elements are properly connected
        this.connectFilteringAndPagination();
        this.setupCrossComponentAccessibility();
        this.initializeUrlStateFromParams();
    }

    connectFilteringAndPagination() {
        // Ensure filtering and pagination work together seamlessly
        const filterButtons = document.querySelectorAll('.filter-btn');
        const paginationContainer = document.getElementById('pagination-controls');
        
        // Add enhanced filter change handling
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Scroll to content section after filter change for better UX
                setTimeout(() => {
                    const contentSection = document.getElementById('content');
                    if (contentSection) {
                        contentSection.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }
                }, 100);
            });
        });
    }

    setupCrossComponentAccessibility() {
        // Add skip links between sections
        this.addSkipLinks();
        
        // Ensure proper heading hierarchy
        this.validateHeadingHierarchy();
        
        // Set up landmark roles if missing
        this.setupLandmarkRoles();
    }

    addSkipLinks() {
        const sections = ['hero', 'achievements', 'content'];
        const skipLinksContainer = document.querySelector('.skip-link')?.parentNode;
        
        if (!skipLinksContainer) return;

        sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (section && index > 0) { // Skip first section as it's already handled
                const skipLink = document.createElement('a');
                skipLink.href = `#${sectionId}`;
                skipLink.className = 'skip-link';
                skipLink.textContent = `Skip to ${sectionId} section`;
                skipLinksContainer.appendChild(skipLink);
            }
        });
    }

    validateHeadingHierarchy() {
        // Ensure proper heading hierarchy for accessibility
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach(heading => {
            const currentLevel = parseInt(heading.tagName.charAt(1));
            if (currentLevel > previousLevel + 1) {
                console.warn(`Heading hierarchy issue: ${heading.tagName} follows h${previousLevel}`);
            }
            previousLevel = currentLevel;
        });
    }

    setupLandmarkRoles() {
        // Ensure proper landmark roles are set
        const hero = document.getElementById('hero');
        const achievements = document.getElementById('achievements');
        const content = document.getElementById('content');
        
        if (hero && !hero.getAttribute('role')) {
            hero.setAttribute('role', 'banner');
        }
        
        if (achievements && !achievements.getAttribute('role')) {
            achievements.setAttribute('role', 'region');
            achievements.setAttribute('aria-labelledby', 'achievements-title');
        }
        
        if (content && !content.getAttribute('role')) {
            content.setAttribute('role', 'main');
        }
    }

    initializeUrlStateFromParams() {
        // Initialize state from URL parameters for bookmarking support
        const urlParams = new URLSearchParams(window.location.search);
        
        const filterParam = urlParams.get('filter');
        if (filterParam && ['talk', 'blog', 'whitepaper', 'article'].includes(filterParam)) {
            this.state.setCurrentFilter(filterParam);
        }
        
        const pageParam = urlParams.get('page');
        if (pageParam) {
            const page = parseInt(pageParam);
            if (page > 0) {
                this.state.setCurrentPage(page);
            }
        }
    }

    handleRenderError(error) {
        // Display partial error message without breaking the entire app
        const errorNotification = document.createElement('div');
        errorNotification.className = 'render-error-notification';
        errorNotification.innerHTML = `
            <p>Some content may not have loaded correctly. <button onclick="location.reload()">Refresh page</button></p>
        `;
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(errorNotification, container.firstChild);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.parentNode.removeChild(errorNotification);
            }
        }, 10000);
    }

    setupEventListeners() {
        // Global event listeners can be added here
        // Component-specific listeners are handled within each component
        
        // Handle smooth scrolling for navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Handle keyboard navigation for smooth scrolling links
            if (e.target.matches('a[href^="#"]') && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                e.target.click();
            }

            // Handle escape key to reset focus
            if (e.key === 'Escape') {
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
            }

            // Handle arrow key navigation for filter buttons
            if (e.target.matches('.filter-btn')) {
                this.handleFilterKeyNavigation(e);
            }

            // Handle arrow key navigation for pagination buttons
            if (e.target.matches('.pagination-btn')) {
                this.handlePaginationKeyNavigation(e);
            }
        });

        // Handle window resize for responsive updates
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });

        // Handle page visibility changes for performance
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Add focus management for better accessibility
        this.setupFocusManagement();
    }

    handleFilterKeyNavigation(e) {
        const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
        const currentIndex = filterButtons.indexOf(e.target);
        let nextIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : filterButtons.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = currentIndex < filterButtons.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                nextIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                nextIndex = filterButtons.length - 1;
                break;
        }

        if (nextIndex !== currentIndex) {
            filterButtons[nextIndex].focus();
        }
    }

    handlePaginationKeyNavigation(e) {
        const paginationButtons = Array.from(document.querySelectorAll('.pagination-btn:not([disabled])'));
        const currentIndex = paginationButtons.indexOf(e.target);
        let nextIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : paginationButtons.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                nextIndex = currentIndex < paginationButtons.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                nextIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                nextIndex = paginationButtons.length - 1;
                break;
        }

        if (nextIndex !== currentIndex) {
            paginationButtons[nextIndex].focus();
        }
    }

    setupFocusManagement() {
        // Announce page changes to screen readers
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.target.id === 'content-grid') {
                    this.announceContentChange();
                }
            });
        });

        const contentGrid = document.getElementById('content-grid');
        if (contentGrid) {
            observer.observe(contentGrid, { childList: true });
        }

        // Focus management for filter changes
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                // Announce filter change to screen readers
                setTimeout(() => {
                    this.announceFilterChange(e.target.textContent);
                }, 100);
            }
        });
    }

    announceContentChange() {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('content-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'content-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            document.body.appendChild(liveRegion);
        }

        const contentCards = document.querySelectorAll('.content-card');
        const count = contentCards.length;
        const message = count === 0 ? 'No content items found' : `${count} content item${count === 1 ? '' : 's'} displayed`;
        
        liveRegion.textContent = message;
    }

    announceFilterChange(filterName) {
        let liveRegion = document.getElementById('filter-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'filter-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.className = 'visually-hidden';
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = `Filter changed to ${filterName}`;
    }

    handleResize() {
        // Trigger component updates on resize if needed
        Object.values(this.components).forEach(component => {
            if (component.handleResize) {
                component.handleResize();
            }
        });
        
        // Update layout calculations if needed
        this.updateLayoutCalculations();
    }

    handlePopState(event) {
        // Handle browser back/forward navigation
        this.initializeUrlStateFromParams();
        
        // Re-render content component to reflect URL state
        if (this.components.content) {
            this.components.content.render();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause any animations or timers
            this.pauseNonEssentialOperations();
        } else {
            // Page is visible - resume operations
            this.resumeOperations();
        }
    }

    updateLayoutCalculations() {
        // Recalculate any layout-dependent values
        const contentGrid = document.getElementById('content-grid');
        if (contentGrid) {
            // Trigger reflow for grid calculations
            contentGrid.style.display = 'none';
            contentGrid.offsetHeight; // Force reflow
            contentGrid.style.display = '';
        }
    }

    pauseNonEssentialOperations() {
        // Pause any non-essential operations when page is hidden
        this.isPaused = true;
    }

    resumeOperations() {
        // Resume operations when page becomes visible
        this.isPaused = false;
        
        // Refresh components if needed
        if (this.isInitialized) {
            this.refreshComponents();
        }
    }

    refreshComponents() {
        // Refresh all components to ensure they're up to date
        Object.values(this.components).forEach(component => {
            if (component.refresh) {
                component.refresh();
            }
        });
    }

    // Public API methods for external integration
    getState() {
        return this.state.getStateSnapshot();
    }

    updateFilter(filter) {
        if (this.state) {
            this.state.setCurrentFilter(filter);
        }
    }

    updatePage(page) {
        if (this.state) {
            this.state.setCurrentPage(page);
        }
    }

    // Method to programmatically scroll to sections
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Update URL
            const url = new URL(window.location);
            url.hash = sectionId;
            window.history.pushState({}, '', url);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// Export for testing purposes
export { PortfolioApp };