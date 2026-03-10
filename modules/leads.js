// Leads Module - CRM Odonto Company (Enhanced)
// ===============================================

// Global state for leads module
const LeadsState = {
    selectedLeads: new Set(),
    expandedLead: null,
    filterStatus: 'all',
    filterDate: null,
    searchTerm: '' // Added search term
};

// Initialize Leads Module
function initLeadsModule() {
    renderLeadsList();

    // Attach event listener to new lead button
    const newLeadBtn = document.getElementById('newLeadBtn');
    if (newLeadBtn && !newLeadBtn.hasAttribute('data-initialized')) {
        newLeadBtn.addEventListener('click', showNewLeadForm);
        newLeadBtn.setAttribute('data-initialized', 'true');
    }

    // Attach import/export buttons
    const importBtn = document.getElementById('importLeadsBtn');
    const exportBtn = document.getElementById('exportLeadsBtn');

    if (importBtn && !importBtn.hasAttribute('data-initialized')) {
        importBtn.addEventListener('click', importLeadsFromXLSX);
        importBtn.setAttribute('data-initialized', 'true');
    }

    if (exportBtn && !exportBtn.hasAttribute('data-initialized')) {
        exportBtn.addEventListener('click', exportLeads);
        exportBtn.setAttribute('data-initialized', 'true');
    }
}

// Calculate days since lead was created
function getDaysSince(dateString) {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get urgency badge for lead age
function getUrgencyBadge(days) {
    if (days === 0) return '<span class="badge" style="background: #dbeafe; color: #1d4ed8;">🆕 Hoje</span>';
    if (days === 1) return '<span class="badge" style="background: #d1fae5; color: #065f46;">1 dia</span>';
    if (days <= 3) return `<span class="badge" style="background: #fef3c7; color: #92400e;">${days} dias</span>`;
    if (days <= 7) return `<span class="badge" style="background: #fed7aa; color: #9a3412;">${days} dias ⚠️</span>`;
    return `<span class="badge" style="background: #fee2e2; color: #991b1b;">${days} dias 🔥</span>`;
}

// Render Leads List (Enhanced - Refactored for Focus Stability)
function renderLeadsList() {
    const container = document.getElementById('leadsContent');

    // 1. Initialize Structure if missing or wrong (Preserves Search Input Focus)
    const existingStructure = document.getElementById('leads-structure-container');
    const existingGrid = document.getElementById('leadsGrid');

    if (!existingStructure || !existingGrid) {
        container.innerHTML = `
            <div id="leads-structure-container">
                <div id="leads-filter-bar"></div>
                <div id="leads-bulk-actions"></div>
                <div id="leadsGrid" class="leads-grid"></div>
                <div id="leads-empty-state"></div>
            </div>
        `;
    }

    const structureContainer = document.getElementById('leads-structure-container');
    const filterBarContainer = document.getElementById('leads-filter-bar');
    const bulkActionsContainer = document.getElementById('leads-bulk-actions');
    const gridContainer = document.getElementById('leadsGrid');

    if (!gridContainer) {
        console.error('❌ CRITICAL: leadsGrid container not found even after initialization!');
        return;
    }

    // Preserve scroll position
    const scrollPos = window.scrollY;

    const emptyStateContainer = document.getElementById('leads-empty-state');

    // 2. Handle Empty Data State
    if (AppState.leads.length === 0) {
        structureContainer.style.display = 'none';
        emptyStateContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h3>Nenhum lead cadastrado</h3>
                <p>Comece adicionando leads vindos do WhatsApp ou importando planilha</p>
            </div>
        `;
        emptyStateContainer.style.display = 'block';
        filterBarContainer.style.display = 'none';
        bulkActionsContainer.style.display = 'none';
        gridContainer.style.display = 'none';
        return;
    } else {
        emptyStateContainer.style.display = 'none';
        structureContainer.style.display = 'block';
        filterBarContainer.style.display = 'block';
        gridContainer.style.display = 'grid';
    }

    // 3. Update Filter Bar
    if (!document.getElementById('leads-search-input')) {
        filterBarContainer.innerHTML = `
            <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); flex-wrap: wrap; align-items: center; justify-content: space-between; background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <div style="display: flex; gap: var(--spacing-sm); align-items: center; flex: 1;">
                     <div class="search-box" style="flex: 1; max-width: 300px;">
                        <input type="text" id="leads-search-input" placeholder="🔍 Buscar por nome ou telefone..." 
                               class="form-input" 
                               oninput="searchLeads(this.value)">
                    </div>
                </div>
    
                <div style="display: flex; gap: var(--spacing-sm); align-items: center; flex-wrap: wrap;" id="leads-filter-buttons">
                    <!-- Buttons injected via JS to update active state easily -->
                </div>
                
                <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
                    <input type="date" id="dateFilter" class="form-input" style="width: auto;" onchange="filterByDate(this.value)">
                    <button id="clearDateBtn" class="btn btn-secondary btn-small" onclick="clearDateFilter()" style="display: none;">Limpar</button>
                </div>
            </div>
        `;
    }

    const searchInput = document.getElementById('leads-search-input');
    if (searchInput && searchInput.value !== LeadsState.searchTerm) {
        searchInput.value = LeadsState.searchTerm;
    }

    const dateInput = document.getElementById('dateFilter');
    if (dateInput) {
        dateInput.value = LeadsState.filterDate || '';
        document.getElementById('clearDateBtn').style.display = LeadsState.filterDate ? 'block' : 'none';
    }

    const filterButtonsContainer = document.getElementById('leads-filter-buttons');
    filterButtonsContainer.innerHTML = `
        <span style="font-weight: 600; color: var(--gray-700); font-size: 0.875rem;">Status:</span>
        <button class="btn ${LeadsState.filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="filterLeads('all')">Todos</button>
        <button class="btn ${LeadsState.filterStatus === 'new' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="filterLeads('new')">🆕 Novos</button>
        <button class="btn ${LeadsState.filterStatus === 'in-contact' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="filterLeads('in-contact')">📞 Em Contato</button>
        <button class="btn ${LeadsState.filterStatus === 'scheduled' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="filterLeads('scheduled')">📅 Agendados</button>
        <button class="btn ${LeadsState.filterStatus === 'visit' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="filterLeads('visit')">🏥 Visitas</button>
    `;

    // 4. Update Bulk Actions Bar
    if (LeadsState.selectedLeads.size > 0) {
        bulkActionsContainer.innerHTML = `
            <div style="background: var(--primary-100); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md);">
                <span style="font-weight: 600; color: var(--primary-700);">${LeadsState.selectedLeads.size} selecionado(s)</span>
                <button class="btn btn-small btn-secondary" onclick="bulkChangeStatus('in-contact')">📞 Marcar Em Contato</button>
                <button class="btn btn-small btn-secondary" onclick="bulkChangeStatus('scheduled')">✅ Marcar Agendados</button>
                <button class="btn btn-small" style="background: var(--error-500); color: white;" onclick="bulkDeleteLeads()">🗑️ Deletar</button>
                <button class="btn btn-small btn-secondary" onclick="clearSelection()">Limpar Seleção</button>
            </div>
        `;
        bulkActionsContainer.style.display = 'block';
    } else {
        bulkActionsContainer.style.display = 'none';
        bulkActionsContainer.innerHTML = '';
    }

    // 5. Filter and Render Grid Content
    let filteredLeads = AppState.leads;

    if (LeadsState.filterStatus !== 'all') {
        filteredLeads = filteredLeads.filter(l => l.status === LeadsState.filterStatus);
    }

    if (LeadsState.filterDate) {
        const filterDateStr = new Date(LeadsState.filterDate).toDateString();
        filteredLeads = filteredLeads.filter(l =>
            new Date(l.createdAt).toDateString() === filterDateStr
        );
    }

    if (LeadsState.searchTerm) {
        const term = LeadsState.searchTerm.toLowerCase();
        filteredLeads = filteredLeads.filter(l =>
            l.name.toLowerCase().includes(term) ||
            (l.phone && String(l.phone).includes(term))
        );
    }

    const sortedLeads = [...filteredLeads].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    const leadsHTML = sortedLeads.map(lead => {
        const days = getDaysSince(lead.createdAt);
        const isSelected = LeadsState.selectedLeads.has(lead.id);
        const isExpanded = LeadsState.expandedLead === lead.id;

        const safeName = escapeHTML(lead.name);
        const safePhone = escapeHTML(lead.phone);
        const safeEmail = escapeHTML(lead.email || '');
        const safeChannel = escapeHTML(lead.channel || '');
        const safeInterest = escapeHTML(lead.interest || '');
        const safeMessage = escapeHTML(lead.message || '');

        return `
            <div class="lead-card ${isSelected ? 'lead-selected' : ''} ${isExpanded ? 'lead-expanded' : ''}" data-lead-id="${lead.id}">
                <div class="lead-header" onclick="toggleLeadExpand('${lead.id}')">
                    <div style="display: flex; align-items: center; gap: var(--spacing-md); flex: 1;">
                        <input type="checkbox" 
                               ${isSelected ? 'checked' : ''} 
                               onclick="event.stopPropagation(); toggleLeadSelection('${lead.id}')" 
                               style="width: 20px; height: 20px; cursor: pointer;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                                <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin: 0;">${safeName}</h4>
                                ${getStatusBadge(lead.status)}
                                ${getUrgencyBadge(days)}
                                ${lead.channel ? `<span class="badge badge-primary">📢 ${safeChannel}</span>` : ''}
                                ${lead.saleStatus === 'sold' ? '<span class="badge badge-success">💰 Venda</span>' : ''}
                                ${lead.saleStatus === 'lost' ? '<span class="badge badge-error">❌ Perdido</span>' : ''}
                            </div>
                            <p style="color: var(--gray-600); font-size: 0.875rem; margin: 0;">
                                📱 ${safePhone} ${lead.email ? `• ✉️ ${safeEmail}` : ''}
                                ${lead.nextContact ? ` • 📅 Retorno: <span style="color: ${new Date(lead.nextContact) < new Date() ? 'var(--error-600)' : 'var(--primary-600)'}; font-weight: 700;">${new Date(lead.nextContact).toLocaleDateString('pt-BR')}</span>` : ''}
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                        <span style="font-size: 1.5rem; transform: rotate(${isExpanded ? '180deg' : '0deg'}); transition: transform 0.3s;">▼</span>
                    </div>
                </div>

                ${isExpanded ? `
                    <div class="lead-details">
                        <!-- Smart Workflow Section -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                            <h5 style="margin: 0 0 1rem 0; font-weight: 600; color: var(--gray-800); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                🚀 Fluxo de Trabalho
                            </h5>
                            
                            <div style="margin-bottom: 1rem; padding: 1rem; background: ${lead.nextContact && new Date(lead.nextContact) < new Date() ? '#fff1f2' : 'white'}; border: 1px dashed ${lead.nextContact && new Date(lead.nextContact) < new Date() ? '#fda4af' : '#cbd5e1'}; border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-size: 0.75rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase;">📅 Próximo Contato (Follow-up)</div>
                                        <div style="font-weight: 600; color: var(--gray-800); margin-top: 4px;">
                                            ${lead.nextContact ? new Date(lead.nextContact).toLocaleDateString('pt-BR') : 'Não agendado'}
                                            ${lead.nextContact && new Date(lead.nextContact) < new Date() ? ' <span style="color: var(--error-600); font-size: 0.7rem;">⚠️ ATRASADO</span>' : ''}
                                        </div>
                                    </div>
                                    <button class="btn btn-secondary btn-small" onclick="showSetNextContactModal('${lead.id}')">Agendar Retorno</button>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                <!-- Passo 1: Contato -->
                                <div class="lead-workflow-item" style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid ${lead.contactedAt ? '#bbf7d0' : '#e2e8f0'}; position: relative;">
                                    <div style="font-size: 0.75rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase;">Passo 1: Contato</div>
                                    <div style="margin-top: 0.5rem; cursor: pointer;" onclick="${lead.contactedAt ? `editStepDate('${lead.id}', 'contactedAt')` : `updateLeadStatus('${lead.id}', 'in-contact')`}">
                                        ${lead.contactedAt
                    ? `<span style="color: #166534; font-weight: 600;">✅ Contatado em:</span><br>${formatDateTime(lead.contactedAt)}<br><small style="color: var(--primary-600)">Clique para alterar</small>`
                    : `<button class="btn btn-secondary btn-small" style="width: 100%;">Marcar Contatado</button>`}
                                    </div>
                                    ${lead.contactedAt ? `<button onclick="revertLeadStep('${lead.id}', 1)" style="position: absolute; top: 5px; right: 5px; background: none; border: none; cursor: pointer; font-size: 0.8rem;" title="Voltar Passo">↩️</button>` : ''}
                                </div>

                                <!-- Passo 2: Agendamento -->
                                <div class="lead-workflow-item" style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid ${lead.scheduledAt ? '#bbf7d0' : '#e2e8f0'}; position: relative;">
                                    <div style="font-size: 0.75rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center;">
                                        <span>Passo 2: Agendamento</span>
                                        ${lead.scheduledAt ? `<button onclick="editVisitDate('${lead.id}')" style="background: none; border: none; color: var(--primary-600); font-size: 0.7rem; font-weight: 700; cursor: pointer; padding: 0;">TROCAR DATA</button>` : ''}
                                    </div>
                                    <div style="margin-top: 0.5rem; cursor: pointer;" onclick="${lead.scheduledAt ? `editStepDate('${lead.id}', 'scheduledAt')` : `updateLeadStatus('${lead.id}', 'scheduled')`}">
                                        ${lead.scheduledAt
                    ? `<span style="color: #166534; font-weight: 600;">✅ Agendado em:</span><br>${formatDateTime(lead.scheduledAt)}<br>
                                               <span style="color: var(--primary-700); font-weight: 600;">📅 Para o dia:</span><br>${lead.visitDate ? formatDate(lead.visitDate) : 'Não definida'}<br>
                                               <small style="color: var(--primary-600)">Clique para alterar</small>`
                    : `<button class="btn btn-primary btn-small" style="width: 100%;">Agendar Agora</button>`}
                                    </div>
                                    ${lead.scheduledAt ? `<button onclick="revertLeadStep('${lead.id}', 2)" style="position: absolute; top: 5px; right: 5px; background: none; border: none; cursor: pointer; font-size: 0.8rem;" title="Voltar Passo">↩️</button>` : ''}
                                </div>

                                <!-- Step 3: Comparecimento -->
                                <div style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid ${lead.attended ? '#bbf7d0' : '#e2e8f0'}; position: relative;">
                                    <div style="font-size: 0.75rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase;">Passo 3: Comparecimento</div>
                                    <div style="margin-top: 0.5rem;">
                                        ${lead.attended
                    ? `<span style="color: #166534; font-weight: 600;">✅ Compareceu</span><br><small>Sincronizado com agenda</small>`
                    : (lead.status === 'scheduled' || lead.status === 'visit')
                        ? `<div style="display: flex; gap: 0.5rem;">
                                                    <button class="btn btn-success btn-small" style="flex: 1;" onclick="markAttendance('${lead.id}', true)">Sim</button>
                                                    <button class="btn btn-error btn-small" style="flex: 1;" onclick="markAttendance('${lead.id}', false)">Não</button>
                                                  </div>`
                        : `<span style="color: var(--gray-400);">Aguardando agendamento</span>`}
                                    </div>
                                    ${lead.attended ? `<button onclick="revertLeadStep('${lead.id}', 3)" style="position: absolute; top: 5px; right: 5px; background: none; border: none; cursor: pointer; font-size: 0.8rem;" title="Voltar Passo">↩️</button>` : ''}
                                </div>

                                <!-- Step 4: Venda -->
                                <div style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid ${lead.saleStatus === 'sold' ? '#bbf7d0' : lead.saleStatus === 'lost' ? '#fecaca' : '#e2e8f0'}; position: relative;">
                                    <div style="font-size: 0.75rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase;">Passo 4: Fechamento</div>
                                    <div style="margin-top: 0.5rem;">
                                        ${lead.saleStatus === 'sold'
                    ? `<span style="color: #166534; font-weight: 600;">💰 Venda Realizada!</span>`
                    : lead.saleStatus === 'lost'
                        ? `<span style="color: #991b1b; font-weight: 600;">❌ Sem interesse</span>`
                        : lead.attended
                            ? `<div style="display: flex; gap: 0.5rem;">
                                                        <button class="btn btn-success btn-small" style="flex: 1; background: #166534;" onclick="markSale('${lead.id}', true)">Fechou</button>
                                                        <button class="btn btn-error btn-small" style="flex: 1;" onclick="markSale('${lead.id}', false)">Perdi</button>
                                                      </div>`
                            : `<span style="color: var(--gray-400);">Aguardando visita</span>`}
                                    </div>
                                    ${lead.saleStatus ? `<button onclick="revertLeadStep('${lead.id}', 4)" style="position: absolute; top: 5px; right: 5px; background: none; border: none; cursor: pointer; font-size: 0.8rem;" title="Voltar Passo">↩️</button>` : ''}
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-lg); margin-top: var(--spacing-lg);">
                            <div class="form-group">
                                <label class="form-label">Nome</label>
                                <input type="text" class="form-input" value="${safeName}" onchange="updateLeadField('${lead.id}', 'name', this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Telefone</label>
                                <input type="text" class="form-input" value="${safePhone}" onchange="updateLeadField('${lead.id}', 'phone', this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" value="${safeEmail}" onchange="updateLeadField('${lead.id}', 'email', this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Canal</label>
                                <select class="form-select" onchange="updateLeadField('${lead.id}', 'channel', this.value)">
                                    <option value="">Selecione</option>
                                    <option value="Google Ads" ${lead.channel === 'Google Ads' ? 'selected' : ''}>Google Ads</option>
                                    <option value="Facebook Ads" ${lead.channel === 'Facebook Ads' ? 'selected' : ''}>Facebook Ads</option>
                                    <option value="Instagram Ads" ${lead.channel === 'Instagram Ads' ? 'selected' : ''}>Instagram Ads</option>
                                    <option value="Organico" ${lead.channel === 'Organico' ? 'selected' : ''}>Orgânico</option>
                                    <option value="Indicacao" ${lead.channel === 'Indicacao' ? 'selected' : ''}>Indicação</option>
                                    <option value="WhatsApp" ${lead.channel === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Interesse</label>
                                <input type="text" class="form-input" value="${safeInterest}" onchange="updateLeadField('${lead.id}', 'interest', this.value)" placeholder="Ex: Clareamento">
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="color: var(--primary-700);">📅 Data da Visita (Relatórios)</label>
                                <input type="date" class="form-input" value="${lead.visitDate ? lead.visitDate.split('T')[0] : ''}" 
                                       onchange="updateLeadField('${lead.id}', 'visitDate', this.value ? new Date(this.value + 'T12:00:00').toISOString() : null)"
                                       style="border-color: var(--primary-200); background: var(--primary-50);">
                                <small style="font-size: 0.7rem; color: var(--gray-500);">Ajuste esta data para corrigir o dia em que a visita aparece nos relatórios.</small>
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: var(--spacing-md);">
                            <label class="form-label">Mensagem Inicial</label>
                            <textarea class="form-textarea" rows="3" onchange="updateLeadField('${lead.id}', 'message', this.value)">${safeMessage}</textarea>
                        </div>

                        <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-lg); flex-wrap: wrap;">
                            <button class="btn btn-whatsapp btn-small" onclick="openWhatsApp('${lead.phone}', 'Olá ${safeName}! Aqui é da Odonto Company.')">
                                💬 Abrir WhatsApp
                            </button>
                            ${lead.status !== 'converted' ? `
                                <button class="btn btn-success btn-small" onclick="convertLeadToPatient('${lead.id}')">
                                    ✅ Tornar Paciente Permanente
                                </button>
                            ` : ''}
                            <button class="btn btn-secondary btn-small" onclick="deleteLead('${lead.id}')">
                                🗑️ Deletar
                            </button>
                        </div>

                        <div style="margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--gray-200);">
                            <h5 style="margin-bottom: var(--spacing-md); font-weight: 600; color: var(--gray-700); display: flex; justify-content: space-between; align-items: center;">
                                📜 Histórico de Interações
                                <button class="btn btn-small btn-secondary" onclick="event.stopPropagation(); showAddInteractionModal('${lead.id}')">+ Adicionar Nota</button>
                            </h5>
                            <div class="interaction-timeline" style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                ${lead.interactions && lead.interactions.length > 0 ?
                    lead.interactions.map(idx => `
                                        <div class="interaction-item" style="background: var(--gray-50); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); border-left: 3px solid var(--primary-300);">
                                            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.25rem;">
                                                <span>${formatDateTime(idx.date)}</span>
                                            </div>
                                            <p style="font-size: 0.875rem; color: var(--gray-700); margin: 0;">${escapeHTML(idx.note)}</p>
                                        </div>
                                    `).join('')
                    : '<p style="font-size: 0.875rem; color: var(--gray-400); font-style: italic;">Nenhuma interação registrada.</p>'
                }
                            </div>
                        </div>

                        <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--gray-200);">
                            <p style="font-size: 0.75rem; color: var(--gray-400);">
                                📅 Cadastrado em: ${formatDateTime(lead.createdAt)} • Origem: ${lead.source}
                                ${lead.contactedAt ? `• Contatado em: ${formatDateTime(lead.contactedAt)}` : ''}
                            </p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    gridContainer.innerHTML = leadsHTML;

    // Restore scroll position
    window.scrollTo(0, scrollPos);
}

// Optimization: Refresh ONLY one specific card without rebuilding the whole grid
function refreshLeadCard(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const cardElement = document.querySelector(`.lead-card[data-lead-id="${leadId}"]`);
    if (!cardElement) {
        renderLeadsList(); // Fallback if card isn't found
        return;
    }

    // Capture the current classes to preserve selection state if needed
    const isSelected = LeadsState.selectedLeads.has(leadId);
    const isExpanded = LeadsState.expandedLead === leadId;

    // Generate new HTML just for this card
    const days = getDaysSince(lead.createdAt);
    const safeName = escapeHTML(lead.name);
    const safePhone = escapeHTML(lead.phone);
    const safeEmail = escapeHTML(lead.email || '');
    const safeChannel = escapeHTML(lead.channel || '');
    const safeInterest = escapeHTML(lead.interest || '');
    const safeMessage = escapeHTML(lead.message || '');

    // We can't easily use the template inside map because it's baked into renderLeadsList
    // So let's extract it into a helper or just re-render as a fallback for now, 
    // but with scroll preservation it will be better.

    // Actually, the simplest way to avoid the "reset" is just to save scroll position.
    // Full re-render with scroll restore is quite fast.
    renderLeadsList();
}

// Search Leads (Debounced)
const debouncedSearchLeads = debounce((term) => {
    LeadsState.searchTerm = term;
    renderLeadsList(); // Re-render with filter
}, 400);

function searchLeads(term) {
    debouncedSearchLeads(term);
}

// Filter leads by status
function filterLeads(status) {
    LeadsState.filterStatus = status;
    renderLeadsList();
}

// Toggle lead selection
function toggleLeadSelection(leadId) {
    if (LeadsState.selectedLeads.has(leadId)) {
        LeadsState.selectedLeads.delete(leadId);
    } else {
        LeadsState.selectedLeads.add(leadId);
    }
    renderLeadsList();
}

// Clear selection
function clearSelection() {
    LeadsState.selectedLeads.clear();
    renderLeadsList();
}

// Toggle lead expand/collapse
function toggleLeadExpand(leadId) {
    if (LeadsState.expandedLead === leadId) {
        LeadsState.expandedLead = null;
    } else {
        LeadsState.expandedLead = leadId;
    }
    renderLeadsList();
}

// Force expand specific lead (for external calls)
function expandLead(leadId) {
    LeadsState.expandedLead = leadId;
    renderLeadsList();
}

// Update lead field inline
function updateLeadField(leadId, field, value) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (lead) {
        lead[field] = value;
        lead.updatedAt = new Date().toISOString();
        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        showNotification(`${field} atualizado`, 'success');
    }
}

// Update lead status
function updateLeadStatus(leadId, newStatus) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (lead) {
        if (newStatus === 'scheduled') {
            showScheduleAppointmentModal(leadId);
            return;
        }

        if (newStatus === 'visit') {
            if (!lead.visitDate) lead.visitDate = new Date().toISOString();
            if (typeof syncLeadVisitToAppointment === 'function') syncLeadVisitToAppointment(leadId);
        }

        lead.status = newStatus;
        lead.updatedAt = new Date().toISOString();

        if (newStatus === 'in-contact' && !lead.contactedAt) {
            // Se estivermos em um fluxo retroativo (manual), podemos querer definir a data do primeiro contato
            // mas por padrão vamos setar agora. O usuário pode clicar no Passo 1 depois para ajustar.
            lead.contactedAt = new Date().toISOString();
        }

        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        refreshLeadCard(leadId); // Granular update
        showNotification(`Status atualizado para: ${newStatus}`, 'success');
    }
}

// Bulk change status
function bulkChangeStatus(newStatus) {
    if (newStatus === 'scheduled') {
        if (LeadsState.selectedLeads.size === 1) {
            const leadId = Array.from(LeadsState.selectedLeads)[0];
            showScheduleAppointmentModal(leadId);
            return;
        } else {
            alert("Para agendar, por favor selecione um lead de cada vez, pois é necessário informar data e hora individualmente.");
            return;
        }
    }

    let count = 0;
    LeadsState.selectedLeads.forEach(leadId => {
        const lead = AppState.leads.find(l => l.id === leadId);
        if (lead) {
            lead.status = newStatus;
            lead.updatedAt = new Date().toISOString();
            if (newStatus === 'in-contact' && !lead.contactedAt) {
                lead.contactedAt = new Date().toISOString();
            }
            count++;
        }
    });

    if (count > 0) {
        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        LeadsState.selectedLeads.clear();
        renderLeadsList();
        showNotification(`${count} lead(s) atualizado(s)`, 'success');
    }
}

// Bulk delete leads
function bulkDeleteLeads() {
    if (!confirm(`Tem certeza que deseja deletar ${LeadsState.selectedLeads.size} lead(s)?`)) {
        return;
    }

    LeadsState.selectedLeads.forEach(leadId => {
        const index = AppState.leads.findIndex(l => l.id === leadId);
        if (index > -1) {
            AppState.leads.splice(index, 1);
        }
    });

    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    LeadsState.selectedLeads.clear();
    renderLeadsList();
    showNotification('Leads deletados', 'success');
}

// Get Status Badge
function getStatusBadge(status) {
    const badges = {
        'new': '<span class="badge" style="background: #dbeafe; color: #1e40af;">🆕 Novo</span>',
        'in-contact': '<span class="badge" style="background: #dbeafe; color: #1e40af;">📞 Em Contato</span>',
        'waiting-return': '<span class="badge" style="background: #fef3c7; color: #92400e;">⏳ Aguardando</span>',
        'scheduled': '<span class="badge badge-success">✅ Agendado</span>',
        'visit': '<span class="badge" style="background: #e9d5ff; color: #6b21a8;">🏥 Visita</span>',
        'converted': '<span class="badge badge-success">✅ Convertido</span>',
        'not-converted': '<span class="badge badge-error">❌ Não Convertido</span>'
    };
    return badges[status] || badges.new;
}

// Show New Lead Form
function showNewLeadForm() {
    const formHTML = `
        <div class="form-group">
            <label class="form-label">Nome *</label>
            <input type="text" id="leadName" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">Telefone *</label>
            <input type="tel" id="leadPhone" class="form-input" required placeholder="(11) 99999-9999">
        </div>
        <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="leadEmail" class="form-input">
        </div>
        <div class="form-group">
            <label class="form-label">Canal</label>
            <select id="leadChannel" class="form-select">
                <option value="">Selecione</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Instagram Ads">Instagram Ads</option>
                <option value="Organico">Orgânico</option>
                <option value="Indicacao">Indicação</option>
                <option value="WhatsApp">WhatsApp</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Fonte</label>
            <input type="text" id="leadSource" class="form-input" value="WhatsApp" placeholder="WhatsApp, Site, etc.">
        </div>
        <div class="form-group">
            <label class="form-label">Interesse</label>
            <input type="text" id="leadInterest" class="form-input" placeholder="Ex: Clareamento, Canal, etc.">
        </div>
        <div class="form-group">
            <label class="form-label">Mensagem Inicial</label>
            <textarea id="leadMessage" class="form-textarea" rows="3" placeholder="Primeira mensagem recebida do lead..."></textarea>
        </div>
    `;

    openModal('Novo Lead', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Lead', class: 'btn-primary', onclick: 'saveLead()' }
    ]);
}

// Save Lead
function saveLead() {
    const name = document.getElementById('leadName').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();

    if (!name || !phone) {
        showNotification('Nome e telefone são obrigatórios!', 'error');
        return;
    }

    const lead = {
        id: generateId(),
        name,
        phone,
        email: document.getElementById('leadEmail').value.trim(),
        channel: document.getElementById('leadChannel').value,
        source: document.getElementById('leadSource').value || 'WhatsApp',
        interest: document.getElementById('leadInterest').value.trim(),
        message: document.getElementById('leadMessage').value.trim(),
        status: 'new',
        createdAt: new Date().toISOString()
    };

    AppState.leads.push(lead);
    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    closeModal();
    renderLeadsList();
    showNotification('Lead criado com sucesso!', 'success');
}

// Convert Lead to Patient
function convertLeadToPatient(leadId, silent = false) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    // Check if already a patient
    let patient = AppState.patients.find(p => p.convertedFrom === leadId || p.name.toLowerCase() === lead.name.toLowerCase());

    if (patient) {
        if (!silent) showNotification('Este lead já é um paciente cadastrado.', 'info');
        return;
    }

    if (!silent && !confirm(`Deseja converter o lead "${lead.name}" em paciente?`)) {
        return;
    }

    patient = {
        id: generateId(),
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        birthDate: '',
        address: '',
        createdAt: new Date().toISOString(),
        convertedFrom: leadId
    };

    AppState.patients.push(patient);
    lead.status = 'converted';
    lead.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);

    renderLeadsList();
    showNotification('Paciente cadastrado com sucesso!', 'success');
}

// Contact Lead
function contactLead(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (lead) {
        lead.status = 'in-contact';
        lead.contactedAt = new Date().toISOString();
        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        renderLeadsList();
        showNotification('Lead marcado como contatado', 'success');
    }
}

// Delete Lead with Cascade Option
function deleteLead(leadId) {
    if (!confirm('Tem certeza que deseja deletar este lead?')) {
        return;
    }

    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    // Check for related data
    const relatedPatient = AppState.patients.find(p => p.convertedFrom === leadId || p.name.toLowerCase() === lead.name.toLowerCase());
    const relatedAppointments = relatedPatient ? AppState.appointments.filter(a => a.patientId === relatedPatient.id) : [];

    let cascade = false;

    if (relatedPatient || relatedAppointments.length > 0) {
        const message = `⚠️ Este lead possui dados vinculados:\n` +
            `${relatedPatient ? '- 1 Paciente cadastrado\n' : ''}` +
            `${relatedAppointments.length > 0 ? `- ${relatedAppointments.length} Agendamento(s)\n` : ''}` +
            `\nDeseja apagar TAMBÉM esses dados vinculados?`;

        cascade = confirm(message);
    }

    const index = AppState.leads.findIndex(l => l.id === leadId);
    if (index > -1) {
        AppState.leads.splice(index, 1);
        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    }

    if (cascade && relatedPatient) {
        const pIndex = AppState.patients.findIndex(p => p.id === relatedPatient.id);
        if (pIndex > -1) {
            AppState.patients.splice(pIndex, 1);
            saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
        }

        AppState.appointments = AppState.appointments.filter(a => a.patientId !== relatedPatient.id);
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

        showNotification('Lead e dados vinculados deletados!', 'success');
    } else {
        showNotification('Lead deletado', 'success');
    }

    renderLeadsList();
}

// Filter by date
function filterByDate(date) {
    LeadsState.filterDate = date;
    renderLeadsList();
}

// Clear date filter
function clearDateFilter() {
    LeadsState.filterDate = null;
    document.getElementById('dateFilter').value = '';
    renderLeadsList();
}

// Show schedule appointment modal (mandatory when changing to 'scheduled')
function showScheduleAppointmentModal(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const today = new Date().toISOString().split('T')[0];

    const formHTML = `
        <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--primary-50); border-radius: var(--radius-md); border-left: 4px solid var(--primary-500);">
            <p style="margin: 0; color: var(--gray-700);">
                <strong>⚠️ Agendamento:</strong> Preencha os dados da avaliação.
            </p>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label class="form-label">📅 Data da Avaliação *</label>
                <input type="date" id="appointmentDate" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">⏰ Hora *</label>
                <input type="time" id="appointmentTime" class="form-input" required>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Procedimento</label>
            <input type="text" id="appointmentProcedure" class="form-input" value="Avaliação" placeholder="Avaliação, Consulta, etc.">
        </div>
        
        <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea id="appointmentNotes" class="form-textarea" rows="2" placeholder="Observações sobre o agendamento..."></textarea>
        </div>
    `;

    openModal('Novo Agendamento', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Confirmar Agendamento', class: 'btn-primary', onclick: `confirmScheduleAppointment('${leadId}')` }
    ]);
}

// Confirm schedule appointment
function confirmScheduleAppointment(leadId) {
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const procedure = document.getElementById('appointmentProcedure').value || 'Avaliação';
    const notes = document.getElementById('appointmentNotes').value;

    if (!date || !time) {
        showNotification('Data e hora são obrigatórios!', 'error');
        return;
    }

    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const dateTime = new Date(date + 'T' + time + ':00').toISOString();

    // Use current date for "Data da Venda" logic (when the appointment was recorded)
    const creationISO = new Date().toISOString();

    lead.status = 'scheduled';
    lead.scheduledAt = creationISO; // Data em que o agendamento foi FEITO
    lead.visitDate = dateTime;     // Data PARA A QUAL foi agendado
    lead.updatedAt = new Date().toISOString();

    let patient = AppState.patients.find(p => p.convertedFrom === leadId || p.name.toLowerCase() === lead.name.toLowerCase());

    if (!patient) {
        patient = {
            id: generateId(),
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            birthDate: '',
            address: '',
            createdAt: creationISO,
            convertedFrom: leadId
        };
        AppState.patients.push(patient);
    }

    const appointment = {
        id: generateId(),
        patientId: patient.id,
        patientName: patient.name,
        date: dateTime,
        saleDate: creationISO,
        procedure: procedure,
        duration: 60,
        notes: notes || `Agendamento criado do lead - Canal: ${lead.channel || 'N/A'}`,
        status: 'scheduled',
        attended: false,
        createdAt: new Date().toISOString()
    };
    AppState.appointments.push(appointment);

    // Track when the appointment was actually MADE
    lead.scheduledAt = new Date().toISOString();
    lead.visitDate = dateTime; // Sincroniza a data do agendamento com o campo de visita do lead

    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

    closeModal();
    renderLeadsList();
    if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
    if (typeof updateWeeklyGoals === 'function') updateWeeklyGoals();

    showNotification(`Agendamento confirmado para ${date.split('-').reverse().join('/')}!`, 'success');
}

// Open Edit Lead Modal
function openEditLeadModal(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const formHTML = `
        <div class="form-group">
            <label class="form-label">Nome *</label>
            <input type="text" id="editLeadName" class="form-input" value="${escapeHTML(lead.name)}" required>
        </div>
        <div class="form-group">
            <label class="form-label">Telefone *</label>
            <input type="tel" id="editLeadPhone" class="form-input" value="${escapeHTML(lead.phone)}" required>
        </div>
        <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="editLeadEmail" class="form-input" value="${escapeHTML(lead.email || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Canal</label>
            <select id="editLeadChannel" class="form-select">
                <option value="">Selecione</option>
                <option value="Google Ads" ${lead.channel === 'Google Ads' ? 'selected' : ''}>Google Ads</option>
                <option value="Facebook Ads" ${lead.channel === 'Facebook Ads' ? 'selected' : ''}>Facebook Ads</option>
                <option value="Instagram Ads" ${lead.channel === 'Instagram Ads' ? 'selected' : ''}>Instagram Ads</option>
                <option value="Organico" ${lead.channel === 'Organico' ? 'selected' : ''}>Orgânico</option>
                <option value="Indicacao" ${lead.channel === 'Indicacao' ? 'selected' : ''}>Indicação</option>
                <option value="WhatsApp" ${lead.channel === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Fonte</label>
            <input type="text" id="editLeadSource" class="form-input" value="${escapeHTML(lead.source || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Interesse</label>
            <input type="text" id="editLeadInterest" class="form-input" value="${escapeHTML(lead.interest || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Mensagem Inicial</label>
            <textarea id="editLeadMessage" class="form-textarea" rows="3">${escapeHTML(lead.message || '')}</textarea>
        </div>
    `;

    openModal('Editar Lead', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Alterações', class: 'btn-primary', onclick: `saveLeadChanges('${leadId}')` }
    ]);
}

// Save Lead Changes from Modal
function saveLeadChanges(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const name = document.getElementById('editLeadName').value.trim();
    const phone = document.getElementById('editLeadPhone').value.trim();

    if (!name || !phone) {
        showNotification('Nome e telefone são obrigatórios!', 'error');
        return;
    }

    lead.name = name;
    lead.phone = phone;
    lead.email = document.getElementById('editLeadEmail').value.trim();
    lead.channel = document.getElementById('editLeadChannel').value;
    lead.source = document.getElementById('editLeadSource').value;
    lead.interest = document.getElementById('editLeadInterest').value.trim();
    lead.message = document.getElementById('editLeadMessage').value.trim();
    lead.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    closeModal();
    renderLeadsList();
    if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
    showNotification('Lead atualizado com sucesso!', 'success');
}

// Export functions
window.initLeadsModule = initLeadsModule;
window.renderLeadsList = renderLeadsList;
window.filterLeads = filterLeads;
window.toggleLeadSelection = toggleLeadSelection;
window.clearSelection = clearSelection;
window.toggleLeadExpand = toggleLeadExpand;
window.expandLead = expandLead;
window.updateLeadField = updateLeadField;
window.updateLeadStatus = updateLeadStatus;
window.bulkChangeStatus = bulkChangeStatus;
window.bulkDeleteLeads = bulkDeleteLeads;
window.showNewLeadForm = showNewLeadForm;
window.saveLead = saveLead;
window.convertLeadToPatient = convertLeadToPatient;
window.contactLead = contactLead;
window.deleteLead = deleteLead;
window.filterByDate = filterByDate;
window.clearDateFilter = clearDateFilter;
window.showScheduleAppointmentModal = showScheduleAppointmentModal;
window.confirmScheduleAppointment = confirmScheduleAppointment;
window.openEditLeadModal = openEditLeadModal;
window.saveLeadChanges = saveLeadChanges;
window.searchLeads = searchLeads;
window.markAttendance = markAttendance;
window.markSale = markSale;

// Interaction History Helpers
window.showAddInteractionModal = (leadId) => {
    const formHTML = `
        <div class="form-group">
            <label class="form-label">Nota / Observação</label>
            <textarea id="interactionNote" class="form-textarea" rows="4" placeholder="Descreva o que foi conversado ou o status atual..." required></textarea>
        </div>
    `;

    openModal('Registrar Interação', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Nota', class: 'btn-primary', onclick: `saveInteraction('${leadId}')` }
    ]);
};

window.saveInteraction = (leadId) => {
    const note = document.getElementById('interactionNote').value.trim();
    if (!note) return;

    const lead = AppState.leads.find(l => l.id === leadId);
    if (lead) {
        if (!lead.interactions) lead.interactions = [];
        lead.interactions.unshift({
            date: new Date().toISOString(),
            note: note
        });
        lead.updatedAt = new Date().toISOString();
        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        closeModal();
        renderLeadsList();
        showNotification('Nota salva com sucesso', 'success');
    }
};

// New Helper Functions for Intuitive UX
async function markAttendance(leadId, attended) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    lead.attended = attended;
    if (attended) {
        lead.status = 'visit';
        // Sync with related appointment if exists
        const patient = AppState.patients.find(p => p.convertedFrom === leadId);
        if (patient) {
            const appointment = AppState.appointments.find(a => a.patientId === patient.id && a.status === 'scheduled');
            if (appointment) {
                appointment.attended = true;
                appointment.status = 'completed';
            }
        }
    } else {
        lead.status = 'not-converted';
        lead.saleStatus = 'lost';
    }

    lead.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
    refreshLeadCard(leadId);
    showNotification(attended ? 'Comparecimento registrado!' : 'Lead marcado como não compareceu', 'success');
}

async function markSale(leadId, sold) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    lead.saleStatus = sold ? 'sold' : 'lost';
    if (sold) {
        const value = prompt(`Digite o valor do fechamento para "${lead.name}":`, lead.saleValue || "0");
        if (value === null) return; // Cancelled
        lead.saleValue = parseFloat(value.replace(',', '.')) || 0;
        lead.status = 'converted';

        // Add interaction automatically
        if (!lead.interactions) lead.interactions = [];
        lead.interactions.unshift({
            date: new Date().toISOString(),
            note: `💰 VENDA REALIZADA! Valor: R$ ${lead.saleValue.toFixed(2)}. Lead convertido em paciente.`
        });

        // Ensure patient is created
        if (typeof convertLeadToPatient === 'function') {
            convertLeadToPatient(leadId, true); // silent conversion
        }
    } else {
        if (!confirm(`Confirmar que a venda para "${lead.name}" não foi fechada?`)) return;
        lead.status = 'not-converted';
        lead.saleValue = 0;
    }

    lead.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);

    // Refresh relevant UIs
    if (typeof refreshLeadCard === 'function') refreshLeadCard(leadId);
    if (typeof renderKanbanBoard === 'function') renderKanbanBoard();
    if (typeof updateDashboard === 'function') updateDashboard();

    showNotification(sold ? `Parabéns pela venda de R$ ${lead.saleValue.toFixed(2)}! 🎯` : 'Lead marcado como perdido', sold ? 'success' : 'info');
}

// Helpers for Manual Retroactive Date Updates
function getCurrentTimeFormatted() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

window.editStepDate = (leadId, field) => {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const currentVal = lead[field] ? lead[field].split('T')[0] : new Date().toISOString().split('T')[0];
    const label = field === 'contactedAt' ? 'Data do Primeiro Contato' : 'Data da Criação do Agendamento';

    const formHTML = `
        <div class="form-group">
            <label class="form-label">📅 Alterar ${label}</label>
            <input type="date" id="newStepDate" class="form-input" value="${currentVal}">
            <p style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.5rem;">
                Esta data é usada para os relatórios de conversão e metas.
            </p>
        </div>
    `;

    openModal('Editar Data do Fluxo', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Alteração', class: 'btn-primary', onclick: `saveStepDate('${leadId}', '${field}')` }
    ]);
};

window.saveStepDate = (leadId, field) => {
    const newDate = document.getElementById('newStepDate').value;
    if (!newDate) return;

    const lead = AppState.leads.find(l => l.id === leadId);
    if (lead) {
        // Keep the original time but change the date
        const timePart = lead[field] ? lead[field].split('T')[1] : '12:00:00.000Z';
        lead[field] = new Date(newDate + 'T' + (timePart.includes('Z') ? timePart : timePart + 'Z')).toISOString();
        lead.updatedAt = new Date().toISOString();

        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        closeModal();
        refreshLeadCard(leadId);
        showNotification('Data atualizada com sucesso!', 'success');
    }
};

window.revertLeadStep = (leadId, step) => {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const confirmMsg = `Deseja realmente voltar o passo ${step}? Isso poderá resetar o status do lead.`;
    if (!confirm(confirmMsg)) return;

    switch (step) {
        case 1: // Revert Contacted
            lead.contactedAt = null;
            lead.status = 'new';
            break;
        case 2: // Revert Scheduled
            lead.scheduledAt = null;
            lead.visitDate = null;
            lead.status = 'in-contact';
            // Note: We don't automatically delete the appointment record to avoid data loss, 
            // but the lead workflow returns to contact phase.
            break;
        case 3: // Revert Attendance
            lead.attended = false;
            lead.status = 'scheduled';
            break;
        case 4: // Revert Sale
            lead.saleStatus = null;
            lead.saleValue = 0;
            lead.status = lead.attended ? 'visit' : 'scheduled';
            break;
    }

    lead.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    refreshLeadCard(leadId);
    showNotification('Passo revertido com sucesso', 'info');
};

window.editVisitDate = (leadId) => {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const currentVal = lead.visitDate ? lead.visitDate.split('T')[0] : new Date().toISOString().split('T')[0];

    const formHTML = `
        <div class="form-group">
            <label class="form-label">📅 Trocar Data do Agendamento</label>
            <input type="date" id="newVisitDate" class="form-input" value="${currentVal}">
            <p style="font-size: 0.825rem; color: var(--gray-500); margin-top: 0.5rem;">
                Isso alterará a data registrada para a visita do paciente.
            </p>
        </div>
    `;

    openModal('Alterar Data da Visita', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Nova Data', class: 'btn-primary', onclick: `saveVisitDate('${leadId}')` }
    ]);
};

window.saveVisitDate = (leadId) => {
    const newDate = document.getElementById('newVisitDate').value;
    if (!newDate) return;

    const lead = AppState.leads.find(l => l.id === leadId);
    if (lead) {
        // Keep original time if possible, or use noon
        const timePart = lead.visitDate ? lead.visitDate.split('T')[1] : '12:00:00.000Z';
        lead.visitDate = new Date(newDate + 'T' + (timePart.includes('Z') ? timePart : timePart + 'Z')).toISOString();
        lead.updatedAt = new Date().toISOString();

        // Also update related appointment if possible
        const patient = AppState.patients.find(p => p.convertedFrom === leadId);
        if (patient) {
            const appointments = AppState.appointments.filter(a => a.patientId === patient.id && a.status === 'scheduled');
            appointments.forEach(a => {
                const aTime = a.date.split('T')[1];
                a.date = new Date(newDate + 'T' + aTime).toISOString();
                a.updatedAt = new Date().toISOString();
            });
            if (appointments.length > 0) {
                saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
            }
        }

        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        closeModal();
        refreshLeadCard(leadId);
        showNotification('Data do agendamento atualizada!', 'success');
    }
};
function showSetNextContactModal(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    const current = lead.nextContact ? lead.nextContact.split('T')[0] : '';

    const html = `
        <div class="form-group">
            <label class="form-label">Data para Retorno</label>
            <input type="date" id="nextContactDate" class="form-input" value="${current}">
            <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 5px;">
                Agende uma data para entrar em contato com o lead novamente caso ele não tenha fechado agora.
            </p>
        </div>
    `;

    openModal(`Agendar Retorno: ${lead.name}`, html, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Remover Agendamento', class: 'btn-secondary', onclick: `saveNextContact('${leadId}', null)` },
        { label: 'Salvar Agendamento', class: 'btn-primary', onclick: `saveNextContact('${leadId}')` }
    ]);
}

window.saveNextContact = (leadId, value) => {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (lead) {
        if (value === null) {
            delete lead.nextContact;
        } else {
            const date = document.getElementById('nextContactDate').value;
            if (!date) {
                showNotification('Selecione uma data!', 'warning');
                return;
            }
            lead.nextContact = date + 'T12:00:00';
        }
        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        closeModal();
        renderLeadsList();
        showNotification('Acompanhamento atualizado!', 'success');
    }
};

window.showSetNextContactModal = showSetNextContactModal;
