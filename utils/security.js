// Security Utilities - CRM Odonto Company
// ==============================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
function sanitizeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#39;');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Brazilian format)
 */
function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate UUID format
 */
function isValidUUID(str) {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Validate input length and type
 */
function validateInput(value, type = 'string', maxLength = 255) {
    if (!value) return false;
    if (typeof value !== 'string') return false;
    if (value.length > maxLength) return false;

    // Additional type-specific validation
    if (type === 'email') return isValidEmail(value);
    if (type === 'phone') return isValidPhone(value);
    if (type === 'uuid') return isValidUUID(value);

    return true;
}

/**
 * Escape special characters for SQL-like queries
 */
function escapeSQL(str) {
    if (!str) return '';
    return str.replace(/'/g, "''").replace(/;/g, '').replace(/--/g, '');
}

/**
 * Generate secure random ID
 */
function generateSecureId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Rate limiting helper
 */
const rateLimit = new Map();

function checkRateLimit(key, maxCalls = 5, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimit.has(key)) {
        rateLimit.set(key, []);
    }

    const calls = rateLimit.get(key).filter(timestamp => timestamp > windowStart);

    if (calls.length >= maxCalls) {
        return false;
    }

    calls.push(now);
    rateLimit.set(key, calls);
    return true;
}

/**
 * Content Security Policy helper
 */
function setCSPHeaders() {
    // This would typically be set on the server-side
    // For client-side, we can at least validate our own content
    const allowedSources = [
        "'self'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com"
    ];

    return allowedSources.join(' ');
}

// Export to global scope
window.SecurityUtils = {
    sanitizeHTML,
    isValidEmail,
    isValidPhone,
    isValidUUID,
    validateInput,
    escapeSQL,
    generateSecureId,
    checkRateLimit,
    setCSPHeaders
};