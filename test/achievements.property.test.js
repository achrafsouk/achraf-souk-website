// Property-based tests for achievements section
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { AchievementsComponent } from '../js/components/achievements.js';
import { AppState } from '../js/state/appState.js';

describe('Achievements Property Tests', () => {
    let appState;
    let achievementsComponent;
    let mockContainer;

    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <div id="achievements-grid" class="achievements-grid"></div>
        `;
        
        appState = new AppState();
        achievementsComponent = new AchievementsComponent(appState);
        mockContainer = document.getElementById('achievements-grid');
    });

    /**
     * Feature: personal-portfolio-website, Property 1: Achievement completeness
     * Validates: Requirements 2.2
     */
    it('should ensure all displayed achievements have non-empty titles and descriptions', () => {
        // Generator for valid achievements (non-empty title and description)
        const validAchievementArb = fc.record({
            id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            order: fc.integer({ min: 1, max: 100 })
        });

        return fc.assert(
            fc.asyncProperty(
                fc.array(validAchievementArb, { minLength: 1, maxLength: 10 }),
                async (achievements) => {
                    // Set up the achievements in app state
                    appState.setAchievements(achievements);
                    
                    // Render the achievements
                    await achievementsComponent.render();
                    
                    // Get all rendered achievement cards
                    const achievementCards = mockContainer.querySelectorAll('.achievement-card');
                    
                    // Verify that we have the expected number of cards
                    expect(achievementCards.length).toBe(achievements.length);
                    
                    // For each achievement card, verify it has non-empty title and description
                    // This is the core property: all displayed achievements must have non-empty titles and descriptions
                    achievementCards.forEach((card) => {
                        const titleElement = card.querySelector('.achievement-title');
                        const descriptionElement = card.querySelector('.achievement-description');
                        
                        // Verify elements exist
                        expect(titleElement).toBeTruthy();
                        expect(descriptionElement).toBeTruthy();
                        
                        // Verify content is non-empty (after trimming whitespace)
                        const titleText = titleElement.textContent.trim();
                        const descriptionText = descriptionElement.textContent.trim();
                        
                        // This is the core property being tested
                        expect(titleText.length).toBeGreaterThan(0);
                        expect(descriptionText.length).toBeGreaterThan(0);
                    });
                }
            ),
            { numRuns: 20 }
        );
    });
});