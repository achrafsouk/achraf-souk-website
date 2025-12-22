# Website Deployment Checklist

## Overview

This checklist ensures proper deployment of the personal portfolio website, serving optimized files from the `dist/` directory instead of unbundled source files.

## Pre-Deployment Checklist

### 1. Code Quality Verification
- [ ] **Run linting**: `npm run lint`
  - Ensure no ESLint errors
  - Fix any code quality issues
- [ ] **Run tests**: `npm run test`
  - All unit tests must pass
  - All property-based tests must pass
  - No failing test cases

### 2. Build Process
- [ ] **Clean previous build**: `npm run clean`
  - Removes old `dist/` directory
  - Ensures fresh build
- [ ] **Run full build**: `npm run build`
  - Vite processes all source files
  - Generates optimized bundles in `dist/`
- [ ] **Verify build output**: `npm run verify:build`
  - Confirms `dist/index.html` exists
  - Confirms `dist/assets/` directory exists
  - Validates build completeness

### 3. Local Testing
- [ ] **Preview locally**: `npm run preview`
  - Test built files locally on http://localhost:4173
  - Verify all sections load correctly (hero, achievements, content)
  - Test interactive features (filters, pagination)
- [ ] **Run local verification**: `npm run verify:local`
  - Validates asset accessibility
  - Checks for proper bundled file references
  - Confirms no 404 errors for JavaScript modules

## Deployment Process

### Step 1: Prepare for Deployment
- [ ] **Run complete deployment build**: `npm run deploy:build`
  - Executes: lint → test → build → verify:build
  - Must complete without errors
- [ ] **Review build output**:
  - Check `dist/` directory structure
  - Verify file sizes are reasonable (minified)
  - Confirm hash-based filenames for cache busting

### Step 2: Server Configuration
- [ ] **Configure web server document root**:
  - Set document root to `dist/` directory
  - **NOT** to project root directory
  - Example paths:
    - ✅ `/path/to/project/dist/`
    - ❌ `/path/to/project/`
- [ ] **Configure MIME types**:
  - `.js` files: `application/javascript`
  - `.css` files: `text/css`
  - `.html` files: `text/html`
- [ ] **Set up cache headers**:
  - HTML files: `Cache-Control: max-age=3600` (1 hour)
  - JS/CSS assets: `Cache-Control: max-age=31536000` (1 year)
  - Images: `Cache-Control: max-age=86400` (1 day)

### Step 3: Deploy Files
- [ ] **Upload `dist/` contents to web server**:
  - Upload entire `dist/` directory contents
  - Maintain directory structure
  - Ensure file permissions are correct (readable by web server)
- [ ] **Verify file upload**:
  - Check that `index.html` exists at web root
  - Confirm `assets/` directory is present
  - Verify all files uploaded successfully

### Step 4: Post-Deployment Verification
- [ ] **Run deployment verification**: `npm run verify:deployment`
  - Tests live website at https://www.achrafsouk.com
  - Validates all assets are accessible
  - Checks cache headers
  - Confirms functionality
- [ ] **Manual verification**:
  - [ ] Website loads without JavaScript errors
  - [ ] Hero section displays correctly
  - [ ] Achievements section shows content
  - [ ] Content sections are visible
  - [ ] Filter buttons work
  - [ ] Pagination functions correctly
  - [ ] No 404 errors in browser console

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: 404 Errors for JavaScript Modules
**Symptoms**: Browser console shows errors like "Failed to load module script: js/main.js"
**Cause**: Web server serving from project root instead of `dist/`
**Solution**:
1. Verify web server document root points to `dist/` directory
2. Check that `dist/index.html` references bundled assets (contains `/assets/` paths)
3. Ensure build process completed successfully

#### Issue: Website Loads but No Functionality
**Symptoms**: Page displays but buttons don't work, no interactive features
**Cause**: JavaScript files not loading or not bundled correctly
**Solution**:
1. Check browser console for JavaScript errors
2. Verify `dist/assets/` contains JavaScript files
3. Run `npm run build` to regenerate bundles
4. Check that `index.html` references correct asset files

#### Issue: Slow Loading Times
**Symptoms**: Website takes long time to load
**Cause**: Missing cache headers or unoptimized assets
**Solution**:
1. Configure cache headers on web server
2. Verify files in `dist/assets/` are minified
3. Check that Vite build process includes optimization
4. Run `npm run build:analyze` to analyze bundle sizes

#### Issue: Build Process Fails
**Symptoms**: `npm run build` exits with errors
**Cause**: Code issues, missing dependencies, or configuration problems
**Solution**:
1. Run `npm run lint` to check for code issues
2. Run `npm run test` to identify failing tests
3. Check that all dependencies are installed: `npm install`
4. Review Vite configuration in `vite.config.js`

#### Issue: Verification Script Fails
**Symptoms**: `npm run verify:deployment` reports errors
**Cause**: Deployment configuration issues or missing files
**Solution**:
1. Check that web server document root is correct
2. Verify all files uploaded successfully
3. Test individual asset URLs manually
4. Check web server error logs
5. Ensure proper MIME types configured

### Emergency Rollback Procedure
If deployment fails and website is not accessible:
1. **Immediate**: Restore previous working version from backup
2. **Investigate**: Run verification scripts on local copy
3. **Fix**: Address issues identified in verification
4. **Re-deploy**: Follow full deployment checklist again

## Deployment Scripts Reference

### Available NPM Scripts
- `npm run deploy:build` - Complete build with verification
- `npm run deploy:production` - Build and verify live deployment
- `npm run deploy:staging` - Build and verify local deployment
- `npm run verify:deployment` - Verify live website
- `npm run verify:local` - Verify local preview
- `npm run verify:build` - Verify build output
- `npm run clean` - Clean dist directory
- `npm run build` - Build for production
- `npm run preview` - Preview built files locally

### Verification Checklist
The verification script checks:
- [ ] `dist/` directory exists and contains required files
- [ ] `index.html` serves from correct location
- [ ] All referenced assets are accessible
- [ ] Cache headers are properly configured
- [ ] Basic website functionality works

## Success Criteria

Deployment is successful when:
- ✅ All verification scripts pass without errors
- ✅ Website loads at https://www.achrafsouk.com
- ✅ No JavaScript 404 errors in browser console
- ✅ All interactive features work correctly
- ✅ Page load times are reasonable (< 3 seconds)
- ✅ Cache headers are properly configured

## Maintenance Notes

### Regular Maintenance
- Run deployment verification monthly: `npm run verify:deployment`
- Update dependencies quarterly and test deployment
- Monitor web server logs for 404 errors
- Check website performance metrics regularly

### When to Re-deploy
- After any code changes to source files
- After updating dependencies
- After modifying build configuration
- After web server configuration changes

---

**Last Updated**: December 2024
**Version**: 1.0
**Contact**: See README.md for support information