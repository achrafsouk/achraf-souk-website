// Data models and validation functions for the portfolio website

/**
 * Content types supported by the system
 */
export const ContentType = {
    TALK: 'talk',
    BLOG: 'blog',
    WHITEPAPER: 'whitepaper',
    ARTICLE: 'article'
};

/**
 * Profile data model
 */
export class Profile {
    constructor(data = {}) {
        this.name = data.name || '';
        this.bio = data.bio || '';
        this.profileImage = {
            src: data.profileImage?.src || '',
            alt: data.profileImage?.alt || '',
            fallbackInitials: data.profileImage?.fallbackInitials || ''
        };
        this.linkedinUrl = data.linkedinUrl || '';
    }

    /**
     * Validates profile data
     * @returns {Object} validation result with isValid boolean and errors array
     */
    validate() {
        const errors = [];

        if (!this.name || typeof this.name !== 'string' || this.name.trim().length === 0) {
            errors.push('Name is required and must be a non-empty string');
        }

        if (!this.bio || typeof this.bio !== 'string' || this.bio.trim().length === 0) {
            errors.push('Bio is required and must be a non-empty string');
        }

        if (!this.profileImage.src || typeof this.profileImage.src !== 'string') {
            errors.push('Profile image src is required and must be a string');
        }

        if (!this.profileImage.alt || typeof this.profileImage.alt !== 'string') {
            errors.push('Profile image alt text is required and must be a string');
        }

        if (!this.profileImage.fallbackInitials || typeof this.profileImage.fallbackInitials !== 'string') {
            errors.push('Profile image fallback initials are required and must be a string');
        }

        if (!this.linkedinUrl || typeof this.linkedinUrl !== 'string') {
            errors.push('LinkedIn URL is required and must be a string');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Achievement data model
 */
export class Achievement {
    constructor(data = {}) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.description = data.description || '';
        this.order = data.order || 0;
    }

    /**
     * Validates achievement data
     * @returns {Object} validation result with isValid boolean and errors array
     */
    validate() {
        const errors = [];

        if (!this.id || typeof this.id !== 'string' || this.id.trim().length === 0) {
            errors.push('Achievement ID is required and must be a non-empty string');
        }

        if (!this.title || typeof this.title !== 'string' || this.title.trim().length === 0) {
            errors.push('Achievement title is required and must be a non-empty string');
        }

        if (!this.description || typeof this.description !== 'string' || this.description.trim().length === 0) {
            errors.push('Achievement description is required and must be a non-empty string');
        }

        if (typeof this.order !== 'number' || this.order < 0) {
            errors.push('Achievement order must be a non-negative number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Content item data model
 */
export class ContentItem {
    constructor(data = {}) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.type = data.type || ContentType.ARTICLE;
        this.publicationDate = data.publicationDate ? new Date(data.publicationDate) : new Date();
        this.description = data.description || '';
        this.externalLink = data.externalLink || null;
        this.featured = data.featured || false;
    }

    /**
     * Validates content item data
     * @returns {Object} validation result with isValid boolean and errors array
     */
    validate() {
        const errors = [];

        if (!this.id || typeof this.id !== 'string' || this.id.trim().length === 0) {
            errors.push('Content item ID is required and must be a non-empty string');
        }

        if (!this.title || typeof this.title !== 'string' || this.title.trim().length === 0) {
            errors.push('Content item title is required and must be a non-empty string');
        }

        if (!Object.values(ContentType).includes(this.type)) {
            errors.push(`Content item type must be one of: ${Object.values(ContentType).join(', ')}`);
        }

        if (!(this.publicationDate instanceof Date) || isNaN(this.publicationDate.getTime())) {
            errors.push('Content item publication date must be a valid Date object');
        }

        if (!this.description || typeof this.description !== 'string' || this.description.trim().length === 0) {
            errors.push('Content item description is required and must be a non-empty string');
        }

        if (this.externalLink !== null && (typeof this.externalLink !== 'string' || this.externalLink.trim().length === 0)) {
            errors.push('Content item external link must be null or a non-empty string');
        }

        if (typeof this.featured !== 'boolean') {
            errors.push('Content item featured flag must be a boolean');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Validation utility functions
 */
export const ValidationUtils = {
    /**
     * Validates an array of profiles
     * @param {Array} profiles - Array of profile objects
     * @returns {Object} validation result
     */
    validateProfiles(profiles) {
        if (!Array.isArray(profiles)) {
            return { isValid: false, errors: ['Profiles must be an array'] };
        }

        const errors = [];
        profiles.forEach((profileData, index) => {
            const profile = new Profile(profileData);
            const validation = profile.validate();
            if (!validation.isValid) {
                errors.push(`Profile ${index}: ${validation.errors.join(', ')}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validates an array of achievements
     * @param {Array} achievements - Array of achievement objects
     * @returns {Object} validation result
     */
    validateAchievements(achievements) {
        if (!Array.isArray(achievements)) {
            return { isValid: false, errors: ['Achievements must be an array'] };
        }

        const errors = [];
        achievements.forEach((achievementData, index) => {
            const achievement = new Achievement(achievementData);
            const validation = achievement.validate();
            if (!validation.isValid) {
                errors.push(`Achievement ${index}: ${validation.errors.join(', ')}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validates an array of content items
     * @param {Array} contentItems - Array of content item objects
     * @returns {Object} validation result
     */
    validateContentItems(contentItems) {
        if (!Array.isArray(contentItems)) {
            return { isValid: false, errors: ['Content items must be an array'] };
        }

        const errors = [];
        contentItems.forEach((contentData, index) => {
            const contentItem = new ContentItem(contentData);
            const validation = contentItem.validate();
            if (!validation.isValid) {
                errors.push(`Content item ${index}: ${validation.errors.join(', ')}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};
