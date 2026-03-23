// Marketing e Campanhas - CRM Odonto Company
// ============================================

const MarketingState = {
    campaigns: [],
    marketingAssets: [],
    leadSources: [],
    conversionFunnels: [],
    marketingReports: [],
    socialMedia: []
};

// Inicializar Módulo de Marketing e Campanhas
function initMarketingCampaignsModule() {
    MarketingState.campaigns = AppState.marketingCampaigns || [];
    MarketingState.marketingAssets = AppState.marketingAssets || [];
    MarketingState.leadSources = AppState.leadSources || [];
    MarketingState.conversionFunnels = AppState.conversionFunnels || [];
    MarketingState.marketingReports = AppState.marketingReports || [];
    MarketingState.socialMedia = AppState.socialMedia || [];
    renderMarketingDashboard();
    setupMarketingEvents();
    loadMarketingData();
}

// Renderizar Dashboard de Marketing e Campanhas
function renderMarketingDashboard() {
    const container = document.getElementById('marketingContent');
    if (!container) return;

    const stats = calculateMarketingStats();

    container.innerHTML = `
        <style>
            .marketing-header {
                background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .marketing-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .marketing-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .marketing-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .marketing-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .marketing-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .campaign-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .campaign-card.active {
                border-color: #ec4899;
                background: linear-gradient(135deg, #fdf2f8, #fce7f3);
            }

            .campaign-card.completed {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .campaign-card.paused {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .campaign-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .campaign-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .campaign-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #ec4899, #a855f7);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .campaign-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .campaign-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .campaign-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #fdf2f8; color: #9d174d; }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-paused { background: #fef3c7; color: #92400e; }
            .status-draft { background: #eef2ff; color: #3730a3; }

            .campaign-metrics {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
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

            .asset-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }

            .funnel-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }

            .social-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }

            .marketing-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .btn-marketing {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-marketing:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-marketing {
                background: #ec4899;
                color: white;
                border-color: #ec4899;
            }

            .btn-primary-marketing:hover {
                background: #db2777;
            }

            .btn-success-marketing {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-marketing:hover {
                background: #059669;
            }

            .btn-warning-marketing {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-marketing:hover {
                background: #d97706;
            }

            .btn-danger-marketing {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-marketing:hover {
                background: #dc2626;
            }

            .progress-bar-marketing {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-marketing {
                height: 100%;
                background: linear-gradient(90deg, #ec4899, #a855f7);
                transition: width 0.3s ease;
            }

            .analytics-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .funnel-steps {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .funnel-step {
                background: var(--gray-50);
                padding: 1rem;
                border-radius: 12px;
                text-align: center;
                position: relative;
            }

            .funnel-step::after {
                content: '→';
                position: absolute;
                right: -1rem;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.5rem;
                color: var(--gray-400);
            }

            .funnel-step:last-child::after {
                display: none;
            }

            .funnel-value {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
            }

            .funnel-label {
                font-size: 0.75rem;
                color: var(--gray-600);
                margin-top: 0.25rem;
            }

            .social-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .social-item {
                background: var(--gray-50);
                padding: 1rem;
                border-radius: 12px;
                text-align: center;
            }

            .social-value {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
            }

            .social-label {
                font-size: 0.75rem;
                color: var(--gray-600);
                margin-top: 0.25rem;
            }

            .asset-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .asset-item {
                background: var(--gray-50);
                padding: 0.75rem;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-left: 4px solid #ec4899;
            }

            .asset-item.image { border-left-color: #3b82f6; background: #eff6ff; }
            .asset-item.video { border-left-color: #10b981; background: #ecfdf5; }
            .asset-item.text { border-left-color: #f59e0b; background: #fffbeb; }
        </style>

        <!-- Header de Marketing -->
        <div class="marketing-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">📢 Marketing & Campanhas</h2>
                    <p style="margin: 0; opacity: 0.9;">Estratégias e campanhas promocionais</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-marketing" onclick="showNewCampaignForm()">🎯 Nova Campanha</button>
                    <button class="btn-success-marketing" onclick="showNewAssetForm()">📁 Novo Asset</button>
                    <button class="btn-warning-marketing" onclick="showNewFunnelForm()">🔄 Novo Funil</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="marketing-stats-grid">
            <div class="marketing-stat-card">
                <div class="marketing-stat-value">${stats.totalCampaigns}</div>
                <div class="marketing-stat-label">Campanhas</div>
            </div>

            <div class="marketing-stat-card">
                <div class="marketing-stat-value" style="color: #ec4899;">${stats.activeCampaigns}</div>
                <div class="marketing-stat-label">Ativas</div>
            </div>

            <div class="marketing-stat-card">
                <div class="marketing-stat-value" style="color: #10b981;">${stats.totalLeads}</div>
                <div class="marketing-stat-label">Leads Gerados</div>
            </div>

            <div class="marketing-stat-card">
                <div class="marketing-stat-value" style="color: #f59e0b;">${stats.avgROI}%</div>
                <div class="marketing-stat-label">ROI Médio</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="marketing-controls">
            <button class="btn-primary-marketing active" onclick="switchMarketingTab('campaigns')" id="tab-campaigns">
                🎯 Campanhas
            </button>
            <button class="btn-primary-marketing" onclick="switchMarketingTab('assets')" id="tab-assets">
                📁 Assets
            </button>
            <button class="btn-primary-marketing" onclick="switchMarketingTab('funnels')" id="tab-funnels">
                🔄 Funis
            </button>
            <button class="btn-primary-marketing" onclick="switchMarketingTab('social')" id="tab-social">
                📱 Social
            </button>
            <button class="btn-primary-marketing" onclick="switchMarketingTab('reports')" id="tab-reports">
                📊 Relatórios
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="marketing-campaigns" class="marketing-content active">
            ${renderCampaignsTab()}
        </div>

        <div id="marketing-assets" class="marketing-content">
            ${renderAssetsTab()}
        </div>

        <div id="marketing-funnels" class="marketing-content">
            ${renderFunnelsTab()}
        </div>

        <div id="marketing-social" class="marketing-content">
            ${renderSocialTab()}
        </div>

        <div id="marketing-reports" class="marketing-content">
            ${renderReportsTab()}
        </div>
    `;
}

// Renderizar Aba de Campanhas
function renderCampaignsTab() {
    return `
        <div class="campaign-card">
            <div class="campaign-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 Lista de Campanhas</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="campaignFilter" onchange="filterCampaigns(this.value)">
                        <option value="all">Todas</option>
                        <option value="active">Ativas</option>
                        <option value="completed">Concluídas</option>
                        <option value="paused">Pausadas</option>
                    </select>
                    <button class="btn-primary-marketing" onclick="exportCampaigns()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="campaignsList" style="display: grid; gap: 1rem;">
                ${MarketingState.campaigns.map(renderCampaignCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Assets
function renderAssetsTab() {
    return `
        <div class="asset-card">
            <div class="campaign-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📁 Assets de Marketing</h3>
                <button class="btn-success-marketing" onclick="showNewAssetForm()">➕ Novo Asset</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${MarketingState.marketingAssets.map(renderAssetCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Funis
function renderFunnelsTab() {
    return `
        <div class="funnel-card">
            <div class="campaign-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔄 Funis de Conversão</h3>
                <button class="btn-warning-marketing" onclick="showNewFunnelForm()">➕ Novo Funil</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;">
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.conversionFunnels.reduce((sum, f) => sum + (f.visitors || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">Visitantes</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.conversionFunnels.reduce((sum, f) => sum + (f.leads || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">Leads</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.conversionFunnels.reduce((sum, f) => sum + (f.quotes || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">Orçamentos</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.conversionFunnels.reduce((sum, f) => sum + (f.conversions || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">Conversões</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.conversionFunnels.reduce((sum, f) => sum + (f.revenue || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">Receita</div>
                </div>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${MarketingState.conversionFunnels.map(renderFunnelCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Social
function renderSocialTab() {
    return `
        <div class="social-card">
            <div class="campaign-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📱 Mídias Sociais</h3>
                <button class="btn-primary-marketing" onclick="showNewSocialForm()">➕ Nova Postagem</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.socialMedia.reduce((sum, s) => sum + (s.facebook || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">Facebook</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.socialMedia.reduce((sum, s) => sum + (s.instagram || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">Instagram</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${MarketingState.socialMedia.reduce((sum, s) => sum + (s.linkedin || 0), 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.25rem;">LinkedIn</div>
                </div>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${MarketingState.socialMedia.map(renderSocialCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Relatórios
function renderReportsTab() {
    return `
        <div class="analytics-card">
            <div class="campaign-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Relatórios de Marketing</h3>
                <button class="btn-success-marketing" onclick="generateMarketingReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📈 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Custo por Lead</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Média</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                R$ ${MarketingState.campaigns.reduce((sum, c) => sum + (c.cost || 0), 0) / (MarketingState.totalLeads || 1)}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Taxa de Conversão</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${MarketingState.conversionFunnels.reduce((sum, f) => sum + (f.conversionRate || 0), 0) / (MarketingState.conversionFunnels.length || 1)}%
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">💰 Investimento</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Investimento Total</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Campanhas</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                R$ ${MarketingState.campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Retorno Total</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Estimado</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                R$ ${MarketingState.conversionFunnels.reduce((sum, f) => sum + (f.revenue || 0), 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Campanha
function renderCampaignCard(campaign) {
    const cssClass = campaign.status === 'active' ? 'active' : campaign.status === 'completed' ? 'completed' : 'paused';
    const statusClass = `status-${campaign.status}`;
    const progress = campaign.progress || 0;
    const leads = campaign.leads || 0;
    const roi = campaign.roi || 0;
    const budget = campaign.budget || 0;

    return `
        <div class="campaign-card ${cssClass}">
            <div class="campaign-header">
                <div class="campaign-info">
                    <div class="campaign-icon">🎯</div>
                    <div class="campaign-details">
                        <h4>${escapeHTML(campaign.name)}</h4>
                        <p>${escapeHTML(campaign.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${campaign.type} • ${campaign.channel} • ${new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="campaign-status ${statusClass}">${campaign.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${progress}%</div>
                </div>
            </div>

            <div class="campaign-metrics">
                <div class="metric-item">
                    <div class="metric-value">${leads}</div>
                    <div class="metric-label">Leads</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #10b981;">${roi}%</div>
                    <div class="metric-label">ROI</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #ec4899;">R$ ${budget}</div>
                    <div class="metric-label">Investimento</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #f59e0b;">${campaign.targetAudience || 'N/A'}</div>
                    <div class="metric-label">Público</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Resultados:</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    <div style="background: var(--gray-50); padding: 0.75rem; border-radius: 8px; text-align: center;">
                        <div style="font-weight: 600; color: var(--gray-900);">${campaign.impressions || 0}</div>
                        <div style="font-size: 0.8rem; color: var(--gray-600);">Impressões</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 0.75rem; border-radius: 8px; text-align: center;">
                        <div style="font-weight: 600; color: var(--gray-900);">${campaign.clicks || 0}</div>
                        <div style="font-size: 0.8rem; color: var(--gray-600);">Cliques</div>
                    </div>
                    <div style="background: var(--gray-50); padding: 0.75rem; border-radius: 8px; text-align: center;">
                        <div style="font-weight: 600; color: var(--gray-900);">${campaign.conversions || 0}</div>
                        <div style="font-size: 0.8rem; color: var(--gray-600);">Conversões</div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-marketing">
                <div class="progress-fill-marketing" style="width: ${progress}%; background: ${getCampaignColor(progress)};"></div>
            </div>

            <div class="marketing-actions">
                <button class="btn-marketing btn-primary-marketing" onclick="viewCampaignDetails('${campaign.id}')">👁️ Detalhes</button>
                <button class="btn-marketing btn-success-marketing" onclick="updateCampaignProgress('${campaign.id}')">📊 Atualizar</button>
                <button class="btn-marketing btn-warning-marketing" onclick="pauseCampaign('${campaign.id}')">⏸️ Pausar</button>
                <button class="btn-marketing btn-danger-marketing" onclick="deleteCampaign('${campaign.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Asset
function renderAssetCard(asset) {
    const cssClass = asset.type === 'image' ? 'image' : asset.type === 'video' ? 'video' : 'text';

    return `
        <div class="asset-card">
            <div class="campaign-header">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${escapeHTML(asset.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${asset.type} • ${asset.category} • ${asset.campaign}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${asset.usageCount || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Usos</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(asset.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Formato:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${asset.format}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tamanho:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${asset.size}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-marketing btn-primary-marketing" onclick="viewAssetContent('${asset.id}')">👁️ Visualizar</button>
                <button class="btn-marketing btn-success-marketing" onclick="editAsset('${asset.id}')">✏️ Editar</button>
                <button class="btn-marketing btn-warning-marketing" onclick="shareAsset('${asset.id}')">📤 Compartilhar</button>
                <button class="btn-marketing btn-danger-marketing" onclick="deleteAsset('${asset.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Funil
function renderFunnelCard(funnel) {
    const conversionRate = funnel.conversionRate || 0;

    return `
        <div class="funnel-card">
            <div class="campaign-header">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${escapeHTML(funnel.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${funnel.type} • ${funnel.source}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${conversionRate}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Conversão</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;">
                <div class="funnel-step">
                    <div class="funnel-value">${funnel.visitors || 0}</div>
                    <div class="funnel-label">Visitantes</div>
                </div>
                <div class="funnel-step">
                    <div class="funnel-value">${funnel.leads || 0}</div>
                    <div class="funnel-label">Leads</div>
                </div>
                <div class="funnel-step">
                    <div class="funnel-value">${funnel.quotes || 0}</div>
                    <div class="funnel-label">Orçamentos</div>
                </div>
                <div class="funnel-step">
                    <div class="funnel-value">${funnel.conversions || 0}</div>
                    <div class="funnel-label">Conversões</div>
                </div>
                <div class="funnel-step">
                    <div class="funnel-value">R$ ${funnel.revenue || 0}</div>
                    <div class="funnel-label">Receita</div>
                </div>
            </div>

            <div style="margin-top: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; color: var(--gray-700);">Taxa de Conversão</span>
                    <span style="font-size: 0.8rem; color: var(--gray-500);">${conversionRate}%</span>
                </div>
                <div class="progress-bar-marketing">
                    <div class="progress-fill-marketing" style="width: ${conversionRate}%; background: ${getFunnelColor(conversionRate)};"></div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-marketing btn-primary-marketing" onclick="editFunnel('${funnel.id}')">✏️ Editar</button>
                <button class="btn-marketing btn-success-marketing" onclick="updateFunnelMetrics('${funnel.id}')">📊 Atualizar</button>
                <button class="btn-marketing btn-warning-marketing" onclick="optimizeFunnel('${funnel.id}')">🚀 Otimizar</button>
                <button class="btn-marketing btn-danger-marketing" onclick="deleteFunnel('${funnel.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Social
function renderSocialCard(social) {
    return `
        <div class="social-card">
            <div class="campaign-header">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${escapeHTML(social.platform)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${social.type} • ${new Date(social.date).toLocaleDateString('pt-BR')}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${social.engagement || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Engajamento</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Conteúdo:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(social.content)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div style="background: var(--gray-50); padding: 0.75rem; border-radius: 8px; text-align: center;">
                    <div style="font-weight: 600; color: var(--gray-900);">${social.likes || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Likes</div>
                </div>
                <div style="background: var(--gray-50); padding: 0.75rem; border-radius: 8px; text-align: center;">
                    <div style="font-weight: 600; color: var(--gray-900);">${social.shares || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Compartilhamentos</div>
                </div>
                <div style="background: var(--gray-50); padding: 0.75rem; border-radius: 8px; text-align: center;">
                    <div style="font-weight: 600; color: var(--gray-900);">${social.comments || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Comentários</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-marketing btn-primary-marketing" onclick="editSocial('${social.id}')">✏️ Editar</button>
                <button class="btn-marketing btn-success-marketing" onclick="scheduleSocial('${social.id}')">📅 Agendar</button>
                <button class="btn-marketing btn-warning-marketing" onclick="boostSocial('${social.id}')">🚀 Boost</button>
                <button class="btn-marketing btn-danger-marketing" onclick="deleteSocial('${social.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchMarketingTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-marketing').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.marketing-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`marketing-${tabName}`).classList.add('active');
}

// Funções de Campanhas
function showNewCampaignForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎯 Nova Campanha</h4>
            <form id="newCampaignForm" onsubmit="saveCampaign(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Campanha *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da campanha..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Digital">Digital</option>
                            <option value="Offline">Offline</option>
                            <option value="Social">Social</option>
                            <option value="Email">Email</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Canal</label>
                        <input type="text" class="form-input" name="channel" placeholder="Canal da campanha">
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
                        <label class="form-label">Orçamento</label>
                        <input type="number" class="form-input" name="budget" min="0" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Público Alvo</label>
                        <input type="text" class="form-input" name="targetAudience" placeholder="Público-alvo">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status">
                        <option value="active">Ativa</option>
                        <option value="completed">Concluída</option>
                        <option value="paused">Pausada</option>
                    </select>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Campanha', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Campanha', class: 'btn-primary', onclick: "document.getElementById('newCampaignForm').requestSubmit()" }
    ]);
}

function saveCampaign(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const campaign = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Digital',
        channel: formData.get('channel') || '',
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        budget: parseFloat(formData.get('budget')) || 0,
        targetAudience: formData.get('targetAudience') || '',
        status: formData.get('status') || 'active',
        progress: 0,
        leads: 0,
        roi: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    MarketingState.campaigns.push(campaign);
    AppState.marketingCampaigns = MarketingState.campaigns;
    saveToStorage(STORAGE_KEYS.MARKETING_CAMPAIGNS, AppState.marketingCampaigns);

    closeModal();
    renderMarketingDashboard();
    showNotification(`Campanha "${campaign.name}" criada com sucesso!`, 'success');
}

// Funções de Assets
function showNewAssetForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📁 Novo Asset</h4>
            <form id="newAssetForm" onsubmit="saveAsset(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Asset *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do asset..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="image">Imagem</option>
                            <option value="video">Vídeo</option>
                            <option value="text">Texto</option>
                            <option value="graphic">Gráfico</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria do asset">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Formato</label>
                        <input type="text" class="form-input" name="format" placeholder="Formato do arquivo">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tamanho</label>
                        <input type="text" class="form-input" name="size" placeholder="Tamanho do arquivo">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Campanha</label>
                    <input type="text" class="form-input" name="campaign" placeholder="Campanha associada">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Asset', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Asset', class: 'btn-primary', onclick: "document.getElementById('newAssetForm').requestSubmit()" }
    ]);
}

function saveAsset(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const asset = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'image',
        category: formData.get('category') || '',
        format: formData.get('format') || '',
        size: formData.get('size') || '',
        campaign: formData.get('campaign') || '',
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    MarketingState.marketingAssets.push(asset);
    AppState.marketingAssets = MarketingState.marketingAssets;
    saveToStorage(STORAGE_KEYS.MARKETING_ASSETS, AppState.marketingAssets);

    closeModal();
    renderMarketingDashboard();
    showNotification(`Asset "${asset.name}" criado com sucesso!`, 'success');
}

// Funções de Funis
function showNewFunnelForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🔄 Novo Funil de Conversão</h4>
            <form id="newFunnelForm" onsubmit="saveFunnel(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Funil *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do funil..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Landing Page">Landing Page</option>
                            <option value="Email">Email</option>
                            <option value="Social">Social</option>
                            <option value="Anúncio">Anúncio</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Fonte</label>
                        <input type="text" class="form-input" name="source" placeholder="Fonte do tráfego">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Visitantes</label>
                        <input type="number" class="form-input" name="visitors" min="0">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Leads</label>
                        <input type="number" class="form-input" name="leads" min="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Orçamentos</label>
                        <input type="number" class="form-input" name="quotes" min="0">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Conversões</label>
                        <input type="number" class="form-input" name="conversions" min="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Receita</label>
                        <input type="number" class="form-input" name="revenue" min="0" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Taxa de Conversão</label>
                        <input type="number" class="form-input" name="conversionRate" min="0" max="100" step="0.1">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Funil de Conversão', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Funil', class: 'btn-primary', onclick: "document.getElementById('newFunnelForm').requestSubmit()" }
    ]);
}

function saveFunnel(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const funnel = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Landing Page',
        source: formData.get('source') || '',
        visitors: parseInt(formData.get('visitors')) || 0,
        leads: parseInt(formData.get('leads')) || 0,
        quotes: parseInt(formData.get('quotes')) || 0,
        conversions: parseInt(formData.get('conversions')) || 0,
        revenue: parseFloat(formData.get('revenue')) || 0,
        conversionRate: parseFloat(formData.get('conversionRate')) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    MarketingState.conversionFunnels.push(funnel);
    AppState.conversionFunnels = MarketingState.conversionFunnels;
    saveToStorage(STORAGE_KEYS.CONVERSION_TUNNELS, AppState.conversionFunnels);

    closeModal();
    renderMarketingDashboard();
    showNotification(`Funil "${funnel.name}" criado com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateMarketingStats() {
    const totalCampaigns = MarketingState.campaigns.length;
    const activeCampaigns = MarketingState.campaigns.filter(c => c.status === 'active').length;
    const totalLeads = MarketingState.campaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
    const avgROI = MarketingState.campaigns.length > 0 ?
        Math.round(MarketingState.campaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / MarketingState.campaigns.length) : 0;

    return {
        totalCampaigns,
        activeCampaigns,
        totalLeads,
        avgROI
    };
}

function getCampaignColor(progress) {
    if (progress >= 100) return '#10b981';
    if (progress >= 50) return '#ec4899';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
}

function getFunnelColor(conversionRate) {
    if (conversionRate >= 20) return '#10b981';
    if (conversionRate >= 10) return '#3b82f6';
    if (conversionRate >= 5) return '#f59e0b';
    return '#ef4444';
}

function filterCampaigns(status) {
    const filteredCampaigns = status === 'all' ?
        MarketingState.campaigns :
        MarketingState.campaigns.filter(c => c.status === status);

    const campaignsList = document.getElementById('campaignsList');
    campaignsList.innerHTML = filteredCampaigns.map(renderCampaignCard).join('');
}

function exportCampaigns() {
    const csvContent = [
        ['Campanha', 'Status', 'Leads', 'ROI', 'Investimento', 'Tipo', 'Canal'],
        ...MarketingState.campaigns.map(c => [
            c.name, c.status, c.leads, `${c.roi}%`, `R$ ${c.budget}`, c.type, c.channel
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('campanhas.csv', csvContent, 'text/csv');
    showNotification('Campanhas exportadas com sucesso!', 'success');
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Configurar Eventos
function setupMarketingEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('marketingUpdated', () => {
        MarketingState.campaigns = AppState.marketingCampaigns;
        MarketingState.marketingAssets = AppState.marketingAssets;
        MarketingState.leadSources = AppState.leadSources;
        MarketingState.conversionFunnels = AppState.conversionFunnels;
        MarketingState.marketingReports = AppState.marketingReports;
        MarketingState.socialMedia = AppState.socialMedia;
        renderMarketingDashboard();
    });
}

// Exportar funções globais
window.initMarketingCampaignsModule = initMarketingCampaignsModule;
window.renderMarketingDashboard = renderMarketingDashboard;
window.setupMarketingEvents = setupMarketingEvents;
window.switchMarketingTab = switchMarketingTab;
window.showNewCampaignForm = showNewCampaignForm;
window.saveCampaign = saveCampaign;
window.showNewAssetForm = showNewAssetForm;
window.saveAsset = saveAsset;
window.showNewFunnelForm = showNewFunnelForm;
window.saveFunnel = saveFunnel;
window.calculateMarketingStats = calculateMarketingStats;
window.getCampaignColor = getCampaignColor;
window.getFunnelColor = getFunnelColor;
window.filterCampaigns = filterCampaigns;
window.exportCampaigns = exportCampaigns;
window.downloadFile = downloadFile;