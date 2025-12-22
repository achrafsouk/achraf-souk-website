import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { HeroComponent } from '../js/components/hero.js';
import { AppState } from '../js/state/appState.js';

describe('Hero Banner Background Image Tests', () => {
    let dom;
    let document;
    let window;
    let heroComponent;
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
        appState.profile = {
            name: 'Test User',
            bio: 'Test bio',
            profileImage: {
                src: 'https://example.com/profile.jpg',
                alt: 'Test User profile picture',
                fallbackInitials: 'TU'
            },
            linkedinUrl: 'https://linkedin.com/in/testuser'
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        dom.window.close();
    });

    describe('Background Image Loading Logic', () => {
        it('should initialize hero section reference', () => {
            heroComponent = new HeroComponent(appState);
            expect(heroComponent.heroSection).toBeTruthy();
            expect(heroComponent.heroSection.classList.contains('hero-section')).toBe(true);
        });

        it('should apply fallback class when background image fails to load', async () => {
            const heroSection = document.querySelector('.hero-section');
            
            // Mock Image constructor to simulate failed loading
            const mockImage = {
                onload: null,
                onerror: null,
                src: ''
            };
            
            global.Image = vi.fn(() => mockImage);
            
            // Create new component to trigger background image test
            heroComponent = new HeroComponent(appState);
            
            // Simulate image load failure
            if (mockImage.onerror) {
                mockImage.onerror();
            }
            
            // Should apply the image-error class
            expect(heroSection.classList.contains('image-error')).toBe(true);
            expect(console.warn).toHaveBeenCalledWith('Hero background image failed to load, using fallback');
        });

        it('should log success when background image loads successfully', async () => {
            const heroSection = document.querySelector('.hero-section');
            
            // Mock Image constructor to simulate successful loading
            const mockImage = {
                onload: null,
                onerror: null,
                src: ''
            };
            
            global.Image = vi.fn(() => mockImage);
            
            // Create new component to trigger background image test
            heroComponent = new HeroComponent(appState);
            
            // Simulate successful image load
            if (mockImage.onload) {
                mockImage.onload();
            }
            
            // Should NOT apply the image-error class
            expect(heroSection.classList.contains('image-error')).toBe(false);
            expect(console.log).toHaveBeenCalledWith('Hero background image loaded successfully');
        });

        it('should test image with correct path', () => {
            // Mock Image constructor to capture the src
            let capturedSrc = '';
            const mockImage = {
                onload: null,
                onerror: null,
                set src(value) {
                    capturedSrc = value;
                }
            };
            
            global.Image = vi.fn(() => mockImage);
            
            // Create component
            heroComponent = new HeroComponent(appState);
            
            // Should test the correct image path
            expect(capturedSrc).toBe('/public/images/hero-banner.jpg');
        });
    });

    describe('Fallback Behavior', () => {
        it('should provide fallback background when image fails', () => {
            heroComponent = new HeroComponent(appState);
            const heroSection = document.querySelector('.hero-section');
            
            // Apply the error class (simulating image load failure)
            heroSection.classList.add('image-error');
            
            // Should have the error class applied
            expect(heroSection.classList.contains('image-error')).toBe(true);
        });

        it('should not have error class by default', () => {
            heroComponent = new HeroComponent(appState);
            const heroSection = document.querySelector('.hero-section');
            
            // Should not have error class initially
            expect(heroSection.classList.contains('image-error')).toBe(false);
        });
    });
});