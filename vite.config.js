import { defineConfig } from 'vite';

export default defineConfig({
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        // Manual chunks can be added here when needed
        manualChunks: undefined,
        // Optimize asset naming for better caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Optimize for static hosting
    target: 'es2015',
    cssCodeSplit: false,
    // Ensure all assets are properly bundled
    assetsInlineLimit: 4096
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },

  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  },

  // Test configuration
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js']
  },

  // Asset optimization
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],

  // CSS configuration
  css: {
    devSourcemap: true
  },

  // Base path for deployment
  base: './',

  // Plugin configuration (can be extended later)
  plugins: []
});