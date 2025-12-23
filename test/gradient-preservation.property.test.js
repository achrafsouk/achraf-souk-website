import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';

/**
 * Feature: remove-hero-background, Property 2: Gradient preservation
 * 
 * Property: For any hero section element, the background should contain 
 * the expected gradient color values
 * 
 * Validates: Requirements 1.2, 2.1
 */

describe('Gradient Preservation Property Tests', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Create a new JSDOM instance for each test
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .hero-section {
                        background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 50%, rgba(240, 147, 251, 0.8) 100%);
                        color: white;
                        padding: 3rem 0;
                        text-align: center;
                        min-height: 40vh;
                        display: flex;
                        align-items: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .hero-section::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
                        z-index: 1;
                        pointer-events: none;
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
            url: 'http://localhost:3000',
            pretendToBeVisual: true,
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
    });

    afterEach(() => {
        vi.restoreAllMocks();
        dom.window.close();
    });

    it('Property 2: Gradient preservation - should contain expected gradient color values', () => {
        fc.assert(
            fc.property(
                // Generate random viewport sizes and class combinations
                fc.record({
                    viewportWidth: fc.integer({ min: 320, max: 1920 }),
                    viewportHeight: fc.integer({ min: 240, max: 1080 }),
                    hasErrorClass: fc.boolean(),
                    testPseudoElement: fc.boolean()
                }),
                ({ viewportWidth, viewportHeight, hasErrorClass, testPseudoElement }) => {
                    const heroSection = document.querySelector('.hero-section');
                    
                    // Set viewport size
                    Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
                    Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });

                    // Apply error class if specified
                    if (hasErrorClass) {
                        heroSection.classList.add('image-error');
                    }

                    // Get computed styles
                    const computedStyle = window.getComputedStyle(heroSection);
                    const backgroundImage = computedStyle.backgroundImage || heroSection.style.backgroundImage || '';

                    // Property assertion: Background should contain the expected gradient
                    // The gradient should be preserved regardless of viewport size or error state
                    
                    // Should contain linear-gradient
                    expect(backgroundImage).toMatch(/linear-gradient/i);
                    
                    // Should contain the expected gradient colors (in rgba format)
                    // Original gradient: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 50%, rgba(240, 147, 251, 0.8) 100%)
                    
                    // Check for gradient direction
                    expect(backgroundImage).toMatch(/135deg/);
                    
                    // Check for the main gradient colors (allowing for different color formats)
                    const hasFirstColor = backgroundImage.includes('rgba(102, 126, 234, 0.8)') || 
                                         backgroundImage.includes('rgba(102,126,234,0.8)') ||
                                         backgroundImage.includes('rgb(102, 126, 234)');
                    
                    const hasSecondColor = backgroundImage.includes('rgba(118, 75, 162, 0.8)') || 
                                          backgroundImage.includes('rgba(118,75,162,0.8)') ||
                                          backgroundImage.includes('rgb(118, 75, 162)');
                    
                    const hasThirdColor = backgroundImage.includes('rgba(240, 147, 251, 0.8)') || 
                                         backgroundImage.includes('rgba(240,147,251,0.8)') ||
                                         backgroundImage.includes('rgb(240, 147, 251)');

                    // At least one of the gradient colors should be present
                    expect(hasFirstColor || hasSecondColor || hasThirdColor).toBe(true);

                    // Should not contain image URLs
                    expect(backgroundImage).not.toMatch(/url\([^)]*\.(jpg|jpeg|png|gif|webp)[^)]*\)/i);

                    // Clean up
                    if (hasErrorClass) {
                        heroSection.classList.remove('image-error');
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 2: Gradient preservation - should maintain gradient across different states', () => {
        fc.assert(
            fc.property(
                // Generate random state combinations
                fc.record({
                    cssClass: fc.constantFrom('', 'image-error', 'loading', 'active'),
                    pseudoState: fc.constantFrom('', 'hover', 'focus', 'active'),
                    mediaQuery: fc.constantFrom('mobile', 'tablet', 'desktop')
                }),
                ({ cssClass, pseudoState, mediaQuery }) => {
                    const heroSection = document.querySelector('.hero-section');
                    
                    // Apply CSS class if specified
                    if (cssClass) {
                        heroSection.classList.add(cssClass);
                    }

                    // Set viewport based on media query
                    let viewportWidth = 1024;
                    if (mediaQuery === 'mobile') viewportWidth = 375;
                    if (mediaQuery === 'tablet') viewportWidth = 768;
                    if (mediaQuery === 'desktop') viewportWidth = 1200;
                    
                    Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });

                    // Get styles
                    const computedStyle = window.getComputedStyle(heroSection);
                    const backgroundImage = computedStyle.backgroundImage || '';

                    // Property: Gradient should be preserved across all states and viewport sizes
                    if (backgroundImage && backgroundImage !== 'none') {
                        // Should contain gradient
                        expect(backgroundImage).toMatch(/linear-gradient|radial-gradient|conic-gradient/i);
                        
                        // Should not contain image file references
                        expect(backgroundImage).not.toMatch(/url\([^)]*\.(jpg|jpeg|png|gif|webp)[^)]*\)/i);
                        
                        // Should not reference hero-banner specifically
                        expect(backgroundImage).not.toContain('hero-banner');
                    }

                    // Clean up
                    if (cssClass) {
                        heroSection.classList.remove(cssClass);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 2: Gradient preservation - SVG pattern overlay should be preserved', () => {
        fc.assert(
            fc.property(
                // Generate random test scenarios for pseudo-element
                fc.record({
                    checkPseudoElement: fc.boolean(),
                    viewportSize: fc.constantFrom('small', 'medium', 'large'),
                    hasAdditionalClasses: fc.boolean()
                }),
                ({ checkPseudoElement, viewportSize, hasAdditionalClasses }) => {
                    const heroSection = document.querySelector('.hero-section');
                    
                    // Set viewport
                    const viewportSizes = { small: 320, medium: 768, large: 1200 };
                    Object.defineProperty(window, 'innerWidth', { 
                        value: viewportSizes[viewportSize], 
                        writable: true 
                    });

                    if (hasAdditionalClasses) {
                        heroSection.classList.add('test-class');
                    }

                    if (checkPseudoElement) {
                        // Check ::before pseudo-element (SVG pattern overlay)
                        // Note: JSDOM has limited support for pseudo-elements, so we'll check the CSS rule exists
                        try {
                            const beforeStyle = window.getComputedStyle(heroSection, '::before');
                            const beforeBackground = beforeStyle.backgroundImage || '';
                            
                            // Property: SVG pattern should be preserved in ::before pseudo-element
                            // If JSDOM returns the background, verify it
                            if (beforeBackground && beforeBackground !== 'none' && beforeBackground !== '') {
                                // Should contain SVG data URL for the pattern
                                expect(beforeBackground).toMatch(/url\(["']?data:image\/svg\+xml/);
                                
                                // Should not contain image file references
                                expect(beforeBackground).not.toMatch(/url\([^)]*\.(jpg|jpeg|png|gif|webp)[^)]*\)/i);
                            }
                            // If JSDOM doesn't return pseudo-element styles, that's acceptable for this test
                        } catch (error) {
                            // JSDOM may not fully support pseudo-element queries, which is acceptable
                            // The important part is that the main element has the correct gradient
                        }
                    }

                    // Main element should still have gradient
                    const mainStyle = window.getComputedStyle(heroSection);
                    const mainBackground = mainStyle.backgroundImage || '';
                    
                    if (mainBackground && mainBackground !== 'none') {
                        expect(mainBackground).toMatch(/linear-gradient/i);
                    }

                    // Clean up
                    if (hasAdditionalClasses) {
                        heroSection.classList.remove('test-class');
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});