// HTML Sanitization Utility
// ==========================
// Prevents XSS attacks by escaping special characters before inserting into DOM

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Raw string (possibly containing HTML)
 * @returns {string} Escaped safe string
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Export to global scope
window.escapeHTML = escapeHTML;
