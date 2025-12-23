import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';
import { HeroComponent } from '../js/components/hero.js';
import { AppState } from '../js/state/appState.js';

/**
 * Feature: remove-hero-background, Property 7: Code cleanup completeness
 * 
 * Property: For any codebase inspection, all background image related code 
 * (JavaScript loading logic, CSS positioning properties, error handling) should be 
 * removed while preserving other functionality
 * 
 * Validates: Requirements 3.1, 3.3
 */

describe('JavaScript Cleanup Property Tests', () => {
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
                            <div class="profile-section">
                                <div class="profile-image-container">
                                    <img id="profile-image" class="profile-image" alt="Profile picture">
                                    <div id="profile-fallback" class="profile-fallback hidden">
                                        <span class="initials"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="hero-text">
                                <h1 class="hero-title"></h1>
                                <p class="bio-text"></p>
                                <a id="linkedin-link" href="#" class="linkedin-link">LinkedIn</a>
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
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn()
        };
        global.IntersectionObserver = vi.fn(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }));

        // Create app state with sample data
        appState = new AppState();
        appState.setProfile({
            name: 'Test User',
            bio: 'Test bio',
            linkedinUrl: 'https://linkedin.com/in/testuser',
            profileImage: {
                src: './images/profile.jpg',
                alt: 'Test profile picture',
                fallbackInitials: 'TU'
            }
        });
    });

    afterEach(() => {
        dom.window.close();
        vi.clearAllMocks();
    });

    it('Property 7: Code cleanup completeness - should not contain background image related methods or properties', () => {
        fc.assert(
            fc.property(
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                    bio: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
                    linkedinUrl: fc.webUrl(),
                    profileImage: fc.record({
                        src: fc.constant('./images/profile.jpg'),
                        alt: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
                        fallbackInitials: fc.string({ minLength: 1, maxLength: 3 }).filter(s => s.trim().length > 0)
                    })
                }),
                (profileData) => {
                    // Set up the profile data
                    appState.setProfile(profileData);
                    
                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    
                    // 1. Verify initializeBackgroundImage method does not exist
                    expect(heroComponent.initializeBackgroundImage).toBeUndefined();
                    
                    // 2. Verify the component constructor does not call background image initialization
                    const heroComponentSource = HeroComponent.toString();
                    expect(heroComponentSource).not.toContain('initializeBackgroundImage');
                    
                    // 3. Verify no background image related properties are set on heroSection
                    const heroSection = document.querySelector('.hero-section');
                    expect(heroSection.style.backgroundImage).toBe('');
                    expect(heroSection.style.backgroundPosition).toBe('');
                    expect(heroSection.style.backgroundSize).toBe('');
                    expect(heroSection.style.backgroundRepeat).toBe('');
                    
                    // 4. Verify no image-error class handling exists
                    expect(heroSection.classList.contains('image-error')).toBe(false);
                    
                    // 5. Verify all profile image functionality is preserved
                    expect(heroComponent.profileImage).toBeTruthy();
                    expect(heroComponent.profileFallback).toBeTruthy();
                    expect(heroComponent.setupProfileImage).toBeDefined();
                    expect(heroComponent.lazyLoadProfileImage).toBeDefined();
                    expect(heroComponent.loadProfileImage).toBeDefined();
                    
                    // 6. Verify render method still works
                    expect(heroComponent.render).toBeDefined();
                    
                    // 7. Verify no background image test logic exists (but preserve profile image test methods)
                    expect(heroComponentSource).not.toContain('hero-banner.jpg');
                    expect(heroComponentSource).not.toContain('new Image()');
                    expect(heroComponentSource).not.toContain('image-error');
                }
            ),
            { numRuns: 100 }
        );
    });
});