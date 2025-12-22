// Property-based tests for CSS optimization
import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

describe('CSS Optimization Property Tests', () => {
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
     * Feature: website-deployment-fix, Property 3: CSS file optimization
     * Validates: Requirements 2.2
     */
    it('should ensure CSS files are minified and optimized', () => {
        return fc.assert(
            fc.property(
                fc.constant(null), // We test the actual built files, no random input needed
                () => {
                    // Verify assets directory exists
                    expect(existsSync(assetsDir)).toBe(true);
                    
                    // Find all CSS files in assets directory
                    const assetFiles = readdirSync(assetsDir);
                    const cssFiles = assetFiles.filter(f => extname(f) === '.css');
                    
                    // Should have at least one CSS file
                    expect(cssFiles.length).toBeGreaterThan(0);
                    
                    // For each CSS file, verify optimization
                    cssFiles.forEach(cssFile => {
                        const filePath = join(assetsDir, cssFile);
                        const cssContent = readFileSync(filePath, 'utf8');
                        const stats = statSync(filePath);
                        
                        // File should not be empty
                        expect(stats.size).toBeGreaterThan(0);
                        expect(cssContent.length).toBeGreaterThan(0);
                        
                        // Minified CSS should have low whitespace ratio
                        const whitespaceRatio = (cssContent.match(/\s/g) || []).length / cssContent.length;
                        expect(whitespaceRatio).toBeLessThan(0.2); // Less than 20% whitespace for minified CSS
                        
                        // Should not contain CSS comments (minified files strip comments)
                        expect(cssContent).not.toMatch(/\/\*[\s\S]*?\*\//); // No CSS comments
                        
                        // Should contain CSS syntax indicators
                        expect(cssContent).toMatch(/[{}:;]/); // Basic CSS syntax
                        
                        // File should have hash-based name for cache busting
                        expect(cssFile).toMatch(/-[a-zA-Z0-9_-]+\.css$/);
                        
                        // Should not contain excessive line breaks (minified files are typically on few lines)
                        const lineCount = cssContent.split('\n').length;
                        expect(lineCount).toBeLessThan(10); // Minified CSS should have very few lines
                        
                        // Should be reasonably dense (not just whitespace)
                        const nonWhitespaceChars = cssContent.replace(/\s/g, '').length;
                        const compressionRatio = nonWhitespaceChars / cssContent.length;
                        expect(compressionRatio).toBeGreaterThan(0.8); // At least 80% non-whitespace
                        
                        // Should not contain unnecessary whitespace patterns
                        expect(cssContent).not.toMatch(/\n\s*\n/); // No double line breaks
                        expect(cssContent).not.toMatch(/\s{2,}/); // No multiple consecutive spaces
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: website-deployment-fix, Property 3: CSS file optimization (Content Analysis)
     * Validates: Requirements 2.2
     */
    it('should ensure CSS files contain optimized content', () => {
        return fc.assert(
            fc.property(
                fc.constant(null),
                () => {
                    const assetFiles = readdirSync(assetsDir);
                    const cssFiles = assetFiles.filter(f => extname(f) === '.css');
                    
                    expect(cssFiles.length).toBeGreaterThan(0);
                    
                    cssFiles.forEach(cssFile => {
                        const filePath = join(assetsDir, cssFile);
                        const cssContent = readFileSync(filePath, 'utf8');
                        
                        // CSS should be substantial in size (contain actual styles)
                        expect(cssContent.length).toBeGreaterThan(1000); // At least 1KB for meaningful CSS
                        
                        // Should contain CSS selectors and properties
                        expect(cssContent).toMatch(/[a-zA-Z0-9_-]+\{/); // Selectors with opening braces
                        expect(cssContent).toMatch(/[a-zA-Z-]+:[^;]+;/); // Properties with values
                        
                        // Should not contain development artifacts
                        expect(cssContent).not.toMatch(/@import/); // No @import statements (should be bundled)
                        expect(cssContent).not.toMatch(/sourceMappingURL/); // No source map references in CSS content
                        
                        // Should contain optimized patterns
                        const hasOptimizedPatterns = 
                            cssContent.includes('0 ') || // Optimized zero values
                            cssContent.match(/:[0-9]/); // No space after colon
                        
                        expect(hasOptimizedPatterns).toBe(true);
                        
                        // Should not contain unnecessary formatting
                        expect(cssContent).not.toMatch(/\{\s*\n/); // No newline after opening brace
                        expect(cssContent).not.toMatch(/\n\s*\}/); // No newline before closing brace
                        
                        // Verify it's valid CSS by checking for balanced braces
                        const openBraces = (cssContent.match(/\{/g) || []).length;
                        const closeBraces = (cssContent.match(/\}/g) || []).length;
                        expect(openBraces).toBe(closeBraces);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});