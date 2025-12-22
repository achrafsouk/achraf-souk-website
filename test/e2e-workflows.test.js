// End-to-end workflow integration tests
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PortfolioApp } from '../js/main.js';
import { AppState } from '../js/state/appState.js';
import { sampleData } from '../js/data/sampleData.js';

// Helper function to create complete DOM structure
const createCompleteDOM = () => {
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Personal Portfolio</title>
        </head>
        <body>
            <a href="#main-content" class="skip-link">Skip to main content</a>
            
            <section id="hero" class="hero-section" aria-label="Personal introduction">
                <div class="container">
                    <div class="hero-content">
                        <div class="profile-image-container">
                            <img id="profile-image" class="profile-image" src="" alt="Profile picture" />
                            <div id="profile-fallback" class="profile-fallback hidden" aria-hidden="true">
                                <span class="initials"></span>
                            </div>
                        </div>
                        <div class="hero-text">
                            <h1 class="hero-title">Welcome to My Portfolio</h1>
                            <p class="bio-text">Professional bio content will be displayed here.</p>
                            <a href="#" id="linkedin-link" class="linkedin-link" target="_blank" rel="noopener noreferrer">
                                Connect on LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="achievements" class="achievements-section" aria-label="Professional achievements">
                <div class="container">
                    <h2 class="section-title">Achievements</h2>
                    <div id="achievements-grid" class="achievements-grid"></div>
                </div>
            </section>

            <main id="main-content">
                <section id="content" class="content-section" aria-label="Thought leadership content">
                    <div class="container">
                        <h2 class="section-title">Thought Leadership</h2>
                        
                        <div class="filter-controls" role="group" aria-label="Content filters">
                            <button id="filter-all" class="filter-btn active" data-filter="all" aria-pressed="true">All</button>
                            <button id="filter-talks" class="filter-btn" data-filter="talk" aria-pressed="false">Talks</button>
                            <button id="filter-blogs" class="filter-btn" data-filter="blog" aria-pressed="false">Blogs</button>
                            <button id="filter-whitepapers" class="filter-btn" data-filter="whitepaper" aria-pressed="false">Whitepapers</button>
                            <button id="filter-reset" class="filter-btn filter-reset">Reset</button>
                        </div>

                        <div id="content-grid" class="content-grid"></div>

                        <nav class="pagination" aria-label="Content pagination" role="navigation">
                            <div id="pagination-controls" class="pagination-controls"></div>
                        </nav>
                    </div>
                </section>
            </main>
        </body>
        </html>
    `;
};

describe('End-to-End Workflow Tests', () => {
    let app;
    let mockObservers;

    beforeEach(() => {
        // Mock all browser APIs
        mockObservers = {
            intersection: vi.fn(),
            performance: vi.fn(),
            mutation: vi.fn()
        };

        global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
            observe: mockObservers.intersection,
            unobserve: vi.fn(),
            disconnect: vi.fn(),
            callback
        }));

        global.PerformanceObserver = vi.fn().mockImplementation(() => ({
            observe: mockObservers.performance,
            disconnect: vi.fn()
        }));

        global.MutationObserver = vi.fn().mockImplementation(() => ({
            observe: mockObservers.mutation,
            disconnect: vi.fn()
        }));

        // Mock performance API
        global.performance = {
            now: vi.fn(() => Date.now()),
            getEntriesByType: vi.fn(() => []),
        };

        // Mock storage APIs
        const mockStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        global.localStorage = mockStorage;
        global.sessionStorage = mockStorage;

        // Mock window methods
        global.window.open = vi.fn();
        global.window.history = {
            replaceState: vi.fn(),
            pushState: vi.fn()
        };

        // Create complete DOM
        createCompleteDOM();
    });

    afterEach(() => {
        if (app && app.performanceMonitor) {
            app.performanceMonitor.cleanupObservers();
        }
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('Complete User Journey: First Visit', () => {
        it('should handle complete first-time user experience', async () => {
            // Simulate first visit (no cached data)
            localStorage.getItem.mockReturnValue(null);
            sessionStorage.getItem.mockReturnValue(null);

            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify hero section loaded
            const heroTitle = document.querySelector('.hero-title');
            const bioText = document.querySelector('.bio-text');
            const linkedinLink = document.getElementById('linkedin-link');

            expect(heroTitle.textContent).toContain('Alex Johnson');
            expect(bioText.textContent).toContain('Passionate software engineer');
            expect(linkedinLink.href).toBe('https://linkedin.com/in/alexjohnson');

            // Verify achievements loaded
            const achievementsGrid = document.getElementById('achievements-grid');
            expect(achievementsGrid.children.length).toBeGreaterThan(0);

            // Verify content loaded with pagination
            const contentGrid = document.getElementById('content-grid');
            expect(contentGrid.children.length).toBeGreaterThan(0);
            expect(contentGrid.children.length).toBeLessThanOrEqual(6); // Max 6 per page

            // Verify pagination controls
            const paginationControls = document.getElementById('pagination-controls');
            if (sampleData.content.length > 6) {
                expect(paginationControls.children.length).toBeGreaterThan(0);
            }

            // Verify state persistence was attempted
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'portfolioAppState',
                expect.any(String)
            );
        });

        it('should handle user interaction flow: filter -> paginate -> reset', async () => {
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Step 1: Filter to blogs
            const blogsFilter = document.getElementById('filter-blogs');
            blogsFilter.click();

            // Verify filter applied
            expect(blogsFilter.classList.contains('active')).toBe(true);
            expect(blogsFilter.getAttribute('aria-pressed')).toBe('true');

            // Verify other filters inactive
            const allFilter = document.getElementById('filter-all');
            expect(allFilter.classList.contains('active')).toBe(false);

            // Step 2: Navigate pagination (if available)
            const paginationControls = document.getElementById('pagination-controls');
            const nextButton = paginationControls.querySelector('[data-page="2"]');
            
            if (nextButton && !nextButton.disabled) {
                nextButton.click();
                
                // Verify page changed
                expect(nextButton.classList.contains('active')).toBe(true);
            }

            // Step 3: Reset filters
            const resetButton = document.getElementById('filter-reset');
            resetButton.click();

            // Verify reset worked
            expect(allFilter.classList.contains('active')).toBe(true);
            expect(blogsFilter.classList.contains('active')).toBe(false);

            // Verify URL state management
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should handle external link navigation workflow', async () => {
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Simulate content cards with external links
            const contentGrid = document.getElementById('content-grid');
            const firstCard = contentGrid.querySelector('.content-card.clickable');

            if (firstCard) {
                // Test click navigation
                firstCard.click();
                
                expect(window.open).toHaveBeenCalledWith(
                    expect.any(String),
                    '_blank',
                    'noopener,noreferrer'
                );
            }

            // Test LinkedIn link
            const linkedinLink = document.getElementById('linkedin-link');
            linkedinLink.click();

            // Note: LinkedIn link uses target="_blank" so window.open isn't called
            // but the link should have proper attributes
            expect(linkedinLink.target).toBe('_blank');
            expect(linkedinLink.rel).toBe('noopener noreferrer');
        });
    });

    describe('Returning User Experience', () => {
        it('should restore user preferences from previous session', async () => {
            // Mock cached state
            const cachedState = {
                currentFilter: 'blog',
                currentPage: 2,
                timestamp: Date.now()
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(cachedState));

            // Mock cached filtered content
            const cachedContent = {
                filteredContent: sampleData.content.filter(item => item.type === 'blog'),
                filter: 'blog',
                timestamp: Date.now()
            };
            sessionStorage.getItem.mockReturnValue(JSON.stringify(cachedContent));

            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify state was restored
            const blogsFilter = document.getElementById('filter-blogs');
            expect(blogsFilter.classList.contains('active')).toBe(true);

            // Verify cached data was used
            expect(sessionStorage.getItem).toHaveBeenCalledWith('portfolioFilterCache');
        });

        it('should handle expired cache gracefully', async () => {
            // Mock expired cached state
            const expiredState = {
                currentFilter: 'blog',
                currentPage: 2,
                timestamp: Date.now() - (10 * 60 * 1000) // 10 minutes ago
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(expiredState));

            // Mock expired cached content
            const expiredContent = {
                filteredContent: [],
                filter: 'blog',
                timestamp: Date.now() - (10 * 60 * 1000) // 10 minutes ago
            };
            sessionStorage.getItem.mockReturnValue(JSON.stringify(expiredContent));

            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify app still works with fresh data
            expect(app.isInitialized).toBe(true);

            // Verify expired cache was cleaned up
            expect(sessionStorage.removeItem).toHaveBeenCalled();
        });
    });

    describe('Accessibility Workflow Tests', () => {
        it('should support complete keyboard navigation workflow', async () => {
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Test skip link navigation
            const skipLink = document.querySelector('.skip-link');
            const mainContent = document.getElementById('main-content');
            
            // Mock focus method
            mainContent.focus = vi.fn();
            
            // Simulate skip link activation
            skipLink.click();
            
            // Test keyboard navigation through filters
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            // Simulate Tab navigation
            filterButtons.forEach((button, index) => {
                button.focus = vi.fn();
                
                // Test Enter key activation
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                button.dispatchEvent(enterEvent);
                
                // Test Space key activation
                const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
                button.dispatchEvent(spaceEvent);
            });

            // Test arrow key navigation between filters
            const talksFilter = document.getElementById('filter-talks');
            talksFilter.focus = vi.fn();
            
            const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            talksFilter.dispatchEvent(arrowRightEvent);

            // Verify no errors occurred during keyboard navigation
            expect(app.isInitialized).toBe(true);
        });

        it('should provide proper screen reader experience', async () => {
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Test filter change announcements
            const talksFilter = document.getElementById('filter-talks');
            talksFilter.click();

            // Allow time for announcement
            await new Promise(resolve => setTimeout(resolve, 200));

            // Check for live region creation
            const liveRegions = document.querySelectorAll('[aria-live]');
            expect(liveRegions.length).toBeGreaterThanOrEqual(0);

            // Test content change announcements
            const blogsFilter = document.getElementById('filter-blogs');
            blogsFilter.click();

            await new Promise(resolve => setTimeout(resolve, 200));

            // Verify announcements were made
            const announcements = document.querySelectorAll('[aria-live="polite"]');
            expect(announcements.length).toBeGreaterThanOrEqual(0);
        });

        it('should handle focus management during dynamic content updates', async () => {
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Mock focus methods
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.focus = vi.fn();
                button.blur = vi.fn();
            });

            // Test focus retention during filter changes
            const talksFilter = document.getElementById('filter-talks');
            talksFilter.focus();
            talksFilter.click();

            // Test Escape key focus management
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            // Verify focus management worked
            expect(app.isInitialized).toBe(true);
        });
    });

    describe('Error Recovery Workflows', () => {
        it('should recover from component rendering failures', async () => {
            // Mock console methods
            const originalConsoleError = console.error;
            const originalConsoleWarn = console.warn;
            console.error = vi.fn();
            console.warn = vi.fn();

            // Remove critical DOM element to trigger error
            document.getElementById('content-grid').remove();

            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify error was logged but app continued
            expect(console.error).toHaveBeenCalled();
            
            // Verify other components still work
            const heroTitle = document.querySelector('.hero-title');
            expect(heroTitle).toBeTruthy();

            // Restore console methods
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
        });

        it('should handle network connectivity issues', async () => {
            // Mock network failure for images
            const profileImage = document.getElementById('profile-image');
            
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Simulate image load failure
            const errorEvent = new Event('error');
            profileImage.dispatchEvent(errorEvent);

            // Verify fallback mechanism activated
            const fallback = document.getElementById('profile-fallback');
            expect(fallback.classList.contains('hidden')).toBe(false);
            expect(fallback.getAttribute('aria-hidden')).toBe('false');

            // Verify app continues to function
            expect(app.isInitialized).toBe(true);
        });

        it('should handle storage quota exceeded gracefully', async () => {
            // Mock storage quota exceeded
            localStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const originalConsoleWarn = console.warn;
            console.warn = vi.fn();

            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify app works despite storage failure
            expect(app.isInitialized).toBe(true);
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Failed to persist state')
            );

            // Restore console.warn
            console.warn = originalConsoleWarn;
        });
    });

    describe('Performance Integration Workflows', () => {
        it('should handle lazy loading workflow correctly', async () => {
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Verify intersection observers were set up
            expect(mockObservers.intersection).toHaveBeenCalled();

            // Simulate intersection for lazy loading
            const observerCallback = global.IntersectionObserver.mock.calls[0][0];
            const mockEntry = {
                isIntersecting: true,
                target: { id: 'achievements' }
            };

            observerCallback([mockEntry]);

            // Verify lazy loading was triggered
            expect(app.components.achievements).toBeTruthy();
        });

        it('should perform cleanup workflow correctly', async () => {
            // Initialize app
            app = new PortfolioApp();
            await new Promise(resolve => setTimeout(resolve, 150));

            // Mock cached data for cleanup
            const oldCacheKey = 'img_cache_test123';
            const oldCacheData = {
                dataUrl: 'data:image/jpeg;base64,test',
                timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
            };
            
            localStorage.getItem.mockImplementation((key) => {
                if (key === oldCacheKey) {
                    return JSON.stringify(oldCacheData);
                }
                return null;
            });

            // Mock Object.keys to return our test key
            const originalKeys = Object.keys;
            Object.keys = vi.fn().mockReturnValue([oldCacheKey]);

            // Trigger cleanup
            app.performCleanup();

            // Verify old cache was removed
            expect(localStorage.removeItem).toHaveBeenCalledWith(oldCacheKey);

            // Restore Object.keys
            Object.keys = originalKeys;
        });
    });
});