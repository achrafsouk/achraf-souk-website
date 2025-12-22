// Unit tests for content filtering system
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentComponent } from '../js/components/content.js';
import { AppState } from '../js/state/appState.js';
import { ContentType } from '../js/models/dataModels.js';

describe('Content Filtering System', () => {
    let appState;
    let contentComponent;
    let mockContainer;

    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <div id="content-section" class="content-section">
                <div class="filter-controls" role="group" aria-label="Content filters">
                    <button id="filter-all" class="filter-btn active" data-filter="all" aria-pressed="true">All</button>
                    <button id="filter-talks" class="filter-btn" data-filter="talk" aria-pressed="false">Talks</button>
                    <button id="filter-blogs" class="filter-btn" data-filter="blog" aria-pressed="false">Blogs</button>
                    <button id="filter-whitepapers" class="filter-btn" data-filter="whitepaper" aria-pressed="false">Whitepapers</button>
                    <button id="filter-reset" class="filter-btn filter-reset">Reset</button>
                </div>
                <div id="content-grid" class="content-grid"></div>
                <div id="pagination-controls" class="pagination-controls"></div>
            </div>
        `;
        
        appState = new AppState();
        contentComponent = new ContentComponent(appState);
        mockContainer = document.getElementById('content-grid');

        // Sample test data
        const testContent = [
            {
                id: 'content-1',
                title: 'Test Talk',
                type: 'talk',
                publicationDate: '2024-01-15',
                description: 'A test talk description',
                externalLink: 'https://example.com/talk1'
            },
            {
                id: 'content-2',
                title: 'Test Blog',
                type: 'blog',
                publicationDate: '2024-01-10',
                description: 'A test blog description',
                externalLink: 'https://example.com/blog1'
            },
            {
                id: 'content-3',
                title: 'Test Whitepaper',
                type: 'whitepaper',
                publicationDate: '2024-01-05',
                description: 'A test whitepaper description',
                externalLink: 'https://example.com/whitepaper1'
            }
        ];

        appState.setContent(testContent);
    });

    describe('Filter Options Availability', () => {
        /**
         * Requirements: 3.3 - Filter options should be available
         */
        it('should display all filter options', () => {
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            // Should have all filter buttons plus reset
            expect(filterButtons.length).toBe(5);
            
            // Check specific filter buttons exist
            expect(document.getElementById('filter-all')).toBeTruthy();
            expect(document.getElementById('filter-talks')).toBeTruthy();
            expect(document.getElementById('filter-blogs')).toBeTruthy();
            expect(document.getElementById('filter-whitepapers')).toBeTruthy();
            expect(document.getElementById('filter-reset')).toBeTruthy();
        });

        it('should have proper accessibility attributes on filter buttons', () => {
            const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
            
            filterButtons.forEach(button => {
                expect(button.getAttribute('aria-pressed')).toBeDefined();
                expect(['true', 'false']).toContain(button.getAttribute('aria-pressed'));
            });
        });

        it('should have "All" filter active by default', () => {
            const allButton = document.getElementById('filter-all');
            expect(allButton.classList.contains('active')).toBe(true);
            expect(allButton.getAttribute('aria-pressed')).toBe('true');
        });
    });

    describe('Filter State Changes', () => {
        /**
         * Requirements: 3.4 - Filter state changes should update display
         */
        it('should update filter button states when filter changes', async () => {
            // Change filter to 'talk'
            appState.setCurrentFilter('talk');
            await contentComponent.render();
            
            // Check button states
            const allButton = document.getElementById('filter-all');
            const talkButton = document.getElementById('filter-talks');
            
            expect(allButton.classList.contains('active')).toBe(false);
            expect(allButton.getAttribute('aria-pressed')).toBe('false');
            expect(talkButton.classList.contains('active')).toBe(true);
            expect(talkButton.getAttribute('aria-pressed')).toBe('true');
        });

        it('should filter content when filter is applied', async () => {
            // Apply talk filter
            appState.setCurrentFilter('talk');
            await contentComponent.render();
            
            const contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(1);
            
            const titleElement = contentCards[0].querySelector('.content-title');
            expect(titleElement.textContent).toBe('Test Talk');
        });

        it('should show all content when "all" filter is selected', async () => {
            // First apply a specific filter
            appState.setCurrentFilter('talk');
            await contentComponent.render();
            
            // Then switch back to all
            appState.setCurrentFilter('all');
            await contentComponent.render();
            
            const contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(3);
        });

        it('should reset to first page when filter changes', () => {
            // Set to page 2 first (if there were enough items)
            appState.setCurrentPage(2);
            
            // Change filter
            appState.setCurrentFilter('talk');
            
            // Should be back to page 1
            expect(appState.getCurrentPage()).toBe(1);
        });

        it('should show appropriate message when no content matches filter', async () => {
            // Apply a filter that won't match any content
            appState.setCurrentFilter('article'); // No articles in test data
            await contentComponent.render();
            
            const noContentMessage = mockContainer.querySelector('.no-content');
            expect(noContentMessage).toBeTruthy();
            expect(noContentMessage.textContent).toContain('article');
        });
    });

    describe('Filter Reset Functionality', () => {
        /**
         * Requirements: 3.3, 3.4 - Reset functionality should work
         */
        it('should reset filter to "all" when reset button is clicked', async () => {
            // First apply a specific filter
            appState.setCurrentFilter('blog');
            await contentComponent.render();
            
            // Click reset button
            const resetButton = document.getElementById('filter-reset');
            resetButton.click();
            
            // Should be back to 'all'
            expect(appState.getCurrentFilter()).toBe('all');
        });

        it('should show all content after reset', async () => {
            // Apply specific filter
            appState.setCurrentFilter('talk');
            await contentComponent.render();
            
            // Verify filtered content
            let contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(1);
            
            // Reset filter
            const resetButton = document.getElementById('filter-reset');
            resetButton.click();
            await contentComponent.render();
            
            // Should show all content
            contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(3);
        });

        it('should update button states after reset', async () => {
            // Apply specific filter
            appState.setCurrentFilter('whitepaper');
            await contentComponent.render();
            
            // Reset
            const resetButton = document.getElementById('filter-reset');
            resetButton.click();
            await contentComponent.render();
            
            // Check button states
            const allButton = document.getElementById('filter-all');
            const whitepaperButton = document.getElementById('filter-whitepapers');
            
            expect(allButton.classList.contains('active')).toBe(true);
            expect(allButton.getAttribute('aria-pressed')).toBe('true');
            expect(whitepaperButton.classList.contains('active')).toBe(false);
            expect(whitepaperButton.getAttribute('aria-pressed')).toBe('false');
        });
    });

    describe('Filter Integration with Pagination', () => {
        /**
         * Requirements: 3.4 - Filter state should persist during pagination
         */
        it('should maintain filter when navigating pages', () => {
            // Set a filter
            appState.setCurrentFilter('talk');
            
            // Change page (even though we don't have enough content for multiple pages in test)
            appState.setCurrentPage(1);
            
            // Filter should still be active
            expect(appState.getCurrentFilter()).toBe('talk');
        });

        it('should recalculate pagination when filter changes', async () => {
            // Add more content to test pagination
            const moreContent = [];
            for (let i = 4; i <= 10; i++) {
                moreContent.push({
                    id: `content-${i}`,
                    title: `Test Talk ${i}`,
                    type: 'talk',
                    publicationDate: `2024-01-${i.toString().padStart(2, '0')}`,
                    description: `Test talk description ${i}`,
                    externalLink: `https://example.com/talk${i}`
                });
            }
            
            appState.setContent([...appState.getContent(), ...moreContent]);
            
            // Apply talk filter - should have 8 talks total
            appState.setCurrentFilter('talk');
            
            // Should have 2 pages (6 items per page)
            expect(appState.getTotalPages()).toBe(2);
            
            // Switch to 'all' filter - should have more pages
            appState.setCurrentFilter('all');
            expect(appState.getTotalPages()).toBe(2); // 10 total items, 6 per page = 2 pages
        });
    });

    describe('Pagination System', () => {
        /**
         * Requirements: 3.1, 3.5 - Pagination should appear when more than 6 items and work correctly
         */
        it('should show pagination when more than 6 items', async () => {
            // Add more content to trigger pagination
            const moreContent = [];
            for (let i = 4; i <= 10; i++) {
                moreContent.push({
                    id: `content-${i}`,
                    title: `Test Content ${i}`,
                    type: 'blog',
                    publicationDate: `2024-01-${i.toString().padStart(2, '0')}`,
                    description: `Test content description ${i}`,
                    externalLink: `https://example.com/content${i}`
                });
            }
            
            appState.setContent([...appState.getContent(), ...moreContent]);
            await contentComponent.render();
            
            // Should have pagination controls
            const paginationControls = document.getElementById('pagination-controls');
            expect(paginationControls).toBeTruthy();
            
            const paginationButtons = paginationControls.querySelectorAll('.pagination-btn');
            expect(paginationButtons.length).toBeGreaterThan(0);
            
            // Should have Previous, page numbers, and Next buttons
            const prevButton = Array.from(paginationButtons).find(btn => btn.textContent.trim() === 'Previous');
            const nextButton = Array.from(paginationButtons).find(btn => btn.textContent.trim() === 'Next');
            expect(prevButton).toBeTruthy();
            expect(nextButton).toBeTruthy();
        });

        it('should not show pagination when 6 or fewer items', async () => {
            // Use default test data (3 items)
            await contentComponent.render();
            
            const paginationControls = document.getElementById('pagination-controls');
            expect(paginationControls.innerHTML.trim()).toBe('');
        });

        it('should update content display when page navigation occurs', async () => {
            // Add enough content for multiple pages
            const moreContent = [];
            for (let i = 4; i <= 15; i++) {
                moreContent.push({
                    id: `content-${i}`,
                    title: `Test Content ${i}`,
                    type: 'blog',
                    publicationDate: `2024-01-${i.toString().padStart(2, '0')}`,
                    description: `Test content description ${i}`,
                    externalLink: `https://example.com/content${i}`
                });
            }
            
            appState.setContent([...appState.getContent(), ...moreContent]);
            await contentComponent.render();
            
            // Should be on page 1 initially
            expect(appState.getCurrentPage()).toBe(1);
            let contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(6); // First page should have 6 items
            
            // Navigate to page 2
            appState.setCurrentPage(2);
            await contentComponent.render();
            
            expect(appState.getCurrentPage()).toBe(2);
            contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(6); // Second page should have 6 items
            
            // Navigate to page 3 (last page)
            appState.setCurrentPage(3);
            await contentComponent.render();
            
            expect(appState.getCurrentPage()).toBe(3);
            contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(3); // Last page should have remaining 3 items (15 total - 12 on first two pages)
        });

        it('should work correctly with filtered content', async () => {
            // Add more content with different types
            const moreContent = [];
            for (let i = 4; i <= 12; i++) {
                moreContent.push({
                    id: `content-${i}`,
                    title: `Test Talk ${i}`,
                    type: 'talk',
                    publicationDate: `2024-01-${i.toString().padStart(2, '0')}`,
                    description: `Test talk description ${i}`,
                    externalLink: `https://example.com/talk${i}`
                });
            }
            
            appState.setContent([...appState.getContent(), ...moreContent]);
            
            // Apply talk filter - should have 10 talks total (1 original + 9 new)
            appState.setCurrentFilter('talk');
            await contentComponent.render();
            
            // Should have 2 pages for talks (10 items, 6 per page)
            expect(appState.getTotalPages()).toBe(2);
            
            // First page should have 6 talks
            let contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(6);
            
            // All should be talks
            contentCards.forEach(card => {
                const typeElement = card.querySelector('.content-type');
                expect(typeElement.textContent.toLowerCase()).toBe('talk');
            });
            
            // Navigate to page 2
            appState.setCurrentPage(2);
            await contentComponent.render();
            
            // Second page should have 4 talks (remaining)
            contentCards = mockContainer.querySelectorAll('.content-card');
            expect(contentCards.length).toBe(4);
            
            // All should still be talks
            contentCards.forEach(card => {
                const typeElement = card.querySelector('.content-type');
                expect(typeElement.textContent.toLowerCase()).toBe('talk');
            });
        });

        it('should have proper ARIA labels on pagination buttons', async () => {
            // Add enough content for pagination
            const moreContent = [];
            for (let i = 4; i <= 10; i++) {
                moreContent.push({
                    id: `content-${i}`,
                    title: `Test Content ${i}`,
                    type: 'blog',
                    publicationDate: `2024-01-${i.toString().padStart(2, '0')}`,
                    description: `Test content description ${i}`,
                    externalLink: `https://example.com/content${i}`
                });
            }
            
            appState.setContent([...appState.getContent(), ...moreContent]);
            await contentComponent.render();
            
            const paginationButtons = document.querySelectorAll('.pagination-btn');
            
            // Check Previous button
            const prevButton = Array.from(paginationButtons).find(btn => btn.textContent.trim() === 'Previous');
            expect(prevButton.getAttribute('aria-label')).toBe('Previous page');
            
            // Check Next button
            const nextButton = Array.from(paginationButtons).find(btn => btn.textContent.trim() === 'Next');
            expect(nextButton.getAttribute('aria-label')).toBe('Next page');
            
            // Check page number buttons
            const pageButtons = Array.from(paginationButtons).filter(btn => 
                !['Previous', 'Next'].includes(btn.textContent.trim())
            );
            
            pageButtons.forEach(button => {
                const pageNum = button.textContent.trim();
                expect(button.getAttribute('aria-label')).toBe(`Page ${pageNum}`);
            });
        });

        it('should indicate current page with aria-current attribute', async () => {
            // Add enough content for pagination
            const moreContent = [];
            for (let i = 4; i <= 10; i++) {
                moreContent.push({
                    id: `content-${i}`,
                    title: `Test Content ${i}`,
                    type: 'blog',
                    publicationDate: `2024-01-${i.toString().padStart(2, '0')}`,
                    description: `Test content description ${i}`,
                    externalLink: `https://example.com/content${i}`
                });
            }
            
            appState.setContent([...appState.getContent(), ...moreContent]);
            await contentComponent.render();
            
            // Page 1 should be current
            const page1Button = Array.from(document.querySelectorAll('.pagination-btn')).find(btn => 
                btn.textContent.trim() === '1'
            );
            expect(page1Button.getAttribute('aria-current')).toBe('page');
            expect(page1Button.classList.contains('active')).toBe(true);
            
            // Navigate to page 2
            appState.setCurrentPage(2);
            await contentComponent.render();
            
            // Page 2 should now be current
            const page2Button = Array.from(document.querySelectorAll('.pagination-btn')).find(btn => 
                btn.textContent.trim() === '2'
            );
            expect(page2Button.getAttribute('aria-current')).toBe('page');
            expect(page2Button.classList.contains('active')).toBe(true);
            
            // Page 1 should no longer be current
            const newPage1Button = Array.from(document.querySelectorAll('.pagination-btn')).find(btn => 
                btn.textContent.trim() === '1'
            );
            expect(newPage1Button.getAttribute('aria-current')).toBeFalsy();
            expect(newPage1Button.classList.contains('active')).toBe(false);
        });

        it('should disable Previous button on first page and Next button on last page', async () => {
            // Add enough content for pagination
            const moreContent = [];
            for (let i = 4; i <= 10; i++) {
                moreContent.push({
                    id: `content-${i}`,
                    title: `Test Content ${i}`,
                    type: 'blog',
                    publicationDate: `2024-01-${i.toString().padStart(2, '0')}`,
                    description: `Test content description ${i}`,
                    externalLink: `https://example.com/content${i}`
                });
            }
            
            appState.setContent([...appState.getContent(), ...moreContent]);
            await contentComponent.render();
            
            // On first page, Previous should be disabled
            let prevButton = Array.from(document.querySelectorAll('.pagination-btn')).find(btn => 
                btn.textContent.trim() === 'Previous'
            );
            expect(prevButton.disabled).toBe(true);
            
            let nextButton = Array.from(document.querySelectorAll('.pagination-btn')).find(btn => 
                btn.textContent.trim() === 'Next'
            );
            expect(nextButton.disabled).toBe(false);
            
            // Navigate to last page
            const totalPages = appState.getTotalPages();
            appState.setCurrentPage(totalPages);
            await contentComponent.render();
            
            // On last page, Next should be disabled
            prevButton = Array.from(document.querySelectorAll('.pagination-btn')).find(btn => 
                btn.textContent.trim() === 'Previous'
            );
            expect(prevButton.disabled).toBe(false);
            
            nextButton = Array.from(document.querySelectorAll('.pagination-btn')).find(btn => 
                btn.textContent.trim() === 'Next'
            );
            expect(nextButton.disabled).toBe(true);
        });
    });
});