// Module: Pacientes Antigos
// Sistema de recuperação de pacientes antigos com rastreamento de resultado

function initOldPatientsModule() {
    renderOldPatients();
}

function getOldPatientStatusConfig(status) {
    const map = {
        'pending': { label: 'Pendente', badgeClass: 'badge-gray', icon: '⏳' },
        'contacted': { label: 'Em Contato', badgeClass: 'badge-primary', icon: '📞' },
        'scheduled': { label: 'Agendado', badgeClass: 'badge-success', icon: '📅' },
        'recovered': { label: 'Recuperado ✅', badgeClass: 'badge-success', icon: '✅' },
        'lost': { label: 'Perdido ❌', badgeClass: 'badge-error', icon: '❌' },
        'not-interested': { label: 'Sem Interesse', badgeClass: 'badge-error', icon: '🚫' }
    };
    return map[status] || { label: status, badgeClass: 'badge-gray', icon: '•' };
}

let oldPatientsSearch = '';
let oldPatientsStatusFilter = 'all';

function renderOldPatients() {
    const container = document.getElementById('oldPatientsContent');
    if (!container) return;

    // Bind header buttons
    const newBtn = document.getElementById('newOldPatientBtn');
    const exportBtn = document.getElementById('exportOldPatientsBtn');
    if (newBtn) newBtn.onclick = () => showNewOldPatientForm();
    if (exportBtn) exportBtn.onclick = () => exportOldPatientsToExcel();

    const data = AppState.oldPatients || [];

    // Summary stats
    const total = data.length;
    const recovered = data.filter(p => p.status === 'recovered').length;
    const pending = data.filter(p => ['pending', 'contacted', 'scheduled'].includes(p.status)).length;
    const rateStr = total > 0 ? Math.round((recovered / total) * 100) + '%' : '—';

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🗂️</div>
                <h3>Nenhum Paciente Antigo Cadastrado</h3>
                <p>Adicione pacientes de gestões anteriores para acompanhar a recuperação.</p>
                <button class="btn btn-primary" onclick="showNewOldPatientForm()" style="margin-top:1rem;">
                    ➕ Adicionar Primeiro Paciente
                </button>
            </div>
        `;
        return;
    }

    // Filtragem
    let filtered = [...data];
    if (oldPatientsSearch) {
        const q = oldPatientsSearch.toLowerCase();
        filtered = filtered.filter(p =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.phone || '').includes(q)
        );
    }
    if (oldPatientsStatusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === oldPatientsStatusFilter);
    }

    container.innerHTML = `
        <!-- Resumo Topo -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.5rem;">
            <div style="background:#dcfce7;border-radius:12px;padding:1rem;text-align:center;">
                <div style="font-size:1.5rem;font-weight:800;color:#16a34a;">${recovered}</div>
                <div style="font-size:0.8rem;color:#166534;font-weight:600;">✅ Recuperados</div>
            </div>
            <div style="background:#fef9c3;border-radius:12px;padding:1rem;text-align:center;">
                <div style="font-size:1.5rem;font-weight:800;color:#a16207;">${pending}</div>
                <div style="font-size:0.8rem;color:#92400e;font-weight:600;">⏳ Em Acompanhamento</div>
            </div>
            <div style="background:${recovered > 0 ? '#dcfce7' : '#f1f5f9'};border-radius:12px;padding:1rem;text-align:center;">
                <div style="font-size:1.5rem;font-weight:800;color:${recovered > 0 ? '#16a34a' : 'var(--gray-600)'};">${rateStr}</div>
                <div style="font-size:0.8rem;color:var(--gray-500);font-weight:600;">Taxa de Recuperação</div>
            </div>
        </div>

        <!-- Busca e Filtros -->
        <div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;flex-wrap:wrap;align-items:center;">
            <div style="flex:1;min-width:200px;position:relative;">
                <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);">🔍</span>
                <input type="text" class="form-input" style="padding-left:2rem;" 
                    placeholder="Buscar por nome ou telefone..."
                    value="${escapeHTML(oldPatientsSearch)}"
                    oninput="updateOldPatientsSearch(this.value)"
                    id="oldPatientsSearchInput">
            </div>
            <select class="form-select" style="width:auto;" onchange="updateOldPatientsStatusFilter(this.value)">
                <option value="all" ${oldPatientsStatusFilter === 'all' ? 'selected' : ''}>Todos os Status</option>
                <option value="pending" ${oldPatientsStatusFilter === 'pending' ? 'selected' : ''}>⏳ Pendente</option>
                <option value="contacted" ${oldPatientsStatusFilter === 'contacted' ? 'selected' : ''}>📞 Em Contato</option>
                <option value="scheduled" ${oldPatientsStatusFilter === 'scheduled' ? 'selected' : ''}>📅 Agendado</option>
                <option value="recovered" ${oldPatientsStatusFilter === 'recovered' ? 'selected' : ''}>✅ Recuperado</option>
                <option value="lost" ${oldPatientsStatusFilter === 'lost' ? 'selected' : ''}>❌ Perdido</option>
                <option value="not-interested" ${oldPatientsStatusFilter === 'not-interested' ? 'selected' : ''}>🚫 Sem Interesse</option>
            </select>
            <span style="font-size:0.85rem;color:var(--gray-500);">${filtered.length} de ${total}</span>
        </div>

        <!-- Lista -->
        <div style="display:flex;flex-direction:column;gap:0.75rem;" id="oldPatientsList">
            ${filtered.length === 0
            ? `<div class="empty-state" style="padding:2rem;">
                       <div class="empty-state-icon" style="font-size:2rem;">🔎</div>
                       <h3>Nenhum resultado encontrado</h3>
                   </div>`
            : filtered.map(p => renderOldPatientCard(p)).join('')
        }
        </div>
    `;
}

function renderOldPatientCard(p) {
    const cfg = getOldPatientStatusConfig(p.status);
    const now = new Date();
    const createdAt = p.createdAt ? new Date(p.createdAt) : null;
    const daysSince = createdAt ? Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)) : null;
    const lastConsultStr = p.lastConsultation ? formatDate(p.lastConsultation) : 'Não informada';
    const recoveredStr = p.recoveredAt ? `Recuperado em ${formatDate(p.recoveredAt)}` : '';

    const borderColor = p.status === 'recovered' ? '#16a34a' :
        p.status === 'lost' ? '#dc2626' :
            p.status === 'scheduled' ? '#2563eb' : 'var(--gray-200)';

    return `
        <div class="list-item" style="border-left:4px solid ${borderColor};padding:1rem 1.25rem;">
            <div class="list-item-content" style="flex:1;">
                <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin-bottom:0.35rem;">
                    <h4 style="margin:0;font-weight:700;">${escapeHTML(p.name)}</h4>
                    <span class="badge ${cfg.badgeClass}">${cfg.icon} ${cfg.label}</span>
                    ${daysSince !== null ? `<span style="font-size:0.75rem;color:var(--gray-400);">Há ${daysSince} dias</span>` : ''}
                </div>
                <div style="display:flex;gap:1.25rem;font-size:0.82rem;color:var(--gray-500);flex-wrap:wrap;margin-bottom:${p.notes ? '0.5rem' : '0'};">
                    ${p.phone ? `<span>📱 ${escapeHTML(p.phone)}</span>` : ''}
                    <span>🦷 Última consulta: ${lastConsultStr}</span>
                    ${p.interest ? `<span>💡 ${escapeHTML(p.interest)}</span>` : ''}
                    ${recoveredStr ? `<span style="color:#16a34a;font-weight:600;">✅ ${recoveredStr}</span>` : ''}
                </div>
                ${p.notes ? `
                <div id="oldPatientNote_${p.id}" style="font-size:0.82rem;color:var(--gray-600);background:var(--gray-50);border-radius:6px;padding:6px 10px;border:1px solid var(--gray-200);margin-top:4px;">
                    📝 ${escapeHTML(p.notes)}
                </div>
                ` : ''}
                <!-- Edição inline de notas -->
                <div id="oldPatientNoteEdit_${p.id}" style="display:none;margin-top:6px;">
                    <textarea class="form-textarea" style="min-height:60px;font-size:0.82rem;" id="oldPatientNoteInput_${p.id}" placeholder="Anotações sobre este paciente...">${escapeHTML(p.notes || '')}</textarea>
                    <div style="display:flex;gap:0.5rem;margin-top:4px;">
                        <button class="btn btn-primary btn-small" onclick="saveOldPatientNote('${p.id}')">💾 Salvar</button>
                        <button class="btn btn-secondary btn-small" onclick="cancelOldPatientNote('${p.id}')">Cancelar</button>
                    </div>
                </div>
            </div>
            <div class="list-item-actions" style="flex-shrink:0;flex-direction:column;gap:0.4rem;">
                <!-- Status rápido -->
                <select class="form-select btn-small" style="font-size:0.78rem;padding:4px 8px;" 
                    onchange="quickUpdateOldPatientStatus('${p.id}', this.value)">
                    <option value="">Mudar status...</option>
                    <option value="pending">⏳ Pendente</option>
                    <option value="contacted">📞 Em Contato</option>
                    <option value="scheduled">📅 Agendado</option>
                    <option value="recovered">✅ Recuperado</option>
                    <option value="lost">❌ Perdido</option>
                    <option value="not-interested">🚫 Sem Interesse</option>
                </select>
                <div style="display:flex;gap:0.4rem;">
                    ${p.phone ? `
                    <button class="btn btn-whatsapp btn-small" onclick="window.openWhatsApp('${escapeHTML(p.phone)}')">
                        📱
                    </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-small" onclick="toggleOldPatientNote('${p.id}')" title="Editar anotação">
                        📝
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="showEditOldPatientForm('${p.id}')" title="Editar completo">
                        ✏️
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Debounced search
const debouncedOldPatientsSearch = debounce((value) => {
    oldPatientsSearch = value;
    renderOldPatients();
    // Maintain focus on search field after re-render if needed
    requestAnimationFrame(() => {
        const el = document.getElementById('oldPatientsSearchInput');
        if (el && el.value !== value) {
            el.value = value;
            el.focus();
            el.setSelectionRange(value.length, value.length);
        }
    });
}, 400);

function updateOldPatientsSearch(value) {
    debouncedOldPatientsSearch(value);
}

function updateOldPatientsStatusFilter(value) {
    oldPatientsStatusFilter = value;
    renderOldPatients();
}

function toggleOldPatientNote(id) {
    const noteDiv = document.getElementById(`oldPatientNote_${id}`);
    const editDiv = document.getElementById(`oldPatientNoteEdit_${id}`);
    if (noteDiv) noteDiv.style.display = 'none';
    if (editDiv) {
        editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
        const textarea = document.getElementById(`oldPatientNoteInput_${id}`);
        if (textarea) textarea.focus();
    }
}

function cancelOldPatientNote(id) {
    const editDiv = document.getElementById(`oldPatientNoteEdit_${id}`);
    const noteDiv = document.getElementById(`oldPatientNote_${id}`);
    if (editDiv) editDiv.style.display = 'none';
    if (noteDiv) noteDiv.style.display = 'block';
}

async function saveOldPatientNote(id) {
    const textarea = document.getElementById(`oldPatientNoteInput_${id}`);
    if (!textarea) return;
    const notes = textarea.value.trim();

    const idx = AppState.oldPatients.findIndex(p => p.id === id);
    if (idx < 0) return;

    AppState.oldPatients[idx] = { ...AppState.oldPatients[idx], notes, updatedAt: new Date().toISOString() };
    await saveToStorage('odontocrm_old_patients', AppState.oldPatients);
    if (typeof isCloudConnected === 'function' && isCloudConnected()) {
        await updateRecord('old_patients', id, { notes });
    }

    showNotification('Anotação salva!', 'success');
    renderOldPatients();
}

async function quickUpdateOldPatientStatus(id, status) {
    if (!status) return;
    const idx = AppState.oldPatients.findIndex(p => p.id === id);
    if (idx < 0) return;

    const updates = { status, updatedAt: new Date().toISOString() };
    if (status === 'recovered') updates.recoveredAt = new Date().toISOString();

    AppState.oldPatients[idx] = { ...AppState.oldPatients[idx], ...updates };
    await saveToStorage('odontocrm_old_patients', AppState.oldPatients);
    if (typeof isCloudConnected === 'function' && isCloudConnected()) {
        const dbUpdates = { status };
        if (status === 'recovered') dbUpdates.recovered_at = updates.recoveredAt;
        await updateRecord('old_patients', id, dbUpdates);
    }

    const cfg = getOldPatientStatusConfig(status);
    showNotification(`${cfg.icon} Status atualizado: ${cfg.label}`, 'success');
    renderOldPatients();
}

function showNewOldPatientForm() {
    openModal('Novo Paciente Antigo', buildOldPatientFormHTML(null), [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: '💾 Salvar', class: 'btn-primary', onclick: 'saveOldPatient()' }
    ]);
    if (typeof applyPhoneMask === 'function') applyPhoneMask(document.querySelector('.phone-mask'));
}

function showEditOldPatientForm(id) {
    const p = AppState.oldPatients.find(item => item.id === id);
    if (!p) return;

    openModal('Editar Paciente Antigo', buildOldPatientFormHTML(p), [
        { label: '🗑️ Remover', class: 'btn-secondary', style: 'background:var(--error-500);color:white;margin-right:auto;', onclick: `deleteOldPatient('${p.id}')` },
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: '💾 Salvar', class: 'btn-primary', onclick: 'saveOldPatient(true)' }
    ]);
    if (typeof applyPhoneMask === 'function') applyPhoneMask(document.querySelector('.phone-mask'));
}

function buildOldPatientFormHTML(p) {
    const isEdit = !!p;
    return `
        <form id="oldPatientForm">
            ${isEdit ? `<input type="hidden" name="id" value="${p.id}">` : ''}
            <div class="form-group">
                <label class="form-label">Nome Completo *</label>
                <input type="text" name="name" class="form-input" required value="${isEdit ? escapeHTML(p.name) : ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">WhatsApp / Telefone</label>
                    <input type="tel" name="phone" class="form-input phone-mask" value="${isEdit ? escapeHTML(p.phone || '') : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Última Consulta</label>
                    <input type="date" name="lastConsultation" class="form-input" value="${isEdit ? (p.lastConsultation || '') : ''}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Procedimento / Interesse Anterior</label>
                <input type="text" name="interest" class="form-input" placeholder="Ex: Implante, Limpeza, Prótese..." value="${isEdit ? escapeHTML(p.interest || '') : ''}">
            </div>
            ${isEdit ? `
            <div class="form-group">
                <label class="form-label">Status de Recuperação</label>
                <select name="status" class="form-select">
                    <option value="pending" ${p.status === 'pending' ? 'selected' : ''}>⏳ Pendente</option>
                    <option value="contacted" ${p.status === 'contacted' ? 'selected' : ''}>📞 Em Contato</option>
                    <option value="scheduled" ${p.status === 'scheduled' ? 'selected' : ''}>📅 Agendado</option>
                    <option value="recovered" ${p.status === 'recovered' ? 'selected' : ''}>✅ Recuperado</option>
                    <option value="lost" ${p.status === 'lost' ? 'selected' : ''}>❌ Perdido</option>
                    <option value="not-interested" ${p.status === 'not-interested' ? 'selected' : ''}>🚫 Sem Interesse</option>
                </select>
            </div>
            ` : ''}
            <div class="form-group">
                <label class="form-label">Observações / Motivo da Saída</label>
                <textarea name="notes" class="form-textarea" placeholder="Ex: Saiu por preço. Possui convênio. Retornar em março com proposta de implante...">${isEdit ? escapeHTML(p.notes || '') : ''}</textarea>
            </div>
        </form>
    `;
}

async function saveOldPatient(isEdit = false) {
    const form = document.getElementById('oldPatientForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.name || !data.name.trim()) {
        showNotification('Nome é obrigatório', 'error');
        return;
    }

    if (!data.lastConsultation) data.lastConsultation = null;

    if (isEdit) {
        const idx = AppState.oldPatients.findIndex(p => p.id === data.id);
        if (idx < 0) return;
        const updates = { ...AppState.oldPatients[idx], ...data, updatedAt: new Date().toISOString() };
        if (data.status === 'recovered' && !AppState.oldPatients[idx].recoveredAt) {
            updates.recoveredAt = new Date().toISOString();
        }
        AppState.oldPatients[idx] = updates;
    } else {
        AppState.oldPatients.push({
            ...data,
            id: generateId(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    await saveToStorage('odontocrm_old_patients', AppState.oldPatients);
    if (typeof isCloudConnected === 'function' && isCloudConnected()) {
        if (isEdit) {
            const p = AppState.oldPatients.find(p => p.id === data.id);
            await updateRecord('old_patients', data.id, {
                name: data.name, phone: data.phone, status: data.status,
                interest: data.interest, notes: data.notes,
                last_consultation: data.lastConsultation,
                recovered_at: p.recoveredAt || null
            });
        } else {
            await saveToSupabase('old_patients', AppState.oldPatients);
        }
    }

    closeModal();
    renderOldPatients();
    showNotification(isEdit ? '✅ Registro atualizado' : '✅ Paciente adicionado', 'success');
}

async function deleteOldPatient(id) {
    if (!confirm('Tem certeza que deseja remover este registro?')) return;
    AppState.oldPatients = AppState.oldPatients.filter(p => p.id !== id);
    await saveToStorage('odontocrm_old_patients', AppState.oldPatients);
    if (typeof isCloudConnected === 'function' && isCloudConnected()) {
        if (typeof deleteRecord === 'function') await deleteRecord('old_patients', id);
    }
    closeModal();
    renderOldPatients();
}

function exportOldPatientsToExcel() {
    if (!AppState.oldPatients.length) return;
    const cfg = getOldPatientStatusConfig;
    const exportData = AppState.oldPatients.map(p => ({
        'Nome': p.name,
        'Telefone': p.phone || '',
        'Status': cfg(p.status).label,
        'Última Consulta': p.lastConsultation || '',
        'Interesse': p.interest || '',
        'Recuperado em': p.recoveredAt ? new Date(p.recoveredAt).toLocaleDateString('pt-BR') : '',
        'Observações': p.notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes Antigos');
    XLSX.writeFile(wb, `Pacientes_Antigos_${new Date().toISOString().split('T')[0]}.xlsx`);
}

window.initOldPatientsModule = initOldPatientsModule;
window.renderOldPatients = renderOldPatients;
window.showNewOldPatientForm = showNewOldPatientForm;
window.showEditOldPatientForm = showEditOldPatientForm;
window.saveOldPatient = saveOldPatient;
window.deleteOldPatient = deleteOldPatient;
window.exportOldPatientsToExcel = exportOldPatientsToExcel;
window.quickUpdateOldPatientStatus = quickUpdateOldPatientStatus;
window.toggleOldPatientNote = toggleOldPatientNote;
window.saveOldPatientNote = saveOldPatientNote;
window.cancelOldPatientNote = cancelOldPatientNote;
window.updateOldPatientsSearch = updateOldPatientsSearch;
window.updateOldPatientsStatusFilter = updateOldPatientsStatusFilter;
