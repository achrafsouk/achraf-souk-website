# Deployment Configuration Guide

## Overview

This guide provides instructions for properly deploying the personal portfolio website to serve optimized files from the `dist/` directory instead of raw source files.

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)
- Build process completed (`npm run build`)

## Build Process

Before deployment, ensure the build process generates all necessary files:

```bash
# Install dependencies
npm install

# Run the build process
npm run build

# Verify build output
ls -la dist/
```

The build process should generate:
- `dist/index.html` - Main entry point with bundled asset references
- `dist/assets/` - Directory containing bundled JavaScript and CSS files
- `dist/images/` - Copied image assets
- `dist/content/` - Copied content files (PDFs, etc.)
- `dist/favicon.ico` and `dist/robots.txt` - Static files

## Web Server Configuration

### Document Root Configuration

**CRITICAL**: The web server document root MUST point to the `dist/` directory, not the project root.

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName www.achrafsouk.com
    DocumentRoot /path/to/project/dist
    
    <Directory "/path/to/project/dist">
        AllowOverride All
        Require all granted
    </Directory>
    
    # Cache headers for assets
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public, immutable"
    </LocationMatch>
    
    # Short cache for HTML files
    <LocationMatch "\.html$">
        ExpiresActive On
        ExpiresDefault "access plus 1 hour"
        Header append Cache-Control "public, must-revalidate"
    </LocationMatch>
</VirtualHost>
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name www.achrafsouk.com;
    root /path/to/project/dist;
    index index.html;
    
    # Cache headers for assets with hash in filename
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Short cache for HTML files
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # Fallback for SPA routing (if needed)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Node.js/Express Static Server

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
    maxAge: '1y', // Cache assets for 1 year
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            // Short cache for HTML files
            res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        }
    }
}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

## Cache Header Recommendations

### Asset Files (JavaScript, CSS, Images)
- **Cache-Control**: `public, max-age=31536000, immutable`
- **Expires**: 1 year from request
- **Rationale**: Vite generates hash-based filenames, so files are immutable

### HTML Files
- **Cache-Control**: `public, max-age=3600, must-revalidate`
- **Expires**: 1 hour from request
- **Rationale**: HTML may change with deployments, needs shorter cache

### Content Files (PDFs, Documents)
- **Cache-Control**: `public, max-age=86400`
- **Expires**: 1 day from request
- **Rationale**: Content files change less frequently but may be updated

## Deployment Checklist

1. **Build Verification**
   - [ ] Run `npm run build` successfully
   - [ ] Verify `dist/` directory contains all expected files
   - [ ] Check that `dist/index.html` references bundled assets (not source files)

2. **Server Configuration**
   - [ ] Document root points to `dist/` directory
   - [ ] Cache headers configured for different file types
   - [ ] MIME types properly configured
   - [ ] Compression enabled (gzip/brotli)

3. **Deployment Verification**
   - [ ] Website loads without JavaScript errors
   - [ ] All sections (hero, achievements, content) display correctly
   - [ ] Interactive features (filters, pagination) work
   - [ ] No 404 errors for assets in browser console

4. **Performance Verification**
   - [ ] Assets served with proper cache headers
   - [ ] JavaScript and CSS files are minified
   - [ ] Images optimized and properly served
   - [ ] Page load times acceptable

## Troubleshooting

### Common Issues

**Issue**: 404 errors for JavaScript modules
- **Cause**: Server serving from project root instead of `dist/`
- **Solution**: Update document root to point to `dist/` directory

**Issue**: Website loads but JavaScript doesn't work
- **Cause**: Missing build step or incomplete build
- **Solution**: Run `npm run build` and verify all files in `dist/`

**Issue**: Assets not cached properly
- **Cause**: Missing or incorrect cache headers
- **Solution**: Configure cache headers as shown above

**Issue**: Changes not reflected after deployment
- **Cause**: Browser cache or CDN cache
- **Solution**: Hard refresh (Ctrl+F5) or clear cache

### Verification Commands

```bash
# Check if build completed successfully
ls -la dist/

# Verify index.html references bundled assets
grep -E "(src=|href=)" dist/index.html

# Test local deployment
npx serve dist/

# Check cache headers (replace URL with your domain)
curl -I https://www.achrafsouk.com/
```

## Security Considerations

1. **File Permissions**: Ensure `dist/` directory has appropriate read permissions
2. **Directory Listing**: Disable directory listing in web server configuration
3. **HTTPS**: Always use HTTPS in production with proper SSL certificates
4. **Content Security Policy**: Consider adding CSP headers for additional security

## Monitoring and Maintenance

1. **Regular Builds**: Ensure build process runs before each deployment
2. **Asset Verification**: Periodically verify all assets are accessible
3. **Performance Monitoring**: Monitor page load times and asset delivery
4. **Cache Validation**: Verify cache headers are working as expected