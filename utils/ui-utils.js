// UI Utilities - CRM Odonto Company
// ==================================

// ─── Loading Overlay ────────────────────────────────────────────────────
function initializeLoadingOverlay() {
    if (document.getElementById('loadingOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(4px);
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
    `;

    overlay.innerHTML = `
        <div class="loading-spinner" style="
            width: 40px;
            height: 40px;
            border: 3px solid var(--gray-200, #e5e7eb);
            border-top-color: var(--primary-500, #3b82f6);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        "></div>
        <p id="loadingText" style="margin-top: 1rem; color: var(--gray-600, #4b5563); font-weight: 500;">Carregando...</p>
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    `;

    document.body.appendChild(overlay);
}

function showLoading(text = 'Carregando...') {
    const overlay = document.getElementById('loadingOverlay');
    const textEl = document.getElementById('loadingText');
    if (overlay) {
        if (textEl) textEl.textContent = SecurityUtils.sanitizeHTML(text);
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

// ─── Notifications ──────────────────────────────────────────────────────
function showNotification(message, type = 'info') {
    const container = getNotificationContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        background: white;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #ccc;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out forwards;
        margin-bottom: 10px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #1f2937;
    `;

    // Type styling
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.style.borderLeftColor = colors[type] || colors.info;

    toast.innerHTML = `
        <span>${icons[type] || icons.info}</span>
        <span>${SecurityUtils.sanitizeHTML(message)}</span>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getNotificationContainer() {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        `;
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
        document.body.appendChild(container);
    }
    return container;
}

// Export to global scope
window.initializeLoadingOverlay = initializeLoadingOverlay;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showNotification = showNotification;

// ─── Debounce Utility ───────────────────────────────────────────────────
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        // Rate limiting check
        if (!SecurityUtils.checkRateLimit('debounce_' + func.name, 10, 10000)) {
            console.warn('Rate limit exceeded for debounced function');
            return;
        }

        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
window.debounce = debounce;

// ─── Input Validation Utility ───────────────────────────────────────────
function validateInput(value, type = 'string', maxLength = 255) {
    return SecurityUtils.validateInput(value, type, maxLength);
}

// ─── Currency Formatting ────────────────────────────────────────────────
function formatCurrency(value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numValue);
}

// ─── Date Formatting ────────────────────────────────────────────────────
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return '';
    }
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleString('pt-BR');
    } catch (e) {
        return '';
    }
}

// Export additional utilities
window.validateInput = validateInput;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
