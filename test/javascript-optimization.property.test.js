// Property-based tests for JavaScript optimization
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

describe('JavaScript Optimization Property Tests', () => {
    const distDir = 'dist';
    const assetsDir = join(distDir, 'assets');

    beforeAll(() => {
        // Ensure we have a fresh build for testing
        try {
            execSync('npm run build', { stdio: 'pipe' });
        } catch (error) {
            throw new Error(`Build failed: ${error.message}`);
        }
    });

    /**
     * Feature: website-deployment-fix, Property 2: JavaScript file optimization
     * Validates: Requirements 2.1
     */
    it('should ensure JavaScript files are minified and bundled', () => {
        return fc.assert(
            fc.property(
                fc.constant(null), // We test the actual built files, no random input needed
                () => {
                    // Verify assets directory exists
                    expect(existsSync(assetsDir)).toBe(true);
                    
                    // Find all JavaScript files in assets directory
                    const assetFiles = readdirSync(assetsDir);
                    const jsFiles = assetFiles.filter(f => extname(f) === '.js' && !f.endsWith('.map'));
                    
                    // Should have at least one JavaScript file
                    expect(jsFiles.length).toBeGreaterThan(0);
                    
                    // For each JavaScript file, verify optimization
                    jsFiles.forEach(jsFile => {
                        const filePath = join(assetsDir, jsFile);
                        const jsContent = readFileSync(filePath, 'utf8');
                        const stats = statSync(filePath);
                        
                        // File should not be empty
                        expect(stats.size).toBeGreaterThan(0);
                        expect(jsContent.length).toBeGreaterThan(0);
                        
                        // Minified files should have high character density (low whitespace ratio)
                        const whitespaceRatio = (jsContent.match(/\s/g) || []).length / jsContent.length;
                        expect(whitespaceRatio).toBeLessThan(0.3); // Less than 30% whitespace indicates minification
                        
                        // Should not contain excessive line breaks (minified files are typically on few lines)
                        const lineCount = jsContent.split('\n').length;
                        expect(lineCount).toBeLessThan(10); // Minified files should have very few lines
                        
                        // Should contain minified variable names (single letters)
                        expect(jsContent).toMatch(/\b[a-z]\s*=/); // Single letter variables
                        
                        // Should not contain comments (minified files strip comments)
                        expect(jsContent).not.toMatch(/\/\*[\s\S]*?\*\//); // No block comments
                        expect(jsContent).not.toMatch(/\/\/.*$/m); // No line comments
                        
                        // Should contain JavaScript syntax indicators
                        expect(jsContent).toMatch(/[{}();]/); // Basic JS syntax
                        
                        // File should have hash-based name for cache busting
                        expect(jsFile).toMatch(/-[a-zA-Z0-9_-]+\.js$/);
                        
                        // Should be significantly smaller than typical unminified code
                        // Estimate: minified code is typically 30-70% smaller than original
                        // We'll check that the file is reasonably dense (not just whitespace)
                        const nonWhitespaceChars = jsContent.replace(/\s/g, '').length;
                        const compressionRatio = nonWhitespaceChars / jsContent.length;
                        expect(compressionRatio).toBeGreaterThan(0.7); // At least 70% non-whitespace
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 2: JavaScript file optimization (Bundle Analysis)
     * Validates: Requirements 2.1
     */
    it('should ensure JavaScript files are properly bundled with optimizations', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    const assetFiles = readdirSync(assetsDir);
                    const jsFiles = assetFiles.filter(f => extname(f) === '.js' && !f.endsWith('.map'));
                    
                    expect(jsFiles.length).toBeGreaterThan(0);
                    
                    // Check that we have a reasonable number of JS files (bundling should consolidate)
                    // For a typical SPA, we should have 1-3 main JS files, not dozens
                    expect(jsFiles.length).toBeLessThan(10); // Bundled files should be consolidated
                    
                    jsFiles.forEach(jsFile => {
                        const filePath = join(assetsDir, jsFile);
                        const jsContent = readFileSync(filePath, 'utf8');
                        
                        // Bundled files should be substantial in size (contain multiple modules)
                        expect(jsContent.length).toBeGreaterThan(1000); // At least 1KB for bundled content
                        
                        // Should contain bundler artifacts (indicating it's been processed)
                        const hasBundlerArtifacts = 
                            jsContent.includes('Object.defineProperty') || // Common in bundled code
                            jsContent.includes('__webpack') || // Webpack artifacts
                            jsContent.includes('function(') || // Function wrappers
                            jsContent.match(/\w+\(\w+,\w+,\w+\)/); // Minified function calls
                        
                        expect(hasBundlerArtifacts).toBe(true);
                        
                        // Should not contain ES6 import/export statements (should be bundled)
                        expect(jsContent).not.toMatch(/^import\s+/m);
                        expect(jsContent).not.toMatch(/^export\s+/m);
                        
                        // Should contain optimized code patterns
                        const hasOptimizedPatterns = 
                            jsContent.includes('!0') || // true optimized to !0
                            jsContent.includes('!1') || // false optimized to !1
                            jsContent.match(/\w+\|\|\w+/); // Logical OR optimizations
                        
                        expect(hasOptimizedPatterns).toBe(true);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});