// Input Masking Utility - CRM Odonto Company
// ==========================================

function maskPhone(value) {
    if (!value) return "";
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, "");
    // Remove prefixo do país: 55 seguido de DDD (10-11 dígitos restantes) => Brasil
    if (value.length === 12 || value.length === 13) {
        if (value.startsWith("55")) {
            value = value.slice(2); // remove o "55"
        }
    }
    // Agora aplica máscara padrão BR
    if (value.length > 10) {
        // Celular com 9 dígitos: (11) 99999-9999
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
        // Fixo: (11) 9999-9999
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d+)/, "($1) $2");
    } else if (value.length > 0) {
        value = value.replace(/^(\d+)/, "($1");
    }
    return value;
}

function maskCPF(value) {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
}

function applyPhoneMask(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value;
        e.target.value = maskPhone(value);
    });
}

function applyCPFMask(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value;
        e.target.value = maskCPF(value);
    });
}

// Global initialization for masks in modals or dynamic content
function initMasks(container = document) {
    const phoneInputs = container.querySelectorAll('input[type="tel"], .mask-phone');
    const cpfInputs = container.querySelectorAll('.mask-cpf');

    phoneInputs.forEach(applyPhoneMask);
    cpfInputs.forEach(applyCPFMask);
}

window.maskPhone = maskPhone;
window.maskCPF = maskCPF;
window.initMasks = initMasks;
