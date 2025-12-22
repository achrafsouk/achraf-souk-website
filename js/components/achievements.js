// Achievements section component
export class AchievementsComponent {
    constructor(appState) {
        this.state = appState;
        this.achievementsGrid = document.getElementById('achievements-grid');
    }

    async render() {
        const achievements = this.state.getAchievements();
        
        if (!this.achievementsGrid) {
            console.warn('Achievements grid element not found');
            return;
        }

        if (!achievements || achievements.length === 0) {
            this.achievementsGrid.innerHTML = '<p class="no-achievements">No achievements to display.</p>';
            return;
        }

        // Sort achievements by order
        const sortedAchievements = [...achievements].sort((a, b) => (a.order || 0) - (b.order || 0));

        // Generate achievement cards HTML
        const achievementsHTML = sortedAchievements.map(achievement => 
            this.createAchievementCard(achievement)
        ).join('');

        this.achievementsGrid.innerHTML = achievementsHTML;
    }

    createAchievementCard(achievement) {
        const { id, title, description } = achievement;
        
        return `
            <div class="achievement-card" data-achievement-id="${id || ''}">
                <h3 class="achievement-title">${this.escapeHtml(title || 'Untitled Achievement')}</h3>
                <p class="achievement-description">${this.escapeHtml(description || 'No description available.')}</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleResize() {
        // Handle any resize-specific logic for achievements component
        // Currently no specific resize handling needed
    }
}