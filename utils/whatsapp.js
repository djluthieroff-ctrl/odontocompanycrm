// WhatsApp Integration Utilities
// ===============================

/**
 * Generate WhatsApp link for direct messaging
 * @param {string} phone - Phone number (can have formatting)
 * @param {string} message - Optional pre-filled message
 * @returns {string} WhatsApp web link
 */
function generateWhatsAppLink(phone, message = '') {
    if (!phone) return '#';

    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Validation: simple check for minimum length (e.g. 10 digits for DD+Number)
    if (cleanPhone.length < 10) {
        console.warn('Phone number too short:', phone);
        return '#';
    }

    // Add country code if not present (assuming Brazil +55)
    let phoneWithCountry = cleanPhone;
    if (cleanPhone.length <= 11) {
        phoneWithCountry = '55' + cleanPhone;
    }

    const encodedMessage = encodeURIComponent(message);

    // Detect Mobile Device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        return `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    } else {
        return `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedMessage}`;
    }
}

/**
 * Open WhatsApp in new tab
 * @param {string} phone - Phone number
 * @param {string} message - Optional message
 */
function openWhatsApp(phone, message = '') {
    const link = generateWhatsAppLink(phone, message);
    if (link && link !== '#') {
        window.open(link, '_blank');
    } else {
        alert('Número de telefone inválido. Verifique o cadastro.');
    }
}

/**
 * Create WhatsApp button HTML
 * @param {string} phone - Phone number
 * @param {string} message - Optional pre-filled message
 * @param {string} size - 'small' or 'normal'
 * @returns {string} Button HTML
 */
function createWhatsAppButton(phone, message = '', size = 'small') {
    if (!phone) return '';

    const buttonClass = size === 'small' ? 'btn btn-small btn-whatsapp' : 'btn btn-whatsapp';
    const onclick = `openWhatsApp('${phone}', '${message.replace(/'/g, "\\'")}')`

    return `
        <button class="${buttonClass}" onclick="${onclick}" title="Enviar mensagem no WhatsApp">
            <span style="font-size: 1.2em;">💬</span> WhatsApp
        </button>
    `;
}

// Export to global scope
window.generateWhatsAppLink = generateWhatsAppLink;
window.openWhatsApp = openWhatsApp;
window.createWhatsAppButton = createWhatsAppButton;
