// Property-based tests for build completeness
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';
import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';

describe('Build Completeness Property Tests', () => {
    const distDir = 'dist';
    const expectedFiles = [
        'index.html',
        'favicon.ico', 
        'robots.txt'
    ];
    const expectedDirectories = [
        'assets',
        'images',
        'content'
    ];

    beforeAll(() => {
        // Ensure we have a fresh build for testing
        try {
            execSync('npm run build', { stdio: 'pipe' });
        } catch (error) {
            throw new Error(`Build failed: ${error.message}`);
        }
    });

    /**
     * Feature: website-deployment-fix, Property 5: Build completeness
     * Validates: Requirements 2.4, 3.3
     */
    it('should ensure all required files exist in dist directory after build', () => {
        return fc.assert(
            fc.property(
                fc.constant(null), // We don't need random input for this property
                () => {
                    // Verify dist directory exists
                    expect(existsSync(distDir)).toBe(true);
                    
                    // Verify all expected files exist
                    expectedFiles.forEach(file => {
                        const filePath = join(distDir, file);
                        expect(existsSync(filePath)).toBe(true);
                        
                        // Verify files are not empty (except for robots.txt which can be empty)
                        if (file !== 'robots.txt') {
                            const stats = statSync(filePath);
                            expect(stats.size).toBeGreaterThan(0);
                        }
                    });
                    
                    // Verify all expected directories exist
                    expectedDirectories.forEach(dir => {
                        const dirPath = join(distDir, dir);
                        expect(existsSync(dirPath)).toBe(true);
                        expect(statSync(dirPath).isDirectory()).toBe(true);
                    });
                    
                    // Verify assets directory contains bundled files
                    const assetsDir = join(distDir, 'assets');
                    const assetFiles = readdirSync(assetsDir);
                    
                    // Should have at least one JS file, one CSS file
                    const jsFiles = assetFiles.filter(f => extname(f) === '.js' && !f.endsWith('.map'));
                    const cssFiles = assetFiles.filter(f => extname(f) === '.css');
                    
                    expect(jsFiles.length).toBeGreaterThan(0);
                    expect(cssFiles.length).toBeGreaterThan(0);
                    
                    // Verify JS files are minified (should not contain excessive whitespace)
                    jsFiles.forEach(jsFile => {
                        const jsContent = readFileSync(join(assetsDir, jsFile), 'utf8');
                        // Minified files should have high character density (low whitespace ratio)
                        const whitespaceRatio = (jsContent.match(/\s/g) || []).length / jsContent.length;
                        expect(whitespaceRatio).toBeLessThan(0.3); // Less than 30% whitespace indicates minification
                    });
                    
                    // Verify CSS files are minified
                    cssFiles.forEach(cssFile => {
                        const cssContent = readFileSync(join(assetsDir, cssFile), 'utf8');
                        // Minified CSS should not contain excessive whitespace or comments
                        const whitespaceRatio = (cssContent.match(/\s/g) || []).length / cssContent.length;
                        expect(whitespaceRatio).toBeLessThan(0.2); // Less than 20% whitespace for CSS
                        expect(cssContent).not.toMatch(/\/\*[\s\S]*?\*\//); // No CSS comments in minified version
                    });
                    
                    // Verify index.html references assets correctly
                    const indexContent = readFileSync(join(distDir, 'index.html'), 'utf8');
                    expect(indexContent).toMatch(/src="\.\/assets\/[^"]+\.js"/); // References JS in assets
                    expect(indexContent).toMatch(/href="\.\/assets\/[^"]+\.css"/); // References CSS in assets
                    
                    // Verify all referenced assets actually exist
                    const jsMatches = indexContent.match(/src="\.\/assets\/([^"]+\.js)"/g) || [];
                    const cssMatches = indexContent.match(/href="\.\/assets\/([^"]+\.css)"/g) || [];
                    
                    jsMatches.forEach(match => {
                        const filename = match.match(/assets\/([^"]+)/)[1];
                        expect(existsSync(join(assetsDir, filename))).toBe(true);
                    });
                    
                    cssMatches.forEach(match => {
                        const filename = match.match(/assets\/([^"]+)/)[1];
                        expect(existsSync(join(assetsDir, filename))).toBe(true);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 5: Build completeness (Static Assets)
     * Validates: Requirements 2.4, 3.3
     */
    it('should ensure all static assets are properly copied to dist', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    // Verify images directory and contents
                    const imagesDir = join(distDir, 'images');
                    expect(existsSync(imagesDir)).toBe(true);
                    
                    const imageFiles = readdirSync(imagesDir);
                    expect(imageFiles.length).toBeGreaterThan(0);
                    
                    // Verify content directory and contents
                    const contentDir = join(distDir, 'content');
                    expect(existsSync(contentDir)).toBe(true);
                    
                    const contentFiles = readdirSync(contentDir);
                    expect(contentFiles.length).toBeGreaterThan(0);
                    
                    // Verify all files in these directories are actual files, not empty
                    [...imageFiles, ...contentFiles].forEach(file => {
                        const filePath = join(file.includes('.') ? 
                            (file.endsWith('.pdf') ? contentDir : imagesDir) : imagesDir, file);
                        if (existsSync(filePath) && statSync(filePath).isFile()) {
                            expect(statSync(filePath).size).toBeGreaterThan(0);
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});