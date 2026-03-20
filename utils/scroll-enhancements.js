// Smooth Scrolling and Scroll Enhancements
// =======================================

// Initialize smooth scrolling functionality
function initializeScrollEnhancements() {
    // Add scroll progress bar
    createScrollProgressBar();

    // Add scroll-to-top button
    createScrollToTopButton();

    // Initialize smooth scrolling for anchor links
    initializeSmoothScrolling();

    // Add scroll listeners for progress tracking
    setupScrollListeners();
}

// Create scroll progress bar
function createScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.id = 'scrollProgressBar';
    document.body.appendChild(progressBar);
}

// Create scroll-to-top button
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.id = 'scrollToTopBtn';
    button.innerHTML = '↑';
    button.title = 'Voltar ao topo';
    button.onclick = scrollToTop;
    document.body.appendChild(button);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        const button = document.getElementById('scrollToTopBtn');
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize smooth scrolling for anchor links
function initializeSmoothScrolling() {
    // Handle internal anchor links
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (target) {
            e.preventDefault();
            const href = target.getAttribute('href');
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    // Handle programmatic navigation with smooth scrolling
    if (window.navigateToPatient) {
        const originalNavigateToPatient = window.navigateToPatient;
        window.navigateToPatient = function (id) {
            originalNavigateToPatient.call(this, id);
            // Add a small delay to ensure the element is rendered
            setTimeout(() => {
                const element = document.querySelector(`[data-id="${id}"]`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 200);
        };
    }

    if (window.navigateToLead) {
        const originalNavigateToLead = window.navigateToLead;
        window.navigateToLead = function (id) {
            originalNavigateToLead.call(this, id);
            setTimeout(() => {
                const element = document.querySelector(`[data-id="${id}"]`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 200);
        };
    }
}

// Setup scroll listeners for progress tracking
function setupScrollListeners() {
    window.addEventListener('scroll', updateScrollProgress);
    window.addEventListener('resize', updateScrollProgress);
}

// Update scroll progress bar
function updateScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    progressBar.style.width = `${scrollPercent}%`;
}

// Add smooth scrolling to module navigation
function enhanceModuleNavigation() {
    // Override switchModule to include smooth scrolling
    if (window.switchModule) {
        const originalSwitchModule = window.switchModule;
        window.switchModule = function (moduleName) {
            originalSwitchModule.call(this, moduleName);

            // Smooth scroll to top when switching modules
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 100);
        };
    }
}

// Initialize all scroll enhancements
document.addEventListener('DOMContentLoaded', () => {
    initializeScrollEnhancements();
    enhanceModuleNavigation();
});

// Export for global scope
window.initializeScrollEnhancements = initializeScrollEnhancements;
window.scrollToTop = scrollToTop;
