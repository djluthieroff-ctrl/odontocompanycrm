// Gestão de Campanhas - CRM Odonto Company
// =============================================

const CampaignState = {
    campaigns: [],
    leads: [],
    metrics: {},
    currentCampaign: null
};

// Inicializar Módulo de Campanhas
function initCampaignsManagerModule() {
    CampaignState.campaigns = AppState.campaigns || [];
    CampaignState.leads = AppState.leads || [];
    renderCampaignsDashboard();
    setupCampaignEvents();
}

// Renderizar Dashboard de Campanhas
function renderCampaignsDashboard() {
    const container = document.getElementById('campaignsContent');
    if (!container) return;

    const stats = calculateCampaignStats();

    container.innerHTML = `
        <style>
            .campaigns-header {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--gray-200);
                margin-bottom: 2rem;
            }

            .campaigns-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .campaign-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .campaign-stat-card {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
            }

            .campaign-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .campaign-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .campaigns-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }

            .campaign-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .campaign-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
                border-color: var(--primary-300);
            }

            .campaign-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .campaign-title {
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--gray-900);
                margin: 0;
            }

            .campaign-status {
                padding: 4px 8px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #dcfce7; color: #166534; }
            .status-paused { background: #fef3c7; color: #92400e; }
            .status-completed { background: #e5e7eb; color: #374151; }

            .campaign-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .metric-item {
                background: var(--gray-50);
                padding: 1rem;
                border-radius: 12px;
                text-align: center;
            }

            .metric-value {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
            }

            .metric-label {
                font-size: 0.75rem;
                color: var(--gray-600);
                margin-top: 0.25rem;
            }

            .campaign-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .btn-campaign {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-campaign:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-campaign {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-primary-campaign:hover {
                background: #2563eb;
            }

            .progress-bar-campaign {
                width: 100%;
                height: 8px;
                background: var(--gray-200);
                border-radius: 4px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-campaign {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                transition: width 0.3s ease;
            }

            .campaign-details {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray-200);
                font-size: 0.9rem;
                color: var(--gray-600);
            }
        </style>

        <!-- Header com Controles -->
        <div class="campaigns-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: var(--gray-900);">📢 Gestão de Campanhas</h2>
                    <p style="margin: 0; color: var(--gray-600);">Crie e acompanhe o desempenho das suas campanhas de marketing</p>
                </div>
                <button class="btn btn-primary" onclick="showNewCampaignForm()">➕ Nova Campanha</button>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="campaign-stats-grid">
            <div class="campaign-stat-card">
                <div class="campaign-stat-value">${stats.totalCampaigns}</div>
                <div class="campaign-stat-label">Campanhas Ativas</div>
            </div>

            <div class="campaign-stat-card">
                <div class="campaign-stat-value" style="color: #10b981;">${stats.totalLeads}</div>
                <div class="campaign-stat-label">Leads Gerados</div>
            </div>

            <div class="campaign-stat-card">
                <div class="campaign-stat-value" style="color: #3b82f6;">${stats.totalConversions}</div>
                <div class="campaign-stat-label">Conversões</div>
            </div>

            <div class="campaign-stat-card">
                <div class="campaign-stat-value" style="color: #f59e0b;">${stats.avgConversionRate}%</div>
                <div class="campaign-stat-label">Taxa Média de Conversão</div>
            </div>
        </div>

        <!-- Lista de Campanhas -->
        <div class="campaigns-list">
            ${CampaignState.campaigns.length > 0 ? CampaignState.campaigns.map(renderCampaignCard).join('') : `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--gray-500);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📢</div>
                    <h3>Nenhuma campanha criada</h3>
                    <p>Crie sua primeira campanha para começar a gerar leads e acompanhar resultados.</p>
                    <button class="btn btn-primary" onclick="showNewCampaignForm()" style="margin-top: 1rem;">Criar Primeira Campanha</button>
                </div>
            `}
        </div>
    `;
}

// Renderizar Card de Campanha
function renderCampaignCard(campaign) {
    const leadsFromCampaign = CampaignState.leads.filter(l => l.campaignId === campaign.id);
    const conversions = leadsFromCampaign.filter(l => l.saleStatus === 'sold').length;
    const conversionRate = leadsFromCampaign.length > 0 ? Math.round((conversions / leadsFromCampaign.length) * 100) : 0;
    const statusClass = campaign.status === 'active' ? 'status-active' :
        campaign.status === 'paused' ? 'status-paused' : 'status-completed';

    return `
        <div class="campaign-card" data-campaign-id="${campaign.id}">
            <div class="campaign-header">
                <div>
                    <h3 class="campaign-title">${escapeHTML(campaign.name)}</h3>
                    <span class="campaign-status ${statusClass}">${campaign.status}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Início</div>
                    <div style="font-weight: 600; color: var(--gray-700);">${new Date(campaign.startDate).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div class="campaign-metrics">
                <div class="metric-item">
                    <div class="metric-value">${leadsFromCampaign.length}</div>
                    <div class="metric-label">Leads</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #10b981;">${conversions}</div>
                    <div class="metric-label">Conversões</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #3b82f6;">${conversionRate}%</div>
                    <div class="metric-label">Taxa de Conversão</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #f59e0b;">R$ ${campaign.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="metric-label">Investimento</div>
                </div>
            </div>

            <div class="progress-bar-campaign">
                <div class="progress-fill-campaign" style="width: ${Math.min(100, (leadsFromCampaign.length / campaign.targetLeads) * 100)}%"></div>
            </div>
            <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                Meta: ${campaign.targetLeads} leads • Atual: ${leadsFromCampaign.length}
            </div>

            <div class="campaign-actions">
                <button class="btn-campaign btn-primary-campaign" onclick="viewCampaignDetails('${campaign.id}')">📊 Detalhes</button>
                <button class="btn-campaign" onclick="editCampaign('${campaign.id}')">✏️ Editar</button>
                <button class="btn-campaign" onclick="toggleCampaignStatus('${campaign.id}')">${campaign.status === 'active' ? '⏸️ Pausar' : '▶️ Ativar'}</button>
                <button class="btn-campaign" style="background: #fee2e2; color: #991b1b; border-color: #fee2e2;" onclick="deleteCampaign('${campaign.id}')">🗑️ Excluir</button>
            </div>

            <div class="campaign-details">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Canal:</span>
                    <span style="font-weight: 600;">${campaign.channel}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Objetivo:</span>
                    <span style="font-weight: 600;">${campaign.goal}</span>
                </div>
            </div>
        </div>
    `;
}

// Mostrar Formulário de Nova Campanha
function showNewCampaignForm() {
    const modalContent = `
        <form id="newCampaignForm" onsubmit="saveCampaign(event)">
            <div class="form-group">
                <label class="form-label">Nome da Campanha *</label>
                <input type="text" class="form-input" name="name" placeholder="Ex: Campanha de Ano Novo" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Canal de Marketing</label>
                    <select class="form-select" name="channel">
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="google-ads">Google Ads</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email Marketing</option>
                        <option value="organic">Tráfego Orgânico</option>
                        <option value="referral">Indicação</option>
                        <option value="other">Outro</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Objetivo</label>
                    <select class="form-select" name="goal">
                        <option value="brand-awareness">Awareness da Marca</option>
                        <option value="lead-generation">Geração de Leads</option>
                        <option value="sales">Vendas Diretas</option>
                        <option value="retention">Fidelização</option>
                        <option value="event">Evento/Promoção</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Data de Início</label>
                    <input type="date" class="form-input" name="startDate">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data de Término</label>
                    <input type="date" class="form-input" name="endDate">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Meta de Leads</label>
                    <input type="number" class="form-input" name="targetLeads" placeholder="Ex: 100" min="1">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Investimento (R$)</label>
                    <input type="number" class="form-input" name="budget" placeholder="Ex: 1000" min="0" step="0.01">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-textarea" name="description" rows="3" placeholder="Descreva os detalhes da campanha..."></textarea>
            </div>
        </form>
    `;

    openModal('Nova Campanha', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Campanha', class: 'btn-primary', onclick: "document.getElementById('newCampaignForm').requestSubmit()" }
    ]);
}

// Salvar Campanha
function saveCampaign(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const campaign = {
        id: generateId(),
        name: formData.get('name'),
        channel: formData.get('channel'),
        goal: formData.get('goal'),
        startDate: formData.get('startDate') || new Date().toISOString().split('T')[0],
        endDate: formData.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetLeads: parseInt(formData.get('targetLeads')) || 50,
        budget: parseFloat(formData.get('budget')) || 0,
        description: formData.get('description') || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        leadsGenerated: 0,
        conversions: 0,
        roi: 0
    };

    CampaignState.campaigns.push(campaign);
    AppState.campaigns = CampaignState.campaigns;
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, AppState.campaigns);

    closeModal();
    renderCampaignsDashboard();
    showNotification(`Campanha "${campaign.name}" criada com sucesso!`, 'success');
}

// Visualizar Detalhes da Campanha
function viewCampaignDetails(campaignId) {
    const campaign = CampaignState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const leadsFromCampaign = CampaignState.leads.filter(l => l.campaignId === campaign.id);
    const conversions = leadsFromCampaign.filter(l => l.saleStatus === 'sold');
    const conversionRate = leadsFromCampaign.length > 0 ? Math.round((conversions.length / leadsFromCampaign.length) * 100) : 0;

    const modalContent = `
        <div style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${escapeHTML(campaign.name)}</h3>
                    <p style="margin: 0.5rem 0 0 0; color: var(--gray-600);">${campaign.channel} • ${campaign.goal}</p>
                </div>
                <span class="campaign-status ${campaign.status === 'active' ? 'status-active' : campaign.status === 'paused' ? 'status-paused' : 'status-completed'}">${campaign.status}</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${leadsFromCampaign.length}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Leads Gerados</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${conversions.length}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Conversões</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${conversionRate}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Taxa de Conversão</div>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h4 style="margin: 0 0 1rem 0; color: var(--gray-800);">Leads da Campanha</h4>
                ${leadsFromCampaign.length > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--gray-200); border-radius: 8px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead style="background: var(--gray-50);">
                                <tr>
                                    <th style="padding: 0.75rem; text-align: left; font-size: 0.8rem;">Nome</th>
                                    <th style="padding: 0.75rem; text-align: left; font-size: 0.8rem;">Status</th>
                                    <th style="padding: 0.75rem; text-align: left; font-size: 0.8rem;">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${leadsFromCampaign.map(lead => `
                                    <tr style="border-bottom: 1px solid var(--gray-100);">
                                        <td style="padding: 0.75rem; font-size: 0.9rem;">${escapeHTML(lead.name)}</td>
                                        <td style="padding: 0.75rem; font-size: 0.9rem;">
                                            <span style="padding: 2px 8px; border-radius: 999px; font-size: 0.7rem; background: ${lead.saleStatus === 'sold' ? '#dcfce7' : '#fef3c7'}; color: ${lead.saleStatus === 'sold' ? '#166534' : '#92400e'};">
                                                ${lead.saleStatus === 'sold' ? 'VENDIDO' : 'EM CONTATO'}
                                            </span>
                                        </td>
                                        <td style="padding: 0.75rem; font-size: 0.9rem;">${new Date(lead.createdAt).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
                        Nenhum lead gerado por esta campanha ainda.
                    </div>
                `}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px;">
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-bottom: 0.5rem;">Investimento</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">R$ ${campaign.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px;">
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-bottom: 0.5rem;">Custo por Lead</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                        ${leadsFromCampaign.length > 0 ? `R$ ${(campaign.budget / leadsFromCampaign.length).toFixed(2)}` : 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    `;

    openModal('Detalhes da Campanha', modalContent, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);
}

// Editar Campanha
function editCampaign(campaignId) {
    const campaign = CampaignState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const modalContent = `
        <form id="editCampaignForm" onsubmit="updateCampaign(event, '${campaignId}')">
            <div class="form-group">
                <label class="form-label">Nome da Campanha *</label>
                <input type="text" class="form-input" name="name" value="${escapeHTML(campaign.name)}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Canal de Marketing</label>
                    <select class="form-select" name="channel">
                        <option value="instagram" ${campaign.channel === 'instagram' ? 'selected' : ''}>Instagram</option>
                        <option value="facebook" ${campaign.channel === 'facebook' ? 'selected' : ''}>Facebook</option>
                        <option value="google-ads" ${campaign.channel === 'google-ads' ? 'selected' : ''}>Google Ads</option>
                        <option value="whatsapp" ${campaign.channel === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                        <option value="email" ${campaign.channel === 'email' ? 'selected' : ''}>Email Marketing</option>
                        <option value="organic" ${campaign.channel === 'organic' ? 'selected' : ''}>Tráfego Orgânico</option>
                        <option value="referral" ${campaign.channel === 'referral' ? 'selected' : ''}>Indicação</option>
                        <option value="other" ${campaign.channel === 'other' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Objetivo</label>
                    <select class="form-select" name="goal">
                        <option value="brand-awareness" ${campaign.goal === 'brand-awareness' ? 'selected' : ''}>Awareness da Marca</option>
                        <option value="lead-generation" ${campaign.goal === 'lead-generation' ? 'selected' : ''}>Geração de Leads</option>
                        <option value="sales" ${campaign.goal === 'sales' ? 'selected' : ''}>Vendas Diretas</option>
                        <option value="retention" ${campaign.goal === 'retention' ? 'selected' : ''}>Fidelização</option>
                        <option value="event" ${campaign.goal === 'event' ? 'selected' : ''}>Evento/Promoção</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Data de Início</label>
                    <input type="date" class="form-input" name="startDate" value="${campaign.startDate}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data de Término</label>
                    <input type="date" class="form-input" name="endDate" value="${campaign.endDate}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Meta de Leads</label>
                    <input type="number" class="form-input" name="targetLeads" value="${campaign.targetLeads}" min="1">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Investimento (R$)</label>
                    <input type="number" class="form-input" name="budget" value="${campaign.budget}" min="0" step="0.01">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-textarea" name="description" rows="3">${escapeHTML(campaign.description || '')}</textarea>
            </div>
        </form>
    `;

    openModal('Editar Campanha', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Alterações', class: 'btn-primary', onclick: "document.getElementById('editCampaignForm').requestSubmit()" }
    ]);
}

// Atualizar Campanha
function updateCampaign(event, campaignId) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const campaign = CampaignState.campaigns.find(c => c.id === campaignId);

    if (campaign) {
        campaign.name = formData.get('name');
        campaign.channel = formData.get('channel');
        campaign.goal = formData.get('goal');
        campaign.startDate = formData.get('startDate') || campaign.startDate;
        campaign.endDate = formData.get('endDate') || campaign.endDate;
        campaign.targetLeads = parseInt(formData.get('targetLeads')) || campaign.targetLeads;
        campaign.budget = parseFloat(formData.get('budget')) || campaign.budget;
        campaign.description = formData.get('description') || campaign.description;
        campaign.updatedAt = new Date().toISOString();

        AppState.campaigns = CampaignState.campaigns;
        saveToStorage(STORAGE_KEYS.CAMPAIGNS, AppState.campaigns);

        closeModal();
        renderCampaignsDashboard();
        showNotification('Campanha atualizada com sucesso!', 'success');
    }
}

// Alternar Status da Campanha
function toggleCampaignStatus(campaignId) {
    const campaign = CampaignState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.status = campaign.status === 'active' ? 'paused' : 'active';
    campaign.updatedAt = new Date().toISOString();

    AppState.campaigns = CampaignState.campaigns;
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, AppState.campaigns);

    renderCampaignsDashboard();
    showNotification(`Campanha ${campaign.status === 'active' ? 'ativada' : 'pausada'} com sucesso!`, 'success');
}

// Excluir Campanha
function deleteCampaign(campaignId) {
    if (!confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) return;

    const campaign = CampaignState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // Remover a campanha
    CampaignState.campaigns = CampaignState.campaigns.filter(c => c.id !== campaignId);

    // Remover referência da campanha nos leads
    CampaignState.leads.forEach(lead => {
        if (lead.campaignId === campaignId) {
            lead.campaignId = null;
            lead.campaignName = null;
        }
    });

    AppState.campaigns = CampaignState.campaigns;
    AppState.leads = CampaignState.leads;
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, AppState.campaigns);
    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);

    renderCampaignsDashboard();
    showNotification('Campanha excluída com sucesso!', 'success');
}

// Calcular Estatísticas das Campanhas
function calculateCampaignStats() {
    const totalCampaigns = CampaignState.campaigns.filter(c => c.status === 'active').length;
    const totalLeads = CampaignState.leads.filter(l => l.campaignId).length;
    const totalConversions = CampaignState.leads.filter(l => l.saleStatus === 'sold').length;

    const activeCampaigns = CampaignState.campaigns.filter(c => c.status === 'active');
    const avgConversionRate = activeCampaigns.length > 0 ?
        Math.round(activeCampaigns.reduce((sum, c) => {
            const leads = CampaignState.leads.filter(l => l.campaignId === c.id);
            const conversions = leads.filter(l => l.saleStatus === 'sold');
            return sum + (leads.length > 0 ? (conversions.length / leads.length) * 100 : 0);
        }, 0) / activeCampaigns.length) : 0;

    return {
        totalCampaigns,
        totalLeads,
        totalConversions,
        avgConversionRate
    };
}

// Configurar Eventos
function setupCampaignEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('campaignsUpdated', () => {
        CampaignState.campaigns = AppState.campaigns;
        CampaignState.leads = AppState.leads;
        renderCampaignsDashboard();
    });
}

// Exportar funções globais
window.initCampaignsManagerModule = initCampaignsManagerModule;
window.renderCampaignsDashboard = renderCampaignsDashboard;
window.setupCampaignEvents = setupCampaignEvents;
window.showNewCampaignForm = showNewCampaignForm;
window.saveCampaign = saveCampaign;
window.viewCampaignDetails = viewCampaignDetails;
window.editCampaign = editCampaign;
window.updateCampaign = updateCampaign;
window.toggleCampaignStatus = toggleCampaignStatus;
window.deleteCampaign = deleteCampaign;
window.calculateCampaignStats = calculateCampaignStats;