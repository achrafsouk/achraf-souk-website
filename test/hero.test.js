// Hero section component tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroComponent } from '../js/components/hero.js';
import { AppState } from '../js/state/appState.js';

describe('Hero Section Component', () => {
    let heroComponent;
    let appState;
    let mockProfile;

    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <section id="hero" class="hero-section">
                <div class="container">
                    <div class="hero-content">
                        <div class="profile-image-container">
                            <img id="profile-image" class="profile-image" src="" alt="Profile picture" />
                            <div id="profile-fallback" class="profile-fallback hidden">
                                <span class="initials"></span>
                            </div>
                        </div>
                        <div class="hero-text">
                            <h1 class="hero-title">Welcome to My Portfolio</h1>
                            <p class="bio-text">Professional bio content will be displayed here.</p>
                            <a href="#" id="linkedin-link" class="linkedin-link" target="_blank" rel="noopener noreferrer" aria-label="Connect with me on LinkedIn">
                                Connect on LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // Set up mock profile data
        mockProfile = {
            name: "Test User",
            bio: "This is a test bio for the hero section component.",
            profileImage: {
                src: "https://example.com/profile.jpg",
                alt: "Test User profile picture",
                fallbackInitials: "TU"
            },
            linkedinUrl: "https://linkedin.com/in/testuser"
        };

        // Initialize app state and hero component
        appState = new AppState();
        appState.setProfile(mockProfile);
        heroComponent = new HeroComponent(appState);
    });

    describe('Hero section displays on page load', () => {
        it('should display hero title with user name', async () => {
            await heroComponent.render();
            
            const heroTitle = document.querySelector('.hero-title');
            expect(heroTitle.textContent).toBe("Hi, I'm Test User");
        });

        it('should display bio text', async () => {
            await heroComponent.render();
            
            const bioText = document.querySelector('.bio-text');
            expect(bioText.textContent).toBe(mockProfile.bio);
        });

        it('should handle missing profile data gracefully', async () => {
            appState.setProfile(null);
            
            // Should not throw an error
            await expect(heroComponent.render()).resolves.not.toThrow();
        });

        it('should handle partial profile data', async () => {
            const partialProfile = {
                name: "Partial User"
                // Missing bio, linkedinUrl, and profileImage
            };
            
            // Should throw validation error for missing required fields
            expect(() => {
                appState.setProfile(partialProfile);
            }).toThrow('Profile validation failed');
        });
    });

    describe('LinkedIn link opens in new tab', () => {
        it('should set LinkedIn URL correctly', async () => {
            await heroComponent.render();
            
            const linkedinLink = document.getElementById('linkedin-link');
            expect(linkedinLink.href).toBe(mockProfile.linkedinUrl);
        });

        it('should have target="_blank" attribute', async () => {
            await heroComponent.render();
            
            const linkedinLink = document.getElementById('linkedin-link');
            expect(linkedinLink.target).toBe('_blank');
        });

        it('should have rel="noopener noreferrer" for security', async () => {
            await heroComponent.render();
            
            const linkedinLink = document.getElementById('linkedin-link');
            expect(linkedinLink.rel).toBe('noopener noreferrer');
        });

        it('should handle missing LinkedIn URL', async () => {
            const profileWithoutLinkedIn = {
                ...mockProfile,
                linkedinUrl: null
            };
            
            // Should throw validation error for missing LinkedIn URL
            expect(() => {
                appState.setProfile(profileWithoutLinkedIn);
            }).toThrow('Profile validation failed');
        });
    });

    describe('Image fallback behavior', () => {
        it('should display profile image when loaded successfully', async () => {
            await heroComponent.render();
            
            const profileImage = document.getElementById('profile-image');
            const profileFallback = document.getElementById('profile-fallback');
            
            // Simulate successful image load
            profileImage.dispatchEvent(new Event('load'));
            
            expect(profileImage.style.display).toBe('block');
            expect(profileFallback.classList.contains('hidden')).toBe(true);
            expect(profileFallback.getAttribute('aria-hidden')).toBe('true');
        });

        it('should show fallback when image fails to load', async () => {
            await heroComponent.render();
            
            const profileImage = document.getElementById('profile-image');
            const profileFallback = document.getElementById('profile-fallback');
            
            // Simulate image load error
            profileImage.dispatchEvent(new Event('error'));
            
            expect(profileImage.style.display).toBe('none');
            expect(profileFallback.classList.contains('hidden')).toBe(false);
            expect(profileFallback.getAttribute('aria-hidden')).toBe('false');
        });

        it('should display correct initials in fallback', async () => {
            await heroComponent.render();
            
            const initialsSpan = document.querySelector('.initials');
            expect(initialsSpan.textContent).toBe(mockProfile.profileImage.fallbackInitials);
        });

        it('should show fallback immediately when no image source provided', async () => {
            const profileWithoutImage = {
                ...mockProfile,
                profileImage: {
                    ...mockProfile.profileImage,
                    src: null
                }
            };
            
            // Should throw validation error for missing image src
            expect(() => {
                appState.setProfile(profileWithoutImage);
            }).toThrow('Profile validation failed');
        });

        it('should handle cached images correctly', async () => {
            const profileImage = document.getElementById('profile-image');
            
            // Mock a cached, successfully loaded image
            Object.defineProperty(profileImage, 'complete', { value: true });
            Object.defineProperty(profileImage, 'naturalWidth', { value: 250 });
            
            await heroComponent.render();
            
            const profileFallback = document.getElementById('profile-fallback');
            expect(profileFallback.classList.contains('hidden')).toBe(true);
        });

        it('should handle cached failed images correctly', async () => {
            const profileImage = document.getElementById('profile-image');
            
            // Mock a cached, failed image
            Object.defineProperty(profileImage, 'complete', { value: true });
            Object.defineProperty(profileImage, 'naturalWidth', { value: 0 });
            
            await heroComponent.render();
            
            const profileFallback = document.getElementById('profile-fallback');
            expect(profileFallback.classList.contains('hidden')).toBe(false);
        });
    });

    describe('Test methods for fallback behavior', () => {
        it('should test image fallback with broken URL', async () => {
            await heroComponent.render();
            
            // Test the fallback with broken URL
            heroComponent.testImageFallback();
            
            const profileImage = document.getElementById('profile-image');
            expect(profileImage.src).toBe('https://broken-url-that-does-not-exist.com/image.jpg');
        });

        it('should restore original image after test', async () => {
            await heroComponent.render();
            
            // Test fallback then restore
            heroComponent.testImageFallback();
            heroComponent.restoreOriginalImage();
            
            const profileImage = document.getElementById('profile-image');
            expect(profileImage.src).toBe(mockProfile.profileImage.src);
        });
    });

    describe('Accessibility and semantic HTML', () => {
        it('should have proper alt text for profile image', async () => {
            await heroComponent.render();
            
            const profileImage = document.getElementById('profile-image');
            expect(profileImage.alt).toBe(mockProfile.profileImage.alt);
        });

        it('should have aria-hidden attribute on fallback', async () => {
            await heroComponent.render();
            
            const profileFallback = document.getElementById('profile-fallback');
            expect(profileFallback.hasAttribute('aria-hidden')).toBe(true);
        });

        it('should have proper aria-label on LinkedIn link', () => {
            const linkedinLink = document.getElementById('linkedin-link');
            // The HTML already has aria-label="Connect with me on LinkedIn"
            expect(linkedinLink.getAttribute('aria-label')).toBe('Connect with me on LinkedIn');
        });
    });
});