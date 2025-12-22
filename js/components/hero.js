// Hero section component
export class HeroComponent {
    constructor(appState) {
        this.state = appState;
        this.profileImage = document.getElementById('profile-image');
        this.profileFallback = document.getElementById('profile-fallback');
        this.linkedinLink = document.getElementById('linkedin-link');
        this.bioText = document.querySelector('.bio-text');
        this.heroTitle = document.querySelector('.hero-title');
        this.initialsSpan = document.querySelector('.initials');
        this.heroSection = document.querySelector('.hero-section');
        
        // Initialize background image handling
        this.initializeBackgroundImage();
    }

    initializeBackgroundImage() {
        // Test if background image loads successfully
        const testImage = new Image();
        testImage.onload = () => {
            // Image loaded successfully, no action needed
            console.log('Hero background image loaded successfully');
        };
        testImage.onerror = () => {
            // Image failed to load, apply fallback class
            console.warn('Hero background image failed to load, using fallback');
            if (this.heroSection) {
                this.heroSection.classList.add('image-error');
            }
        };
        testImage.src = '/public/images/hero-banner.jpg';
    }

    async render() {
        const profile = this.state.getProfile();
        
        if (!profile) {
            console.warn('No profile data available');
            return;
        }

        // Set hero title and bio
        if (this.heroTitle && profile.name) {
            this.heroTitle.textContent = `Hi, I'm ${profile.name}`;
        }
        
        if (this.bioText && profile.bio) {
            this.bioText.textContent = profile.bio;
        }

        // Set LinkedIn link
        if (this.linkedinLink && profile.linkedinUrl) {
            this.linkedinLink.href = profile.linkedinUrl;
        }

        // Handle profile image with fallback
        this.setupProfileImage(profile);
    }

    setupProfileImage(profile) {
        if (!this.profileImage || !this.profileFallback) return;

        // Set up fallback initials
        if (this.initialsSpan && profile.profileImage?.fallbackInitials) {
            this.initialsSpan.textContent = profile.profileImage.fallbackInitials;
        }

        // Handle image loading with lazy loading and caching
        if (profile.profileImage?.src) {
            // Reset any previous state
            this.profileImage.style.display = 'block';
            this.profileFallback.classList.add('hidden');
            this.profileFallback.setAttribute('aria-hidden', 'true');

            // Implement lazy loading for profile image
            this.lazyLoadProfileImage(profile.profileImage);
        } else {
            // No image source provided, show fallback immediately
            this.showFallback();
        }
    }

    lazyLoadProfileImage(imageData) {
        // Check if image is in cache first
        const cachedImage = this.getCachedImage(imageData.src);
        if (cachedImage) {
            this.loadImageFromCache(cachedImage, imageData);
            return;
        }

        // Use Intersection Observer for lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadProfileImage(imageData);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        imageObserver.observe(this.profileImage);

        // Fallback: load image after 2 seconds if not in viewport
        setTimeout(() => {
            if (this.profileImage.src === '' || this.profileImage.src === window.location.href) {
                this.loadProfileImage(imageData);
            }
        }, 2000);
    }

    loadProfileImage(imageData) {
        // Show loading state
        this.profileImage.classList.add('loading');

        this.profileImage.src = imageData.src;
        this.profileImage.alt = imageData.alt || 'Profile picture';

        // Remove any existing event listeners to prevent duplicates
        this.profileImage.removeEventListener('error', this.handleImageError);
        this.profileImage.removeEventListener('load', this.handleImageLoad);

        // Bind event handlers to maintain context
        this.handleImageError = () => {
            this.profileImage.classList.remove('loading');
            this.showFallback();
        };
        this.handleImageLoad = () => {
            this.profileImage.classList.remove('loading');
            this.hideFallback();
            this.cacheImage(imageData.src, this.profileImage);
        };

        // Set up error handling for image loading
        this.profileImage.addEventListener('error', this.handleImageError);
        this.profileImage.addEventListener('load', this.handleImageLoad);

        // Test if image is already loaded (cached by browser)
        if (this.profileImage.complete) {
            if (this.profileImage.naturalWidth === 0) {
                this.handleImageError();
            } else {
                this.handleImageLoad();
            }
        }
    }

    loadImageFromCache(cachedImageData, imageData) {
        this.profileImage.src = cachedImageData.dataUrl;
        this.profileImage.alt = imageData.alt || 'Profile picture';
        this.hideFallback();
    }

    getCachedImage(src) {
        try {
            const cached = localStorage.getItem(`img_cache_${this.hashString(src)}`);
            if (cached) {
                const data = JSON.parse(cached);
                // Check if cache is still valid (24 hours)
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    return data;
                } else {
                    // Remove expired cache
                    localStorage.removeItem(`img_cache_${this.hashString(src)}`);
                }
            }
        } catch (error) {
            console.warn('Error accessing image cache:', error);
        }
        return null;
    }

    cacheImage(src, imgElement) {
        try {
            // Only cache small images to avoid localStorage limits
            if (imgElement.naturalWidth <= 500 && imgElement.naturalHeight <= 500) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = imgElement.naturalWidth;
                canvas.height = imgElement.naturalHeight;
                
                ctx.drawImage(imgElement, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                // Check size before caching (limit to 100KB)
                if (dataUrl.length < 100000) {
                    const cacheData = {
                        dataUrl: dataUrl,
                        timestamp: Date.now()
                    };
                    localStorage.setItem(`img_cache_${this.hashString(src)}`, JSON.stringify(cacheData));
                }
            }
        } catch (error) {
            console.warn('Error caching image:', error);
        }
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    showFallback() {
        if (this.profileImage) {
            this.profileImage.style.display = 'none';
        }
        if (this.profileFallback) {
            this.profileFallback.classList.remove('hidden');
            this.profileFallback.setAttribute('aria-hidden', 'false');
        }
    }

    hideFallback() {
        if (this.profileImage) {
            this.profileImage.style.display = 'block';
        }
        if (this.profileFallback) {
            this.profileFallback.classList.add('hidden');
            this.profileFallback.setAttribute('aria-hidden', 'true');
        }
    }

    handleResize() {
        // Handle any resize-specific logic for hero component
        // Currently no specific resize handling needed
    }

    // Method to test fallback behavior with broken image URLs
    testImageFallback() {
        const profile = this.state.getProfile();
        if (profile && profile.profileImage) {
            // Create a test profile with a broken image URL
            const testProfile = {
                ...profile,
                profileImage: {
                    ...profile.profileImage,
                    src: 'https://broken-url-that-does-not-exist.com/image.jpg'
                }
            };
            this.setupProfileImage(testProfile);
        }
    }

    // Method to restore original image
    restoreOriginalImage() {
        const profile = this.state.getProfile();
        if (profile) {
            this.setupProfileImage(profile);
        }
    }
}