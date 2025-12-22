// Property-based tests for asset reference validity
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('Asset Reference Validity Property Tests', () => {
    const distDir = 'dist';

    beforeAll(() => {
        // Ensure we have a fresh build for testing
        try {
            execSync('npm run build', { stdio: 'pipe' });
        } catch (error) {
            throw new Error(`Build failed: ${error.message}`);
        }
    });

    /**
     * Feature: website-deployment-fix, Property 1: Asset reference validity
     * Validates: Requirements 1.2
     */
    it('should ensure all referenced assets in HTML files exist in dist directory', () => {
        return fc.assert(
            fc.property(
                fc.constant(null), // We test the actual built files, no random input needed
                () => {
                    // Find all HTML files in dist directory
                    const htmlFiles = [];
                    
                    function findHtmlFiles(dir) {
                        const files = readdirSync(dir, { withFileTypes: true });
                        for (const file of files) {
                            const fullPath = join(dir, file.name);
                            if (file.isDirectory()) {
                                findHtmlFiles(fullPath);
                            } else if (file.name.endsWith('.html')) {
                                htmlFiles.push(fullPath);
                            }
                        }
                    }
                    
                    findHtmlFiles(distDir);
                    expect(htmlFiles.length).toBeGreaterThan(0);
                    
                    // For each HTML file, verify all referenced assets exist
                    htmlFiles.forEach(htmlFile => {
                        const htmlContent = readFileSync(htmlFile, 'utf8');
                        
                        // Extract script src attributes using regex
                        const scriptMatches = htmlContent.match(/src="([^"]+)"/g) || [];
                        scriptMatches.forEach(match => {
                            const src = match.match(/src="([^"]+)"/)[1];
                            if (src && src.startsWith('./')) {
                                // Convert relative path to absolute path within dist
                                const assetPath = join(distDir, src.substring(2));
                                expect(existsSync(assetPath)).toBe(true);
                                
                                // Verify the file is not empty
                                const stats = statSync(assetPath);
                                expect(stats.size).toBeGreaterThan(0);
                            }
                        });
                        
                        // Extract link href attributes for stylesheets using regex
                        const linkMatches = htmlContent.match(/href="([^"]+)"[^>]*rel="stylesheet"|rel="stylesheet"[^>]*href="([^"]+)"/g) || [];
                        linkMatches.forEach(match => {
                            const href = match.match(/href="([^"]+)"/)?.[1];
                            if (href && href.startsWith('./')) {
                                const assetPath = join(distDir, href.substring(2));
                                expect(existsSync(assetPath)).toBe(true);
                                
                                // Verify the file is not empty
                                const stats = statSync(assetPath);
                                expect(stats.size).toBeGreaterThan(0);
                            }
                        });
                        
                        // Extract img src attributes using regex
                        const imgMatches = htmlContent.match(/<img[^>]+src="([^"]+)"/g) || [];
                        imgMatches.forEach(match => {
                            const src = match.match(/src="([^"]+)"/)[1];
                            if (src && src.startsWith('./')) {
                                const assetPath = join(distDir, src.substring(2));
                                expect(existsSync(assetPath)).toBe(true);
                                
                                // Verify the file is not empty
                                const stats = statSync(assetPath);
                                expect(stats.size).toBeGreaterThan(0);
                            }
                        });
                        
                        // Verify that assets directory structure is correct
                        const assetsDir = join(distDir, 'assets');
                        if (existsSync(assetsDir)) {
                            const assetFiles = readdirSync(assetsDir);
                            
                            // All asset files should have hash-based names for cache busting
                            assetFiles.forEach(assetFile => {
                                if (!assetFile.endsWith('.map')) { // Skip source maps
                                    // Asset files should contain a hash (indicated by hyphen followed by alphanumeric)
                                    expect(assetFile).toMatch(/-[a-zA-Z0-9_-]+\./);
                                }
                            });
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 1: Asset reference validity (Cross-reference)
     * Validates: Requirements 1.2
     */
    it('should ensure no broken asset references exist in any HTML file', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    const indexPath = join(distDir, 'index.html');
                    expect(existsSync(indexPath)).toBe(true);
                    
                    const htmlContent = readFileSync(indexPath, 'utf8');
                    
                    // Extract all asset references using regex patterns
                    const jsReferences = htmlContent.match(/src="\.\/assets\/[^"]+\.js"/g) || [];
                    const cssReferences = htmlContent.match(/href="\.\/assets\/[^"]+\.css"/g) || [];
                    
                    // Verify each JavaScript reference exists
                    jsReferences.forEach(ref => {
                        const filename = ref.match(/assets\/([^"]+)/)[1];
                        const fullPath = join(distDir, 'assets', filename);
                        expect(existsSync(fullPath)).toBe(true);
                        
                        // Verify it's a valid JavaScript file (not empty, has JS content)
                        const content = readFileSync(fullPath, 'utf8');
                        expect(content.length).toBeGreaterThan(0);
                        // Should contain some JavaScript-like content
                        expect(content).toMatch(/[{}();]/); // Basic JS syntax indicators
                    });
                    
                    // Verify each CSS reference exists
                    cssReferences.forEach(ref => {
                        const filename = ref.match(/assets\/([^"]+)/)[1];
                        const fullPath = join(distDir, 'assets', filename);
                        expect(existsSync(fullPath)).toBe(true);
                        
                        // Verify it's a valid CSS file (not empty, has CSS content)
                        const content = readFileSync(fullPath, 'utf8');
                        expect(content.length).toBeGreaterThan(0);
                        // Should contain some CSS-like content
                        expect(content).toMatch(/[{}:;]/); // Basic CSS syntax indicators
                    });
                    
                    // Ensure we found at least one of each type
                    expect(jsReferences.length).toBeGreaterThan(0);
                    expect(cssReferences.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 100 }
        );
    });
});