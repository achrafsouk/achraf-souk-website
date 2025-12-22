// Unit tests for achievements section
import { describe, it, expect, beforeEach } from 'vitest';
import { AchievementsComponent } from '../js/components/achievements.js';
import { AppState } from '../js/state/appState.js';

describe('Achievements Component', () => {
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

    describe('Achievement Display', () => {
        it('should display achievements in organized format', async () => {
            // Test data with multiple achievements
            const testAchievements = [
                {
                    id: 'achievement-1',
                    title: 'Test Achievement 1',
                    description: 'Description for achievement 1',
                    order: 1
                },
                {
                    id: 'achievement-2',
                    title: 'Test Achievement 2',
                    description: 'Description for achievement 2',
                    order: 2
                }
            ];

            appState.setAchievements(testAchievements);
            await achievementsComponent.render();

            // Verify achievements are displayed
            const achievementCards = mockContainer.querySelectorAll('.achievement-card');
            expect(achievementCards.length).toBe(2);

            // Verify first achievement
            const firstCard = achievementCards[0];
            expect(firstCard.querySelector('.achievement-title').textContent).toBe('Test Achievement 1');
            expect(firstCard.querySelector('.achievement-description').textContent).toBe('Description for achievement 1');
            expect(firstCard.dataset.achievementId).toBe('achievement-1');

            // Verify second achievement
            const secondCard = achievementCards[1];
            expect(secondCard.querySelector('.achievement-title').textContent).toBe('Test Achievement 2');
            expect(secondCard.querySelector('.achievement-description').textContent).toBe('Description for achievement 2');
            expect(secondCard.dataset.achievementId).toBe('achievement-2');
        });

        it('should handle empty achievements list', async () => {
            appState.setAchievements([]);
            await achievementsComponent.render();

            expect(mockContainer.innerHTML).toContain('No achievements to display');
        });

        it('should handle null/undefined achievements', async () => {
            appState.setAchievements(null);
            await achievementsComponent.render();

            expect(mockContainer.innerHTML).toContain('No achievements to display');
        });

        it('should sort achievements by order property', async () => {
            const testAchievements = [
                {
                    id: 'achievement-3',
                    title: 'Third Achievement',
                    description: 'Should appear third',
                    order: 3
                },
                {
                    id: 'achievement-1',
                    title: 'First Achievement',
                    description: 'Should appear first',
                    order: 1
                },
                {
                    id: 'achievement-2',
                    title: 'Second Achievement',
                    description: 'Should appear second',
                    order: 2
                }
            ];

            appState.setAchievements(testAchievements);
            await achievementsComponent.render();

            const achievementCards = mockContainer.querySelectorAll('.achievement-card');
            expect(achievementCards[0].querySelector('.achievement-title').textContent).toBe('First Achievement');
            expect(achievementCards[1].querySelector('.achievement-title').textContent).toBe('Second Achievement');
            expect(achievementCards[2].querySelector('.achievement-title').textContent).toBe('Third Achievement');
        });
    });

    describe('Grid Layout', () => {
        it('should create achievement cards with proper CSS classes', async () => {
            const testAchievements = [
                {
                    id: 'achievement-1',
                    title: 'Test Achievement',
                    description: 'Test Description',
                    order: 1
                }
            ];

            appState.setAchievements(testAchievements);
            await achievementsComponent.render();

            const achievementCard = mockContainer.querySelector('.achievement-card');
            expect(achievementCard).toBeTruthy();
            expect(achievementCard.classList.contains('achievement-card')).toBe(true);

            const title = achievementCard.querySelector('.achievement-title');
            expect(title).toBeTruthy();
            expect(title.classList.contains('achievement-title')).toBe(true);

            const description = achievementCard.querySelector('.achievement-description');
            expect(description).toBeTruthy();
            expect(description.classList.contains('achievement-description')).toBe(true);
        });

        it('should handle multiple achievements in grid layout', async () => {
            // Create 6 achievements to test grid layout
            const testAchievements = Array.from({ length: 6 }, (_, i) => ({
                id: `achievement-${i + 1}`,
                title: `Achievement ${i + 1}`,
                description: `Description ${i + 1}`,
                order: i + 1
            }));

            appState.setAchievements(testAchievements);
            await achievementsComponent.render();

            const achievementCards = mockContainer.querySelectorAll('.achievement-card');
            expect(achievementCards.length).toBe(6);

            // Verify each card has the expected structure
            achievementCards.forEach((card, index) => {
                expect(card.querySelector('.achievement-title')).toBeTruthy();
                expect(card.querySelector('.achievement-description')).toBeTruthy();
                expect(card.dataset.achievementId).toBe(`achievement-${index + 1}`);
            });
        });
    });

    describe('Responsive Behavior', () => {
        it('should maintain grid structure across different viewport sizes', async () => {
            const testAchievements = [
                {
                    id: 'achievement-1',
                    title: 'Test Achievement',
                    description: 'Test Description',
                    order: 1
                }
            ];

            appState.setAchievements(testAchievements);
            
            // Test mobile viewport (320px)
            Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
            await achievementsComponent.render();
            
            let achievementCards = mockContainer.querySelectorAll('.achievement-card');
            expect(achievementCards.length).toBe(1);
            expect(mockContainer.classList.contains('achievements-grid')).toBe(true);

            // Test tablet viewport (768px)
            Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
            await achievementsComponent.render();
            
            achievementCards = mockContainer.querySelectorAll('.achievement-card');
            expect(achievementCards.length).toBe(1);
            expect(mockContainer.classList.contains('achievements-grid')).toBe(true);

            // Test desktop viewport (1024px)
            Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
            await achievementsComponent.render();
            
            achievementCards = mockContainer.querySelectorAll('.achievement-card');
            expect(achievementCards.length).toBe(1);
            expect(mockContainer.classList.contains('achievements-grid')).toBe(true);
        });
    });

    describe('Data Handling', () => {
        it('should handle achievements with missing optional fields', async () => {
            // Test that validation properly rejects invalid achievements
            const invalidAchievements = [
                {
                    // Missing id
                    title: 'Achievement without ID',
                    description: 'Description without ID',
                    order: 1
                },
                {
                    id: 'achievement-2',
                    // Missing title - should be rejected
                    description: 'Description without title',
                    order: 2
                },
                {
                    id: 'achievement-3',
                    title: 'Achievement without description',
                    // Missing description - should be rejected
                    order: 3
                }
            ];

            // Should throw validation error
            expect(() => {
                appState.setAchievements(invalidAchievements);
            }).toThrow('Achievements validation failed');
        });

        it('should escape HTML in achievement content', async () => {
            const testAchievements = [
                {
                    id: 'achievement-1',
                    title: '<script>alert("xss")</script>Malicious Title',
                    description: '<img src="x" onerror="alert(\'xss\')" />Malicious Description',
                    order: 1
                }
            ];

            appState.setAchievements(testAchievements);
            await achievementsComponent.render();

            const achievementCard = mockContainer.querySelector('.achievement-card');
            const title = achievementCard.querySelector('.achievement-title');
            const description = achievementCard.querySelector('.achievement-description');

            // Verify HTML is escaped
            expect(title.textContent).toContain('<script>');
            expect(title.textContent).toContain('Malicious Title');
            expect(description.textContent).toContain('<img src="x"');
            expect(description.textContent).toContain('Malicious Description');

            // Verify no actual script tags are in the DOM
            expect(mockContainer.querySelector('script')).toBeNull();
            expect(mockContainer.querySelector('img')).toBeNull();
        });
    });

    describe('Component Integration', () => {
        it('should handle resize events gracefully', () => {
            // Test that handleResize method exists and doesn't throw
            expect(() => {
                achievementsComponent.handleResize();
            }).not.toThrow();
        });

        it('should handle missing DOM element gracefully', async () => {
            // Remove the achievements grid element
            document.body.innerHTML = '';
            
            const componentWithoutDOM = new AchievementsComponent(appState);
            
            // Should not throw error when DOM element is missing
            expect(async () => {
                await componentWithoutDOM.render();
            }).not.toThrow();
        });
    });
});