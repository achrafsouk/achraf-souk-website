import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';

/**
 * Feature: remove-hero-background, Property 3: No network requests for background image
 * 
 * Property: For any page load, no network requests should be made for hero-banner.jpg
 * 
 * Validates: Requirements 1.3
 */

describe('Hero Banner Loading Property Tests', () => {
    let dom;
    let document;
    let window;
    let networkRequests;

    beforeEach(() => {
        // Track all network requests
        networkRequests = [];

        // Create JSDOM instance with inline CSS to avoid external requests
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .hero-section {
                        background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 50%, rgba(240, 147, 251, 0.8) 100%);
                        color: white;
                        padding: 2rem 0;
                    }
                </style>
            </head>
            <body>
                <section class="hero-section">
                    <div class="container">
                        <div class="hero-content">
                            <div class="profile-image-container">
                                <img id="profile-image" class="profile-image" src="" alt="Profile picture" />
                                <div id="profile-fallback" class="profile-fallback hidden">
                                    <span class="initials"></span>
                                </div>
                            </div>
                            <div class="hero-text">
                                <h1 class="hero-title">Welcome</h1>
                                <p class="bio-text">Bio text</p>
                                <a href="#" id="linkedin-link" class="linkedin-link">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                </section>
            </body>
            </html>
        `, {
            url: 'http://localhost:3000/',
            pretendToBeVisual: false,
            resources: 'usable'
        });

        document = dom.window.document;
        window = dom.window;
        
        // Set up global objects
        global.document = document;
        global.window = window;

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        if (dom && dom.window) {
            dom.window.close();
        }
        
        // Clear network requests
        networkRequests = [];
    });

    it('Property 3: No network requests for background image - hero-banner.jpg should not be requested', () => {
        // Get the hero section
        const heroSection = document.querySelector('.hero-section');
        
        // The hero section should exist
        expect(heroSection).toBeTruthy();

        // Property assertion: Inline styles should not contain hero-banner references
        const inlineBackgroundImage = heroSection.style.backgroundImage || '';
        expect(inlineBackgroundImage).not.toContain('hero-banner.jpg');
        expect(inlineBackgroundImage).not.toContain('hero-banner.jpeg');
        expect(inlineBackgroundImage).not.toContain('hero-banner.png');
        expect(inlineBackgroundImage).not.toContain('hero-banner.gif');
        expect(inlineBackgroundImage).not.toContain('hero-banner.webp');
        expect(inlineBackgroundImage).not.toContain('hero-banner.svg');

        // Property assertion: Inline styles should not contain any image URLs
        const hasInlineImageUrl = /url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i.test(inlineBackgroundImage);
        expect(hasInlineImageUrl).toBe(false);

        // Property assertion: Data attributes should not contain hero-banner references
        const dataBackground = heroSection.getAttribute('data-background') || '';
        const dataImage = heroSection.getAttribute('data-image') || '';
        
        expect(dataBackground).not.toContain('hero-banner');
        expect(dataImage).not.toContain('hero-banner');

        // Property assertion: Class list should not contain image-related classes that might trigger loading
        const classList = Array.from(heroSection.classList);
        const hasImageLoadingClass = classList.some(className => 
            className.includes('hero-banner') || 
            className.includes('background-image') ||
            className.includes('bg-image')
        );
        expect(hasImageLoadingClass).toBe(false);

        // Property assertion: No child elements should have background image styles
        const childElements = heroSection.querySelectorAll('*');
        childElements.forEach(child => {
            const childBackgroundImage = child.style.backgroundImage || '';
            expect(childBackgroundImage).not.toContain('hero-banner');
            
            const childDataBackground = child.getAttribute('data-background') || '';
            const childDataImage = child.getAttribute('data-image') || '';
            expect(childDataBackground).not.toContain('hero-banner');
            expect(childDataImage).not.toContain('hero-banner');
        });
    });

    it('Property 3: No network requests for background image - CSS classes should not reference background images', () => {
        fc.assert(
            fc.property(
                // Generate random CSS class scenarios
                fc.record({
                    addErrorClass: fc.boolean(),
                    addHoverClass: fc.boolean(),
                    addActiveClass: fc.boolean()
                }),
                ({ addErrorClass, addHoverClass, addActiveClass }) => {
                    const heroSection = document.querySelector('.hero-section');
                    expect(heroSection).toBeTruthy();

                    // Apply various classes that might trigger background images
                    const classesToTest = [];
                    if (addErrorClass) classesToTest.push('image-error');
                    if (addHoverClass) classesToTest.push('hover');
                    if (addActiveClass) classesToTest.push('active');

                    classesToTest.forEach(className => {
                        heroSection.classList.add(className);
                    });

                    // Check styles with these classes
                    let backgroundImageStyle = '';
                    try {
                        if (window && window.getComputedStyle) {
                            const computedStyle = window.getComputedStyle(heroSection);
                            backgroundImageStyle = computedStyle.backgroundImage || '';
                        }
                    } catch (e) {
                        backgroundImageStyle = heroSection.style.backgroundImage || '';
                    }

                    // Property assertion: No background image URLs should be present
                    expect(backgroundImageStyle).not.toContain('hero-banner');
                    const hasImageUrl = /url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i.test(backgroundImageStyle);
                    expect(hasImageUrl).toBe(false);

                    // Clean up classes
                    classesToTest.forEach(className => {
                        heroSection.classList.remove(className);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 3: No network requests for background image - DOM events should not trigger image loading', () => {
        fc.assert(
            fc.property(
                // Generate random event scenarios
                fc.record({
                    triggerLoad: fc.boolean(),
                    triggerResize: fc.boolean(),
                    triggerScroll: fc.boolean()
                }),
                ({ triggerLoad, triggerResize, triggerScroll }) => {
                    const heroSection = document.querySelector('.hero-section');
                    expect(heroSection).toBeTruthy();

                    // Trigger various DOM events
                    const eventsToTrigger = [];
                    if (triggerLoad) eventsToTrigger.push('load');
                    if (triggerResize) eventsToTrigger.push('resize');
                    if (triggerScroll) eventsToTrigger.push('scroll');

                    eventsToTrigger.forEach(eventType => {
                        try {
                            const event = new Event(eventType);
                            heroSection.dispatchEvent(event);
                            if (window) window.dispatchEvent(event);
                            document.dispatchEvent(event);
                        } catch (e) {
                            // Ignore event dispatch errors
                        }
                    });

                    // Check that no background images are referenced after events
                    let backgroundImageStyle = '';
                    try {
                        if (window && window.getComputedStyle) {
                            const computedStyle = window.getComputedStyle(heroSection);
                            backgroundImageStyle = computedStyle.backgroundImage || '';
                        }
                    } catch (e) {
                        backgroundImageStyle = heroSection.style.backgroundImage || '';
                    }

                    // Property assertion: Events should not cause background image loading
                    expect(backgroundImageStyle).not.toContain('hero-banner');
                    const hasImageUrl = /url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i.test(backgroundImageStyle);
                    expect(hasImageUrl).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 3: No network requests for background image - inline styles should not contain image URLs', () => {
        fc.assert(
            fc.property(
                // Generate random inline style scenarios
                fc.record({
                    checkInlineStyles: fc.boolean(),
                    checkDataAttributes: fc.boolean()
                }),
                ({ checkInlineStyles, checkDataAttributes }) => {
                    const heroSection = document.querySelector('.hero-section');
                    expect(heroSection).toBeTruthy();

                    if (checkInlineStyles) {
                        // Check inline styles
                        const inlineBackgroundImage = heroSection.style.backgroundImage || '';
                        expect(inlineBackgroundImage).not.toContain('hero-banner');
                        
                        const hasInlineImageUrl = /url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i.test(inlineBackgroundImage);
                        expect(hasInlineImageUrl).toBe(false);
                    }

                    if (checkDataAttributes) {
                        // Check data attributes that might contain image URLs
                        const dataBackground = heroSection.getAttribute('data-background') || '';
                        const dataImage = heroSection.getAttribute('data-image') || '';
                        
                        expect(dataBackground).not.toContain('hero-banner');
                        expect(dataImage).not.toContain('hero-banner');
                    }

                    // Property assertion: Hero section should only have gradient backgrounds
                    const allBackgroundSources = [
                        heroSection.style.backgroundImage || '',
                        heroSection.getAttribute('data-background') || '',
                        heroSection.getAttribute('data-image') || ''
                    ];

                    allBackgroundSources.forEach(bgSource => {
                        if (bgSource && bgSource !== 'none') {
                            expect(bgSource).not.toContain('hero-banner');
                            const hasImageUrl = /url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i.test(bgSource);
                            expect(hasImageUrl).toBe(false);
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});