// Accessibility Utilities - CRM Odonto Company
// ================================================

/**
 * Add ARIA labels and keyboard navigation
 */
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.addKeyboardNavigation();
        this.addARIALabels();
        this.addFocusManagement();
        this.addScreenReaderSupport();
    }

    /**
     * Add keyboard navigation
     */
    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            // Focus management shortcuts
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }

            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    /**
     * Add ARIA labels to interactive elements
     */
    addARIALabels() {
        // Buttons
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                const text = btn.textContent.trim();
                if (text) {
                    btn.setAttribute('aria-label', text);
                }
            }
        });

        // Inputs
        document.querySelectorAll('input').forEach(input => {
            if (!input.getAttribute('aria-label')) {
                const label = input.closest('label');
                if (label) {
                    input.setAttribute('aria-label', label.textContent.trim());
                } else {
                    const placeholder = input.getAttribute('placeholder');
                    if (placeholder) {
                        input.setAttribute('aria-label', placeholder);
                    }
                }
            }
        });

        // Modal dialogs
        document.querySelectorAll('.modal').forEach(modal => {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            const title = modal.querySelector('.modal-header h3');
            if (title) {
                modal.setAttribute('aria-labelledby', title.id || 'modal-title');
            }
        });
    }

    /**
     * Add focus management
     */
    addFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    this.trapFocus(modal, e);
                }
            }
        });
    }

    /**
     * Trap focus within modal
     */
    trapFocus(modal, event) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * Add screen reader support
     */
    addScreenReaderSupport() {
        // Live regions for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);

        window.screenReaderAnnounce = (message) => {
            liveRegion.textContent = '';
            setTimeout(() => {
                liveRegion.textContent = message;
            }, 100);
        };
    }

    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * Close modals
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.click();
            }
        });
    }
}

/**
 * High contrast mode toggle
 */
function toggleHighContrast() {
    const body = document.body;
    body.classList.toggle('high-contrast');

    const isHighContrast = body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);

    // Announce the change to screen readers
    if (window.screenReaderAnnounce) {
        window.screenReaderAnnounce(isHighContrast ? 'Modo alto contraste ativado' : 'Modo alto contraste desativado');
    }
}

/**
 * Font size adjustment
 */
function adjustFontSize(direction) {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize);
    const newSize = direction === 'increase' ? currentSize + 2 : currentSize - 2;

    if (newSize >= 12 && newSize <= 24) {
        root.style.fontSize = `${newSize}px`;
        localStorage.setItem('fontSize', newSize);
    }
}

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    new AccessibilityManager();

    // Load saved preferences
    const savedContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('fontSize');

    if (savedContrast) {
        document.body.classList.add('high-contrast');
    }

    if (savedFontSize) {
        document.documentElement.style.fontSize = `${savedFontSize}px`;
    }

    // Attach listeners to buttons if they exist in the HTML
    const hb = document.getElementById('highContrastToggle');
    if (hb) hb.onclick = () => toggleHighContrast();

    const fsu = document.getElementById('fontSizeUp');
    if (fsu) fsu.onclick = () => adjustFontSize('increase');

    const fsd = document.getElementById('fontSizeDown');
    if (fsd) fsd.onclick = () => adjustFontSize('decrease');
}

// Export to global scope
window.AccessibilityManager = AccessibilityManager;
window.toggleHighContrast = toggleHighContrast;
window.adjustFontSize = adjustFontSize;
window.initAccessibility = initAccessibility;