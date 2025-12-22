import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';
import { HeroComponent } from '../js/components/hero.js';
import { AppState } from '../js/state/appState.js';

/**
 * Feature: website-deployment-fix, Property 6: Hero banner image loading
 * 
 * Property: For any deployed website, the hero section should display the background image 
 * without 404 errors and the image URL should resolve to an existing asset
 * 
 * Validates: Requirements 1.4, 4.3
 */

describe('Hero Banner Image Loading Property Tests', () => {
    let dom;
    let document;
    let window;
    let appState;

    beforeEach(() => {
        // Create a new JSDOM instance for each test
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
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
        global.Image = window.Image;

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Create app state with mock data
        appState = new AppState();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        dom.window.close();
    });

    it('Property 6: Hero banner image loading - should set background image and test image loading for any profile data', () => {
        fc.assert(
            fc.property(
                // Generate random profile data
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }),
                    bio: fc.string({ minLength: 10, maxLength: 200 }),
                    profileImage: fc.record({
                        src: fc.webUrl(),
                        alt: fc.string({ minLength: 1, maxLength: 100 }),
                        fallbackInitials: fc.string({ minLength: 1, maxLength: 3 })
                    }),
                    linkedinUrl: fc.webUrl()
                }),
                (profileData) => {
                    // Set up app state with generated profile data
                    appState.profile = profileData;

                    // Track image creation and src setting
                    let imageCreated = false;
                    let imageSrcSet = false;
                    let capturedSrc = '';

                    const mockImage = {
                        onload: null,
                        onerror: null,
                        set src(value) {
                            imageSrcSet = true;
                            capturedSrc = value;
                        }
                    };

                    global.Image = vi.fn(() => {
                        imageCreated = true;
                        return mockImage;
                    });

                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    const heroSection = document.querySelector('.hero-section');

                    // Property assertions:
                    // 1. Hero section should exist and be properly initialized
                    expect(heroSection).toBeTruthy();
                    expect(heroComponent.heroSection).toBe(heroSection);

                    // 2. Background image should be set dynamically via JavaScript
                    const backgroundImage = heroSection.style.backgroundImage;
                    expect(backgroundImage).toBeTruthy();
                    expect(backgroundImage).toContain('linear-gradient');
                    expect(backgroundImage).toContain('url(');

                    // 3. Image loading test should be initiated
                    expect(imageCreated).toBe(true);
                    expect(imageSrcSet).toBe(true);
                    expect(capturedSrc).toBeTruthy();
                    expect(typeof capturedSrc).toBe('string');

                    // 4. Image should have proper event handlers for success/failure
                    expect(mockImage.onload).toBeTypeOf('function');
                    expect(mockImage.onerror).toBeTypeOf('function');

                    // Test successful image loading
                    mockImage.onload();
                    expect(heroSection.classList.contains('image-error')).toBe(false);

                    // Reset and test failed image loading
                    heroSection.classList.remove('image-error');
                    mockImage.onerror();
                    expect(heroSection.classList.contains('image-error')).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 6: Hero banner image URL validation - should use valid asset URL format', () => {
        fc.assert(
            fc.property(
                // Generate random profile configurations
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 30 }),
                    bio: fc.string({ minLength: 5, maxLength: 100 }),
                    profileImage: fc.record({
                        src: fc.webUrl(),
                        alt: fc.string({ minLength: 1, maxLength: 50 }),
                        fallbackInitials: fc.string({ minLength: 1, maxLength: 2 })
                    }),
                    linkedinUrl: fc.webUrl()
                }),
                (profileData) => {
                    appState.profile = profileData;

                    let capturedImageSrc = '';
                    const mockImage = {
                        onload: null,
                        onerror: null,
                        set src(value) {
                            capturedImageSrc = value;
                        }
                    };

                    global.Image = vi.fn(() => mockImage);

                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    const heroSection = document.querySelector('.hero-section');

                    // Property: The image URL should be a valid string that could resolve to an asset
                    expect(capturedImageSrc).toBeTruthy();
                    expect(typeof capturedImageSrc).toBe('string');
                    expect(capturedImageSrc.length).toBeGreaterThan(0);
                    // Should use the images directory path
                    expect(capturedImageSrc).toBe('./images/hero-banner.jpg');

                    // The background image should be properly formatted
                    const backgroundImage = heroSection.style.backgroundImage;
                    
                    // Should contain both gradient and image URL
                    expect(backgroundImage).toContain('linear-gradient');
                    expect(backgroundImage).toContain('url(');
                    expect(backgroundImage).toContain('./images/hero-banner.jpg');
                    expect(backgroundImage).toContain('rgba(102, 126, 234, 0.8)'); // Part of the gradient
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 6: Hero banner fallback behavior - should handle image loading failures gracefully', () => {
        fc.assert(
            fc.property(
                // Generate random failure scenarios
                fc.record({
                    profileData: fc.record({
                        name: fc.string({ minLength: 1, maxLength: 40 }),
                        bio: fc.string({ minLength: 1, maxLength: 150 }),
                        profileImage: fc.record({
                            src: fc.webUrl(),
                            alt: fc.string({ minLength: 1, maxLength: 60 }),
                            fallbackInitials: fc.string({ minLength: 1, maxLength: 3 })
                        }),
                        linkedinUrl: fc.webUrl()
                    }),
                    shouldImageFail: fc.boolean()
                }),
                ({ profileData, shouldImageFail }) => {
                    appState.profile = profileData;

                    const mockImage = {
                        onload: null,
                        onerror: null,
                        src: ''
                    };

                    global.Image = vi.fn(() => mockImage);

                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    const heroSection = document.querySelector('.hero-section');

                    // Property: Fallback behavior should be consistent regardless of image success/failure
                    if (shouldImageFail) {
                        // Simulate image failure
                        mockImage.onerror();
                        expect(heroSection.classList.contains('image-error')).toBe(true);
                    } else {
                        // Simulate image success
                        mockImage.onload();
                        expect(heroSection.classList.contains('image-error')).toBe(false);
                    }

                    // Background should always be set regardless of image loading result
                    const backgroundImage = heroSection.style.backgroundImage;
                    expect(backgroundImage).toBeTruthy();
                    expect(backgroundImage).toContain('linear-gradient');
                }
            ),
            { numRuns: 100 }
        );
    });
});