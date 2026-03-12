// Performance Utilities - CRM Odonto Company
// ================================================

/**
 * Virtualization for long lists
 */
class VirtualList {
    constructor(container, itemHeight, totalItems, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.totalItems = totalItems;
        this.renderItem = renderItem;
        this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
        this.scrollTop = 0;
        this.items = [];

        this.init();
    }

    init() {
        this.container.style.height = `${this.totalItems * this.itemHeight}px`;
        this.container.style.position = 'relative';
        this.container.addEventListener('scroll', this.onScroll.bind(this));
        this.onScroll();
    }

    onScroll() {
        this.scrollTop = this.container.scrollTop;
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(startIndex + this.visibleItems, this.totalItems);

        // Remove old items
        this.container.innerHTML = '';

        // Add new items
        for (let i = startIndex; i < endIndex; i++) {
            const item = this.renderItem(i);
            item.style.position = 'absolute';
            item.style.top = `${i * this.itemHeight}px`;
            item.style.height = `${this.itemHeight}px`;
            item.style.width = '100%';
            this.container.appendChild(item);
        }
    }
}

/**
 * Lazy loading for images
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

/**
 * Memory management
 */
class MemoryManager {
    constructor() {
        this.listeners = new Map();
        this.intervals = new Set();
        this.timeouts = new Set();
    }

    addListener(element, event, handler) {
        if (!this.listeners.has(element)) {
            this.listeners.set(element, new Map());
        }
        this.listeners.get(element).set(event, handler);
        element.addEventListener(event, handler);
    }

    removeListeners(element) {
        if (this.listeners.has(element)) {
            const events = this.listeners.get(element);
            events.forEach((handler, event) => {
                element.removeEventListener(event, handler);
            });
            this.listeners.delete(element);
        }
    }

    addInterval(callback, delay) {
        const id = setInterval(callback, delay);
        this.intervals.add(id);
        return id;
    }

    addTimeout(callback, delay) {
        const id = setTimeout(callback, delay);
        this.timeouts.add(id);
        return id;
    }

    clearAll() {
        // Clear intervals
        this.intervals.forEach(id => clearInterval(id));
        this.intervals.clear();

        // Clear timeouts
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts.clear();

        // Clear listeners
        this.listeners.forEach((events, element) => {
            this.removeListeners(element);
        });
    }
}

/**
 * Pagination helper
 */
class Paginator {
    constructor(data, itemsPerPage = 20) {
        this.data = data;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(data.length / itemsPerPage);
    }

    getPage(page) {
        if (page < 1 || page > this.totalPages) return [];
        this.currentPage = page;
        const start = (page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.data.slice(start, end);
    }

    hasNext() {
        return this.currentPage < this.totalPages;
    }

    hasPrev() {
        return this.currentPage > 1;
    }

    nextPage() {
        if (this.hasNext()) return this.getPage(this.currentPage + 1);
        return this.getPage(this.currentPage);
    }

    prevPage() {
        if (this.hasPrev()) return this.getPage(this.currentPage - 1);
        return this.getPage(this.currentPage);
    }
}

/**
 * Cache manager
 */
class CacheManager {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    get(key) {
        return this.cache.get(key);
    }

    has(key) {
        return this.cache.has(key);
    }

    clear() {
        this.cache.clear();
    }
}

// Export to global scope
window.VirtualList = VirtualList;
window.initLazyLoading = initLazyLoading;
window.MemoryManager = MemoryManager;
window.Paginator = Paginator;
window.CacheManager = CacheManager;