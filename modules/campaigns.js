// Campaigns Module - CRM Odonto Company
// ===========================================

// Global state for campaigns module
const CampaignsState = {
    campaigns: [],
    templates: [],
    contactLists: [],
    contacts: [],
    blacklist: [],
    selectedCampaign: null,
    filterStatus: 'all',
    filterType: 'all',
    searchTerm: '',
    currentView: 'dashboard' // dashboard, list, create, edit, details
};

// Campaign Types
const CAMPAIGN_TYPES = {
    marketing: { label: 'Marketing', icon: '📢', color: '#3b82f6' },
    red_folder: { label: 'Pasta Vermelha', icon: '🚩', color: '#ef4444' },
    collection: { label: 'Cobrança', icon: '💰', color: '#f59e0b' },
    birthday: { label: 'Aniversário', icon: '🎂', color: '#ec4899' },
    reminder: { label: 'Lembrete', icon: '⏰', color: '#10b981' },
    promotion: { label: 'Promoção', icon: '🔥', color: '#ef4444' }
};

// Initialize Campaigns Module
function initCampaignsModule() {
    console.log('📢 Initializing Campaigns Module...');
    loadCampaignsData();
    renderCampaignsDashboard();
    setupCampaignsEventListeners();
}

// Load Data from Storage
function loadCampaignsData() {
    try {
        // Load campaigns
        const campaignsData = localStorage.getItem('campaigns');
        if (campaignsData) {
            CampaignsState.campaigns = JSON.parse(campaignsData);
        }

        // Load templates
        const templatesData = localStorage.getItem('campaignTemplates');
        if (templatesData) {
            CampaignsState.templates = JSON.parse(templatesData);
        } else {
            // Load default templates if none exist
            loadDefaultTemplates();
        }

        // Load contact lists
        const contactListsData = localStorage.getItem('contactLists');
        if (contactListsData) {
            CampaignsState.contactLists = JSON.parse(contactListsData);
        }

        // Load contacts
        const contactsData = localStorage.getItem('contacts');
        if (contactsData) {
            CampaignsState.contacts = JSON.parse(contactsData);
        }

        // Load blacklist
        const blacklistData = localStorage.getItem('blacklist');
        if (blacklistData) {
            CampaignsState.blacklist = JSON.parse(blacklistData);
        }

        console.log('📢 Campaigns data loaded:', {
            campaigns: CampaignsState.campaigns.length,
            templates: CampaignsState.templates.length,
            contactLists: CampaignsState.contactLists.length,
            contacts: CampaignsState.contacts.length,
            blacklist: CampaignsState.blacklist.length
        });

    } catch (error) {
        console.error('❌ Error loading campaigns data:', error);
        showNotification('Erro ao carregar dados de campanhas', 'error');
    }
}

// Save Data to Storage
function saveCampaignsData() {
    try {
        localStorage.setItem('campaigns', JSON.stringify(CampaignsState.campaigns));
        localStorage.setItem('campaignTemplates', JSON.stringify(CampaignsState.templates));
        localStorage.setItem('contactLists', JSON.stringify(CampaignsState.contactLists));
        localStorage.setItem('contacts', JSON.stringify(CampaignsState.contacts));
        localStorage.setItem('blacklist', JSON.stringify(CampaignsState.blacklist));
    } catch (error) {
        console.error('❌ Error saving campaigns data:', error);
        showNotification('Erro ao salvar dados de campanhas', 'error');
    }
}

// Load Default Templates
function loadDefaultTemplates() {
    const defaultTemplates = [
        {
            id: generateId(),
            name: 'Template de Marketing',
            content: 'Olá {{nome}}! Temos uma promoção especial para você na {{unidade}}! Agende sua avaliação e ganhe 20% de desconto. Data da consulta: {{data_consulta}}',
            variables: ['nome', 'unidade', 'data_consulta'],
            type: 'marketing',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Template de Pasta Vermelha',
            content: 'Olá {{nome}}, sentimos falta de você aqui na {{unidade}}! Sabia que podemos transformar seu sorriso? Agende uma avaliação e receba um plano personalizado. Horário da consulta: {{horario}}',
            variables: ['nome', 'unidade', 'horario'],
            type: 'red_folder',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Template de Cobrança',
            content: 'Olá {{nome}}, temos uma pendência em aberto referente ao tratamento na {{unidade}}. Valor: R$ {{valor}}. Entre em contato para regularizar. Data de vencimento: {{data_vencimento}}',
            variables: ['nome', 'unidade', 'valor', 'data_vencimento'],
            type: 'collection',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Template de Aniversário',
            content: 'Feliz aniversário {{nome}}! 🎉 Para comemorar, temos um presente especial para você na {{unidade}}: limpeza grátis! Agende sua visita. Data da consulta: {{data_consulta}}',
            variables: ['nome', 'unidade', 'data_consulta'],
            type: 'birthday',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Template de Lembrete',
            content: 'Olá {{nome}}, seu agendamento está marcado para amanhã na {{unidade}} às {{horario}}. Confirme sua presença respondendo SIM. Qualquer dúvida, estamos à disposição!',
            variables: ['nome', 'unidade', 'horario'],
            type: 'reminder',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: generateId(),
            name: 'Template de Promoção',
            content: '🔥 PROMOÇÃO RELÂMPAGO! Olá {{nome}}, na {{unidade}} temos condições especiais hoje! Clareamento por R$ {{valor}} ou implante por R$ {{valor_implante}}. Agende já! Data da consulta: {{data_consulta}}',
            variables: ['nome', 'unidade', 'valor', 'valor_implante', 'data_consulta'],
            type: 'promotion',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];

    CampaignsState.templates = defaultTemplates;
    saveCampaignsData();
}

// Setup Event Listeners
function setupCampaignsEventListeners() {
    // Import contacts button
    const importBtn = document.getElementById('importContactsBtn');
    if (importBtn) {
        importBtn.addEventListener('click', showImportContactsModal);
    }

    // Manage templates button
    const templatesBtn = document.getElementById('manageTemplatesBtn');
    if (templatesBtn) {
        templatesBtn.addEventListener('click', showTemplateManager);
    }

    // New campaign button
    const newCampaignBtn = document.getElementById('newCampaignBtn');
    if (newCampaignBtn) {
        newCampaignBtn.addEventListener('click', showCreateCampaignForm);
    }

    // Setup search and filter events after content is rendered
    setTimeout(() => {
        const container = document.getElementById('campaignsContent');
        if (!container) return;

        // Search input
        const searchInput = document.getElementById('campaignsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                CampaignsState.searchTerm = e.target.value;
                renderCampaignsList();
            });
        }

        // Filter buttons
        const filterButtons = container.querySelectorAll('.campaign-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                CampaignsState.filterStatus = e.target.dataset.status;
                CampaignsState.filterType = e.target.dataset.type || 'all';
                renderCampaignsList();
            });
        });
    }, 100);
}

// Render Campaigns Dashboard
function renderCampaignsDashboard() {
    const container = document.getElementById('campaignsContent');

    const stats = calculateCampaignStats();

    container.innerHTML = `
        <div class="campaigns-dashboard">
            <!-- Quick Stats -->
            <div class="dashboard-grid" style="margin-bottom: 2rem;">
                <div class="stat-card">
                    <div class="stat-icon">📢</div>
                    <div class="stat-content">
                        <h3>Total de Campanhas</h3>
                        <div class="stat-number">${stats.total}</div>
                        <div class="stat-label">Campanhas criadas</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3>Em Andamento</h3>
                        <div class="stat-number">${stats.running}</div>
                        <div class="stat-label">Campanhas ativas</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <h3>Concluídas</h3>
                        <div class="stat-number">${stats.completed}</div>
                        <div class="stat-label">Campanhas finalizadas</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <h3>Taxa de Entrega</h3>
                        <div class="stat-number">${stats.deliveryRate}%</div>
                        <div class="stat-label">Média de entrega</div>
                    </div>
                </div>
            </div>

            <!-- Actions & Filters -->
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; flex-wrap: wrap;">
                <div class="search-box" style="flex: 1; max-width: 300px;">
                    <input type="text" id="campaignsSearch" placeholder="🔍 Buscar campanha..." 
                           class="form-input" value="${CampaignsState.searchTerm}">
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn ${CampaignsState.filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'} btn-small" 
                            onclick="filterCampaigns('all', 'all')">Todas</button>
                    <button class="btn ${CampaignsState.filterStatus === 'running' ? 'btn-primary' : 'btn-secondary'} btn-small" 
                            onclick="filterCampaigns('running', 'all')">Em Andamento</button>
                    <button class="btn ${CampaignsState.filterStatus === 'completed' ? 'btn-primary' : 'btn-secondary'} btn-small" 
                            onclick="filterCampaigns('completed', 'all')">Concluídas</button>
                    <button class="btn ${CampaignsState.filterStatus === 'scheduled' ? 'btn-primary' : 'btn-secondary'} btn-small" 
                            onclick="filterCampaigns('scheduled', 'all')">Agendadas</button>
                </div>
            </div>

            <!-- Campaigns List -->
            <div class="campaigns-list">
                ${renderCampaignsListHTML()}
            </div>
        </div>
    `;

    setupCampaignsEventListeners();
}

// Render Campaigns List HTML
function renderCampaignsListHTML() {
    let filteredCampaigns = [...CampaignsState.campaigns];

    // Apply filters
    if (CampaignsState.filterStatus !== 'all') {
        filteredCampaigns = filteredCampaigns.filter(c => c.status === CampaignsState.filterStatus);
    }

    if (CampaignsState.filterType !== 'all') {
        filteredCampaigns = filteredCampaigns.filter(c => c.type === CampaignsState.filterType);
    }

    // Apply search
    if (CampaignsState.searchTerm) {
        const term = CampaignsState.searchTerm.toLowerCase();
        filteredCampaigns = filteredCampaigns.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.type.toLowerCase().includes(term)
        );
    }

    // Sort by creation date (newest first)
    filteredCampaigns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (filteredCampaigns.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📢</div>
                <h3>Nenhuma campanha encontrada</h3>
                <p>${CampaignsState.searchTerm ? 'Tente ajustar os filtros ou a busca.' : 'Crie sua primeira campanha!'}</p>
                <button class="btn btn-primary" onclick="showCreateCampaignForm()" style="margin-top: 1rem;">
                    ➕ Criar Primeira Campanha
                </button>
            </div>
        `;
    }

    return filteredCampaigns.map(campaign => {
        const typeInfo = CAMPAIGN_TYPES[campaign.type] || CAMPAIGN_TYPES.marketing;
        const stats = getCampaignStats(campaign.id);
        const progress = campaign.total_sent > 0 ? Math.round((campaign.total_delivered / campaign.total_sent) * 100) : 0;

        return `
            <div class="campaign-card" onclick="showCampaignDetails('${campaign.id}')">
                <div class="campaign-header">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 2rem; color: ${typeInfo.color};">${typeInfo.icon}</div>
                        <div>
                            <h4 style="margin: 0; font-size: 1.125rem; color: var(--gray-900);">${escapeHTML(campaign.name)}</h4>
                            <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--gray-600);">
                                ${typeInfo.label} • ${formatDate(campaign.created_at)}
                                ${campaign.scheduled_at ? ` • Agendada: ${formatDate(campaign.scheduled_at)}` : ''}
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="badge ${getStatusBadgeClass(campaign.status)}">${getStatusLabel(campaign.status)}</span>
                        <span style="font-size: 1.5rem;">›</span>
                    </div>
                </div>
                
                <div class="campaign-stats" style="margin-top: 1rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
                    <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 8px;">
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-600);">${stats.total_contacts || 0}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Contatos</div>
                    </div>
                    <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 8px;">
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--success-600);">${campaign.total_sent}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Enviados</div>
                    </div>
                    <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 8px;">
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-600);">${campaign.total_delivered}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Entregues</div>
                    </div>
                    <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 8px;">
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--error-600);">${campaign.total_failed}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Falhas</div>
                    </div>
                </div>

                ${campaign.total_sent > 0 ? `
                    <div style="margin-top: 1rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--gray-500); margin-bottom: 4px;">
                            <span>Taxa de Entrega</span>
                            <span>${progress}%</span>
                        </div>
                        <div style="height: 8px; background: var(--gray-100); border-radius: 10px; overflow: hidden;">
                            <div style="height: 100%; background: var(--primary-500); width: ${progress}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Render Campaigns List (for list view)
function renderCampaignsList() {
    const container = document.getElementById('campaignsContent');
    container.innerHTML = renderCampaignsListHTML();
    setupCampaignsEventListeners();
}

// Filter Campaigns
function filterCampaigns(status, type = 'all') {
    CampaignsState.filterStatus = status;
    CampaignsState.filterType = type;
    renderCampaignsList();
}

// Calculate Campaign Stats
function calculateCampaignStats() {
    const total = CampaignsState.campaigns.length;
    const running = CampaignsState.campaigns.filter(c => c.status === 'running').length;
    const completed = CampaignsState.campaigns.filter(c => c.status === 'completed').length;

    // Calculate average delivery rate
    let totalSent = 0;
    let totalDelivered = 0;
    CampaignsState.campaigns.forEach(c => {
        totalSent += c.total_sent || 0;
        totalDelivered += c.total_delivered || 0;
    });

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

    return {
        total,
        running,
        completed,
        deliveryRate
    };
}

// Get Campaign Stats
function getCampaignStats(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return { total_contacts: 0 };

    const contactList = CampaignsState.contactLists.find(cl => cl.id === campaign.contact_list_id);
    return {
        total_contacts: contactList ? contactList.valid_contacts : 0
    };
}

// Get Status Label and Class
function getStatusLabel(status) {
    const labels = {
        draft: 'Rascunho',
        scheduled: 'Agendada',
        running: 'Em Andamento',
        completed: 'Concluída',
        cancelled: 'Cancelada',
        paused: 'Pausada'
    };
    return labels[status] || status;
}

function getStatusBadgeClass(status) {
    const classes = {
        draft: 'badge-gray',
        scheduled: 'badge-warning',
        running: 'badge-primary',
        completed: 'badge-success',
        cancelled: 'badge-error',
        paused: 'badge-warning'
    };
    return classes[status] || 'badge-gray';
}

// Show Create Campaign Form
function showCreateCampaignForm() {
    const templatesHTML = CampaignsState.templates.map(template => `
        <div class="template-option" onclick="selectTemplate('${template.id}')">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <input type="radio" name="template" value="${template.id}" id="template-${template.id}">
                <label for="template-${template.id}" style="cursor: pointer; flex: 1;">
                    <div style="font-weight: 600; color: var(--gray-900);">${escapeHTML(template.name)}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-top: 4px;">${escapeHTML(template.content.substring(0, 100))}...</div>
                    <div style="font-size: 0.75rem; color: var(--primary-600); margin-top: 4px;">Variáveis: ${template.variables.join(', ')}</div>
                </label>
            </div>
        </div>
    `).join('');

    const contactListsHTML = CampaignsState.contactLists.map(list => `
        <div class="contact-list-option" onclick="selectContactList('${list.id}')">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <input type="radio" name="contactList" value="${list.id}" id="list-${list.id}">
                <label for="list-${list.id}" style="cursor: pointer; flex: 1;">
                    <div style="font-weight: 600; color: var(--gray-900);">${escapeHTML(list.name)}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-top: 4px;">
                        ${list.valid_contacts} contatos válidos • ${list.total_contacts} total
                    </div>
                </label>
            </div>
        </div>
    `).join('');

    const campaignTypesHTML = Object.entries(CAMPAIGN_TYPES).map(([key, type]) => `
        <div class="campaign-type-option" onclick="selectCampaignType('${key}')">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <input type="radio" name="campaignType" value="${key}" id="type-${key}">
                <label for="type-${key}" style="cursor: pointer; flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">${type.icon}</span>
                        <span style="font-weight: 600; color: var(--gray-900);">${type.label}</span>
                    </div>
                </label>
            </div>
        </div>
    `).join('');

    const formHTML = `
        <div class="campaign-form">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Criar Nova Campanha</h3>
            
            <!-- Step 1: Basic Info -->
            <div class="form-step">
                <h4 style="margin-bottom: 1rem;">1. Informações Básicas</h4>
                <div class="form-group">
                    <label class="form-label">Nome da Campanha *</label>
                    <input type="text" id="campaignName" class="form-input" placeholder="Ex: Campanha de Aniversário de Maio">
                </div>
                <div class="form-group">
                    <label class="form-label">Tipo de Campanha *</label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">
                        ${campaignTypesHTML}
                    </div>
                </div>
            </div>

            <!-- Step 2: Template -->
            <div class="form-step">
                <h4 style="margin-bottom: 1rem;">2. Escolher Template</h4>
                <div class="form-group">
                    <label class="form-label">Template de Mensagem *</label>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${templatesHTML}
                    </div>
                    <button class="btn btn-secondary btn-small" style="margin-top: 1rem;" onclick="showCreateTemplateForm()">
                        ➕ Criar Novo Template
                    </button>
                </div>
            </div>

            <!-- Step 3: Contacts -->
            <div class="form-step">
                <h4 style="margin-bottom: 1rem;">3. Lista de Contatos</h4>
                <div class="form-group">
                    <label class="form-label">Lista de Contatos *</label>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${contactListsHTML}
                    </div>
                    <button class="btn btn-secondary btn-small" style="margin-top: 1rem;" onclick="showImportContactsModal()">
                        📥 Importar Contatos
                    </button>
                </div>
            </div>

            <!-- Step 4: Scheduling & Settings -->
            <div class="form-step">
                <h4 style="margin-bottom: 1rem;">4. Agendamento e Configurações</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data e Hora de Início</label>
                        <input type="datetime-local" id="campaignSchedule" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Limite Diário</label>
                        <input type="number" id="campaignDailyLimit" class="form-input" value="300" min="1" max="1000">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Intervalo Mínimo (segundos)</label>
                        <input type="number" id="campaignIntervalMin" class="form-input" value="5" min="1" max="60">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Intervalo Máximo (segundos)</label>
                        <input type="number" id="campaignIntervalMax" class="form-input" value="15" min="1" max="120">
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="saveCampaign()">💾 Salvar Campanha</button>
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            </div>
        </div>
    `;

    openModal('Nova Campanha', formHTML, []);
}

// Select Template
function selectTemplate(templateId) {
    document.querySelectorAll('.template-option').forEach(el => el.classList.remove('selected'));
    const selected = document.querySelector(`.template-option:has(#template-${templateId})`);
    if (selected) selected.classList.add('selected');
    document.getElementById(`template-${templateId}`).checked = true;
}

// Select Contact List
function selectContactList(listId) {
    document.querySelectorAll('.contact-list-option').forEach(el => el.classList.remove('selected'));
    const selected = document.querySelector(`.contact-list-option:has(#list-${listId})`);
    if (selected) selected.classList.add('selected');
    document.getElementById(`list-${listId}`).checked = true;
}

// Select Campaign Type
function selectCampaignType(type) {
    document.querySelectorAll('.campaign-type-option').forEach(el => el.classList.remove('selected'));
    const selected = document.querySelector(`.campaign-type-option:has(#type-${type})`);
    if (selected) selected.classList.add('selected');
    document.getElementById(`type-${type}`).checked = true;
}

// Save Campaign
function saveCampaign() {
    const name = document.getElementById('campaignName').value.trim();
    const type = document.querySelector('input[name="campaignType"]:checked')?.value;
    const templateId = document.querySelector('input[name="template"]:checked')?.value;
    const contactListId = document.querySelector('input[name="contactList"]:checked')?.value;
    const scheduledAt = document.getElementById('campaignSchedule').value;
    const dailyLimit = parseInt(document.getElementById('campaignDailyLimit').value) || 300;
    const intervalMin = parseInt(document.getElementById('campaignIntervalMin').value) || 5;
    const intervalMax = parseInt(document.getElementById('campaignIntervalMax').value) || 15;

    if (!name || !type || !templateId || !contactListId) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    const campaign = {
        id: generateId(),
        name,
        type,
        status: scheduledAt ? 'scheduled' : 'draft',
        template_id: templateId,
        contact_list_id: contactListId,
        scheduled_at: scheduledAt || null,
        timezone: 'America/Sao_Paulo',
        daily_limit: dailyLimit,
        current_day_count: 0,
        interval_min: intervalMin,
        interval_max: intervalMax,
        total_sent: 0,
        total_delivered: 0,
        total_read: 0,
        total_failed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        started_at: null,
        completed_at: null
    };

    CampaignsState.campaigns.push(campaign);
    saveCampaignsData();
    closeModal();
    renderCampaignsDashboard();
    showNotification('Campanha criada com sucesso!', 'success');
}

// Show Campaign Details
function showCampaignDetails(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const template = CampaignsState.templates.find(t => t.id === campaign.template_id);
    const contactList = CampaignsState.contactLists.find(cl => cl.id === campaign.contact_list_id);
    const typeInfo = CAMPAIGN_TYPES[campaign.type] || CAMPAIGN_TYPES.marketing;

    const stats = getCampaignStats(campaignId);
    const deliveryRate = campaign.total_sent > 0 ? Math.round((campaign.total_delivered / campaign.total_sent) * 100) : 0;
    const readRate = campaign.total_delivered > 0 ? Math.round((campaign.total_read / campaign.total_delivered) * 100) : 0;
    const failureRate = campaign.total_sent > 0 ? Math.round((campaign.total_failed / campaign.total_sent) * 100) : 0;

    const formHTML = `
        <div class="campaign-details">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="font-size: 3rem; color: ${typeInfo.color};">${typeInfo.icon}</div>
                <div>
                    <h3 style="margin: 0; font-size: 1.5rem; color: var(--gray-900);">${escapeHTML(campaign.name)}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--gray-600);">
                        ${typeInfo.label} • ${getStatusLabel(campaign.status)}
                        ${campaign.scheduled_at ? ` • Agendada: ${formatDateTime(campaign.scheduled_at)}` : ''}
                    </p>
                </div>
            </div>

            <!-- Stats Overview -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary-600);">${stats.total_contacts}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Contatos</div>
                </div>
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--success-600);">${campaign.total_sent}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Enviados</div>
                </div>
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary-600);">${campaign.total_delivered}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Entregues</div>
                </div>
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--error-600);">${campaign.total_failed}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Falhas</div>
                </div>
            </div>

            <!-- Rates -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.5rem;">Taxa de Entrega</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-600);">${deliveryRate}%</div>
                    <div style="height: 6px; background: var(--gray-100); border-radius: 10px; overflow: hidden; margin-top: 0.5rem;">
                        <div style="height: 100%; background: var(--primary-500); width: ${deliveryRate}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.5rem;">Taxa de Leitura</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success-600);">${readRate}%</div>
                    <div style="height: 6px; background: var(--gray-100); border-radius: 10px; overflow: hidden; margin-top: 0.5rem;">
                        <div style="height: 100%; background: var(--success-500); width: ${readRate}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.5rem;">Taxa de Falha</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--error-600);">${failureRate}%</div>
                    <div style="height: 6px; background: var(--gray-100); border-radius: 10px; overflow: hidden; margin-top: 0.5rem;">
                        <div style="height: 100%; background: var(--error-500); width: ${failureRate}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>

            <!-- Template Preview -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Template da Mensagem</h4>
                <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--gray-200);">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Conteúdo:</div>
                    <div style="font-size: 1rem; line-height: 1.6; white-space: pre-wrap;">${escapeHTML(template.content)}</div>
                    <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--gray-500);">
                        Variáveis disponíveis: ${template.variables.map(v => `{{${v}}}`).join(', ')}
                    </div>
                </div>
            </div>

            <!-- Configuration -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Configurações</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.5rem;">Limite Diário</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${campaign.daily_limit}</div>
                    </div>
                    <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px;">
                        <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.5rem;">Intervalo</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${campaign.interval_min}-${campaign.interval_max}s</div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; justify-content: space-between;">
                <div style="display: flex; gap: 1rem;">
                    ${campaign.status === 'draft' ? `
                        <button class="btn btn-primary" onclick="startCampaign('${campaign.id}')">▶️ Iniciar Campanha</button>
                    ` : ''}
                    ${campaign.status === 'running' ? `
                        <button class="btn btn-secondary" onclick="pauseCampaign('${campaign.id}')">⏸️ Pausar</button>
                        <button class="btn btn-error" onclick="cancelCampaign('${campaign.id}')">❌ Cancelar</button>
                    ` : ''}
                    ${campaign.status === 'paused' ? `
                        <button class="btn btn-primary" onclick="resumeCampaign('${campaign.id}')">▶️ Retomar</button>
                        <button class="btn btn-error" onclick="cancelCampaign('${campaign.id}')">❌ Cancelar</button>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="editCampaign('${campaign.id}')">✏️ Editar</button>
                    <button class="btn btn-error" onclick="deleteCampaign('${campaign.id}')">🗑️ Excluir</button>
                </div>
            </div>
        </div>
    `;

    openModal(`${escapeHTML(campaign.name)}`, formHTML, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);
}

// Campaign Actions
function startCampaign(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.status = 'running';
    campaign.started_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    saveCampaignsData();
    closeModal();
    renderCampaignsDashboard();
    showNotification('Campanha iniciada com sucesso!', 'success');
}

function pauseCampaign(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.status = 'paused';
    campaign.updated_at = new Date().toISOString();
    saveCampaignsData();
    closeModal();
    renderCampaignsDashboard();
    showNotification('Campanha pausada', 'info');
}

function resumeCampaign(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.status = 'running';
    campaign.updated_at = new Date().toISOString();
    saveCampaignsData();
    closeModal();
    renderCampaignsDashboard();
    showNotification('Campanha retomada', 'success');
}

function cancelCampaign(campaignId) {
    if (!confirm('Tem certeza que deseja cancelar esta campanha?')) return;

    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.status = 'cancelled';
    campaign.updated_at = new Date().toISOString();
    saveCampaignsData();
    closeModal();
    renderCampaignsDashboard();
    showNotification('Campanha cancelada', 'info');
}

function deleteCampaign(campaignId) {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;

    const index = CampaignsState.campaigns.findIndex(c => c.id === campaignId);
    if (index > -1) {
        CampaignsState.campaigns.splice(index, 1);
        saveCampaignsData();
        closeModal();
        renderCampaignsDashboard();
        showNotification('Campanha excluída', 'success');
    }
}

function editCampaign(campaignId) {
    // Implementation for editing campaign
    showNotification('Edição de campanha em desenvolvimento', 'info');
}

// Export functions
window.initCampaignsModule = initCampaignsModule;
window.renderCampaignsDashboard = renderCampaignsDashboard;
window.renderCampaignsList = renderCampaignsList;
window.filterCampaigns = filterCampaigns;
window.showCreateCampaignForm = showCreateCampaignForm;
window.selectTemplate = selectTemplate;
window.selectContactList = selectContactList;
window.selectCampaignType = selectCampaignType;
window.saveCampaign = saveCampaign;
window.showCampaignDetails = showCampaignDetails;
window.startCampaign = startCampaign;
window.pauseCampaign = pauseCampaign;
window.resumeCampaign = resumeCampaign;
window.cancelCampaign = cancelCampaign;
window.deleteCampaign = deleteCampaign;
window.editCampaign = editCampaign;
window.getStatusLabel = getStatusLabel;
window.getStatusBadgeClass = getStatusBadgeClass;
window.getCampaignStats = getCampaignStats;
window.calculateCampaignStats = calculateCampaignStats;
