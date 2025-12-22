import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';
import { HeroComponent } from '../js/components/hero.js';
import { AppState } from '../js/state/appState.js';
import fs from 'fs';
import path from 'path';

/**
 * Feature: website-deployment-fix, Property 7: Asset reference processing
 * 
 * Property: For any asset reference in the source code, after the build process 
 * it should resolve to a valid file path in the dist/ directory
 * 
 * Validates: Requirements 2.5, 4.4
 */

describe('Asset Reference Processing Property Tests', () => {
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

    it('Property 7: Asset reference processing - should use correct asset paths that exist in dist directory', () => {
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

                    // Property: Asset references should use paths that exist in the dist directory
                    
                    // 1. Hero banner image should use the correct path format
                    expect(capturedImageSrc).toBe('./images/hero-banner.jpg');
                    
                    // 2. Background image should reference the correct asset path
                    const backgroundImage = heroSection.style.backgroundImage;
                    expect(backgroundImage).toContain('./images/hero-banner.jpg');
                    
                    // 3. The path should be relative and suitable for deployment
                    expect(capturedImageSrc).toMatch(/^\.\/images\//);
                    expect(capturedImageSrc).not.toContain('/public/');
                    expect(capturedImageSrc).not.toContain('http://');
                    expect(capturedImageSrc).not.toContain('https://');
                    
                    // 4. The asset path should be consistent across different profile configurations
                    // (The hero banner path should not depend on profile data)
                    expect(capturedImageSrc).toBe('./images/hero-banner.jpg');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 7: Asset reference validation - should verify asset paths exist in built output', () => {
        // This test verifies that the asset paths we use actually exist in the dist directory
        const distPath = path.join(process.cwd(), 'dist');
        const heroBannerPath = path.join(distPath, 'images', 'hero-banner.jpg');
        
        // Check if dist directory exists (build should have been run)
        if (fs.existsSync(distPath)) {
            // Property: If dist directory exists, the hero banner image should exist
            expect(fs.existsSync(heroBannerPath)).toBe(true);
            
            // Property: The file should be a valid image file (non-empty)
            const stats = fs.statSync(heroBannerPath);
            expect(stats.size).toBeGreaterThan(0);
        } else {
            // If dist doesn't exist, skip this validation (build not run)
            console.warn('Dist directory not found, skipping asset existence validation');
        }
    });

    it('Property 7: Asset reference consistency - should use consistent paths across components', () => {
        fc.assert(
            fc.property(
                // Generate multiple profile configurations
                fc.array(
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
                    { minLength: 1, maxLength: 5 }
                ),
                (profileConfigs) => {
                    const capturedPaths = [];
                    
                    // Test multiple hero components with different configurations
                    profileConfigs.forEach((profileData, index) => {
                        // Reset DOM for each test
                        const testSection = document.createElement('section');
                        testSection.className = 'hero-section';
                        testSection.innerHTML = `
                            <div class="container">
                                <div class="hero-content">
                                    <div class="profile-image-container">
                                        <img id="profile-image-${index}" class="profile-image" src="" alt="Profile picture" />
                                        <div id="profile-fallback-${index}" class="profile-fallback hidden">
                                            <span class="initials"></span>
                                        </div>
                                    </div>
                                    <div class="hero-text">
                                        <h1 class="hero-title">Welcome</h1>
                                        <p class="bio-text">Bio text</p>
                                        <a href="#" id="linkedin-link-${index}" class="linkedin-link">LinkedIn</a>
                                    </div>
                                </div>
                            </div>
                        `;
                        document.body.appendChild(testSection);

                        appState.profile = profileData;

                        let capturedSrc = '';
                        const mockImage = {
                            onload: null,
                            onerror: null,
                            set src(value) {
                                capturedSrc = value;
                            }
                        };

                        global.Image = vi.fn(() => mockImage);

                        // Override querySelector to return our test section
                        const originalQuerySelector = document.querySelector;
                        document.querySelector = vi.fn((selector) => {
                            if (selector === '.hero-section') {
                                return testSection;
                            }
                            return originalQuerySelector.call(document, selector);
                        });

                        // Create hero component
                        const heroComponent = new HeroComponent(appState);
                        capturedPaths.push(capturedSrc);

                        // Restore original querySelector
                        document.querySelector = originalQuerySelector;
                        document.body.removeChild(testSection);
                    });

                    // Property: All hero components should use the same asset path regardless of profile data
                    const uniquePaths = [...new Set(capturedPaths)];
                    expect(uniquePaths).toHaveLength(1);
                    expect(uniquePaths[0]).toBe('./images/hero-banner.jpg');
                }
            ),
            { numRuns: 50 }
        );
    });
});