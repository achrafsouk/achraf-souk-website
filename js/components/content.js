// Content section component with filtering and pagination
export class ContentComponent {
    constructor(appState) {
        this.state = appState;
        this.contentGrid = document.getElementById('content-grid');
        this.paginationControls = document.getElementById('pagination-controls');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        this.setupEventListeners();
        this.setupStateListeners();
        
        // Initialize filter button states immediately
        this.updateFilterButtonStates(this.state.getCurrentFilter());
        
        // If content already exists, render immediately
        if (this.state.getContent().length > 0) {
            this.render();
        }
    }

    setupEventListeners() {
        // Filter button event listeners
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                if (filter) {
                    this.handleFilterChange(filter);
                }
            });
        });
    }

    setupStateListeners() {
        // Listen for state changes to update UI
        this.state.addEventListener('filter', (filter) => {
            this.updateFilterButtonStates(filter);
        });

        this.state.addEventListener('filteredContent', () => {
            this.render();
        });

        this.state.addEventListener('pagination', () => {
            this.render();
        });

        // Initial render when content is first loaded
        this.state.addEventListener('content', () => {
            // Force update filtered content and render
            this.state.updateFilteredContent();
        });
    }

    async render() {
        if (!this.contentGrid) {
            console.warn('Content grid element not found');
            return;
        }

        // Show loading state
        this.contentGrid.classList.add('loading');

        // Get paginated content directly from state
        const pageContent = this.state.getPaginatedContent();
        const currentFilter = this.state.getCurrentFilter();

        // Update filter button states
        this.updateFilterButtonStates(currentFilter);

        // Use requestAnimationFrame for smooth rendering and await it
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                this.renderContent(pageContent, currentFilter);
                resolve();
            });
        });
    }

    renderContent(pageContent, currentFilter) {
        // Render content cards with performance optimizations
        if (pageContent.length === 0) {
            const filterText = currentFilter === 'all' ? 'available' : `matching "${currentFilter}" filter`;
            this.contentGrid.innerHTML = `<p class="no-content">No content ${filterText}.</p>`;
        } else {
            // Use document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            pageContent.forEach((item, index) => {
                const cardElement = this.createContentCardElement(item);
                
                // Stagger card animations for better perceived performance
                cardElement.style.animationDelay = `${index * 50}ms`;
                
                fragment.appendChild(cardElement);
            });
            
            // Clear and append all at once
            this.contentGrid.innerHTML = '';
            this.contentGrid.appendChild(fragment);
        }

        // Remove loading state
        this.contentGrid.classList.remove('loading');

        // Render pagination
        this.renderPagination();

        // Set up content card click handlers with debouncing
        this.setupContentCardListeners();

        // Set up lazy loading for any images in content cards
        this.setupLazyLoadingForCards();
    }

    createContentCardElement(item) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `content-card ${item.externalLink ? 'clickable' : ''}`;
        cardDiv.dataset.contentId = item.id || '';
        
        if (item.externalLink) {
            cardDiv.dataset.externalLink = item.externalLink;
            cardDiv.setAttribute('tabindex', '0');
            cardDiv.setAttribute('role', 'button');
        }

        const formattedDate = this.formatDate(item.publicationDate);
        const truncatedDescription = this.truncateToFirstLine(item.description || 'No description available.');
        
        cardDiv.innerHTML = `
            <div class="content-meta">
                <span class="content-type">${this.escapeHtml(item.type || 'article')}</span>
                <span class="content-date">${formattedDate}</span>
            </div>
            <h3 class="content-title">${this.escapeHtml(item.title || 'Untitled')}</h3>
            <p class="content-description">${this.escapeHtml(truncatedDescription)}</p>
        `;

        return cardDiv;
    }

    setupLazyLoadingForCards() {
        // Set up intersection observer for card animations
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '20px 0px',
            threshold: 0.1
        });

        // Observe all content cards
        this.contentGrid.querySelectorAll('.content-card').forEach(card => {
            cardObserver.observe(card);
        });
    }

    setupContentCardListeners() {
        const clickableCards = this.contentGrid.querySelectorAll('.content-card.clickable');
        
        // Debounce click handlers to prevent double-clicks
        const debouncedClick = this.debounce((externalLink) => {
            window.open(externalLink, '_blank', 'noopener,noreferrer');
        }, 300);
        
        clickableCards.forEach(card => {
            const handleClick = () => {
                const externalLink = card.dataset.externalLink;
                if (externalLink) {
                    debouncedClick(externalLink);
                }
            };

            card.addEventListener('click', handleClick);
            
            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            });
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    handleFilterChange(filter) {
        // Update state - this will trigger state listeners
        this.state.setCurrentFilter(filter);
    }

    updateFilterButtonStates(currentFilter) {
        // Update active filter button states
        this.filterButtons.forEach(button => {
            const buttonFilter = button.dataset.filter;
            if (buttonFilter) {
                const isActive = buttonFilter === currentFilter;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', isActive.toString());
            }
        });
    }

    renderPagination() {
        if (!this.paginationControls) return;

        const totalPages = this.state.getTotalPages();
        const currentPage = this.state.getCurrentPage();

        if (totalPages <= 1) {
            this.paginationControls.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        paginationHTML += `
            <button class="pagination-btn" data-page="${currentPage - 1}" ${prevDisabled} aria-label="Previous page">
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage ? 'active' : '';
            const ariaCurrent = i === currentPage ? 'aria-current="page"' : '';
            paginationHTML += `
                <button class="pagination-btn ${isActive}" data-page="${i}" ${ariaCurrent} aria-label="Page ${i}">
                    ${i}
                </button>
            `;
        }

        // Next button
        const nextDisabled = currentPage === totalPages ? 'disabled' : '';
        paginationHTML += `
            <button class="pagination-btn" data-page="${currentPage + 1}" ${nextDisabled} aria-label="Next page">
                Next
            </button>
        `;

        this.paginationControls.innerHTML = paginationHTML;

        // Add event listeners to pagination buttons
        this.paginationControls.querySelectorAll('.pagination-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== currentPage && !e.target.disabled) {
                    this.state.setCurrentPage(page);
                    this.render();
                }
            });
        });
    }

    formatDate(dateString) {
        if (!dateString) return 'No date';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateToFirstLine(text) {
        if (!text) return '';
        
        // Split by common sentence endings and line breaks
        const sentences = text.split(/[.!?]\s+|\n/);
        
        // Get the first sentence/line
        let firstLine = sentences[0].trim();
        
        // If the first sentence is very short (less than 30 chars), 
        // try to include the next sentence if it exists and the total is reasonable
        if (firstLine.length < 30 && sentences.length > 1 && sentences[1]) {
            const secondSentence = sentences[1].trim();
            const combined = firstLine + '. ' + secondSentence;
            if (combined.length <= 120) {
                firstLine = combined;
            }
        }
        
        // If still very long, truncate at word boundary
        if (firstLine.length > 120) {
            const words = firstLine.split(' ');
            let truncated = '';
            for (const word of words) {
                if ((truncated + ' ' + word).length > 120) break;
                truncated += (truncated ? ' ' : '') + word;
            }
            firstLine = truncated;
        }
        
        // Add ellipsis if we truncated or if there's more content
        const needsEllipsis = firstLine.length < text.length || sentences.length > 1;
        return needsEllipsis ? firstLine + '...' : firstLine;
    }

    handleResize() {
        // Handle any resize-specific logic for content component
        // Currently no specific resize handling needed
    }
}