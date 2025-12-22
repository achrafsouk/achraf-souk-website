// Performance monitoring and optimization utilities
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.isSupported = 'performance' in window;

        if (this.isSupported) {
            this.setupPerformanceObservers();
        }
    }

    setupPerformanceObservers() {
        // Observe Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            this.observeMetric('largest-contentful-paint', (entries) => {
                const lcpEntry = entries[entries.length - 1];
                this.recordMetric('LCP', lcpEntry.startTime);
            });

            // First Input Delay (FID)
            this.observeMetric('first-input', (entries) => {
                const fidEntry = entries[0];
                this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime);
            });

            // Cumulative Layout Shift (CLS)
            this.observeMetric('layout-shift', (entries) => {
                let clsValue = 0;
                for (const entry of entries) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.recordMetric('CLS', clsValue);
            });
        }

        // Monitor resource loading
        this.monitorResourceLoading();
    }

    observeMetric(type, callback) {
        try {
            const observer = new PerformanceObserver((list) => {
                callback(list.getEntries());
            });
            observer.observe({ type, buffered: true });
            this.observers.set(type, observer);
        } catch (error) {
            console.warn(`Failed to observe ${type}:`, error);
        }
    }

    monitorResourceLoading() {
        // Monitor critical resource loading times
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.recordMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
                this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.loadEventStart);
            }

            // Monitor resource loading
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.name.includes('.js') || resource.name.includes('.css')) {
                    this.recordMetric(`Resource_${this.getResourceName(resource.name)}`, resource.duration);
                }
            });
        });
    }

    recordMetric(name, value) {
        this.metrics.set(name, {
            value,
            timestamp: Date.now()
        });

        // Log performance issues
        this.checkPerformanceThresholds(name, value);
    }

    checkPerformanceThresholds(name, value) {
        const thresholds = {
            'LCP': 2500, // 2.5 seconds
            'FID': 100,  // 100 milliseconds
            'CLS': 0.1   // 0.1 cumulative score
        };

        if (thresholds[name] && value > thresholds[name]) {
            console.warn(`Performance issue detected: ${name} = ${value} (threshold: ${thresholds[name]})`);
        }
    }

    getResourceName(url) {
        return url.split('/').pop().split('?')[0];
    }

    // Utility methods for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Lazy loading utility
    createIntersectionObserver(callback, options = {}) {
        const defaultOptions = {
            rootMargin: '50px 0px',
            threshold: 0.1
        };

        return new IntersectionObserver(callback, { ...defaultOptions, ...options });
    }

    // Memory management
    cleanupObservers() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }

    // Get performance report
    getPerformanceReport() {
        const report = {
            metrics: Object.fromEntries(this.metrics),
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };

        return report;
    }

    // Preload critical resources
    preloadResource(href, as, type = null) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) {link.type = type;}

        document.head.appendChild(link);
    }

    // Prefetch resources for next navigation
    prefetchResource(href) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;

        document.head.appendChild(link);
    }

    // Critical resource hints
    setupResourceHints() {
        // Preconnect to external domains
        const externalDomains = [
            'https://via.placeholder.com',
            'https://linkedin.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
}

// Image optimization utilities
export class ImageOptimizer {
    static createResponsiveImage(src, alt, sizes = []) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.loading = 'lazy';
        img.decoding = 'async';

        if (sizes.length > 0) {
            const srcset = sizes.map(size => `${src}?w=${size.width} ${size.width}w`).join(', ');
            img.srcset = srcset;
            img.sizes = sizes.map(size => `(max-width: ${size.breakpoint}px) ${size.width}px`).join(', ');
        }

        return img;
    }

    static compressImage(file, quality = 0.8, maxWidth = 1200) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
}

// Bundle size optimization
export class BundleOptimizer {
    static async loadModuleDynamically(modulePath) {
        try {
            const module = await import(modulePath);
            return module;
        } catch (error) {
            console.error(`Failed to load module ${modulePath}:`, error);
            return null;
        }
    }

    static preloadCriticalModules() {
        // Preload critical modules
        const criticalModules = [
            'js/components/hero.js',
            'js/state/appState.js'
        ];

        criticalModules.forEach(module => {
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = module;
            document.head.appendChild(link);
        });
    }
}
