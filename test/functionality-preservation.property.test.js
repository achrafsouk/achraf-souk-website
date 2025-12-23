import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fc from 'fast-check';
import { HeroComponent } from '../js/components/hero.js';
import { AppState } from '../js/state/appState.js';

/**
 * Feature: remove-hero-background, Property 4: Functionality preservation
 * 
 * Property: For any hero section, all existing functionality (profile image loading, 
 * text display, responsive behavior) should work correctly after background image removal
 * 
 * Validates: Requirements 1.4, 1.5, 3.4
 */

describe('Functionality Preservation Property Tests', () => {
    let dom;
    let document;
    let window;
    let appState;

    beforeEach(() => {
        // Create a new JSDOM instance for each test with complete hero section HTML
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
                    .hero-section .container {
                        position: relative;
                        z-index: 2;
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
                    }
                    .bio-text {
                        font-size: 1.1rem;
                        margin-bottom: 2rem;
                        opacity: 0.9;
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
                    .loading {
                        opacity: 0.6;
                    }
                    
                    /* Responsive styles for testing */
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

        // Create app state
        appState = new AppState();

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
    });

    it('Property 4: Functionality preservation - profile image loading should work correctly', () => {
        fc.assert(
            fc.property(
                // Generate random profile data
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                    bio: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
                    linkedinUrl: fc.webUrl(),
                    profileImage: fc.record({
                        src: fc.constantFrom('./images/profile.jpg', './images/test.png', 'https://example.com/profile.jpg'),
                        alt: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
                        fallbackInitials: fc.string({ minLength: 1, maxLength: 3 }).filter(s => s.trim().length > 0)
                    })
                }),
                (profileData) => {
                    // Set up the profile data
                    appState.setProfile(profileData);
                    
                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    
                    // Property: Profile image functionality should be preserved
                    
                    // 1. Component should have all required DOM elements
                    expect(heroComponent.profileImage).toBeTruthy();
                    expect(heroComponent.profileFallback).toBeTruthy();
                    expect(heroComponent.initialsSpan).toBeTruthy();
                    
                    // 2. Profile image methods should exist and be callable
                    expect(typeof heroComponent.setupProfileImage).toBe('function');
                    expect(typeof heroComponent.lazyLoadProfileImage).toBe('function');
                    expect(typeof heroComponent.loadProfileImage).toBe('function');
                    expect(typeof heroComponent.showFallback).toBe('function');
                    expect(typeof heroComponent.hideFallback).toBe('function');
                    
                    // 3. Setup profile image should work without errors
                    expect(() => {
                        heroComponent.setupProfileImage(profileData);
                    }).not.toThrow();
                    
                    // 4. Fallback initials should be set correctly
                    expect(heroComponent.initialsSpan.textContent).toBe(profileData.profileImage.fallbackInitials);
                    
                    // 5. Profile image should have correct alt text when set
                    if (profileData.profileImage.src) {
                        expect(heroComponent.profileImage.alt).toBe(profileData.profileImage.alt);
                    }
                    
                    // 6. Caching methods should exist
                    expect(typeof heroComponent.getCachedImage).toBe('function');
                    expect(typeof heroComponent.cacheImage).toBe('function');
                    expect(typeof heroComponent.hashString).toBe('function');
                    
                    // 7. Test methods should exist for fallback testing
                    expect(typeof heroComponent.testImageFallback).toBe('function');
                    expect(typeof heroComponent.restoreOriginalImage).toBe('function');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 4: Functionality preservation - hero text content should display properly', () => {
        fc.assert(
            fc.property(
                // Generate random text content
                fc.record({
                    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                    bio: fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0),
                    linkedinUrl: fc.webUrl(),
                    profileImage: fc.record({
                        src: fc.constant('./images/profile.jpg'),
                        alt: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
                        fallbackInitials: fc.string({ minLength: 1, maxLength: 3 }).filter(s => s.trim().length > 0)
                    })
                }),
                async (profileData) => {
                    // Set up the profile data
                    appState.setProfile(profileData);
                    
                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    
                    // Property: Text content functionality should be preserved
                    
                    // 1. Render method should work without errors
                    await expect(heroComponent.render()).resolves.not.toThrow();
                    
                    // 2. Hero title should be set correctly
                    expect(heroComponent.heroTitle.textContent).toBe(`Hi, I'm ${profileData.name}`);
                    
                    // 3. Bio text should be set correctly
                    expect(heroComponent.bioText.textContent).toBe(profileData.bio);
                    
                    // 4. LinkedIn link should be set correctly
                    expect(heroComponent.linkedinLink.href).toBe(profileData.linkedinUrl);
                    
                    // 5. All text elements should be visible (not hidden)
                    expect(heroComponent.heroTitle.style.display).not.toBe('none');
                    expect(heroComponent.bioText.style.display).not.toBe('none');
                    expect(heroComponent.linkedinLink.style.display).not.toBe('none');
                    
                    // 6. Text content should not be empty after render
                    expect(heroComponent.heroTitle.textContent.trim()).not.toBe('');
                    expect(heroComponent.bioText.textContent.trim()).not.toBe('');
                    expect(heroComponent.linkedinLink.href.trim()).not.toBe('');
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 4: Functionality preservation - responsive design should work across device sizes', () => {
        fc.assert(
            fc.property(
                // Generate random viewport sizes and profile data
                fc.record({
                    viewportWidth: fc.integer({ min: 320, max: 1920 }),
                    viewportHeight: fc.integer({ min: 240, max: 1080 }),
                    profileData: fc.record({
                        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                        bio: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
                        linkedinUrl: fc.webUrl(),
                        profileImage: fc.record({
                            src: fc.constant('./images/profile.jpg'),
                            alt: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
                            fallbackInitials: fc.string({ minLength: 1, maxLength: 3 }).filter(s => s.trim().length > 0)
                        })
                    })
                }),
                async ({ viewportWidth, viewportHeight, profileData }) => {
                    // Set viewport size
                    Object.defineProperty(window, 'innerWidth', { value: viewportWidth, writable: true });
                    Object.defineProperty(window, 'innerHeight', { value: viewportHeight, writable: true });
                    
                    // Set up the profile data
                    appState.setProfile(profileData);
                    
                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    
                    // Property: Responsive behavior should be preserved across all viewport sizes
                    
                    // 1. Hero section should exist and be properly structured
                    const heroSection = document.querySelector('.hero-section');
                    expect(heroSection).toBeTruthy();
                    
                    // 2. Container and content elements should exist
                    const container = heroSection.querySelector('.container');
                    const heroContent = heroSection.querySelector('.hero-content');
                    expect(container).toBeTruthy();
                    expect(heroContent).toBeTruthy();
                    
                    // 3. Profile image container should maintain proper structure
                    const profileContainer = heroSection.querySelector('.profile-image-container');
                    expect(profileContainer).toBeTruthy();
                    
                    // 4. Text content should be accessible at all viewport sizes
                    expect(heroComponent.heroTitle).toBeTruthy();
                    expect(heroComponent.bioText).toBeTruthy();
                    expect(heroComponent.linkedinLink).toBeTruthy();
                    
                    // 5. Render should work at any viewport size
                    await expect(heroComponent.render()).resolves.not.toThrow();
                    
                    // 6. Content should be properly set regardless of viewport
                    expect(heroComponent.heroTitle.textContent).toBe(`Hi, I'm ${profileData.name}`);
                    expect(heroComponent.bioText.textContent).toBe(profileData.bio);
                    expect(heroComponent.linkedinLink.href).toBe(profileData.linkedinUrl);
                    
                    // 7. Responsive classes and structure should be maintained
                    expect(heroSection.classList.contains('hero-section')).toBe(true);
                    expect(container.classList.contains('container')).toBe(true);
                    expect(heroContent.classList.contains('hero-content')).toBe(true);
                    
                    // 8. Profile image functionality should work at all sizes
                    expect(() => {
                        heroComponent.setupProfileImage(profileData);
                    }).not.toThrow();
                    
                    // 9. Resize handling should work
                    expect(typeof heroComponent.handleResize).toBe('function');
                    expect(() => {
                        heroComponent.handleResize();
                    }).not.toThrow();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 4: Functionality preservation - all component methods should remain functional', () => {
        fc.assert(
            fc.property(
                // Generate random profile data and test scenarios
                fc.record({
                    profileData: fc.record({
                        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                        bio: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
                        linkedinUrl: fc.webUrl(),
                        profileImage: fc.record({
                            src: fc.constantFrom('./images/profile.jpg', '', 'broken-url.jpg'),
                            alt: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
                            fallbackInitials: fc.string({ minLength: 1, maxLength: 3 }).filter(s => s.trim().length > 0)
                        })
                    }),
                    testFallback: fc.boolean(),
                    testCaching: fc.boolean()
                }),
                async ({ profileData, testFallback, testCaching }) => {
                    // Set up the profile data
                    appState.setProfile(profileData);
                    
                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    
                    // Property: All existing functionality should be preserved
                    
                    // 1. Core rendering functionality
                    await expect(heroComponent.render()).resolves.not.toThrow();
                    
                    // 2. Profile image setup functionality
                    expect(() => {
                        heroComponent.setupProfileImage(profileData);
                    }).not.toThrow();
                    
                    // 3. Fallback functionality should work
                    if (testFallback) {
                        expect(() => {
                            heroComponent.showFallback();
                        }).not.toThrow();
                        
                        expect(() => {
                            heroComponent.hideFallback();
                        }).not.toThrow();
                        
                        expect(() => {
                            heroComponent.testImageFallback();
                        }).not.toThrow();
                        
                        expect(() => {
                            heroComponent.restoreOriginalImage();
                        }).not.toThrow();
                    }
                    
                    // 4. Caching functionality should work
                    if (testCaching) {
                        const testUrl = 'https://example.com/test.jpg';
                        
                        expect(() => {
                            heroComponent.getCachedImage(testUrl);
                        }).not.toThrow();
                        
                        expect(() => {
                            heroComponent.hashString(testUrl);
                        }).not.toThrow();
                        
                        const hash = heroComponent.hashString(testUrl);
                        expect(typeof hash).toBe('string');
                        expect(hash.length).toBeGreaterThan(0);
                    }
                    
                    // 5. Event handling should be preserved
                    expect(typeof heroComponent.handleResize).toBe('function');
                    
                    // 6. Lazy loading functionality should exist
                    expect(typeof heroComponent.lazyLoadProfileImage).toBe('function');
                    expect(typeof heroComponent.loadProfileImage).toBe('function');
                    
                    // 7. State management should work
                    const currentProfile = heroComponent.state.getProfile();
                    expect(currentProfile).toEqual(profileData);
                    
                    // 8. DOM element references should be maintained
                    expect(heroComponent.profileImage).toBeTruthy();
                    expect(heroComponent.profileFallback).toBeTruthy();
                    expect(heroComponent.linkedinLink).toBeTruthy();
                    expect(heroComponent.bioText).toBeTruthy();
                    expect(heroComponent.heroTitle).toBeTruthy();
                    expect(heroComponent.initialsSpan).toBeTruthy();
                    expect(heroComponent.heroSection).toBeTruthy();
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 4: Functionality preservation - error handling should remain intact', () => {
        fc.assert(
            fc.property(
                // Generate edge cases and error scenarios
                fc.record({
                    profileData: fc.oneof(
                        // Valid profile
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
                        // Profile with missing image
                        fc.record({
                            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                            bio: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
                            linkedinUrl: fc.webUrl(),
                            profileImage: fc.record({
                                src: fc.constant(''),
                                alt: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
                                fallbackInitials: fc.string({ minLength: 1, maxLength: 3 }).filter(s => s.trim().length > 0)
                            })
                        }),
                        // Null profile image
                        fc.record({
                            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                            bio: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
                            linkedinUrl: fc.webUrl(),
                            profileImage: fc.constant(null)
                        })
                    )
                }),
                async (testCase) => {
                    // Set up the profile data (including edge cases)
                    appState.setProfile(testCase.profileData);
                    
                    // Create hero component
                    const heroComponent = new HeroComponent(appState);
                    
                    // Property: Error handling should be preserved for all edge cases
                    
                    // 1. Render should handle all profile data gracefully
                    await expect(heroComponent.render()).resolves.not.toThrow();
                    
                    // 2. Setup profile image should handle missing/null image data
                    expect(() => {
                        heroComponent.setupProfileImage(testCase.profileData);
                    }).not.toThrow();
                    
                    // 3. Component should handle missing DOM elements gracefully
                    // Test with temporarily removed elements
                    const originalProfileImage = heroComponent.profileImage;
                    const originalProfileFallback = heroComponent.profileFallback;
                    
                    // Temporarily remove elements to test error handling
                    heroComponent.profileImage = null;
                    heroComponent.profileFallback = null;
                    
                    expect(() => {
                        heroComponent.setupProfileImage(testCase.profileData);
                    }).not.toThrow();
                    
                    expect(() => {
                        heroComponent.showFallback();
                    }).not.toThrow();
                    
                    expect(() => {
                        heroComponent.hideFallback();
                    }).not.toThrow();
                    
                    // Restore elements
                    heroComponent.profileImage = originalProfileImage;
                    heroComponent.profileFallback = originalProfileFallback;
                    
                    // 4. Caching should handle errors gracefully
                    expect(() => {
                        heroComponent.getCachedImage('invalid-url');
                    }).not.toThrow();
                    
                    // 5. Hash function should handle various inputs
                    expect(() => {
                        heroComponent.hashString('');
                        heroComponent.hashString('test');
                        heroComponent.hashString('very-long-url-with-special-characters-!@#$%^&*()');
                    }).not.toThrow();
                }
            ),
            { numRuns: 100 }
        );
    });
});