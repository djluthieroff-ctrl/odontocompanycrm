// WhatsApp Integration Utilities — CRM Odonto Company
// =====================================================
// Suporta: link direto WA, envio via Z-API (campanhas)

/**
 * Gera link do WhatsApp para mensagem direta
 */
function generateWhatsAppLink(phone, message = '') {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        console.warn('Número de telefone muito curto:', phone);
        return '#';
    }
    let phoneWithCountry = cleanPhone;
    if (cleanPhone.length <= 11) {
        phoneWithCountry = '55' + cleanPhone;
    }
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        return `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    } else {
        return `https://web.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodedMessage}`;
    }
}

/**
 * Abre WhatsApp em nova aba
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
 * Cria HTML de botão WhatsApp
 */
function createWhatsAppButton(phone, message = '', size = 'small') {
    if (!phone) return '';
    const buttonClass = size === 'small' ? 'btn btn-small btn-whatsapp' : 'btn btn-whatsapp';
    const onclick = `openWhatsApp('${phone}', '${message.replace(/'/g, "\\'")}')`;
    return `
        <button class="${buttonClass}" onclick="${onclick}" title="Enviar mensagem no WhatsApp">
            <span style="font-size: 1.2em;">💬</span> WhatsApp
        </button>
    `;
}

// =====================================================
// Z-API Integration — Envio via API
// =====================================================

/**
 * Formata número de telefone para o padrão Z-API (5511999999999)
 */
function formatPhoneForZAPI(phone) {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, '');
    // Adiciona 55 se não tiver código de país
    if (clean.length <= 11) {
        clean = '55' + clean;
    }
    // Remove o 9° dígito extra para números fixos se necessário (13 dígitos = ok para celular BR)
    if (clean.length === 14 && clean.startsWith('55')) {
        // Possível número com DDD + 9 dígitos + dígito extra
        // Ex: 5511999999999 = ok (13 chars), 55119999999999 = 14 chars, provável erro
    }
    return clean;
}

/**
 * Obtém configurações Z-API do AppState
 */
function getZAPISettings() {
    const settings = AppState?.settings || {};
    return {
        instance: settings.zapiInstance || '',
        token: settings.zapiToken || '',
        clientToken: settings.zapiClientToken || '',
        baseUrl: settings.zapiBaseUrl || 'https://api.z-api.io'
    };
}

/**
 * Testa conexão com a instância Z-API
 * @returns {Promise<{connected: boolean, status: string, error?: string}>}
 */
async function testZAPIConnection() {
    const zapi = getZAPISettings();
    if (!zapi.instance || !zapi.token) {
        return { connected: false, status: 'NOT_CONFIGURED', error: 'Instance ID e Token não configurados' };
    }

    try {
        const url = `${zapi.baseUrl}/instances/${zapi.instance}/token/${zapi.token}/status`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Client-Token': zapi.clientToken || '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return { connected: false, status: 'ERROR', error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        const isConnected = data?.value === 'CONNECTED' || data?.connected === true || data?.status === 'CONNECTED';
        return {
            connected: isConnected,
            status: data?.value || data?.status || 'UNKNOWN',
            raw: data
        };
    } catch (error) {
        return { connected: false, status: 'ERROR', error: error.message };
    }
}

/**
 * Envia mensagem de texto via Z-API
 * @param {string} phone - Número de telefone
 * @param {string} message - Conteúdo da mensagem
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendWhatsAppMessageZAPI(phone, message) {
    const zapi = getZAPISettings();

    if (!zapi.instance || !zapi.token) {
        return {
            success: false,
            error: 'Z-API não configurada. Vá em Configurações → Integrações.'
        };
    }

    const formattedPhone = formatPhoneForZAPI(phone);
    if (!formattedPhone) {
        return { success: false, error: 'Número de telefone inválido' };
    }

    try {
        const url = `${zapi.baseUrl}/instances/${zapi.instance}/token/${zapi.token}/send-text`;

        const payload = {
            phone: formattedPhone,
            message: message
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Token': zapi.clientToken || ''
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data?.error || data?.message || `Erro HTTP ${response.status}`;
            return { success: false, error: errMsg };
        }

        // Z-API retorna { zaapId, messageId, id } em sucesso
        const messageId = data?.zaapId || data?.messageId || data?.id || '';
        return { success: true, messageId, raw: data };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Envia imagem via Z-API
 * @param {string} phone
 * @param {string} imageUrl - URL pública da imagem
 * @param {string} caption - Legenda opcional
 */
async function sendWhatsAppImageZAPI(phone, imageUrl, caption = '') {
    const zapi = getZAPISettings();
    if (!zapi.instance || !zapi.token) {
        return { success: false, error: 'Z-API não configurada' };
    }

    const formattedPhone = formatPhoneForZAPI(phone);
    if (!formattedPhone) return { success: false, error: 'Número inválido' };

    try {
        const url = `${zapi.baseUrl}/instances/${zapi.instance}/token/${zapi.token}/send-image`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Token': zapi.clientToken || ''
            },
            body: JSON.stringify({ phone: formattedPhone, image: imageUrl, caption })
        });
        const data = await response.json();
        return response.ok
            ? { success: true, messageId: data?.zaapId || data?.id || '' }
            : { success: false, error: data?.error || `HTTP ${response.status}` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Export to global scope
window.generateWhatsAppLink = generateWhatsAppLink;
window.openWhatsApp = openWhatsApp;
window.createWhatsAppButton = createWhatsAppButton;
window.formatPhoneForZAPI = formatPhoneForZAPI;
window.getZAPISettings = getZAPISettings;
window.testZAPIConnection = testZAPIConnection;
window.sendWhatsAppMessageZAPI = sendWhatsAppMessageZAPI;
window.sendWhatsAppImageZAPI = sendWhatsAppImageZAPI;
