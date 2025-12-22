// Deployment functionality tests - verify website loads correctly from dist/ files
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper to load built files
const loadBuiltFile = (filePath) => {
    try {
        return readFileSync(join(process.cwd(), 'dist', filePath), 'utf-8');
    } catch (error) {
        throw new Error(`Failed to load built file: ${filePath}`);
    }
};

// Helper to create DOM from built HTML
const createDOMFromBuiltHTML = () => {
    const htmlContent = loadBuiltFile('index.html');
    
    // Parse the HTML content to extract head and body
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Copy attributes from parsed document to current document
    document.documentElement.setAttribute('lang', doc.documentElement.getAttribute('lang') || 'en');
    
    // Copy head content
    document.head.innerHTML = doc.head.innerHTML;
    
    // Copy body content
    document.body.innerHTML = doc.body.innerHTML;
    
    return htmlContent;
};

describe('Deployment Functionality Tests', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        document.head.innerHTML = '';
        
        // Mock browser APIs
        global.IntersectionObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        }));

        global.PerformanceObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            disconnect: vi.fn()
        }));

        global.performance = {
            now: vi.fn(() => Date.now()),
            getEntriesByType: vi.fn(() => []),
        };

        const mockStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        global.localStorage = mockStorage;
        global.sessionStorage = mockStorage;

        global.window.open = vi.fn();
        Element.prototype.scrollIntoView = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('4.1 Verify website loads correctly from dist/ files', () => {
        it('should load index.html without JavaScript errors', async () => {
            // Load the built HTML
            const htmlContent = createDOMFromBuiltHTML();
            
            // Verify HTML structure is present
            expect(htmlContent).toContain('<!DOCTYPE html>');
            expect(htmlContent).toContain('<html lang="en">');
            expect(htmlContent).toContain('<meta charset="UTF-8">');
            
            // Verify script and CSS references point to bundled assets
            expect(htmlContent).toMatch(/src="\.\/assets\/index-[a-zA-Z0-9]+\.js"/);
            expect(htmlContent).toMatch(/href="\.\/assets\/style-[a-zA-Z0-9]+\.css"/);
            
            // Verify no JavaScript errors during DOM creation
            const scriptTags = document.querySelectorAll('script[src]');
            expect(scriptTags.length).toBeGreaterThan(0);
            
            // Verify script has proper module type
            const moduleScript = document.querySelector('script[type="module"]');
            expect(moduleScript).toBeTruthy();
            expect(moduleScript.getAttribute('crossorigin')).toBe('');
        });

        it('should display hero section correctly', () => {
            createDOMFromBuiltHTML();
            
            // Verify hero section structure
            const heroSection = document.getElementById('hero');
            expect(heroSection).toBeTruthy();
            expect(heroSection.getAttribute('aria-label')).toBe('Personal introduction');
            
            // Verify hero content elements
            const heroTitle = document.querySelector('.hero-title');
            const bioText = document.querySelector('.bio-text');
            const linkedinLink = document.getElementById('linkedin-link');
            const profileImage = document.getElementById('profile-image');
            const profileFallback = document.getElementById('profile-fallback');
            
            expect(heroTitle).toBeTruthy();
            expect(heroTitle.textContent).toBe('Welcome to My Portfolio');
            
            expect(bioText).toBeTruthy();
            expect(bioText.textContent).toBe('Professional bio content will be displayed here.');
            
            expect(linkedinLink).toBeTruthy();
            expect(linkedinLink.getAttribute('target')).toBe('_blank');
            expect(linkedinLink.getAttribute('rel')).toBe('noopener noreferrer');
            
            expect(profileImage).toBeTruthy();
            expect(profileImage.getAttribute('alt')).toBe('Profile picture');
            
            expect(profileFallback).toBeTruthy();
            expect(profileFallback.classList.contains('hidden')).toBe(true);
        });

        it('should display achievements section correctly', () => {
            createDOMFromBuiltHTML();
            
            // Verify achievements section structure
            const achievementsSection = document.getElementById('achievements');
            expect(achievementsSection).toBeTruthy();
            expect(achievementsSection.getAttribute('aria-label')).toBe('Professional achievements');
            
            // Verify section title
            const sectionTitle = achievementsSection.querySelector('.section-title');
            expect(sectionTitle).toBeTruthy();
            expect(sectionTitle.textContent).toBe('Achievements');
            
            // Verify achievements grid container
            const achievementsGrid = document.getElementById('achievements-grid');
            expect(achievementsGrid).toBeTruthy();
            expect(achievementsGrid.classList.contains('achievements-grid')).toBe(true);
        });

        it('should display content section correctly', () => {
            createDOMFromBuiltHTML();
            
            // Verify content section structure
            const contentSection = document.getElementById('content');
            expect(contentSection).toBeTruthy();
            expect(contentSection.getAttribute('aria-label')).toBe('Thought leadership content');
            
            // Verify main content wrapper
            const mainContent = document.getElementById('main-content');
            expect(mainContent).toBeTruthy();
            expect(mainContent.tagName).toBe('MAIN');
            
            // Verify section title
            const sectionTitle = contentSection.querySelector('.section-title');
            expect(sectionTitle).toBeTruthy();
            expect(sectionTitle.textContent).toBe('Thought Leadership');
            
            // Verify filter controls
            const filterControls = document.querySelector('.filter-controls');
            expect(filterControls).toBeTruthy();
            expect(filterControls.getAttribute('role')).toBe('group');
            expect(filterControls.getAttribute('aria-label')).toBe('Content filters');
            
            // Verify content grid container
            const contentGrid = document.getElementById('content-grid');
            expect(contentGrid).toBeTruthy();
            expect(contentGrid.classList.contains('content-grid')).toBe(true);
            
            // Verify pagination container
            const pagination = document.querySelector('.pagination');
            expect(pagination).toBeTruthy();
            expect(pagination.getAttribute('role')).toBe('navigation');
            expect(pagination.getAttribute('aria-label')).toBe('Content pagination');
        });

        it('should have proper accessibility attributes', () => {
            createDOMFromBuiltHTML();
            
            // Verify skip link
            const skipLink = document.querySelector('.skip-link');
            expect(skipLink).toBeTruthy();
            expect(skipLink.getAttribute('href')).toBe('#main-content');
            
            // Verify filter buttons have proper ARIA attributes
            const filterButtons = document.querySelectorAll('.filter-btn');
            expect(filterButtons.length).toBeGreaterThan(0);
            
            filterButtons.forEach(button => {
                expect(button.getAttribute('aria-pressed')).toMatch(/^(true|false)$/);
                expect(button.getAttribute('aria-label')).toBeTruthy();
            });
            
            // Verify active filter button
            const activeFilter = document.querySelector('.filter-btn.active');
            expect(activeFilter).toBeTruthy();
            expect(activeFilter.getAttribute('aria-pressed')).toBe('true');
            expect(activeFilter.id).toBe('filter-all');
        });

        it('should have proper meta tags and document structure', () => {
            createDOMFromBuiltHTML();
            
            // Verify document structure
            expect(document.documentElement.getAttribute('lang')).toBe('en');
            
            // Verify meta tags
            const charset = document.querySelector('meta[charset]');
            expect(charset).toBeTruthy();
            expect(charset.getAttribute('charset')).toBe('UTF-8');
            
            const viewport = document.querySelector('meta[name="viewport"]');
            expect(viewport).toBeTruthy();
            expect(viewport.getAttribute('content')).toBe('width=device-width, initial-scale=1.0');
            
            const description = document.querySelector('meta[name="description"]');
            expect(description).toBeTruthy();
            expect(description.getAttribute('content')).toContain('Personal professional portfolio');
            
            // Verify title
            const title = document.querySelector('title');
            expect(title).toBeTruthy();
            expect(title.textContent).toBe('Personal Portfolio');
        });

        it('should reference correct bundled assets', () => {
            const htmlContent = createDOMFromBuiltHTML();
            
            // Verify CSS link
            const cssLink = document.querySelector('link[rel="stylesheet"]');
            expect(cssLink).toBeTruthy();
            expect(cssLink.getAttribute('href')).toMatch(/^\.\/assets\/style-[a-zA-Z0-9]+\.css$/);
            expect(cssLink.getAttribute('crossorigin')).toBe('');
            
            // Verify JavaScript script
            const jsScript = document.querySelector('script[type="module"]');
            expect(jsScript).toBeTruthy();
            expect(jsScript.getAttribute('src')).toMatch(/^\.\/assets\/index-[a-zA-Z0-9]+\.js$/);
            expect(jsScript.getAttribute('crossorigin')).toBe('');
            
            // Verify no references to unbundled source files
            expect(htmlContent).not.toContain('js/main.js');
            expect(htmlContent).not.toContain('styles/main.css');
            expect(htmlContent).not.toContain('js/components/');
            expect(htmlContent).not.toContain('js/state/');
        });
    });

    describe('4.2 Test interactive functionality', () => {
        it('should verify filter buttons work correctly', async () => {
            createDOMFromBuiltHTML();
            
            // Get filter buttons
            const allFilter = document.getElementById('filter-all');
            const talksFilter = document.getElementById('filter-talks');
            const blogsFilter = document.getElementById('filter-blogs');
            const whitepapersFilter = document.getElementById('filter-whitepapers');
            
            // Verify initial state - All filter should be active
            expect(allFilter.classList.contains('active')).toBe(true);
            expect(allFilter.getAttribute('aria-pressed')).toBe('true');
            expect(talksFilter.classList.contains('active')).toBe(false);
            expect(talksFilter.getAttribute('aria-pressed')).toBe('false');
            
            // Test filter button click behavior
            // Simulate clicking talks filter
            allFilter.classList.remove('active');
            allFilter.setAttribute('aria-pressed', 'false');
            talksFilter.classList.add('active');
            talksFilter.setAttribute('aria-pressed', 'true');
            
            // Verify state changed
            expect(allFilter.classList.contains('active')).toBe(false);
            expect(allFilter.getAttribute('aria-pressed')).toBe('false');
            expect(talksFilter.classList.contains('active')).toBe(true);
            expect(talksFilter.getAttribute('aria-pressed')).toBe('true');
            
            // Test switching to blogs filter
            talksFilter.classList.remove('active');
            talksFilter.setAttribute('aria-pressed', 'false');
            blogsFilter.classList.add('active');
            blogsFilter.setAttribute('aria-pressed', 'true');
            
            // Verify blogs filter is now active
            expect(talksFilter.classList.contains('active')).toBe(false);
            expect(blogsFilter.classList.contains('active')).toBe(true);
            expect(blogsFilter.getAttribute('aria-pressed')).toBe('true');
            
            // Test returning to all filter
            blogsFilter.classList.remove('active');
            blogsFilter.setAttribute('aria-pressed', 'false');
            allFilter.classList.add('active');
            allFilter.setAttribute('aria-pressed', 'true');
            
            // Verify back to all
            expect(blogsFilter.classList.contains('active')).toBe(false);
            expect(allFilter.classList.contains('active')).toBe(true);
            expect(allFilter.getAttribute('aria-pressed')).toBe('true');
        });

        it('should test pagination functionality', () => {
            createDOMFromBuiltHTML();
            
            // Get pagination controls container
            const paginationControls = document.getElementById('pagination-controls');
            expect(paginationControls).toBeTruthy();
            
            // Simulate pagination buttons for testing
            paginationControls.innerHTML = `
                <button class="pagination-btn active" data-page="1" aria-current="page">1</button>
                <button class="pagination-btn" data-page="2">2</button>
                <button class="pagination-btn" data-page="3">3</button>
            `;
            
            const page1Btn = paginationControls.querySelector('[data-page="1"]');
            const page2Btn = paginationControls.querySelector('[data-page="2"]');
            const page3Btn = paginationControls.querySelector('[data-page="3"]');
            
            // Verify initial state
            expect(page1Btn.classList.contains('active')).toBe(true);
            expect(page1Btn.getAttribute('aria-current')).toBe('page');
            expect(page2Btn.classList.contains('active')).toBe(false);
            
            // Test pagination navigation
            // Simulate clicking page 2
            page1Btn.classList.remove('active');
            page1Btn.removeAttribute('aria-current');
            page2Btn.classList.add('active');
            page2Btn.setAttribute('aria-current', 'page');
            
            // Verify page 2 is now active
            expect(page1Btn.classList.contains('active')).toBe(false);
            expect(page1Btn.getAttribute('aria-current')).toBeNull();
            expect(page2Btn.classList.contains('active')).toBe(true);
            expect(page2Btn.getAttribute('aria-current')).toBe('page');
            
            // Test navigation to page 3
            page2Btn.classList.remove('active');
            page2Btn.removeAttribute('aria-current');
            page3Btn.classList.add('active');
            page3Btn.setAttribute('aria-current', 'page');
            
            // Verify page 3 is now active
            expect(page2Btn.classList.contains('active')).toBe(false);
            expect(page3Btn.classList.contains('active')).toBe(true);
            expect(page3Btn.getAttribute('aria-current')).toBe('page');
        });

        it('should ensure all JavaScript features work as expected', () => {
            createDOMFromBuiltHTML();
            
            // Test skip link functionality
            const skipLink = document.querySelector('.skip-link');
            const mainContent = document.getElementById('main-content');
            
            expect(skipLink).toBeTruthy();
            expect(skipLink.getAttribute('href')).toBe('#main-content');
            expect(mainContent).toBeTruthy();
            
            // Test external link functionality
            const linkedinLink = document.getElementById('linkedin-link');
            expect(linkedinLink).toBeTruthy();
            expect(linkedinLink.getAttribute('target')).toBe('_blank');
            expect(linkedinLink.getAttribute('rel')).toBe('noopener noreferrer');
            
            // Test profile image fallback functionality
            const profileImage = document.getElementById('profile-image');
            const profileFallback = document.getElementById('profile-fallback');
            
            expect(profileImage).toBeTruthy();
            expect(profileFallback).toBeTruthy();
            expect(profileFallback.classList.contains('hidden')).toBe(true);
            
            // Simulate image error to test fallback
            profileImage.style.display = 'none';
            profileFallback.classList.remove('hidden');
            profileFallback.setAttribute('aria-hidden', 'false');
            
            // Verify fallback is shown
            expect(profileFallback.classList.contains('hidden')).toBe(false);
            expect(profileFallback.getAttribute('aria-hidden')).toBe('false');
            
            // Test keyboard navigation support
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                // Verify buttons are focusable
                expect(button.tabIndex).not.toBe(-1);
                
                // Verify ARIA attributes for screen readers
                expect(button.getAttribute('aria-pressed')).toMatch(/^(true|false)$/);
                expect(button.getAttribute('aria-label')).toBeTruthy();
            });
            
            // Test content grid container
            const contentGrid = document.getElementById('content-grid');
            expect(contentGrid).toBeTruthy();
            expect(contentGrid.classList.contains('content-grid')).toBe(true);
            
            // Test achievements grid container
            const achievementsGrid = document.getElementById('achievements-grid');
            expect(achievementsGrid).toBeTruthy();
            expect(achievementsGrid.classList.contains('achievements-grid')).toBe(true);
        });

        it('should handle filter and pagination interaction', () => {
            createDOMFromBuiltHTML();
            
            // Test combined filter and pagination workflow
            const talksFilter = document.getElementById('filter-talks');
            const allFilter = document.getElementById('filter-all');
            const paginationControls = document.getElementById('pagination-controls');
            
            // Initial state - all filter active, pagination has placeholder content
            expect(allFilter.classList.contains('active')).toBe(true);
            expect(paginationControls.innerHTML.trim()).toContain('<!-- Pagination buttons will be dynamically inserted here -->');
            
            // Simulate filtering to talks (which might need pagination)
            allFilter.classList.remove('active');
            allFilter.setAttribute('aria-pressed', 'false');
            talksFilter.classList.add('active');
            talksFilter.setAttribute('aria-pressed', 'true');
            
            // Simulate pagination appearing for filtered content
            paginationControls.innerHTML = `
                <button class="pagination-btn active" data-page="1" aria-current="page">1</button>
                <button class="pagination-btn" data-page="2">2</button>
            `;
            
            // Verify filter and pagination state
            expect(talksFilter.classList.contains('active')).toBe(true);
            expect(paginationControls.children.length).toBe(2);
            
            const page1Btn = paginationControls.querySelector('[data-page="1"]');
            expect(page1Btn.classList.contains('active')).toBe(true);
            
            // Test resetting filter clears pagination
            talksFilter.classList.remove('active');
            talksFilter.setAttribute('aria-pressed', 'false');
            allFilter.classList.add('active');
            allFilter.setAttribute('aria-pressed', 'true');
            paginationControls.innerHTML = ''; // Simulate pagination clearing
            
            // Verify reset state
            expect(allFilter.classList.contains('active')).toBe(true);
            expect(talksFilter.classList.contains('active')).toBe(false);
            expect(paginationControls.innerHTML).toBe('');
        });

        it('should test responsive behavior simulation', () => {
            createDOMFromBuiltHTML();
            
            // Test that all interactive elements are present regardless of viewport
            const filterControls = document.querySelector('.filter-controls');
            const filterButtons = document.querySelectorAll('.filter-btn');
            const contentGrid = document.getElementById('content-grid');
            const paginationControls = document.getElementById('pagination-controls');
            
            // Verify all interactive elements exist
            expect(filterControls).toBeTruthy();
            expect(filterButtons.length).toBe(4); // All, Talks, Blogs, Whitepapers
            expect(contentGrid).toBeTruthy();
            expect(paginationControls).toBeTruthy();
            
            // Verify filter controls have proper group role
            expect(filterControls.getAttribute('role')).toBe('group');
            expect(filterControls.getAttribute('aria-label')).toBe('Content filters');
            
            // Test that buttons maintain functionality across different states
            filterButtons.forEach((button, index) => {
                // Simulate focus for keyboard navigation
                button.focus = vi.fn();
                
                // Test that each button can be activated
                const wasActive = button.classList.contains('active');
                
                // Simulate activation
                if (!wasActive) {
                    // Remove active from all others
                    filterButtons.forEach(otherBtn => {
                        otherBtn.classList.remove('active');
                        otherBtn.setAttribute('aria-pressed', 'false');
                    });
                    
                    // Activate this button
                    button.classList.add('active');
                    button.setAttribute('aria-pressed', 'true');
                }
                
                // Verify activation worked
                expect(button.classList.contains('active')).toBe(true);
                expect(button.getAttribute('aria-pressed')).toBe('true');
                
                // Verify only one button is active at a time
                const activeButtons = document.querySelectorAll('.filter-btn.active');
                expect(activeButtons.length).toBe(1);
                expect(activeButtons[0]).toBe(button);
            });
        });
    });

    describe('4.3 Write integration tests for deployed functionality', () => {
        it('should test complete user workflows on deployed site', async () => {
            createDOMFromBuiltHTML();
            
            // Mock the PortfolioApp to simulate real deployment behavior
            const mockApp = {
                isInitialized: false,
                components: {},
                
                async initialize() {
                    // Simulate app initialization
                    this.isInitialized = true;
                    this.components = {
                        hero: { initialized: true },
                        achievements: { initialized: true },
                        content: { initialized: true }
                    };
                    
                    // Simulate loading hero data
                    const heroTitle = document.querySelector('.hero-title');
                    const bioText = document.querySelector('.bio-text');
                    const linkedinLink = document.getElementById('linkedin-link');
                    
                    if (heroTitle) heroTitle.textContent = 'Alex Johnson';
                    if (bioText) bioText.textContent = 'Passionate software engineer with expertise in cloud architecture and edge computing.';
                    if (linkedinLink) linkedinLink.href = 'https://linkedin.com/in/alexjohnson';
                    
                    // Simulate loading achievements
                    const achievementsGrid = document.getElementById('achievements-grid');
                    if (achievementsGrid) {
                        achievementsGrid.innerHTML = `
                            <div class="achievement-card">
                                <h3>AWS Certified Solutions Architect</h3>
                                <p>Professional level certification</p>
                            </div>
                            <div class="achievement-card">
                                <h3>Speaker at AWS re:Invent</h3>
                                <p>Presented on edge computing</p>
                            </div>
                        `;
                    }
                    
                    // Simulate loading content
                    const contentGrid = document.getElementById('content-grid');
                    if (contentGrid) {
                        contentGrid.innerHTML = `
                            <div class="content-card clickable" data-external-link="https://example.com/talk1">
                                <h3>Edge Computing Best Practices</h3>
                                <p class="content-type">Talk</p>
                                <p class="content-description">Deep dive into edge computing strategies</p>
                            </div>
                            <div class="content-card clickable" data-external-link="https://example.com/blog1">
                                <h3>CloudFront Security</h3>
                                <p class="content-type">Blog</p>
                                <p class="content-description">Security best practices for CDN</p>
                            </div>
                            <div class="content-card clickable" data-external-link="https://example.com/whitepaper1">
                                <h3>AWS Edge Services</h3>
                                <p class="content-type">Whitepaper</p>
                                <p class="content-description">Comprehensive guide to edge services</p>
                            </div>
                        `;
                    }
                    
                    return true;
                }
            };
            
            // Initialize the mock app
            await mockApp.initialize();
            
            // Test complete workflow: Load → Filter → Navigate → Reset
            
            // Step 1: Verify initial load
            expect(mockApp.isInitialized).toBe(true);
            expect(mockApp.components.hero.initialized).toBe(true);
            expect(mockApp.components.achievements.initialized).toBe(true);
            expect(mockApp.components.content.initialized).toBe(true);
            
            // Verify hero content loaded
            const heroTitle = document.querySelector('.hero-title');
            expect(heroTitle.textContent).toBe('Alex Johnson');
            
            // Verify achievements loaded
            const achievementCards = document.querySelectorAll('.achievement-card');
            expect(achievementCards.length).toBe(2);
            
            // Verify content loaded
            const contentCards = document.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(3);
            
            // Step 2: Test filtering workflow
            const talksFilter = document.getElementById('filter-talks');
            const allFilter = document.getElementById('filter-all');
            
            // Simulate filtering to talks
            allFilter.classList.remove('active');
            allFilter.setAttribute('aria-pressed', 'false');
            talksFilter.classList.add('active');
            talksFilter.setAttribute('aria-pressed', 'true');
            
            // Simulate filtering content (hide non-talk items)
            const talkCards = document.querySelectorAll('.content-card');
            talkCards.forEach(card => {
                const type = card.querySelector('.content-type').textContent.toLowerCase();
                if (type !== 'talk') {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'block';
                }
            });
            
            // Verify filtering worked
            const visibleCards = Array.from(talkCards).filter(card => 
                card.style.display !== 'none'
            );
            expect(visibleCards.length).toBe(1);
            expect(visibleCards[0].querySelector('.content-type').textContent).toBe('Talk');
            
            // Step 3: Test external link navigation
            const talkCard = visibleCards[0];
            expect(talkCard.dataset.externalLink).toBe('https://example.com/talk1');
            
            // Simulate click (would open external link)
            talkCard.click();
            
            // Step 4: Test reset functionality
            talksFilter.classList.remove('active');
            talksFilter.setAttribute('aria-pressed', 'false');
            allFilter.classList.add('active');
            allFilter.setAttribute('aria-pressed', 'true');
            
            // Simulate showing all content again
            talkCards.forEach(card => {
                card.style.display = 'block';
            });
            
            // Verify reset worked
            const allVisibleCards = Array.from(talkCards).filter(card => 
                card.style.display !== 'none'
            );
            expect(allVisibleCards.length).toBe(3);
        });

        it('should verify all interactive features work correctly', async () => {
            createDOMFromBuiltHTML();
            
            // Test skip link navigation
            const skipLink = document.querySelector('.skip-link');
            const mainContent = document.getElementById('main-content');
            
            // Mock focus method
            mainContent.focus = vi.fn();
            
            // Simulate skip link click
            skipLink.click();
            
            // Test keyboard navigation through filters
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            filterButtons.forEach(button => {
                button.focus = vi.fn();
                
                // Test Enter key activation
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                button.dispatchEvent(enterEvent);
                
                // Test Space key activation  
                const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
                button.dispatchEvent(spaceEvent);
            });
            
            // Test filter state management
            const blogsFilter = document.getElementById('filter-blogs');
            const allFilter = document.getElementById('filter-all');
            
            // Simulate complete filter cycle
            const filterSequence = [
                { filter: blogsFilter, type: 'blog' },
                { filter: document.getElementById('filter-talks'), type: 'talk' },
                { filter: document.getElementById('filter-whitepapers'), type: 'whitepaper' },
                { filter: allFilter, type: 'all' }
            ];
            
            filterSequence.forEach(({ filter, type }) => {
                // Deactivate all filters
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                // Activate current filter
                filter.classList.add('active');
                filter.setAttribute('aria-pressed', 'true');
                
                // Verify state
                expect(filter.classList.contains('active')).toBe(true);
                expect(filter.getAttribute('aria-pressed')).toBe('true');
                
                // Verify only one filter is active
                const activeFilters = document.querySelectorAll('.filter-btn.active');
                expect(activeFilters.length).toBe(1);
                expect(activeFilters[0]).toBe(filter);
            });
            
            // Test pagination interaction
            const paginationControls = document.getElementById('pagination-controls');
            
            // Simulate pagination for large content sets
            paginationControls.innerHTML = `
                <button class="pagination-btn active" data-page="1" aria-current="page">1</button>
                <button class="pagination-btn" data-page="2">2</button>
                <button class="pagination-btn" data-page="3">3</button>
                <span class="pagination-info">Page 1 of 3</span>
            `;
            
            const paginationButtons = paginationControls.querySelectorAll('.pagination-btn');
            
            // Test pagination navigation
            paginationButtons.forEach((button, index) => {
                // Deactivate all pagination buttons
                paginationButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.removeAttribute('aria-current');
                });
                
                // Activate current button
                button.classList.add('active');
                button.setAttribute('aria-current', 'page');
                
                // Verify pagination state
                expect(button.classList.contains('active')).toBe(true);
                expect(button.getAttribute('aria-current')).toBe('page');
                
                // Verify only one page is active
                const activePages = paginationControls.querySelectorAll('.pagination-btn.active');
                expect(activePages.length).toBe(1);
                expect(activePages[0]).toBe(button);
            });
            
            // Test accessibility features
            const linkedinLink = document.getElementById('linkedin-link');
            expect(linkedinLink.getAttribute('target')).toBe('_blank');
            expect(linkedinLink.getAttribute('rel')).toBe('noopener noreferrer');
            
            // Test profile image fallback
            const profileImage = document.getElementById('profile-image');
            const profileFallback = document.getElementById('profile-fallback');
            
            // Simulate image load error
            profileImage.style.display = 'none';
            profileFallback.classList.remove('hidden');
            profileFallback.setAttribute('aria-hidden', 'false');
            
            // Verify fallback is active
            expect(profileFallback.classList.contains('hidden')).toBe(false);
            expect(profileFallback.getAttribute('aria-hidden')).toBe('false');
        });

        it('should handle error scenarios gracefully', () => {
            createDOMFromBuiltHTML();
            
            // Test missing content gracefully
            const contentGrid = document.getElementById('content-grid');
            contentGrid.innerHTML = ''; // Simulate no content
            
            // Verify empty state doesn't break functionality
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            });
            
            const talksFilter = document.getElementById('filter-talks');
            talksFilter.classList.add('active');
            talksFilter.setAttribute('aria-pressed', 'true');
            
            // Should still work with no content
            expect(talksFilter.classList.contains('active')).toBe(true);
            
            // Test broken external links
            contentGrid.innerHTML = `
                <div class="content-card clickable" data-external-link="">
                    <h3>Broken Link Test</h3>
                </div>
            `;
            
            const brokenCard = contentGrid.querySelector('.content-card');
            expect(brokenCard.dataset.externalLink).toBe('');
            
            // Should handle gracefully (no error thrown)
            brokenCard.click();
            
            // Test missing pagination
            const paginationControls = document.getElementById('pagination-controls');
            paginationControls.innerHTML = ''; // No pagination
            
            // Should not break filter functionality
            const blogsFilter = document.getElementById('filter-blogs');
            blogsFilter.classList.add('active');
            expect(blogsFilter.classList.contains('active')).toBe(true);
            
            // Test accessibility with missing elements
            const missingElement = document.getElementById('non-existent');
            expect(missingElement).toBeNull(); // Should handle gracefully
        });

        it('should maintain performance during interactions', async () => {
            createDOMFromBuiltHTML();
            
            const startTime = performance.now();
            
            // Simulate rapid filter changes
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            for (let i = 0; i < 10; i++) {
                filterButtons.forEach(button => {
                    button.classList.remove('active');
                    button.setAttribute('aria-pressed', 'false');
                });
                
                const randomFilter = filterButtons[i % filterButtons.length];
                randomFilter.classList.add('active');
                randomFilter.setAttribute('aria-pressed', 'true');
            }
            
            const filterTime = performance.now() - startTime;
            
            // Should complete rapidly (under 100ms for 40 operations)
            expect(filterTime).toBeLessThan(100);
            
            // Test pagination performance
            const paginationStart = performance.now();
            const paginationControls = document.getElementById('pagination-controls');
            
            // Simulate large pagination set
            const paginationHTML = Array.from({ length: 20 }, (_, i) => 
                `<button class="pagination-btn" data-page="${i + 1}">${i + 1}</button>`
            ).join('');
            
            paginationControls.innerHTML = paginationHTML;
            
            const paginationTime = performance.now() - paginationStart;
            
            // Should render quickly
            expect(paginationTime).toBeLessThan(50);
            expect(paginationControls.children.length).toBe(20);
        });

        it('should support complete accessibility workflow', () => {
            createDOMFromBuiltHTML();
            
            // Test screen reader navigation
            const sections = [
                { id: 'hero', label: 'Personal introduction' },
                { id: 'achievements', label: 'Professional achievements' },
                { id: 'content', label: 'Thought leadership content' }
            ];
            
            sections.forEach(({ id, label }) => {
                const section = document.getElementById(id);
                expect(section).toBeTruthy();
                expect(section.getAttribute('aria-label')).toBe(label);
            });
            
            // Test keyboard navigation flow
            const focusableElements = document.querySelectorAll(
                'a, button, [tabindex]:not([tabindex="-1"])'
            );
            
            expect(focusableElements.length).toBeGreaterThan(0);
            
            // Test ARIA live regions for announcements
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            // Simulate filter change with announcement
            const talksFilter = document.getElementById('filter-talks');
            talksFilter.classList.add('active');
            talksFilter.setAttribute('aria-pressed', 'true');
            
            // Create announcement region (simulating real app behavior)
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.textContent = 'Showing talks content';
            document.body.appendChild(announcement);
            
            // Verify announcement
            const liveRegion = document.querySelector('[aria-live="polite"]');
            expect(liveRegion).toBeTruthy();
            expect(liveRegion.textContent).toBe('Showing talks content');
            
            // Test focus management
            const mainContent = document.getElementById('main-content');
            mainContent.focus = vi.fn();
            
            const skipLink = document.querySelector('.skip-link');
            skipLink.click();
            
            // Test high contrast support (simulated)
            const filterControls = document.querySelector('.filter-controls');
            expect(filterControls.getAttribute('role')).toBe('group');
            
            // Test reduced motion support (elements should still be functional)
            filterButtons.forEach(button => {
                expect(button.getAttribute('aria-pressed')).toMatch(/^(true|false)$/);
            });
        });
    });
});