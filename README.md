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

### Static Hosting Deployment

This website is fully optimized for static hosting. Build manually and deploy the `dist/` folder:
```bash
npm run build
cp -r assets/* dist/assets/
# Upload contents of ./dist/ to your hosting service
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

## License

MIT License - see LICENSE file for details