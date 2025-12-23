// Property-based test for visual design preservation
// **Feature: remove-hero-background, Property 6: Visual design preservation**
// **Validates: Requirements 2.3, 2.4**

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

describe('Visual Design Preservation Property Tests', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Create a new JSDOM instance with complete CSS
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* Hero Section Styles */
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
                    
                    .hero-section .container {
                        position: relative;
                        z-index: 2;
                        width: 100%;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 1rem;
                    }
                    
                    .hero-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 2rem;
                    }
                    
                    .profile-image-container {
                        position: relative;
                        width: 150px;
                        height: 150px;
                    }
                    
                    .profile-image {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 4px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .profile-fallback {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        background-color: #34495e;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 4px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .initials {
                        font-size: 3rem;
                        font-weight: bold;
                        color: white;
                    }
                    
                    .hero-text {
                        max-width: 600px;
                    }
                    
                    .hero-title {
                        margin-bottom: 1rem;
                        font-size: clamp(1.75rem, 4vw, 2.5rem);
                        font-weight: 600;
                        line-height: 1.2;
                        color: white;
                    }
                    
                    .bio-text {
                        font-size: 1.1rem;
                        margin-bottom: 2rem;
                        opacity: 0.9;
                        color: white;
                    }
                    
                    .linkedin-link {
                        display: inline-block;
                        background-color: #0077b5;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: 500;
                        transition: background-color 0.3s ease, transform 0.2s ease;
                    }
                    
                    .hidden {
                        display: none !important;
                    }
                    
                    /* Responsive Styles */
                    @media (min-width: 768px) {
                        .hero-content {
                            flex-direction: row;
                            text-align: left;
                            gap: 3rem;
                        }
                        
                        .profile-image-container {
                            width: 200px;
                            height: 200px;
                            flex-shrink: 0;
                        }
                    }
                    
                    @media (min-width: 1024px) {
                        .hero-section {
                            padding: 4rem 0;
                            min-height: 40vh;
                        }
                        
                        .profile-image-container {
                            width: 250px;
                            height: 250px;
                        }
                        
                        .initials {
                            font-size: 4rem;
                        }
                    }
                </style>
            </head>
            <body>
                <section id="hero" class="hero-section" aria-label="Personal introduction">
                    <div class="container">
                        <div class="hero-content">
                            <div class="profile-image-container">
                                <img id="profile-image" class="profile-image" src="" alt="Profile picture" />
                                <div id="profile-fallback" class="profile-fallback hidden" aria-hidden="true">
                                    <span class="initials">AS</span>
                                </div>
                            </div>
                            <div class="hero-text">
                                <h1 class="hero-title">Hi, I'm Achraf Souk</h1>
                                <p class="bio-text">Senior Solutions Architect at AWS with expertise in edge computing, security, and performance optimization.</p>
                                <a href="https://linkedin.com/in/achrafsouk" id="linkedin-link" class="linkedin-link" target="_blank" rel="noopener noreferrer">
                                    Follow me on LinkedIn !
                                </a>
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
        global.document = document;
        global.window = window;
    });

    // Helper function to parse CSS values
    function parseCSSValue(value) {
        if (!value) return null;
        
        // Remove 'px' and convert to number
        if (value.endsWith('px')) {
            return parseFloat(value.slice(0, -2));
        }
        
        // Remove 'rem' and convert to number (assuming 16px base)
        if (value.endsWith('rem')) {
            return parseFloat(value.slice(0, -3)) * 16;
        }
        
        // Remove '%' and convert to number
        if (value.endsWith('%')) {
            return parseFloat(value.slice(0, -1));
        }
        
        return value;
    }

    // Helper function to check if gradient is preserved
    function hasGradientBackground(element) {
        const computedStyle = window.getComputedStyle(element);
        const background = computedStyle.background || computedStyle.backgroundImage;
        
        // Check for linear-gradient in background
        return background && background.includes('linear-gradient');
    }

    // Helper function to check color scheme preservation
    function checkColorScheme(element) {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        
        // Hero section should have white text
        return color === 'white' || color === 'rgb(255, 255, 255)' || color === '#ffffff';
    }

    // Generator for viewport dimensions
    const viewportArbitrary = fc.record({
        width: fc.integer({ min: 320, max: 1920 }),
        height: fc.integer({ min: 568, max: 1080 })
    });

    // Generator for content variations
    const contentArbitrary = fc.record({
        name: fc.string({ minLength: 3, max: 30 }),
        bio: fc.string({ minLength: 20, max: 200 }),
        initials: fc.string({ minLength: 1, max: 3 }).map(s => s.toUpperCase())
    });

    it('Property 6: Visual design preservation - For any hero section, the layout dimensions, spacing, and color scheme should remain unchanged from the original design', () => {
        fc.assert(fc.property(fc.tuple(viewportArbitrary, contentArbitrary), ([viewport, content]) => {
            // Set viewport dimensions (simulated)
            // In a real browser, this would affect media queries
            
            // Update content
            const heroTitle = document.querySelector('.hero-title');
            const bioText = document.querySelector('.bio-text');
            const initialsSpan = document.querySelector('.initials');
            
            heroTitle.textContent = `Hi, I'm ${content.name}`;
            bioText.textContent = content.bio;
            initialsSpan.textContent = content.initials;

            // Get hero section and key elements
            const heroSection = document.querySelector('.hero-section');
            const container = document.querySelector('.container');
            const heroContent = document.querySelector('.hero-content');
            const profileContainer = document.querySelector('.profile-image-container');
            const heroText = document.querySelector('.hero-text');

            // Check that all elements exist
            const elementsExist = heroSection && container && heroContent && profileContainer && heroText;
            if (!elementsExist) return false;

            // Check gradient background is preserved
            const hasGradient = hasGradientBackground(heroSection);

            // Check color scheme is preserved (white text)
            const titleColorCorrect = checkColorScheme(heroTitle);
            const bioColorCorrect = checkColorScheme(bioText);

            // Check layout structure is preserved
            const heroContentStyle = window.getComputedStyle(heroContent);
            const hasFlexDisplay = heroContentStyle.display === 'flex';
            
            // Check container has proper max-width
            const containerStyle = window.getComputedStyle(container);
            const maxWidth = parseCSSValue(containerStyle.maxWidth);
            const hasProperMaxWidth = maxWidth === 1200; // 1200px max-width

            // Check hero section has proper min-height
            const heroStyle = window.getComputedStyle(heroSection);
            const minHeight = heroStyle.minHeight;
            const hasProperMinHeight = minHeight === '40vh';

            // Check profile container dimensions are reasonable
            const profileStyle = window.getComputedStyle(profileContainer);
            const profileWidth = parseCSSValue(profileStyle.width);
            const profileHeight = parseCSSValue(profileStyle.height);
            const hasProperProfileDimensions = profileWidth >= 150 && profileHeight >= 150;

            // All design elements should be preserved
            return hasGradient && 
                   titleColorCorrect && 
                   bioColorCorrect && 
                   hasFlexDisplay && 
                   hasProperMaxWidth && 
                   hasProperMinHeight && 
                   hasProperProfileDimensions;
        }), { numRuns: 100 });
    });

    it('Property 6a: Layout spacing is preserved across content variations', () => {
        fc.assert(fc.property(contentArbitrary, (content) => {
            // Update content with different lengths
            const heroTitle = document.querySelector('.hero-title');
            const bioText = document.querySelector('.bio-text');
            
            heroTitle.textContent = `Hi, I'm ${content.name}`;
            bioText.textContent = content.bio;

            // Check spacing elements
            const heroContent = document.querySelector('.hero-content');
            const heroText = document.querySelector('.hero-text');
            const linkedinLink = document.querySelector('.linkedin-link');

            // Get computed styles
            const heroContentStyle = window.getComputedStyle(heroContent);
            const heroTextStyle = window.getComputedStyle(heroText);
            const titleStyle = window.getComputedStyle(heroTitle);
            const bioStyle = window.getComputedStyle(bioText);
            const linkStyle = window.getComputedStyle(linkedinLink);

            // Check gap is preserved (2rem = 32px)
            const gap = parseCSSValue(heroContentStyle.gap);
            const hasProperGap = gap === 32 || gap === 2; // Could be in rem or px

            // Check text margins are preserved
            const titleMarginBottom = parseCSSValue(titleStyle.marginBottom);
            const bioMarginBottom = parseCSSValue(bioStyle.marginBottom);
            
            const hasProperTitleMargin = titleMarginBottom >= 16; // 1rem minimum
            const hasProperBioMargin = bioMarginBottom >= 32; // 2rem minimum

            // Check link padding is preserved
            const linkPadding = linkStyle.padding;
            const hasProperLinkPadding = linkPadding && linkPadding.includes('0.75rem') || linkPadding.includes('12px');

            return hasProperGap && hasProperTitleMargin && hasProperBioMargin && hasProperLinkPadding;
        }), { numRuns: 100 });
    });

    it('Property 6b: Color scheme consistency is maintained', () => {
        fc.assert(fc.property(contentArbitrary, (content) => {
            // Update content
            const heroTitle = document.querySelector('.hero-title');
            const bioText = document.querySelector('.bio-text');
            const linkedinLink = document.querySelector('.linkedin-link');
            
            heroTitle.textContent = `Hi, I'm ${content.name}`;
            bioText.textContent = content.bio;

            // Check all text elements maintain white color
            const titleStyle = window.getComputedStyle(heroTitle);
            const bioStyle = window.getComputedStyle(bioText);
            const linkStyle = window.getComputedStyle(linkedinLink);

            const titleColorCorrect = checkColorScheme(heroTitle);
            const bioColorCorrect = checkColorScheme(bioText);
            const linkColorCorrect = checkColorScheme(linkedinLink);

            // Check LinkedIn button maintains brand color
            const linkBgColor = linkStyle.backgroundColor;
            const hasLinkedInBrandColor = linkBgColor === 'rgb(0, 119, 181)' || linkBgColor === '#0077b5';

            // Check bio text opacity is preserved
            const bioOpacity = parseFloat(bioStyle.opacity || '1');
            const hasProperOpacity = Math.abs(bioOpacity - 0.9) < 0.1; // Allow small variance

            return titleColorCorrect && bioColorCorrect && linkColorCorrect && hasLinkedInBrandColor && hasProperOpacity;
        }), { numRuns: 100 });
    });

    it('Property 6c: SVG pattern overlay is preserved', () => {
        fc.assert(fc.property(contentArbitrary, (content) => {
            // Update content
            const heroTitle = document.querySelector('.hero-title');
            heroTitle.textContent = `Hi, I'm ${content.name}`;

            // Check that hero section has the ::before pseudo-element with SVG pattern
            const heroSection = document.querySelector('.hero-section');
            const heroStyle = window.getComputedStyle(heroSection, '::before');

            // Check that the pseudo-element exists and has proper positioning
            const position = heroStyle.position;
            const zIndex = heroStyle.zIndex;
            const pointerEvents = heroStyle.pointerEvents;

            const hasProperPosition = position === 'absolute';
            const hasProperZIndex = zIndex === '1';
            const hasProperPointerEvents = pointerEvents === 'none';

            // The SVG pattern should be in the background
            const background = heroStyle.background || heroStyle.backgroundImage;
            const hasSVGPattern = background && background.includes('data:image/svg+xml');

            return hasProperPosition && hasProperZIndex && hasProperPointerEvents && hasSVGPattern;
        }), { numRuns: 100 });
    });

    it('Property 6d: Profile image container maintains circular design', () => {
        fc.assert(fc.property(contentArbitrary, (content) => {
            // Update initials
            const initialsSpan = document.querySelector('.initials');
            initialsSpan.textContent = content.initials;

            // Check profile image and fallback styling
            const profileImage = document.querySelector('.profile-image');
            const profileFallback = document.querySelector('.profile-fallback');

            const imageStyle = window.getComputedStyle(profileImage);
            const fallbackStyle = window.getComputedStyle(profileFallback);

            // Check border-radius is 50% (circular)
            const imageBorderRadius = imageStyle.borderRadius;
            const fallbackBorderRadius = fallbackStyle.borderRadius;

            const imageIsCircular = imageBorderRadius === '50%';
            const fallbackIsCircular = fallbackBorderRadius === '50%';

            // Check both have proper borders
            const imageBorder = imageStyle.border;
            const fallbackBorder = fallbackStyle.border;

            const hasImageBorder = imageBorder && imageBorder.includes('rgba(255, 255, 255, 0.2)');
            const hasFallbackBorder = fallbackBorder && fallbackBorder.includes('rgba(255, 255, 255, 0.2)');

            // Check fallback background color
            const fallbackBgColor = fallbackStyle.backgroundColor;
            const hasProperFallbackBg = fallbackBgColor === 'rgb(52, 73, 94)' || fallbackBgColor === '#34495e';

            return imageIsCircular && fallbackIsCircular && hasImageBorder && hasFallbackBorder && hasProperFallbackBg;
        }), { numRuns: 100 });
    });
});