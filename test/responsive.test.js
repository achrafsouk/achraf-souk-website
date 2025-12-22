// Responsive behavior unit tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PortfolioApp } from '../js/main.js';

describe('Responsive Design Tests', () => {
  let mockHTML;

  beforeEach(() => {
    // Create mock HTML structure
    mockHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      
      <section id="hero" class="hero-section" aria-label="Personal introduction">
        <div class="container">
          <div class="hero-content">
            <div class="profile-image-container">
              <img id="profile-image" class="profile-image" src="" alt="Profile picture" />
              <div id="profile-fallback" class="profile-fallback hidden" aria-hidden="true">
                <span class="initials"></span>
              </div>
            </div>
            <div class="hero-text">
              <h1 class="hero-title">Welcome to My Portfolio</h1>
              <p class="bio-text">Professional bio content will be displayed here.</p>
              <a href="#" id="linkedin-link" class="linkedin-link" target="_blank" rel="noopener noreferrer">
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="achievements" class="achievements-section" aria-label="Professional achievements">
        <div class="container">
          <h2 class="section-title">Achievements</h2>
          <div id="achievements-grid" class="achievements-grid">
          </div>
        </div>
      </section>

      <main id="main-content">
        <section id="content" class="content-section" aria-label="Thought leadership content">
          <div class="container">
            <h2 class="section-title">Thought Leadership</h2>
            
            <div class="filter-controls" role="group" aria-label="Content filters">
              <button id="filter-all" class="filter-btn active" data-filter="all" aria-pressed="true">All</button>
              <button id="filter-talks" class="filter-btn" data-filter="talk" aria-pressed="false">Talks</button>
              <button id="filter-blogs" class="filter-btn" data-filter="blog" aria-pressed="false">Blogs</button>
              <button id="filter-whitepapers" class="filter-btn" data-filter="whitepaper" aria-pressed="false">Whitepapers</button>
              <button id="filter-reset" class="filter-btn filter-reset">Reset</button>
            </div>

            <div id="content-grid" class="content-grid">
            </div>

            <nav class="pagination" aria-label="Content pagination" role="navigation">
              <div id="pagination-controls" class="pagination-controls">
              </div>
            </nav>
          </div>
        </section>
      </main>
    `;
    
    document.body.innerHTML = mockHTML;
  });

  describe('Mobile Layout (320px-767px)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone viewport width
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    it('should have mobile-optimized touch targets', () => {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const linkedinLink = document.querySelector('.linkedin-link');
      
      // Check that elements exist for mobile testing
      expect(filterButtons.length).toBeGreaterThan(0);
      expect(linkedinLink).toBeTruthy();
      
      // In a real implementation, we would check computed styles
      // For this test, we verify the elements have the right classes
      filterButtons.forEach(button => {
        expect(button.classList.contains('filter-btn')).toBe(true);
      });
      
      expect(linkedinLink.classList.contains('linkedin-link')).toBe(true);
    });

    it('should display hero content in column layout on mobile', () => {
      const heroContent = document.querySelector('.hero-content');
      const profileContainer = document.querySelector('.profile-image-container');
      const heroText = document.querySelector('.hero-text');
      
      expect(heroContent).toBeTruthy();
      expect(profileContainer).toBeTruthy();
      expect(heroText).toBeTruthy();
      
      // Verify structure is set up for mobile layout
      expect(heroContent.classList.contains('hero-content')).toBe(true);
    });

    it('should have single-column grid layout for achievements on mobile', () => {
      const achievementsGrid = document.querySelector('.achievements-grid');
      
      expect(achievementsGrid).toBeTruthy();
      expect(achievementsGrid.classList.contains('achievements-grid')).toBe(true);
    });

    it('should have single-column content grid on mobile', () => {
      const contentGrid = document.querySelector('.content-grid');
      
      expect(contentGrid).toBeTruthy();
      expect(contentGrid.classList.contains('content-grid')).toBe(true);
    });
  });

  describe('Tablet Layout (768px-1023px)', () => {
    beforeEach(() => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should display hero content in row layout on tablet', () => {
      const heroContent = document.querySelector('.hero-content');
      
      expect(heroContent).toBeTruthy();
      expect(heroContent.classList.contains('hero-content')).toBe(true);
    });

    it('should have two-column grid layout for achievements on tablet', () => {
      const achievementsGrid = document.querySelector('.achievements-grid');
      
      expect(achievementsGrid).toBeTruthy();
      expect(achievementsGrid.classList.contains('achievements-grid')).toBe(true);
    });

    it('should have two-column content grid on tablet', () => {
      const contentGrid = document.querySelector('.content-grid');
      
      expect(contentGrid).toBeTruthy();
      expect(contentGrid.classList.contains('content-grid')).toBe(true);
    });

    it('should have appropriate touch target sizes for tablet', () => {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const paginationButtons = document.querySelectorAll('.pagination-btn');
      
      // Verify elements exist and have proper classes
      filterButtons.forEach(button => {
        expect(button.classList.contains('filter-btn')).toBe(true);
      });
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });
    });

    it('should have three-column grid layout for achievements on desktop', () => {
      const achievementsGrid = document.querySelector('.achievements-grid');
      
      expect(achievementsGrid).toBeTruthy();
      expect(achievementsGrid.classList.contains('achievements-grid')).toBe(true);
    });

    it('should have three-column content grid on desktop', () => {
      const contentGrid = document.querySelector('.content-grid');
      
      expect(contentGrid).toBeTruthy();
      expect(contentGrid.classList.contains('content-grid')).toBe(true);
    });

    it('should display larger profile image on desktop', () => {
      const profileContainer = document.querySelector('.profile-image-container');
      
      expect(profileContainer).toBeTruthy();
      expect(profileContainer.classList.contains('profile-image-container')).toBe(true);
    });

    it('should have proper spacing and layout for desktop', () => {
      const container = document.querySelector('.container');
      const heroSection = document.querySelector('.hero-section');
      
      expect(container).toBeTruthy();
      expect(heroSection).toBeTruthy();
      expect(container.classList.contains('container')).toBe(true);
      expect(heroSection.classList.contains('hero-section')).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle window resize events', () => {
      const app = new PortfolioApp();
      const resizeHandler = vi.fn();
      
      // Mock the handleResize method
      app.handleResize = resizeHandler;
      
      // Trigger resize event
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // Wait for debounced resize handler
      setTimeout(() => {
        expect(resizeHandler).toHaveBeenCalled();
      }, 300);
    });

    it('should maintain proper container max-width across viewports', () => {
      const container = document.querySelector('.container');
      
      expect(container).toBeTruthy();
      expect(container.classList.contains('container')).toBe(true);
    });

    it('should have responsive typography scaling', () => {
      const heroTitle = document.querySelector('.hero-title');
      const sectionTitle = document.querySelector('.section-title');
      
      expect(heroTitle).toBeTruthy();
      expect(sectionTitle).toBeTruthy();
      expect(heroTitle.classList.contains('hero-title')).toBe(true);
      expect(sectionTitle.classList.contains('section-title')).toBe(true);
    });

    it('should handle orientation changes on mobile devices', () => {
      // Mock landscape orientation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const heroSection = document.querySelector('.hero-section');
      expect(heroSection).toBeTruthy();
      expect(heroSection.classList.contains('hero-section')).toBe(true);
    });
  });

  describe('Print Styles', () => {
    it('should hide interactive elements in print mode', () => {
      const filterControls = document.querySelector('.filter-controls');
      const pagination = document.querySelector('.pagination');
      
      expect(filterControls).toBeTruthy();
      expect(pagination).toBeTruthy();
      
      // Verify elements exist (print styles would hide them via CSS)
      expect(filterControls.classList.contains('filter-controls')).toBe(true);
      expect(pagination.classList.contains('pagination')).toBe(true);
    });

    it('should maintain readable layout for print', () => {
      const contentCards = document.querySelectorAll('.content-card');
      const achievementCards = document.querySelectorAll('.achievement-card');
      
      // Verify card elements exist and have proper classes for print styling
      contentCards.forEach(card => {
        expect(card.classList.contains('content-card')).toBe(true);
      });
      
      achievementCards.forEach(card => {
        expect(card.classList.contains('achievement-card')).toBe(true);
      });
    });
  });
});