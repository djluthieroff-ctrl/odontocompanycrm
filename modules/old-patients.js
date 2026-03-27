// Module: Pacientes Antigos
// Sistema de recuperação de pacientes antigos com rastreamento de resultado

function initOldPatientsModule() {
    renderOldPatients();
}

function getOldPatientStatusConfig(status) {
    const map = {
        'pending': { label: 'Pendente', badgeClass: 'badge-gray', icon: '⏳', color: '#6b7280' },
        'contacted': { label: 'Em Contato', badgeClass: 'badge-primary', icon: '📞', color: '#2563eb' },
        'scheduled': { label: 'Agendado', badgeClass: 'badge-success', icon: '📅', color: '#16a34a' },
        'recovered': { label: 'Recuperado ✅', badgeClass: 'badge-success', icon: '✅', color: '#16a34a' },
        'lost': { label: 'Perdido ❌', badgeClass: 'badge-error', icon: '❌', color: '#dc2626' },
        'not-interested': { label: 'Sem Interesse', badgeClass: 'badge-error', icon: '🚫', color: '#991b1b' }
    };
    return map[status] || { label: status, badgeClass: 'badge-gray', icon: '•', color: '#6b7280' };
}

const OLD_PATIENT_CATEGORIES = {
    'orto': { label: 'Ortodontia', color: '#7c3aed', icon: '🦷' },
    'protese': { label: 'Prótese', color: '#db2777', icon: '🪥' },
    'clinico': { label: 'Clínico Geral', color: '#0891b2', icon: '🩺' },
    'implante': { label: 'Implantes', color: '#c026d3', icon: '🔩' },
    'outro': { label: 'Outros', color: '#4b5563', icon: '📂' }
};

const OLD_PATIENT_PRIORITIES = {
    'alta': { label: 'Alta Prioridade', color: '#ef4444', score: 3 },
    'media': { label: 'Média', color: '#f59e0b', score: 2 },
    'baixa': { label: 'Baixa', color: '#10b981', score: 1 }
};

let oldPatientsSearch = '';
let oldPatientsStatusFilter = 'all';
let oldPatientsCategoryFilter = 'all';
let oldPatientsPriorityFilter = 'all';

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
            (p.phone || '').includes(q) ||
            (p.lastProcedure || '').toLowerCase().includes(q) ||
            (p.interest || '').toLowerCase().includes(q)
        );
    }
    if (oldPatientsStatusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === oldPatientsStatusFilter);
    }
    if (oldPatientsCategoryFilter !== 'all') {
        filtered = filtered.filter(p => (p.category || 'clinico') === oldPatientsCategoryFilter);
    }
    if (oldPatientsPriorityFilter !== 'all') {
        filtered = filtered.filter(p => (p.priority || 'media') === oldPatientsPriorityFilter);
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

            <select class="form-select" style="width:auto;" onchange="updateOldPatientsCategoryFilter(this.value)">
                <option value="all" ${oldPatientsCategoryFilter === 'all' ? 'selected' : ''}>Todas Categorias</option>
                ${Object.entries(OLD_PATIENT_CATEGORIES).map(([key, cfg]) => `
                    <option value="${key}" ${oldPatientsCategoryFilter === key ? 'selected' : ''}>${cfg.icon} ${cfg.label}</option>
                `).join('')}
            </select>

            <select class="form-select" style="width:auto;" onchange="updateOldPatientsPriorityFilter(this.value)" id="oldPatientsPriorityFilter">
                <option value="all" ${oldPatientsPriorityFilter === 'all' ? 'selected' : ''}>Todas Prioridades</option>
                <option value="alta" ${oldPatientsPriorityFilter === 'alta' ? 'selected' : ''}>🔥 Alta Prioridade</option>
                <option value="media" ${oldPatientsPriorityFilter === 'media' ? 'selected' : ''}>⚡ Média</option>
                <option value="baixa" ${oldPatientsPriorityFilter === 'baixa' ? 'selected' : ''}>❄️ Baixa</option>
            </select>

            ${(oldPatientsSearch || oldPatientsStatusFilter !== 'all' || oldPatientsCategoryFilter !== 'all' || oldPatientsPriorityFilter !== 'all') ? `
                <button class="btn btn-secondary btn-small" onclick="clearOldPatientsFilters()" title="Limpar todos os filtros">🧹 Limpar</button>
            ` : ''}

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
    const catCfg = OLD_PATIENT_CATEGORIES[p.category || 'clinico'] || OLD_PATIENT_CATEGORIES.outro;
    const prioCfg = OLD_PATIENT_PRIORITIES[p.priority || 'media'];
    
    const now = new Date();
    const createdAt = p.createdAt ? new Date(p.createdAt) : null;
    const daysSince = createdAt ? Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)) : null;
    const lastConsultStr = p.lastConsultation ? formatDate(p.lastConsultation) : 'Não informada';
    const lastContactStr = p.lastContactDate ? formatDate(p.lastContactDate) : 'Nunca';
    
    const borderColor = p.status === 'recovered' ? '#16a34a' :
        p.status === 'lost' ? '#dc2626' :
            p.status === 'scheduled' ? '#2563eb' : cfg.color;

    const stars = '⭐'.repeat(prioCfg.score);

    return `
        <div class="list-item" data-old-patient-id="${p.id}" style="border-left:5px solid ${borderColor}; padding:1.25rem; background:white; position:relative; overflow:hidden;">
            <div style="position:absolute; right:-10px; top:-10px; font-size:4rem; opacity:0.05; pointer-events:none;">${catCfg.icon}</div>
            
            <div class="list-item-content" style="flex:1;">
                <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.5rem;">
                    <h4 style="margin:0; font-size:1.1rem; color:var(--gray-900);">${escapeHTML(p.name)}</h4>
                    <span class="badge" style="background:${catCfg.color}20; color:${catCfg.color}; border:1px solid ${catCfg.color}40;">
                        ${catCfg.icon} ${catCfg.label}
                    </span>
                    <span class="badge ${cfg.badgeClass}">${cfg.icon} ${cfg.label}</span>
                    <span title="${prioCfg.label}" style="cursor:help;">${stars}</span>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; font-size:0.85rem; color:var(--gray-600); margin-bottom:0.75rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span>📱</span> <strong>${escapeHTML(p.phone || 'Sem fone')}</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span>🦷</span> <span>Última consulta: ${lastConsultStr}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span>📞</span> <span>Último contato: ${lastContactStr}</span>
                    </div>
                </div>

                ${p.lastProcedure ? `
                <div style="font-size:0.85rem; margin-bottom:0.5rem; padding:8px 12px; background:var(--primary-50); border-radius:8px; border-left:3px solid var(--primary-500);">
                    <strong style="color:var(--primary-700);">Último Procedimento:</strong> ${escapeHTML(p.lastProcedure)}
                </div>
                ` : ''}

                ${p.notes ? `
                <div id="oldPatientNote_${p.id}" style="font-size:0.82rem; color:var(--gray-600); background:var(--gray-50); border-radius:8px; padding:8px 12px; border:1px solid var(--gray-200); margin-top:0.5rem;">
                    📝 ${escapeHTML(p.notes)}
                </div>
                ` : ''}

                ${p.contacts && p.contacts.length > 0 ? `
                <div style="font-size:0.75rem; color:var(--primary-600); background:var(--primary-50); border-radius:8px; padding:6px 12px; margin-top:0.5rem; display:flex; align-items:center; gap:8px;">
                    <span>📢 <strong>Última Interação:</strong> ${escapeHTML(p.contacts[p.contacts.length-1].note)}</span>
                    <span style="margin-left:auto; opacity:0.7; font-size:0.7rem;">${formatDate(p.contacts[p.contacts.length-1].date)}</span>
                </div>
                ` : ''}

                <div id="oldPatientNoteEdit_${p.id}" style="display:none; margin-top:8px;">
                    <textarea class="form-textarea" style="min-height:70px; font-size:0.85rem;" id="oldPatientNoteInput_${p.id}">${escapeHTML(p.notes || '')}</textarea>
                    <div style="display:flex; gap:0.5rem; margin-top:6px;">
                        <button class="btn btn-primary btn-small" onclick="saveOldPatientNote('${p.id}')">💾 Salvar</button>
                        <button class="btn btn-secondary btn-small" onclick="cancelOldPatientNote('${p.id}')">Cancelar</button>
                    </div>
                </div>
            </div>

            <div class="list-item-actions" style="flex-shrink:0; display:flex; flex-direction:column; gap:0.6rem; min-width:140px; border-left:1px solid var(--gray-100); padding-left:1rem; margin-left:1rem;">
                <button class="btn btn-primary" style="width:100%; font-size:0.85rem; padding:8px;" onclick="showReactivationSuite('${p.id}')">
                    ⚡ REATIVAR
                </button>
                
                <select class="form-select btn-small" style="font-size:0.8rem; padding:6px;" 
                    onchange="quickUpdateOldPatientStatus('${p.id}', this.value)">
                    <option value="">Status...</option>
                    <option value="pending">⏳ Pendente</option>
                    <option value="contacted">📞 Em Contato</option>
                    <option value="scheduled">📅 Agendado</option>
                    <option value="recovered">✅ Recuperado</option>
                    <option value="lost">❌ Perdido</option>
                    <option value="not-interested">🚫 Sem Interesse</option>
                </select>

                <div style="display:flex; gap:0.4rem; justify-content:center;">
                    <button class="btn btn-secondary btn-small" onclick="toggleOldPatientNote('${p.id}')" title="Editar anotação">📝</button>
                    <button class="btn btn-secondary btn-small" onclick="showEditOldPatientForm('${p.id}')" title="Editar cadastro completo">✏️</button>
                    ${p.phone ? `<button class="btn btn-whatsapp btn-small" onclick="window.openWhatsApp('${escapeHTML(p.phone)}')">📱</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

function showReactivationSuite(id) {
    const p = AppState.oldPatients.find(item => item.id === id);
    if (!p) return;

    const lastConsult = p.lastConsultation ? new Date(p.lastConsultation).toLocaleDateString() : 'algum tempo';
    const templates = [
        {
            title: '👋 Saudação & Retorno',
            text: `Olá ${p.name.split(' ')[0]}! Tudo bem? Aqui é da Odonto Company. Vimos que sua última consulta foi em ${lastConsult} e gostaríamos de saber como está sua saúde bucal. Que tal agendarmos uma avaliação cortesia de retorno?`
        },
        {
            title: '🦷 Procedimento Pendente',
            text: `Oi ${p.name.split(' ')[0]}, como vai? Notei aqui em seu histórico que o último procedimento foi "${p.lastProcedure || 'uma consulta'}". Ficamos com saudade! Temos horários disponíveis esta semana para você continuar seu cuidado conosco.`
        },
        {
            title: '🎁 Condição Especial',
            text: `Olá ${p.name.split(' ')[0]}! Temos uma novidade para pacientes especiais como você. Preparamos uma condição exclusiva para você reativar seu tratamento nesta semana. Vamos conversar?`
        }
    ];

    const html = `
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <div style="background:var(--primary-50); padding:1rem; border-radius:12px; border:1px solid var(--primary-100);">
                <h5 style="margin:0 0 0.5rem 0; color:var(--primary-700);">Informações para Reativação</h5>
                <div style="font-size:0.9rem; display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
                    <div><strong>Paciente:</strong> ${escapeHTML(p.name)}</div>
                    <div><strong>Última Vez:</strong> ${lastConsult}</div>
                    <div style="grid-column:span 2;"><strong>Serviço Anterior:</strong> ${escapeHTML(p.lastProcedure || 'Não especificado')}</div>
                </div>
            </div>

            <div>
                <h5 style="margin:0 0 0.75rem 0; font-weight:600;">Modelos de Mensagem WhatsApp</h5>
                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                    ${templates.map(t => `
                        <div class="template-card" style="border:1px solid var(--gray-200); border-radius:10px; padding:1rem; transition:all 0.2s; cursor:pointer; background:white;"
                             onclick="sendOldPatientTemplate('${id}', '${t.text.replace(/'/g, "\\'")}')"
                             onmouseover="this.style.borderColor='var(--primary-400)'; this.style.boxShadow='var(--shadow-sm)'"
                             onmouseout="this.style.borderColor='var(--gray-200)'; this.style.boxShadow='none'">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                                <strong style="color:var(--primary-600);">${t.title}</strong>
                                <span class="badge badge-success" style="font-size:0.7rem;">ENVIAR ➔</span>
                            </div>
                            <p style="font-size:0.8rem; color:var(--gray-600); margin:0; font-style:italic;">"${t.text}"</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div>
                <h5 style="margin:0 0 0.75rem 0; font-weight:600;">Registro Rápido de Contato</h5>
                <div style="display:flex; gap:0.75rem;">
                    <button class="btn btn-secondary" style="flex:1;" onclick="logOldPatientContact('${id}', 'Tentativa de Ligação')">📞 Tentativa Ligação</button>
                    <button class="btn btn-secondary" style="flex:1;" onclick="logOldPatientContact('${id}', 'Mensagem Enviada')">💬 Mensagem Enviada</button>
                </div>
                <div style="margin-top:0.75rem;">
                    <textarea id="quickContactNote" class="form-textarea" style="min-height:60px; font-size:0.85rem;" placeholder="Anotação rápida do contato..."></textarea>
                    <button class="btn btn-primary" style="margin-top:0.5rem; width:100%;" onclick="logOldPatientContact('${id}', document.getElementById('quickContactNote').value)">💾 Registrar Contato Realizado</button>
                </div>
            </div>
        </div>
    `;

    openModal('🚀 Central de Reativação', html, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);
}

async function sendOldPatientTemplate(id, text) {
    const p = AppState.oldPatients.find(item => item.id === id);
    if (!p || !p.phone) {
        showNotification('Telefone não cadastrado!', 'error');
        return;
    }
    
    // Log the contact
    await logOldPatientContact(id, 'Envio de template WhatsApp', false);
    
    // Open WA
    window.openWhatsApp(p.phone, text);
    closeModal();
}

async function logOldPatientContact(id, note, shouldClose = true) {
    const idx = AppState.oldPatients.findIndex(p => p.id === id);
    if (idx < 0) return;

    const contactDate = new Date().toISOString();
    const contactLog = {
        date: contactDate,
        note: note || 'Contato realizado',
        user: AppState.user?.name || 'CRC'
    };

    if (!AppState.oldPatients[idx].contacts) AppState.oldPatients[idx].contacts = [];
    AppState.oldPatients[idx].contacts.push(contactLog);
    AppState.oldPatients[idx].lastContactDate = contactDate;
    AppState.oldPatients[idx].updatedAt = contactDate;
    
    // Auto-update status to contacted if it was pending
    if (AppState.oldPatients[idx].status === 'pending') {
        AppState.oldPatients[idx].status = 'contacted';
    }

    await saveToStorage('odontocrm_old_patients', AppState.oldPatients);
    
    if (typeof isCloudConnected === 'function' && isCloudConnected()) {
        await updateRecord('old_patients', id, { 
            last_contact_date: contactDate,
            status: AppState.oldPatients[idx].status,
            notes: (AppState.oldPatients[idx].notes || '') + `\n[Log ${formatDate(contactDate)}]: ${note}`
        });
    }

    showNotification('✅ Contato registrado!', 'success');
    if (shouldClose) closeModal();
    renderOldPatients();
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

function updateOldPatientsCategoryFilter(value) {
    oldPatientsCategoryFilter = value;
    renderOldPatients();
}

function updateOldPatientsPriorityFilter(value) {
    oldPatientsPriorityFilter = value;
    renderOldPatients();
}

function clearOldPatientsFilters() {
    oldPatientsSearch = '';
    oldPatientsStatusFilter = 'all';
    oldPatientsCategoryFilter = 'all';
    oldPatientsPriorityFilter = 'all';
    
    // Clear input value manually if it exists
    const input = document.getElementById('oldPatientsSearchInput');
    if (input) input.value = '';
    
    renderOldPatients();
    showNotification('🧹 Filtros limpos', 'success');
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
    const cat = p ? (p.category || 'clinico') : 'clinico';
    const prio = p ? (p.priority || 'media') : 'media';

    return `
        <form id="oldPatientForm">
            ${isEdit ? `<input type="hidden" name="id" value="${p.id}">` : ''}
            <div class="form-group">
                <label class="form-label">Nome Completo *</label>
                <input type="text" name="name" class="form-input" required value="${isEdit ? escapeHTML(p.name) : ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Categoria de Tratamento</label>
                    <select name="category" class="form-select">
                        ${Object.entries(OLD_PATIENT_CATEGORIES).map(([key, cfg]) => `
                            <option value="${key}" ${cat === key ? 'selected' : ''}>${cfg.icon} ${cfg.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Prioridade de Reativação</label>
                    <select name="priority" class="form-select">
                        ${Object.entries(OLD_PATIENT_PRIORITIES).map(([key, cfg]) => `
                            <option value="${key}" ${prio === key ? 'selected' : ''}>${cfg.label}</option>
                        `).join('')}
                    </select>
                </div>
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
                <label class="form-label">Último Procedimento Realizado</label>
                <input type="text" name="lastProcedure" class="form-input" placeholder="Ex: Canal no dente 46, Limpeza semestral, Braquetes colados..." value="${isEdit ? escapeHTML(p.lastProcedure || '') : ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Interesse Original / Queixa</label>
                <input type="text" name="interest" class="form-input" placeholder="Ex: Implante, Estética..." value="${isEdit ? escapeHTML(p.interest || '') : ''}">
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
                category: data.category,
                last_procedure: data.lastProcedure,
                priority: data.priority,
                last_consultation: data.lastConsultation,
                recovered_at: p.recoveredAt || null
            });
        }
 else {
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
window.updateOldPatientsCategoryFilter = updateOldPatientsCategoryFilter;
window.updateOldPatientsPriorityFilter = updateOldPatientsPriorityFilter;
window.showReactivationSuite = showReactivationSuite;
window.sendOldPatientTemplate = sendOldPatientTemplate;
window.logOldPatientContact = logOldPatientContact;
window.clearOldPatientsFilters = clearOldPatientsFilters;
