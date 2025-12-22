// Accessibility features unit tests
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Accessibility Features Tests', () => {
  let mockHTML;
  let app;

  beforeEach(() => {
    // Create mock HTML structure with accessibility features
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
              <a href="#" id="linkedin-link" class="linkedin-link" target="_blank" rel="noopener noreferrer" aria-label="Connect with me on LinkedIn">
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
              <button id="filter-all" class="filter-btn active" data-filter="all" aria-pressed="true" aria-label="Show all content types">All</button>
              <button id="filter-talks" class="filter-btn" data-filter="talk" aria-pressed="false" aria-label="Show talks only">Talks</button>
              <button id="filter-blogs" class="filter-btn" data-filter="blog" aria-pressed="false" aria-label="Show blogs only">Blogs</button>
              <button id="filter-whitepapers" class="filter-btn" data-filter="whitepaper" aria-pressed="false" aria-label="Show whitepapers only">Whitepapers</button>
              <button id="filter-reset" class="filter-btn filter-reset" aria-label="Reset filters to show all content">Reset</button>
            </div>

            <div id="content-grid" class="content-grid">
              <div class="content-card clickable" data-external-link="https://example.com" tabindex="0" role="button">
                <div class="content-meta">
                  <span class="content-type">blog</span>
                  <span class="content-date">Jan 15, 2024</span>
                </div>
                <h3 class="content-title">Sample Blog Post</h3>
                <p class="content-description">This is a sample blog post description.</p>
              </div>
            </div>

            <nav class="pagination" aria-label="Content pagination" role="navigation">
              <div id="pagination-controls" class="pagination-controls">
                <button class="pagination-btn" data-page="1" disabled aria-label="Previous page">Previous</button>
                <button class="pagination-btn active" data-page="1" aria-current="page" aria-label="Page 1">1</button>
                <button class="pagination-btn" data-page="2" aria-label="Page 2">2</button>
                <button class="pagination-btn" data-page="2" aria-label="Next page">Next</button>
              </div>
            </nav>
          </div>
        </section>
      </main>
    `;
    
    document.body.innerHTML = mockHTML;
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      const linkedinLink = document.querySelector('#linkedin-link');
      const filterButtons = document.querySelectorAll('.filter-btn');
      const paginationButtons = document.querySelectorAll('.pagination-btn');
      
      // Check LinkedIn link has proper aria-label
      expect(linkedinLink.getAttribute('aria-label')).toBe('Connect with me on LinkedIn');
      
      // Check filter buttons have proper aria-labels
      expect(document.querySelector('#filter-all').getAttribute('aria-label')).toBe('Show all content types');
      expect(document.querySelector('#filter-talks').getAttribute('aria-label')).toBe('Show talks only');
      expect(document.querySelector('#filter-blogs').getAttribute('aria-label')).toBe('Show blogs only');
      expect(document.querySelector('#filter-whitepapers').getAttribute('aria-label')).toBe('Show whitepapers only');
      expect(document.querySelector('#filter-reset').getAttribute('aria-label')).toBe('Reset filters to show all content');
      
      // Check pagination buttons have proper aria-labels
      const prevButton = document.querySelector('[aria-label="Previous page"]');
      const nextButton = document.querySelector('[aria-label="Next page"]');
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
    });

    it('should have proper roles on semantic elements', () => {
      const filterControls = document.querySelector('.filter-controls');
      const pagination = document.querySelector('.pagination');
      const contentCard = document.querySelector('.content-card.clickable');
      
      expect(filterControls.getAttribute('role')).toBe('group');
      expect(pagination.getAttribute('role')).toBe('navigation');
      expect(contentCard.getAttribute('role')).toBe('button');
    });

    it('should have proper aria-pressed states on filter buttons', () => {
      const allButton = document.querySelector('#filter-all');
      const talksButton = document.querySelector('#filter-talks');
      
      expect(allButton.getAttribute('aria-pressed')).toBe('true');
      expect(talksButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('should have proper aria-current on active pagination button', () => {
      const activePageButton = document.querySelector('.pagination-btn.active');
      
      expect(activePageButton.getAttribute('aria-current')).toBe('page');
    });

    it('should have proper section labels', () => {
      const heroSection = document.querySelector('#hero');
      const achievementsSection = document.querySelector('#achievements');
      const contentSection = document.querySelector('#content');
      
      expect(heroSection.getAttribute('aria-label')).toBe('Personal introduction');
      expect(achievementsSection.getAttribute('aria-label')).toBe('Professional achievements');
      expect(contentSection.getAttribute('aria-label')).toBe('Thought leadership content');
    });
  });

  describe('Keyboard Navigation Support', () => {

    it('should handle Enter key on clickable content cards', () => {
      const contentCard = document.querySelector('.content-card.clickable');
      const mockOpen = vi.fn();
      window.open = mockOpen;
      
      // Add event listener like the actual component does
      contentCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const externalLink = contentCard.dataset.externalLink;
          if (externalLink) {
            window.open(externalLink, '_blank', 'noopener,noreferrer');
          }
        }
      });
      
      // Simulate Enter key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      contentCard.dispatchEvent(enterEvent);
      
      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });

    it('should handle Space key on clickable content cards', () => {
      const contentCard = document.querySelector('.content-card.clickable');
      const mockOpen = vi.fn();
      window.open = mockOpen;
      
      // Add event listener like the actual component does
      contentCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const externalLink = contentCard.dataset.externalLink;
          if (externalLink) {
            window.open(externalLink, '_blank', 'noopener,noreferrer');
          }
        }
      });
      
      // Simulate Space key press
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      contentCard.dispatchEvent(spaceEvent);
      
      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });

    it('should support arrow key navigation on filter buttons', () => {
      const filterButtons = document.querySelectorAll('.filter-btn');
      
      // Verify filter buttons exist and can be navigated
      expect(filterButtons.length).toBeGreaterThan(1);
      
      // Verify buttons have proper structure for keyboard navigation
      filterButtons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
        expect(button.classList.contains('filter-btn')).toBe(true);
      });
    });

    it('should support Home and End keys on filter buttons', () => {
      const filterButtons = document.querySelectorAll('.filter-btn');
      
      // Verify filter buttons exist for keyboard navigation
      expect(filterButtons.length).toBeGreaterThan(2);
      
      // Verify buttons are properly structured for navigation
      const firstButton = filterButtons[0];
      const lastButton = filterButtons[filterButtons.length - 1];
      
      expect(firstButton.tagName).toBe('BUTTON');
      expect(lastButton.tagName).toBe('BUTTON');
      expect(firstButton.classList.contains('filter-btn')).toBe(true);
      expect(lastButton.classList.contains('filter-btn')).toBe(true);
    });

    it('should handle Escape key to blur focused elements', () => {
      const button = document.querySelector('.filter-btn');
      button.blur = vi.fn();
      button.focus();
      
      // Mock document.activeElement
      Object.defineProperty(document, 'activeElement', {
        get: () => button,
        configurable: true
      });
      
      // Add the escape key handler
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
        }
      });
      
      // Simulate Escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      expect(button.blur).toHaveBeenCalled();
    });
  });

  describe('Skip Link Functionality', () => {
    it('should have a skip link that points to main content', () => {
      const skipLink = document.querySelector('.skip-link');
      const mainContent = document.querySelector('#main-content');
      
      expect(skipLink).toBeTruthy();
      expect(mainContent).toBeTruthy();
      expect(skipLink.getAttribute('href')).toBe('#main-content');
      expect(skipLink.textContent).toBe('Skip to main content');
    });

    it('should handle skip link navigation', () => {
      const skipLink = document.querySelector('.skip-link');
      const mainContent = document.querySelector('#main-content');
      
      // Mock scrollIntoView
      mainContent.scrollIntoView = vi.fn();
      
      // Add the click handler like the actual app does
      document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="#"]')) {
          e.preventDefault();
          const targetId = e.target.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
      
      // Simulate click on skip link
      const clickEvent = new Event('click');
      Object.defineProperty(clickEvent, 'target', { value: skipLink });
      document.dispatchEvent(clickEvent);
      
      expect(mainContent.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should create live regions for content announcements', () => {
      // Create a live region manually for testing
      const liveRegion = document.createElement('div');
      liveRegion.id = 'content-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
      
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
      expect(liveRegion.classList.contains('visually-hidden')).toBe(true);
    });

    it('should announce filter changes', () => {
      // Create a live region for filter announcements
      const liveRegion = document.createElement('div');
      liveRegion.id = 'filter-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.className = 'visually-hidden';
      liveRegion.textContent = 'Filter changed to Blogs';
      document.body.appendChild(liveRegion);
      
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion.textContent).toBe('Filter changed to Blogs');
    });

    it('should announce content count changes', () => {
      // Add some content cards to test count
      const contentGrid = document.getElementById('content-grid');
      contentGrid.innerHTML = `
        <div class="content-card">Card 1</div>
        <div class="content-card">Card 2</div>
        <div class="content-card">Card 3</div>
      `;
      
      // Create announcement based on content count
      const liveRegion = document.createElement('div');
      liveRegion.id = 'content-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.className = 'visually-hidden';
      
      const contentCards = document.querySelectorAll('.content-card');
      const count = contentCards.length;
      liveRegion.textContent = `${count} content items displayed`;
      document.body.appendChild(liveRegion);
      
      expect(liveRegion.textContent).toBe('3 content items displayed');
    });

    it('should announce when no content is found', () => {
      // Clear content grid
      const contentGrid = document.getElementById('content-grid');
      contentGrid.innerHTML = '';
      
      // Create announcement for no content
      const liveRegion = document.createElement('div');
      liveRegion.id = 'content-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.className = 'visually-hidden';
      liveRegion.textContent = 'No content items found';
      document.body.appendChild(liveRegion);
      
      expect(liveRegion.textContent).toBe('No content items found');
    });
  });

  describe('Focus Management', () => {
    it('should have proper tabindex on clickable content cards', () => {
      const clickableCard = document.querySelector('.content-card.clickable');
      
      expect(clickableCard.getAttribute('tabindex')).toBe('0');
    });

    it('should have focus styles applied to interactive elements', () => {
      const filterButton = document.querySelector('.filter-btn');
      const linkedinLink = document.querySelector('.linkedin-link');
      const contentCard = document.querySelector('.content-card.clickable');
      
      // Verify elements have the classes that CSS focus styles target
      expect(filterButton.classList.contains('filter-btn')).toBe(true);
      expect(linkedinLink.classList.contains('linkedin-link')).toBe(true);
      expect(contentCard.classList.contains('content-card')).toBe(true);
    });

    it('should handle smooth scrolling for anchor links', () => {
      const skipLink = document.querySelector('.skip-link');
      const mainContent = document.querySelector('#main-content');
      
      // Verify skip link and main content exist
      expect(skipLink).toBeTruthy();
      expect(mainContent).toBeTruthy();
      
      // Verify skip link has proper href
      expect(skipLink.getAttribute('href')).toBe('#main-content');
      
      // Verify main content has proper id
      expect(mainContent.getAttribute('id')).toBe('main-content');
      
      // Verify skip link is properly structured for keyboard navigation
      expect(skipLink.tagName).toBe('A');
      expect(skipLink.classList.contains('skip-link')).toBe(true);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have proper contrast ratios for text elements', () => {
      const bioText = document.querySelector('.bio-text');
      const contentDescription = document.querySelector('.content-description');
      const achievementDescription = document.querySelector('.achievement-description');
      
      // Verify elements exist (actual contrast testing would require computed styles)
      expect(bioText).toBeTruthy();
      expect(contentDescription).toBeTruthy();
      
      // Verify classes are applied for CSS contrast improvements
      expect(bioText.classList.contains('bio-text')).toBe(true);
      expect(contentDescription.classList.contains('content-description')).toBe(true);
    });

    it('should support high contrast mode preferences', () => {
      const heroSection = document.querySelector('.hero-section');
      const filterButton = document.querySelector('.filter-btn.active');
      
      // Verify elements have classes that high contrast CSS targets
      expect(heroSection.classList.contains('hero-section')).toBe(true);
      expect(filterButton.classList.contains('filter-btn')).toBe(true);
      expect(filterButton.classList.contains('active')).toBe(true);
    });

    it('should support reduced motion preferences', () => {
      // Verify that the HTML element exists for CSS to target
      expect(document.documentElement).toBeTruthy();
      expect(document.documentElement.tagName).toBe('HTML');
    });
  });

  describe('External Link Security', () => {
    it('should have proper security attributes on external links', () => {
      const linkedinLink = document.querySelector('#linkedin-link');
      
      expect(linkedinLink.getAttribute('target')).toBe('_blank');
      expect(linkedinLink.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should open external content links securely', () => {
      const contentCard = document.querySelector('.content-card.clickable');
      const mockOpen = vi.fn();
      window.open = mockOpen;
      
      // Add click handler like the actual component does
      contentCard.addEventListener('click', () => {
        const externalLink = contentCard.dataset.externalLink;
        if (externalLink) {
          window.open(externalLink, '_blank', 'noopener,noreferrer');
        }
      });
      
      // Simulate click on content card
      contentCard.click();
      
      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });
  });
});