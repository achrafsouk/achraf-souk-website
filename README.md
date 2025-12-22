# Personal Portfolio Website

A responsive, accessible personal portfolio website built with modern web technologies. Features a clean design showcasing professional achievements, bio information, and thought leadership content.

## Features

- **Responsive Design**: Mobile-first approach with seamless adaptation across devices
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Content Management**: Filterable and paginated thought leadership content
- **Performance Optimized**: Fast loading with asset optimization and lazy loading
- **Modern Architecture**: Component-based JavaScript with clean separation of concerns

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **Testing**: Vitest with fast-check for property-based testing
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building for Production

Build the optimized production version:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Deployment

### Building and Deploying

This website is fully optimized for static hosting. Follow these steps for deployment:

#### 1. Build the Project

```bash
# Clean previous builds and create optimized production build
npm run build
```

This command will:
- Clean the `dist/` directory
- Bundle and minify JavaScript files
- Optimize CSS files
- Copy static assets with proper naming
- Generate source maps for debugging
- Verify build completeness

#### 2. Deploy to Web Server

**Important**: Always deploy the contents of the `dist/` directory, not the project root.

```bash
# Upload contents of ./dist/ to your hosting service
# Example for various hosting platforms:

# Static hosting (Netlify, Vercel, etc.)
# Simply drag and drop the dist/ folder or connect to your repository

# Traditional web hosting
# Upload dist/ contents to your web server's document root (e.g., public_html/)

# AWS S3 + CloudFront
aws s3 sync dist/ s3://your-bucket-name --delete

# GitHub Pages (using gh-pages branch)
npm install -g gh-pages
gh-pages -d dist
```

### Web Server Configuration Requirements

#### Document Root Configuration

**Critical**: Your web server must serve files from the `dist/` directory, not the project root.

**Apache (.htaccess in dist/ directory):**
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache headers for assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache headers
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

#### Required MIME Types

Ensure your web server serves these MIME types correctly:
- `.js` files: `application/javascript`
- `.css` files: `text/css`
- `.html` files: `text/html`
- `.json` files: `application/json`

### Deployment Verification

After deployment, verify your site is working correctly:

```bash
# Run deployment verification script
npm run verify:deployment

# Or verify against a specific URL
node scripts/verify-deployment.js https://your-domain.com
```

The verification script checks:
- ✅ All assets are accessible
- ✅ JavaScript and CSS files are properly minified
- ✅ Cache headers are configured correctly
- ✅ Basic functionality works

### Automated Deployment Scripts

Use the provided deployment scripts for different environments:

```bash
# Full production deployment (includes linting, testing, building, and verification)
npm run deploy:production

# Staging deployment with local verification
npm run deploy:staging

# Build and preview locally
npm run deploy:preview
```

### Troubleshooting Common Deployment Issues

#### Issue: 404 Errors for JavaScript Modules

**Symptoms**: Console errors like "Failed to load module script" or 404 errors for files in `js/` directory

**Cause**: Web server is serving from project root instead of `dist/` directory

**Solution**:
1. Verify your web server document root points to the `dist/` directory
2. Check that `dist/index.html` exists and references assets in `assets/` directory
3. Ensure you ran `npm run build` before deployment

#### Issue: Website Shows Blank Page

**Symptoms**: White screen, no content visible

**Cause**: JavaScript files not loading or MIME type issues

**Solution**:
1. Check browser console for JavaScript errors
2. Verify web server serves `.js` files with `application/javascript` MIME type
3. Ensure all assets in `dist/assets/` are accessible
4. Run `npm run verify:deployment` to check asset accessibility

#### Issue: Styles Not Applied

**Symptoms**: Unstyled content, missing CSS

**Cause**: CSS files not loading or incorrect MIME types

**Solution**:
1. Verify CSS files exist in `dist/assets/`
2. Check that web server serves `.css` files with `text/css` MIME type
3. Ensure CSS files are referenced correctly in `dist/index.html`

#### Issue: Slow Loading Performance

**Symptoms**: Long load times, poor performance scores

**Solution**:
1. Enable gzip compression on your web server
2. Configure proper cache headers (see web server configuration above)
3. Verify assets are served with long-term cache headers
4. Use a CDN for better global performance

#### Issue: Build Fails

**Symptoms**: `npm run build` command fails

**Solution**:
1. Ensure Node.js version is 18.0.0 or higher
2. Delete `node_modules/` and `package-lock.json`, then run `npm install`
3. Check for syntax errors in JavaScript files
4. Run `npm run lint` to identify code issues

### Deployment Checklist

Before deploying to production:

- [ ] Run `npm run lint` - no linting errors
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run build` - build completes successfully
- [ ] Verify `dist/` directory contains all required files
- [ ] Test locally with `npm run preview`
- [ ] Configure web server to serve from `dist/` directory
- [ ] Set up proper cache headers
- [ ] Run deployment verification script
- [ ] Test website functionality in production environment

### Hosting Platform Specific Instructions

#### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

#### Vercel
1. Import your repository to Vercel
2. Framework preset: Other
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

#### GitHub Pages
```bash
# Build and deploy to gh-pages branch
npm run build
npx gh-pages -d dist
```

#### AWS S3 + CloudFront
```bash
# Build and sync to S3
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```


### Performance
- **Total size**: ~77.5 KB (22.5 KB gzipped)
- **Load time**: < 1 second on standard connections
- **Lighthouse score**: 95+ across all metrics

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Code Quality

Lint the code:
```bash
npm run lint
```

Format the code:
```bash
npm run format
```

## Project Structure

```
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # Main stylesheet with responsive design
├── js/
│   ├── main.js             # Application entry point
│   ├── components/         # UI components
│   │   ├── hero.js         # Hero section component
│   │   ├── achievements.js # Achievements component
│   │   └── content.js      # Content filtering and pagination
│   ├── state/
│   │   └── appState.js     # Application state management
│   └── data/
│       └── sampleData.js   # Sample data for development
├── test/
│   └── setup.js            # Test configuration
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Build configuration
└── README.md               # Project documentation
```

## Customization

### Profile Information

Update the profile data in `js/data/sampleData.js`:

```javascript
profile: {
    name: "Your Name",
    bio: "Your professional bio...",
    profileImage: {
        src: "path/to/your/image.jpg",
        alt: "Your name profile picture",
        fallbackInitials: "YN"
    },
    linkedinUrl: "https://linkedin.com/in/yourprofile"
}
```

### Achievements

Add your achievements to the `achievements` array in `sampleData.js`:

```javascript
{
    id: "unique-id",
    title: "Achievement Title",
    description: "Achievement description...",
    order: 1
}
```

### Content Items

Add your thought leadership content to the `content` array:

```javascript
{
    id: "unique-id",
    title: "Content Title",
    type: "talk|blog|whitepaper|article",
    publicationDate: "YYYY-MM-DD",
    description: "Content description...",
    externalLink: "https://link-to-content.com"
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

