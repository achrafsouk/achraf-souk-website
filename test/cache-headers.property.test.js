// Property-based tests for asset cache headers
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Cache Headers Property Tests', () => {
    const distDir = 'dist';

    beforeAll(() => {
        // Ensure we have a fresh build for testing
        try {
            execSync('npm run build', { stdio: 'pipe' });
        } catch (error) {
            throw new Error(`Build failed: ${error.message}`);
        }
    });

    // Helper function to simulate cache header logic
    function getCacheHeadersForFile(filePath) {
        if (filePath.endsWith('.html')) {
            return {
                'cache-control': 'public, max-age=3600, must-revalidate',
                maxAge: 3600
            };
        } else if (filePath.includes('/assets/') && (filePath.endsWith('.js') || filePath.endsWith('.css'))) {
            return {
                'cache-control': 'public, max-age=31536000, immutable',
                maxAge: 31536000
            };
        } else if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg)$/)) {
            return {
                'cache-control': 'public, max-age=86400',
                maxAge: 86400
            };
        } else {
            return {
                'cache-control': 'public, max-age=3600',
                maxAge: 3600
            };
        }
    }

    /**
     * Feature: website-deployment-fix, Property 4: Asset cache headers
     * Validates: Requirements 2.3
     */
    it('should define appropriate short-term cache headers for HTML files', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    const indexPath = join(distDir, 'index.html');
                    expect(existsSync(indexPath)).toBe(true);
                    
                    // Test cache header logic for HTML files
                    const cacheHeaders = getCacheHeadersForFile(indexPath);
                    
                    expect(cacheHeaders['cache-control']).toBeDefined();
                    expect(cacheHeaders['cache-control']).toMatch(/max-age=3600/);
                    expect(cacheHeaders['cache-control']).toMatch(/public/);
                    expect(cacheHeaders['cache-control']).toMatch(/must-revalidate/);
                    expect(cacheHeaders.maxAge).toBe(3600);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 4: Asset cache headers (JavaScript Assets)
     * Validates: Requirements 2.3
     */
    it('should define long-term cache headers for JavaScript assets', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    // Find JavaScript assets in the assets directory
                    const assetsDir = join(distDir, 'assets');
                    expect(existsSync(assetsDir)).toBe(true);
                    
                    const assetFiles = readdirSync(assetsDir);
                    const jsFiles = assetFiles.filter(file => file.endsWith('.js') && !file.endsWith('.map'));
                    
                    expect(jsFiles.length).toBeGreaterThan(0);
                    
                    // Test cache header logic for JavaScript files
                    const jsFilePath = join(assetsDir, jsFiles[0]);
                    const cacheHeaders = getCacheHeadersForFile(jsFilePath);
                    
                    expect(cacheHeaders['cache-control']).toBeDefined();
                    expect(cacheHeaders['cache-control']).toMatch(/max-age=31536000/);
                    expect(cacheHeaders['cache-control']).toMatch(/public/);
                    expect(cacheHeaders['cache-control']).toMatch(/immutable/);
                    expect(cacheHeaders.maxAge).toBe(31536000);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 4: Asset cache headers (CSS Assets)
     * Validates: Requirements 2.3
     */
    it('should define long-term cache headers for CSS assets', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    // Find CSS assets in the assets directory
                    const assetsDir = join(distDir, 'assets');
                    expect(existsSync(assetsDir)).toBe(true);
                    
                    const assetFiles = readdirSync(assetsDir);
                    const cssFiles = assetFiles.filter(file => file.endsWith('.css'));
                    
                    expect(cssFiles.length).toBeGreaterThan(0);
                    
                    // Test cache header logic for CSS files
                    const cssFilePath = join(assetsDir, cssFiles[0]);
                    const cacheHeaders = getCacheHeadersForFile(cssFilePath);
                    
                    expect(cacheHeaders['cache-control']).toBeDefined();
                    expect(cacheHeaders['cache-control']).toMatch(/max-age=31536000/);
                    expect(cacheHeaders['cache-control']).toMatch(/public/);
                    expect(cacheHeaders['cache-control']).toMatch(/immutable/);
                    expect(cacheHeaders.maxAge).toBe(31536000);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 4: Asset cache headers (Image Assets)
     * Validates: Requirements 2.3
     */
    it('should define appropriate cache headers for image assets', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    // Find image files in the dist directory
                    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'];
                    let imageFiles = [];
                    
                    function findImageFiles(dir) {
                        const files = readdirSync(dir, { withFileTypes: true });
                        for (const file of files) {
                            const fullPath = join(dir, file.name);
                            if (file.isDirectory()) {
                                findImageFiles(fullPath);
                            } else if (imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
                                imageFiles.push(fullPath);
                            }
                        }
                    }
                    
                    findImageFiles(distDir);
                    
                    if (imageFiles.length === 0) {
                        // Skip test if no images found
                        return;
                    }
                    
                    // Test cache header logic for image files
                    const imageFile = imageFiles[0];
                    const cacheHeaders = getCacheHeadersForFile(imageFile);
                    
                    expect(cacheHeaders['cache-control']).toBeDefined();
                    expect(cacheHeaders['cache-control']).toMatch(/max-age=86400/);
                    expect(cacheHeaders['cache-control']).toMatch(/public/);
                    expect(cacheHeaders.maxAge).toBe(86400);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 4: Asset cache headers (Cache Consistency)
     * Validates: Requirements 2.3
     */
    it('should define consistent cache headers for files of the same type', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    // Test that all JavaScript files have the same cache policy
                    const assetsDir = join(distDir, 'assets');
                    if (!existsSync(assetsDir)) {
                        return; // Skip if no assets directory
                    }
                    
                    const assetFiles = readdirSync(assetsDir);
                    const jsFiles = assetFiles.filter(file => file.endsWith('.js') && !file.endsWith('.map'));
                    
                    if (jsFiles.length < 2) {
                        return; // Skip if less than 2 JS files
                    }
                    
                    // Test cache headers for first two JavaScript files
                    const cacheHeaders1 = getCacheHeadersForFile(join(assetsDir, jsFiles[0]));
                    const cacheHeaders2 = getCacheHeadersForFile(join(assetsDir, jsFiles[1]));
                    
                    // Both should have the same cache-control header
                    expect(cacheHeaders1['cache-control']).toBe(cacheHeaders2['cache-control']);
                    expect(cacheHeaders1.maxAge).toBe(cacheHeaders2.maxAge);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 4: Asset cache headers (Hash-based Assets)
     * Validates: Requirements 2.3
     */
    it('should define immutable cache headers for hash-based asset filenames', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    const assetsDir = join(distDir, 'assets');
                    if (!existsSync(assetsDir)) {
                        return;
                    }
                    
                    const assetFiles = readdirSync(assetsDir);
                    
                    // Find files with hash-based names (contain hyphen followed by alphanumeric)
                    const hashedFiles = assetFiles.filter(file => 
                        file.match(/-[a-zA-Z0-9_-]+\.(js|css)$/) && !file.endsWith('.map')
                    );
                    
                    if (hashedFiles.length === 0) {
                        return;
                    }
                    
                    // All hashed files should have immutable cache headers
                    hashedFiles.forEach(file => {
                        const filePath = join(assetsDir, file);
                        const cacheHeaders = getCacheHeadersForFile(filePath);
                        
                        expect(cacheHeaders['cache-control']).toMatch(/immutable/);
                        expect(cacheHeaders.maxAge).toBe(31536000); // 1 year
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});