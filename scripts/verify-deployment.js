#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that the deployment serves files from the dist/ directory
 * and validates that all assets are accessible with proper cache headers.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentVerifier {
    constructor(baseUrl = 'https://www.achrafsouk.com') {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.errors = [];
        this.warnings = [];
        this.distPath = path.join(process.cwd(), 'dist');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '✓',
            'warn': '⚠',
            'error': '✗'
        }[type] || 'ℹ';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        
        if (type === 'error') {
            this.errors.push(message);
        } else if (type === 'warn') {
            this.warnings.push(message);
        }
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            
            const req = protocol.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                });
            });
            
            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async verifyDistDirectory() {
        this.log('Verifying dist/ directory exists and contains built files...');
        
        if (!fs.existsSync(this.distPath)) {
            this.log('dist/ directory does not exist. Run "npm run build" first.', 'error');
            return false;
        }

        const requiredFiles = ['index.html'];
        const requiredDirs = ['assets'];
        
        for (const file of requiredFiles) {
            const filePath = path.join(this.distPath, file);
            if (!fs.existsSync(filePath)) {
                this.log(`Required file missing: ${file}`, 'error');
                return false;
            }
        }
        
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.distPath, dir);
            if (!fs.existsSync(dirPath)) {
                this.log(`Required directory missing: ${dir}`, 'error');
                return false;
            }
        }
        
        this.log('dist/ directory structure verified');
        return true;
    }

    async verifyIndexHtml() {
        this.log('Verifying index.html serves from dist/...');
        
        try {
            const response = await this.makeRequest(this.baseUrl);
            
            if (response.statusCode !== 200) {
                this.log(`Index page returned status ${response.statusCode}`, 'error');
                return false;
            }
            
            // Check if the HTML contains references to bundled assets (not source files)
            const html = response.data;
            
            // Look for bundled asset references (should contain /assets/ paths)
            const hasAssetReferences = html.includes('/assets/') || html.includes('assets/');
            if (!hasAssetReferences) {
                this.log('Index.html does not reference bundled assets from /assets/', 'error');
                return false;
            }
            
            // Check for problematic source file references
            const hasSourceReferences = html.includes('js/main.js') || html.includes('js/components/');
            if (hasSourceReferences) {
                this.log('Index.html still references unbundled source files', 'error');
                return false;
            }
            
            this.log('Index.html correctly references bundled assets');
            return true;
            
        } catch (error) {
            this.log(`Failed to fetch index.html: ${error.message}`, 'error');
            return false;
        }
    }

    async verifyAssetAccessibility() {
        this.log('Verifying asset accessibility...');
        
        try {
            // First get the index.html to extract asset URLs
            const indexResponse = await this.makeRequest(this.baseUrl);
            if (indexResponse.statusCode !== 200) {
                this.log('Cannot verify assets - index.html not accessible', 'error');
                return false;
            }
            
            const html = indexResponse.data;
            
            // Extract asset URLs from HTML
            const assetUrls = [];
            
            // Extract script src attributes
            const scriptMatches = html.match(/src="([^"]*\.js[^"]*)"/g) || [];
            scriptMatches.forEach(match => {
                const url = match.match(/src="([^"]*)"/)[1];
                if (url.startsWith('/') || url.startsWith('./')) {
                    assetUrls.push(url.replace(/^\.?\//, ''));
                }
            });
            
            // Extract link href attributes for CSS
            const linkMatches = html.match(/href="([^"]*\.css[^"]*)"/g) || [];
            linkMatches.forEach(match => {
                const url = match.match(/href="([^"]*)"/)[1];
                if (url.startsWith('/') || url.startsWith('./')) {
                    assetUrls.push(url.replace(/^\.?\//, ''));
                }
            });
            
            if (assetUrls.length === 0) {
                this.log('No asset URLs found in index.html', 'warn');
                return true;
            }
            
            let accessibleAssets = 0;
            
            for (const assetUrl of assetUrls) {
                const fullUrl = `${this.baseUrl}/${assetUrl}`;
                
                try {
                    const response = await this.makeRequest(fullUrl);
                    
                    if (response.statusCode === 200) {
                        this.log(`Asset accessible: ${assetUrl}`);
                        accessibleAssets++;
                    } else {
                        this.log(`Asset not accessible (${response.statusCode}): ${assetUrl}`, 'error');
                    }
                } catch (error) {
                    this.log(`Failed to fetch asset ${assetUrl}: ${error.message}`, 'error');
                }
            }
            
            const successRate = accessibleAssets / assetUrls.length;
            if (successRate < 1.0) {
                this.log(`Only ${accessibleAssets}/${assetUrls.length} assets accessible`, 'error');
                return false;
            }
            
            this.log(`All ${accessibleAssets} assets are accessible`);
            return true;
            
        } catch (error) {
            this.log(`Asset verification failed: ${error.message}`, 'error');
            return false;
        }
    }

    async verifyCacheHeaders() {
        this.log('Verifying cache headers...');
        
        try {
            // Check cache headers for different file types
            const testUrls = [
                { url: this.baseUrl, type: 'HTML', expectedMaxAge: 3600 },
            ];
            
            // Get asset URLs from index.html
            const indexResponse = await this.makeRequest(this.baseUrl);
            if (indexResponse.statusCode === 200) {
                const html = indexResponse.data;
                
                // Find first JS and CSS assets
                const jsMatch = html.match(/src="([^"]*\.js[^"]*)"/);
                const cssMatch = html.match(/href="([^"]*\.css[^"]*)"/);
                
                if (jsMatch) {
                    const jsUrl = jsMatch[1].replace(/^\.?\//, '');
                    testUrls.push({
                        url: `${this.baseUrl}/${jsUrl}`,
                        type: 'JavaScript',
                        expectedMaxAge: 31536000 // 1 year
                    });
                }
                
                if (cssMatch) {
                    const cssUrl = cssMatch[1].replace(/^\.?\//, '');
                    testUrls.push({
                        url: `${this.baseUrl}/${cssUrl}`,
                        type: 'CSS',
                        expectedMaxAge: 31536000 // 1 year
                    });
                }
            }
            
            let cacheHeadersCorrect = true;
            
            for (const test of testUrls) {
                try {
                    const response = await this.makeRequest(test.url);
                    
                    if (response.statusCode !== 200) {
                        this.log(`Cannot check cache headers for ${test.type} - not accessible`, 'warn');
                        continue;
                    }
                    
                    const cacheControl = response.headers['cache-control'];
                    const expires = response.headers['expires'];
                    
                    if (!cacheControl && !expires) {
                        this.log(`No cache headers found for ${test.type}`, 'warn');
                        cacheHeadersCorrect = false;
                        continue;
                    }
                    
                    if (cacheControl) {
                        // Parse max-age from cache-control
                        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
                        if (maxAgeMatch) {
                            const maxAge = parseInt(maxAgeMatch[1]);
                            if (maxAge >= test.expectedMaxAge * 0.8) { // Allow 20% tolerance
                                this.log(`Cache headers correct for ${test.type}: ${cacheControl}`);
                            } else {
                                this.log(`Cache max-age too low for ${test.type}: ${maxAge} (expected ~${test.expectedMaxAge})`, 'warn');
                                cacheHeadersCorrect = false;
                            }
                        } else {
                            this.log(`Cache-Control header present for ${test.type} but no max-age: ${cacheControl}`, 'warn');
                        }
                    }
                    
                } catch (error) {
                    this.log(`Failed to check cache headers for ${test.type}: ${error.message}`, 'warn');
                }
            }
            
            return cacheHeadersCorrect;
            
        } catch (error) {
            this.log(`Cache header verification failed: ${error.message}`, 'error');
            return false;
        }
    }

    async verifyFunctionality() {
        this.log('Verifying basic functionality...');
        
        try {
            const response = await this.makeRequest(this.baseUrl);
            
            if (response.statusCode !== 200) {
                this.log('Website not accessible for functionality test', 'error');
                return false;
            }
            
            const html = response.data;
            
            // Check for key content sections
            const hasHeroSection = html.includes('hero') || html.includes('banner');
            const hasAchievements = html.includes('achievement') || html.includes('accomplishment');
            const hasContent = html.includes('content') || html.includes('portfolio');
            
            if (!hasHeroSection) {
                this.log('Hero section not found in HTML', 'warn');
            }
            
            if (!hasAchievements) {
                this.log('Achievements section not found in HTML', 'warn');
            }
            
            if (!hasContent) {
                this.log('Content section not found in HTML', 'warn');
            }
            
            // Check for JavaScript loading (presence of script tags)
            const hasScripts = html.includes('<script') && html.includes('.js');
            if (!hasScripts) {
                this.log('No JavaScript files found in HTML', 'error');
                return false;
            }
            
            this.log('Basic functionality verification completed');
            return true;
            
        } catch (error) {
            this.log(`Functionality verification failed: ${error.message}`, 'error');
            return false;
        }
    }

    async run() {
        console.log('🚀 Starting deployment verification...\n');
        
        const checks = [
            { name: 'Dist Directory', fn: () => this.verifyDistDirectory() },
            { name: 'Index HTML', fn: () => this.verifyIndexHtml() },
            { name: 'Asset Accessibility', fn: () => this.verifyAssetAccessibility() },
            { name: 'Cache Headers', fn: () => this.verifyCacheHeaders() },
            { name: 'Basic Functionality', fn: () => this.verifyFunctionality() }
        ];
        
        const results = {};
        
        for (const check of checks) {
            console.log(`\n--- ${check.name} ---`);
            try {
                results[check.name] = await check.fn();
            } catch (error) {
                this.log(`Check failed with error: ${error.message}`, 'error');
                results[check.name] = false;
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('DEPLOYMENT VERIFICATION SUMMARY');
        console.log('='.repeat(50));
        
        const passed = Object.values(results).filter(Boolean).length;
        const total = Object.keys(results).length;
        
        for (const [checkName, result] of Object.entries(results)) {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${checkName}`);
        }
        
        console.log(`\nOverall: ${passed}/${total} checks passed`);
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  ${this.warnings.length} warnings:`);
            this.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ ${this.errors.length} errors:`);
            this.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        const success = passed === total && this.errors.length === 0;
        
        if (success) {
            console.log('\n🎉 Deployment verification completed successfully!');
        } else {
            console.log('\n💥 Deployment verification failed. Please check the errors above.');
        }
        
        process.exit(success ? 0 : 1);
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const baseUrl = args[0] || 'https://www.achrafsouk.com';
    
    console.log(`Verifying deployment at: ${baseUrl}`);
    
    const verifier = new DeploymentVerifier(baseUrl);
    verifier.run().catch(error => {
        console.error('Verification script failed:', error);
        process.exit(1);
    });
}

export default DeploymentVerifier;