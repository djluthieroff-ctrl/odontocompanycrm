// Module: Pacientes Antigos
// Legacy physical files management

function initOldPatientsModule() {
    renderOldPatients();
}

function renderOldPatients() {
    const container = document.getElementById('oldPatientsContent');
    if (!container) return;

    const data = AppState.oldPatients || [];

    // Re-bind buttons since the IDs are in index.html - DO THIS BEFORE EARLY RETURN
    const newBtn = document.getElementById('newOldPatientBtn');
    const exportBtn = document.getElementById('exportOldPatientsBtn');
    if (newBtn) newBtn.onclick = () => showNewOldPatientForm();
    if (exportBtn) exportBtn.onclick = () => exportOldPatientsToExcel();

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🗂️</div>
                <h3>Nenhum Registro Antigo</h3>
                <p>Adicione pacientes de gestões anteriores para iniciar o acompanhamento.</p>
                <button class="btn btn-primary" onclick="showNewOldPatientForm()" style="margin-top: 1rem;">
                    ➕ Primeiro Registro
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="list-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span class="badge badge-gray">${data.length} registros</span>
                <div style="display: flex; gap: 0.5rem;">
                    <select id="oldPatientsStatusFilter" class="form-select btn-small" onchange="renderOldPatients()">
                        <option value="all">Todos os Status</option>
                        <option value="pending">Pendente</option>
                        <option value="contacted">Contatado</option>
                        <option value="scheduled">Agendado</option>
                        <option value="not-interested">Sem Interesse</option>
                    </select>
                </div>
            </div>
            <div id="oldPatientsList">
                ${renderOldPatientsItems(data)}
            </div>
        </div>
    `;

    // Check filter
    const filter = document.getElementById('oldPatientsStatusFilter');
    if (filter) {
        const value = filter.value;
        if (value !== 'all') {
            const filtered = data.filter(p => p.status === value);
            const listEl = document.getElementById('oldPatientsList');
            if (listEl) listEl.innerHTML = renderOldPatientsItems(filtered);
        }
    }
}

function renderOldPatientsItems(items) {
    return items.map(p => `
        <div class="list-item">
            <div class="list-item-content">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h4 style="margin:0;">${p.name}</h4>
                    <span class="badge ${getStatusBadgeClass(p.status)}">${getStatusLabel(p.status)}</span>
                </div>
                <p style="margin: 4px 0;">${p.phone || 'Sem telefone'}</p>
                <small style="color: var(--gray-500);">Última Consulta: ${formatDate(p.lastConsultation) || 'Não informada'}</small>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary btn-small" onclick="showEditOldPatientForm('${p.id}')">
                    <span>✏️</span> Editar
                </button>
                <button class="btn btn-whatsapp btn-small" onclick="window.openWhatsApp('${p.phone}')">
                    <span>📱</span> WhatsApp
                </button>
            </div>
        </div>
    `).join('');
}

function getStatusBadgeClass(status) {
    const map = {
        'pending': 'badge-gray',
        'contacted': 'badge-primary',
        'scheduled': 'badge-success',
        'not-interested': 'badge-error'
    };
    return map[status] || 'badge-gray';
}

function getStatusLabel(status) {
    const map = {
        'pending': 'Pendente',
        'contacted': 'Contatado',
        'scheduled': 'Agendado',
        'not-interested': 'Sem Interesse'
    };
    return map[status] || status;
}

function showNewOldPatientForm() {
    const content = `
        <form id="oldPatientForm">
            <div class="form-group">
                <label class="form-label">Nome Completo</label>
                <input type="text" name="name" class="form-input" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">WhatsApp/Telefone</label>
                    <input type="tel" name="phone" class="form-input phone-mask">
                </div>
                <div class="form-group">
                    <label class="form-label">Data Última Consulta</label>
                    <input type="date" name="lastConsultation" class="form-input">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Interesse / Procedimento Anterior</label>
                <input type="text" name="interest" class="form-input" placeholder="Ex: Limpeza, Prótese...">
            </div>
            <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea name="notes" class="form-textarea"></textarea>
            </div>
        </form>
    `;

    openModal('Novo Registro Antigo', content, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: 'saveOldPatient()' }
    ]);

    if (typeof applyPhoneMask === 'function') applyPhoneMask(document.querySelector('.phone-mask'));
}

function showEditOldPatientForm(id) {
    const p = AppState.oldPatients.find(item => item.id === id);
    if (!p) return;

    const content = `
        <form id="oldPatientForm">
            <input type="hidden" name="id" value="${p.id}">
            <div class="form-group">
                <label class="form-label">Nome Completo</label>
                <input type="text" name="name" class="form-input" value="${p.name}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">WhatsApp/Telefone</label>
                    <input type="tel" name="phone" class="form-input phone-mask" value="${p.phone}">
                </div>
                <div class="form-group">
                    <label class="form-label">Status do Contato</label>
                    <select name="status" class="form-select">
                        <option value="pending" ${p.status === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="contacted" ${p.status === 'contacted' ? 'selected' : ''}>Contatado</option>
                        <option value="scheduled" ${p.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                        <option value="not-interested" ${p.status === 'not-interested' ? 'selected' : ''}>Sem Interesse</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Data Última Consulta</label>
                <input type="date" name="lastConsultation" class="form-input" value="${p.lastConsultation}">
            </div>
            <div class="form-group">
                <label class="form-label">Interesse</label>
                <input type="text" name="interest" class="form-input" value="${p.interest || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea name="notes" class="form-textarea">${p.notes || ''}</textarea>
            </div>
        </form>
    `;

    openModal('Editar Registro Antigo', content, [
        { label: 'Remover', class: 'btn-secondary', style: 'background: var(--error-500); color: white; margin-right: auto;', onclick: `deleteOldPatient('${p.id}')` },
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Alterações', class: 'btn-primary', onclick: 'saveOldPatient(true)' }
    ]);

    if (typeof applyPhoneMask === 'function') applyPhoneMask(document.querySelector('.phone-mask'));
}

async function saveOldPatient(isEdit = false) {
    const form = document.getElementById('oldPatientForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (isEdit) {
        const index = AppState.oldPatients.findIndex(p => p.id === data.id);
        if (index > -1) {
            // Clean empty dates to null for PostgreSQL compatibility
            if (!data.lastConsultation) data.lastConsultation = null;

            AppState.oldPatients[index] = {
                ...AppState.oldPatients[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Clean empty dates to null for PostgreSQL compatibility
        if (!data.lastConsultation) data.lastConsultation = null;

        const newRecord = {
            ...data,
            id: generateId(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        AppState.oldPatients.push(newRecord);
    }

    await saveToStorage('odontocrm_old_patients', AppState.oldPatients);
    closeModal();
    renderOldPatients();
    showNotification(isEdit ? 'Registro atualizado' : 'Registro adicionado', 'success');
}

async function deleteOldPatient(id) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;

    AppState.oldPatients = AppState.oldPatients.filter(p => p.id !== id);
    await saveToStorage('odontocrm_old_patients', AppState.oldPatients);

    if (typeof isCloudConnected === 'function' && isCloudConnected()) {
        if (typeof deleteRecord === 'function') {
            await deleteRecord('old_patients', id);
        }
    }

    closeModal();
    renderOldPatients();
}

function exportOldPatientsToExcel() {
    if (AppState.oldPatients.length === 0) return;

    const exportData = AppState.oldPatients.map(p => ({
        'Nome': p.name,
        'Telefone': p.phone,
        'Status': getStatusLabel(p.status),
        'Última Consulta': p.lastConsultation,
        'Interesse': p.interest,
        'Observações': p.notes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes Antigos");
    XLSX.writeFile(wb, `Pacientes_Antigos_${new Date().toISOString().split('T')[0]}.xlsx`);
}

window.initOldPatientsModule = initOldPatientsModule;
window.renderOldPatients = renderOldPatients;
window.showNewOldPatientForm = showNewOldPatientForm;
window.showEditOldPatientForm = showEditOldPatientForm;
window.exportOldPatientsToExcel = exportOldPatientsToExcel;
