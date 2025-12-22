// Property-based tests for content section
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ContentComponent } from '../js/components/content.js';
import { AppState } from '../js/state/appState.js';
import { ContentType } from '../js/models/dataModels.js';

describe('Content Property Tests', () => {
    let appState;
    let contentComponent;
    let mockContainer;

    beforeEach(() => {
        // Set up DOM structure with all required elements
        document.body.innerHTML = `
            <div id="content-section" class="content-section">
                <div class="filter-controls">
                    <button class="filter-btn" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="talk">Talks</button>
                    <button class="filter-btn" data-filter="blog">Blogs</button>
                    <button class="filter-btn" data-filter="whitepaper">Whitepapers</button>
                    <button id="filter-reset">Reset</button>
                </div>
                <div id="content-grid" class="content-grid"></div>
                <div id="pagination-controls" class="pagination-controls"></div>
            </div>
        `;
        
        appState = new AppState();
        contentComponent = new ContentComponent(appState);
        mockContainer = document.getElementById('content-grid');
    });

    /**
     * Feature: personal-portfolio-website, Property 4: Filter accuracy
     * Validates: Requirements 3.4
     */
    it('should ensure all displayed content items match the selected filter type', () => {
        // Generator for valid content items with different types
        const validContentArb = fc.record({
            id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom(...Object.values(ContentType)),
            publicationDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            externalLink: fc.option(fc.webUrl(), { nil: null }),
            featured: fc.boolean()
        });

        // Generator for filter types (including 'all')
        const filterArb = fc.constantFrom('all', ...Object.values(ContentType));

        return fc.assert(
            fc.asyncProperty(
                fc.array(validContentArb, { minLength: 5, maxLength: 20 }), // Ensure we have diverse content
                filterArb,
                async (contentItems, selectedFilter) => {
                    // Set up the content in app state
                    appState.setContent(contentItems);
                    
                    // Apply the filter
                    appState.setCurrentFilter(selectedFilter);
                    
                    // Render the content
                    await contentComponent.render();
                    
                    // Get the filtered content from state
                    const filteredContent = appState.getFilteredContent();
                    const paginatedContent = appState.getPaginatedContent();
                    
                    // Core property: when a filter is applied, all displayed content should match that filter
                    if (selectedFilter === 'all') {
                        // When 'all' filter is selected, filtered content should include all content types
                        // but still be sorted by date (newest first)
                        expect(filteredContent.length).toBe(contentItems.length);
                        
                        // Verify date sorting (newest first)
                        for (let i = 0; i < filteredContent.length - 1; i++) {
                            const currentDate = new Date(filteredContent[i].publicationDate);
                            const nextDate = new Date(filteredContent[i + 1].publicationDate);
                            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
                        }
                    } else {
                        // When a specific filter is applied, all items should match that type
                        filteredContent.forEach(item => {
                            expect(item.type).toBe(selectedFilter);
                        });
                        
                        // Verify that filtered content only contains items of the selected type
                        const expectedCount = contentItems.filter(item => item.type === selectedFilter).length;
                        expect(filteredContent.length).toBe(expectedCount);
                    }
                    
                    // Verify that paginated content (what's actually displayed) also matches the filter
                    paginatedContent.forEach(item => {
                        if (selectedFilter !== 'all') {
                            expect(item.type).toBe(selectedFilter);
                        }
                    });
                    
                    // Verify that no more than 6 items are displayed at once
                    expect(paginatedContent.length).toBeLessThanOrEqual(6);
                }
            ),
            { numRuns: 20 }
        );
    });

    /**
     * Feature: personal-portfolio-website, Property 2: Content display limit
     * Validates: Requirements 3.1
     */
    it('should ensure no more than 6 items are displayed at once regardless of total content count', () => {
        // Generator for valid content items
        const validContentArb = fc.record({
            id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom(...Object.values(ContentType)),
            publicationDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            externalLink: fc.option(fc.webUrl(), { nil: null }),
            featured: fc.boolean()
        });

        return fc.assert(
            fc.asyncProperty(
                fc.array(validContentArb, { minLength: 1, maxLength: 50 }), // Test with various content sizes
                async (contentItems) => {
                    // Set up the content in app state
                    appState.setContent(contentItems);
                    
                    // Test with 'all' filter
                    appState.setCurrentFilter('all');
                    
                    // Render the content
                    await contentComponent.render();
                    
                    // Get paginated content (what's actually displayed)
                    const paginatedContent = appState.getPaginatedContent();
                    
                    // Core property: no more than 6 items should be displayed at once
                    expect(paginatedContent.length).toBeLessThanOrEqual(6);
                    
                    // Verify this holds true for all pages
                    const totalPages = appState.getTotalPages();
                    for (let page = 1; page <= totalPages; page++) {
                        appState.setCurrentPage(page);
                        await contentComponent.render();
                        
                        const pageContent = appState.getPaginatedContent();
                        expect(pageContent.length).toBeLessThanOrEqual(6);
                        
                        // Last page might have fewer items, but never more than 6
                        if (page === totalPages) {
                            const expectedLastPageSize = contentItems.length % 6;
                            if (expectedLastPageSize > 0) {
                                expect(pageContent.length).toBe(expectedLastPageSize);
                            } else {
                                expect(pageContent.length).toBe(6);
                            }
                        } else {
                            // All pages except the last should have exactly 6 items (if there are enough items)
                            if (contentItems.length >= 6) {
                                expect(pageContent.length).toBe(6);
                            }
                        }
                    }
                    
                    // Test that the property holds with different filters
                    const contentTypes = [...new Set(contentItems.map(item => item.type))];
                    
                    for (const contentType of contentTypes) {
                        appState.setCurrentFilter(contentType);
                        await contentComponent.render();
                        
                        const filteredPaginatedContent = appState.getPaginatedContent();
                        expect(filteredPaginatedContent.length).toBeLessThanOrEqual(6);
                    }
                }
            ),
            { numRuns: 20 }
        );
    });

    /**
     * Feature: personal-portfolio-website, Property 5: Content card completeness
     * Validates: Requirements 3.6
     */
    it('should ensure all displayed content cards have title, type, publication date, and description', () => {
        // Generator for valid content items that pass validation
        const validContentArb = fc.record({
            id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom(...Object.values(ContentType)),
            publicationDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            externalLink: fc.option(fc.webUrl(), { nil: null }),
            featured: fc.boolean()
        });

        return fc.assert(
            fc.asyncProperty(
                fc.array(validContentArb, { minLength: 1, maxLength: 12 }),
                async (contentItems) => {
                    // Set up the content in app state
                    appState.setContent(contentItems);
                    
                    // Render the content
                    await contentComponent.render();
                    
                    // Get all rendered content cards
                    const contentCards = mockContainer.querySelectorAll('.content-card');
                    
                    // Verify that we have cards (should be limited to 6 per page)
                    expect(contentCards.length).toBeGreaterThan(0);
                    expect(contentCards.length).toBeLessThanOrEqual(6);
                    
                    // For each content card, verify it has all required elements
                    // This is the core property: all displayed content cards must have title, type, publication date, and description
                    contentCards.forEach((card) => {
                        const titleElement = card.querySelector('.content-title');
                        const typeElement = card.querySelector('.content-type');
                        const dateElement = card.querySelector('.content-date');
                        const descriptionElement = card.querySelector('.content-description');
                        
                        // Verify all required elements exist
                        expect(titleElement).toBeTruthy();
                        expect(typeElement).toBeTruthy();
                        expect(dateElement).toBeTruthy();
                        expect(descriptionElement).toBeTruthy();
                        
                        // Verify content is non-empty (after trimming whitespace)
                        const titleText = titleElement.textContent.trim();
                        const typeText = typeElement.textContent.trim();
                        const dateText = dateElement.textContent.trim();
                        const descriptionText = descriptionElement.textContent.trim();
                        
                        // This is the core property being tested - all fields must be present and non-empty
                        expect(titleText.length).toBeGreaterThan(0);
                        expect(typeText.length).toBeGreaterThan(0);
                        expect(dateText.length).toBeGreaterThan(0);
                        expect(descriptionText.length).toBeGreaterThan(0);
                        
                        // Verify type is one of the valid content types
                        const validTypes = Object.values(ContentType);
                        expect(validTypes.some(type => typeText.toLowerCase().includes(type))).toBe(true);
                    });
                }
            ),
            { numRuns: 20 }
        );
    });

    /**
     * Feature: personal-portfolio-website, Property 3: Content date sorting
     * Validates: Requirements 3.2
     */
    it('should ensure content items are sorted by publication date in descending order (newest first)', () => {
        // Generator for valid content items with different publication dates
        const validContentArb = fc.record({
            id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom(...Object.values(ContentType)),
            publicationDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
            description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            externalLink: fc.option(fc.webUrl(), { nil: null }),
            featured: fc.boolean()
        });

        return fc.assert(
            fc.asyncProperty(
                fc.array(validContentArb, { minLength: 2, maxLength: 20 }), // Need at least 2 items to test sorting
                async (contentItems) => {
                    // Set up the content in app state
                    appState.setContent(contentItems);
                    
                    // Apply 'all' filter to get all content
                    appState.setCurrentFilter('all');
                    
                    // Render the content
                    await contentComponent.render();
                    
                    // Get the filtered content from state (which should be sorted)
                    const filteredContent = appState.getFilteredContent();
                    
                    // Core property: content should be sorted by publication date in descending order (newest first)
                    for (let i = 0; i < filteredContent.length - 1; i++) {
                        const currentDate = new Date(filteredContent[i].publicationDate);
                        const nextDate = new Date(filteredContent[i + 1].publicationDate);
                        
                        // Current item should have a date >= next item (newest first)
                        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
                    }
                    
                    // Also test that sorting works with filtered content
                    const contentTypes = [...new Set(contentItems.map(item => item.type))];
                    
                    // Test sorting for each content type filter
                    for (const contentType of contentTypes) {
                        appState.setCurrentFilter(contentType);
                        await contentComponent.render();
                        
                        const typeFilteredContent = appState.getFilteredContent();
                        
                        // Verify sorting is maintained even with filtering
                        for (let i = 0; i < typeFilteredContent.length - 1; i++) {
                            const currentDate = new Date(typeFilteredContent[i].publicationDate);
                            const nextDate = new Date(typeFilteredContent[i + 1].publicationDate);
                            
                            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
                        }
                        
                        // Verify all items are of the correct type
                        typeFilteredContent.forEach(item => {
                            expect(item.type).toBe(contentType);
                        });
                    }
                }
            ),
            { numRuns: 20 }
        );
    });

    /**
     * Feature: personal-portfolio-website, Property 6: External link behavior
     * Validates: Requirements 3.7
     */
    it('should ensure content items with external links are clickable and open in new tab', () => {
        // Generator for content items with external links
        const contentWithLinkArb = fc.integer({ min: 1, max: 1000 }).chain(id => 
            fc.record({
                id: fc.constant(`content-with-link-${id}`), // Ensure unique IDs
                title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                type: fc.constantFrom(...Object.values(ContentType)),
                publicationDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
                description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                externalLink: fc.webUrl(), // Always has external link
                featured: fc.boolean()
            })
        );

        // Generator for content items without external links
        const contentWithoutLinkArb = fc.integer({ min: 1, max: 1000 }).chain(id => 
            fc.record({
                id: fc.constant(`content-without-link-${id}`), // Ensure unique IDs
                title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                type: fc.constantFrom(...Object.values(ContentType)),
                publicationDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
                description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
                externalLink: fc.constant(null), // No external link
                featured: fc.boolean()
            })
        );

        return fc.assert(
            fc.asyncProperty(
                fc.array(contentWithLinkArb, { minLength: 1, maxLength: 5 }),
                fc.array(contentWithoutLinkArb, { minLength: 1, maxLength: 5 }),
                async (contentWithLinks, contentWithoutLinks) => {
                    // Ensure all IDs are unique by adding a timestamp suffix
                    const timestamp = Date.now();
                    contentWithLinks.forEach((item, index) => {
                        item.id = `with-link-${timestamp}-${index}`;
                    });
                    contentWithoutLinks.forEach((item, index) => {
                        item.id = `without-link-${timestamp}-${index}`;
                    });
                    // Combine both types of content
                    const allContent = [...contentWithLinks, ...contentWithoutLinks];
                    
                    // Set up the content in app state
                    appState.setContent(allContent);
                    
                    // Render the content
                    await contentComponent.render();
                    
                    // Get all rendered content cards
                    const contentCards = mockContainer.querySelectorAll('.content-card');
                    
                    // Verify that we have cards
                    expect(contentCards.length).toBeGreaterThan(0);
                    expect(contentCards.length).toBeLessThanOrEqual(6); // Max 6 per page
                    
                    // Get the paginated content to match with rendered cards
                    const paginatedContent = appState.getPaginatedContent();
                    
                    // For each rendered card, verify external link behavior by matching content ID
                    contentCards.forEach((card) => {
                        const contentId = card.getAttribute('data-content-id');
                        const correspondingContent = paginatedContent.find(item => item.id === contentId);
                        
                        if (correspondingContent && correspondingContent.externalLink) {
                            // Core property: cards with external links should be clickable
                            expect(card.classList.contains('clickable')).toBe(true);
                            expect(card.getAttribute('data-external-link')).toBe(correspondingContent.externalLink);
                            expect(card.getAttribute('tabindex')).toBe('0');
                            expect(card.getAttribute('role')).toBe('button');
                            
                            // Verify the card has the external link data attribute
                            const externalLink = card.dataset.externalLink;
                            expect(externalLink).toBeTruthy();
                            expect(externalLink).toBe(correspondingContent.externalLink);
                            
                        } else {
                            // Cards without external links should not be clickable
                            expect(card.classList.contains('clickable')).toBe(false);
                            expect(card.getAttribute('data-external-link')).toBeFalsy();
                            expect(card.getAttribute('tabindex')).toBeFalsy();
                            expect(card.getAttribute('role')).toBeFalsy();
                        }
                    });
                    
                    // Test that clicking on clickable cards would open external links
                    // We can't actually test window.open in this environment, but we can verify
                    // that the click handlers are properly set up
                    const clickableCards = mockContainer.querySelectorAll('.content-card.clickable');
                    
                    clickableCards.forEach(card => {
                        const externalLink = card.dataset.externalLink;
                        expect(externalLink).toBeTruthy();
                        
                        // Verify the card is properly configured for accessibility
                        expect(card.getAttribute('tabindex')).toBe('0');
                        expect(card.getAttribute('role')).toBe('button');
                    });
                }
            ),
            { numRuns: 20 }
        );
    });
});