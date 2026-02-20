// Input Masking Utility - CRM Odonto Company
// ==========================================

function maskPhone(value) {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
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
