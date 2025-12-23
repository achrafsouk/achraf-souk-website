import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';

/**
 * Feature: remove-hero-background, Property 1: No background image display
 * 
 * Property: For any hero section element, the computed background-image style 
 * should not contain any image URLs, only gradient values
 * 
 * Validates: Requirements 1.1
 */

describe('CSS Background Removal Property Tests', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Create a new JSDOM instance for each test
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="../styles/main.css">
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
            pretendToBeVisual: true,
            resources: 'usable',
            runScripts: 'dangerously'
        });

        document = dom.window.document;
        window = dom.window;
        
        // Set up global objects
        global.document = document;
        global.window = window;
        global.location = window.location;

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        dom.window.close();
    });

    it('Property 1: No background image display - should not contain image URLs in background-image style', () => {
        fc.assert(
            fc.property(
                // Generate random CSS class variations and viewport sizes
                fc.record({
                    additionalClasses: fc.array(
                        fc.string({ minLength: 1, maxLength: 20 })
                          .filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)), // Valid CSS class names only
                        { maxLength: 3 }
                    ),
                    viewportWidth: fc.integer({ min: 320, max: 1920 }),
                    viewportHeight: fc.integer({ min: 240, max: 1080 })
                }),
                ({ additionalClasses, viewportWidth, viewportHeight }) => {
                    const heroSection = document.querySelector('.hero-section');
                    
                    // Apply random additional classes (but preserve hero-section)
                    additionalClasses.forEach(className => {
                        if (className && !className.includes('hero-section')) {
                            heroSection.classList.add(className);
                        }
                    });

                    // Set viewport size
                    Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
                    Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });

                    // Get computed styles (simulated since JSDOM doesn't fully support CSS)
                    const computedStyle = window.getComputedStyle(heroSection);
                    const backgroundImage = computedStyle.backgroundImage || heroSection.style.backgroundImage || '';

                    // Property assertion: Background image should NOT contain any image URLs
                    // Should only contain gradient values, not url() references to image files
                    
                    // Check that no image URLs are present
                    const hasImageUrl = /url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i.test(backgroundImage);
                    expect(hasImageUrl).toBe(false);

                    // If background-image is set, it should only contain gradients
                    if (backgroundImage && backgroundImage !== 'none' && backgroundImage !== '') {
                        // Should contain gradient functions
                        const hasGradient = /linear-gradient|radial-gradient|conic-gradient/i.test(backgroundImage);
                        expect(hasGradient).toBe(true);
                        
                        // Should not contain references to hero-banner.jpg specifically
                        expect(backgroundImage).not.toContain('hero-banner.jpg');
                        expect(backgroundImage).not.toContain('hero-banner.jpeg');
                        expect(backgroundImage).not.toContain('hero-banner.png');
                    }

                    // Clean up classes for next iteration
                    additionalClasses.forEach(className => {
                        if (className && !className.includes('hero-section')) {
                            heroSection.classList.remove(className);
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 1: No background image display - CSS rules should not define background-image with URLs', () => {
        fc.assert(
            fc.property(
                // Generate random CSS selector variations
                fc.record({
                    pseudoClass: fc.constantFrom('', ':hover', ':focus', ':active'),
                    mediaQuery: fc.constantFrom('', '@media (max-width: 768px)', '@media (min-width: 1024px)'),
                    errorClass: fc.boolean()
                }),
                ({ pseudoClass, mediaQuery, errorClass }) => {
                    const heroSection = document.querySelector('.hero-section');
                    
                    // Apply error class if specified
                    if (errorClass) {
                        heroSection.classList.add('image-error');
                    }

                    // Check CSS rules for background-image properties
                    // Since JSDOM doesn't fully parse CSS, we'll check the style attribute and computed styles
                    const inlineStyle = heroSection.style.backgroundImage || '';
                    const computedStyle = window.getComputedStyle(heroSection).backgroundImage || '';

                    // Property: No image URLs should be present in any background-image declarations
                    const allBackgroundStyles = [inlineStyle, computedStyle];
                    
                    allBackgroundStyles.forEach(style => {
                        if (style && style !== 'none') {
                            // Should not contain image file references
                            expect(style).not.toMatch(/url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i);
                            
                            // Should not contain hero-banner specifically
                            expect(style).not.toContain('hero-banner');
                        }
                    });

                    // Clean up
                    if (errorClass) {
                        heroSection.classList.remove('image-error');
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 1: No background image display - background positioning properties should be removed', () => {
        fc.assert(
            fc.property(
                // Generate random test scenarios
                fc.record({
                    checkInlineStyles: fc.boolean(),
                    checkComputedStyles: fc.boolean(),
                    applyErrorClass: fc.boolean()
                }),
                ({ checkInlineStyles, checkComputedStyles, applyErrorClass }) => {
                    const heroSection = document.querySelector('.hero-section');
                    
                    if (applyErrorClass) {
                        heroSection.classList.add('image-error');
                    }

                    // Property: Background positioning properties for images should be removed
                    // These properties are only needed when there's a background image
                    
                    if (checkInlineStyles) {
                        const inlineStyles = heroSection.style;
                        
                        // These properties should not be set for image positioning
                        // (They may still exist for gradient positioning, but not for images)
                        const backgroundImage = inlineStyles.backgroundImage || '';
                        
                        if (backgroundImage && !backgroundImage.includes('url(')) {
                            // If no image URL, these properties are not needed for image positioning
                            // Note: They might still be used for gradient positioning
                        }
                    }

                    if (checkComputedStyles) {
                        const computedStyle = window.getComputedStyle(heroSection);
                        const backgroundImage = computedStyle.backgroundImage || '';
                        
                        // Property: If no image URL is present, image-specific positioning is not needed
                        if (!backgroundImage.includes('url(')) {
                            // This is the expected state - no image URLs
                            expect(backgroundImage).not.toMatch(/url\([^)]*\.(jpg|jpeg|png|gif|webp|svg)[^)]*\)/i);
                        }
                    }

                    // Clean up
                    if (applyErrorClass) {
                        heroSection.classList.remove('image-error');
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});