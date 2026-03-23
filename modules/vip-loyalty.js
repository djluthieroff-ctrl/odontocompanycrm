// Gestão de Pacientes VIP e Fidelidade - CRM Odonto Company
// =============================================================

const VIPState = {
    vipPatients: [],
    loyaltyPrograms: [],
    rewards: [],
    vipAnalytics: [],
    retentionStrategies: [],
    vipBenefits: []
};

// Inicializar Módulo VIP e Fidelidade
function initVIPloyaltyModule() {
    VIPState.vipPatients = AppState.vipPatients || [];
    VIPState.loyaltyPrograms = AppState.loyaltyPrograms || [];
    VIPState.rewards = AppState.rewards || [];
    VIPState.vipAnalytics = AppState.vipAnalytics || [];
    VIPState.retentionStrategies = AppState.retentionStrategies || [];
    VIPState.vipBenefits = AppState.vipBenefits || [];
    renderVIPDashboard();
    setupVIPEvents();
    loadVIPData();
}

// Renderizar Dashboard VIP e Fidelidade
function renderVIPDashboard() {
    const container = document.getElementById('vipContent');
    if (!container) return;

    const stats = calculateVIPStats();

    container.innerHTML = `
        <style>
            .vip-header {
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .vip-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .vip-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .vip-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .vip-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .vip-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .vip-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .vip-card.vip {
                border-color: #fbbf24;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .vip-card.premium {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
            }

            .vip-card.gold {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fde68a);
            }

            .vip-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .vip-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .vip-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .vip-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .vip-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .vip-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-vip { background: #fef3c7; color: #92400e; }
            .status-premium { background: #e9d5ff; color: #5b21b6; }
            .status-gold { background: #fde68a; color: #92400e; }
            .status-platinum { background: #e5e7eb; color: #1f2937; }

            .vip-metrics {
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

            .loyalty-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }

            .reward-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }

            .benefit-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
            }

            .vip-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .btn-vip {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-vip:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-vip {
                background: #fbbf24;
                color: white;
                border-color: #fbbf24;
            }

            .btn-primary-vip:hover {
                background: #f59e0b;
            }

            .btn-success-vip {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-vip:hover {
                background: #059669;
            }

            .btn-warning-vip {
                background: #8b5cf6;
                color: white;
                border-color: #8b5cf6;
            }

            .btn-warning-vip:hover {
                background: #7c3aed;
            }

            .btn-danger-vip {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-vip:hover {
                background: #dc2626;
            }

            .progress-bar-vip {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-vip {
                height: 100%;
                background: linear-gradient(90deg, #fbbf24, #f59e0b);
                transition: width 0.3s ease;
            }

            .analytics-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .retention-chart {
                height: 200px;
                background: var(--gray-50);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--gray-600);
                font-size: 0.9rem;
            }

            .benefits-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .benefit-item {
                background: var(--gray-50);
                padding: 1rem;
                border-radius: 12px;
                text-align: center;
            }

            .benefit-value {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
            }

            .benefit-label {
                font-size: 0.75rem;
                color: var(--gray-600);
                margin-top: 0.25rem;
            }
        </style>

        <!-- Header VIP -->
        <div class="vip-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">💎 VIP & Fidelidade</h2>
                    <p style="margin: 0; opacity: 0.9;">Gestão de pacientes de alto valor</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-vip" onclick="showNewVIPForm()">💎 Novo VIP</button>
                    <button class="btn-success-vip" onclick="showNewLoyaltyForm()">🎁 Novo Programa</button>
                    <button class="btn-warning-vip" onclick="showNewRewardForm()">⭐ Novo Prêmio</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="vip-stats-grid">
            <div class="vip-stat-card">
                <div class="vip-stat-value">${stats.totalVIPs}</div>
                <div class="vip-stat-label">Pacientes VIP</div>
            </div>

            <div class="vip-stat-card">
                <div class="vip-stat-value" style="color: #fbbf24;">${stats.vipLevel}</div>
                <div class="vip-stat-label">Nível Médio</div>
            </div>

            <div class="vip-stat-card">
                <div class="vip-stat-value" style="color: #10b981;">${stats.totalRevenue}</div>
                <div class="vip-stat-label">Receita VIP</div>
            </div>

            <div class="vip-stat-card">
                <div class="vip-stat-value" style="color: #8b5cf6;">${stats.retentionRate}%</div>
                <div class="vip-stat-label">Taxa de Retenção</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="vip-controls">
            <button class="btn-primary-vip active" onclick="switchVIPTab('vipPatients')" id="tab-vipPatients">
                💎 Pacientes VIP
            </button>
            <button class="btn-primary-vip" onclick="switchVIPTab('loyalty')" id="tab-loyalty">
                🎁 Programas
            </button>
            <button class="btn-primary-vip" onclick="switchVIPTab('rewards')" id="tab-rewards">
                ⭐ Prêmios
            </button>
            <button class="btn-primary-vip" onclick="switchVIPTab('benefits')" id="tab-benefits">
                🎯 Benefícios
            </button>
            <button class="btn-primary-vip" onclick="switchVIPTab('analytics')" id="tab-analytics">
                📊 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="vip-vipPatients" class="vip-content active">
            ${renderVIPPatientsTab()}
        </div>

        <div id="vip-loyalty" class="vip-content">
            ${renderLoyaltyTab()}
        </div>

        <div id="vip-rewards" class="vip-content">
            ${renderRewardsTab()}
        </div>

        <div id="vip-benefits" class="vip-content">
            ${renderBenefitsTab()}
        </div>

        <div id="vip-analytics" class="vip-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Pacientes VIP
function renderVIPPatientsTab() {
    return `
        <div class="vip-card">
            <div class="vip-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">💎 Lista de Pacientes VIP</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="vipFilter" onchange="filterVIPs(this.value)">
                        <option value="all">Todos</option>
                        <option value="vip">VIP</option>
                        <option value="premium">Premium</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                    </select>
                    <button class="btn-primary-vip" onclick="exportVIPs()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="vipPatientsList" style="display: grid; gap: 1rem;">
                ${VIPState.vipPatients.map(renderVIPCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Programas de Fidelidade
function renderLoyaltyTab() {
    return `
        <div class="loyalty-card">
            <div class="vip-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎁 Programas de Fidelidade</h3>
                <button class="btn-success-vip" onclick="showNewLoyaltyForm()">➕ Novo Programa</button>
            </div>
            
            <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                ${VIPState.loyaltyPrograms.map(renderLoyaltyCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Prêmios
function renderRewardsTab() {
    return `
        <div class="reward-card">
            <div class="vip-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⭐ Catálogo de Prêmios</h3>
                <button class="btn-warning-vip" onclick="showNewRewardForm()">➕ Novo Prêmio</button>
            </div>
            
            <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                ${VIPState.rewards.map(renderRewardCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Benefícios
function renderBenefitsTab() {
    return `
        <div class="benefit-card">
            <div class="vip-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 Benefícios VIP</h3>
                <button class="btn-primary-vip" onclick="showNewBenefitForm()">➕ Novo Benefício</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${VIPState.vipBenefits.map(renderBenefitCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="vip-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Analytics VIP</h3>
                <button class="btn-success-vip" onclick="generateVIPReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📈 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Valor de Vida</div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">R$ ${VIPState.vipAnalytics.reduce((sum, a) => sum + (a.ltv || 0), 0)}</div>
                            </div>
                            <div style="font-size: 0.8rem; color: var(--gray-500);">Clientes</div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Frequência Média</div>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${VIPState.vipAnalytics.reduce((sum, a) => sum + (a.frequency || 0), 0) / (VIPState.vipAnalytics.length || 1)} visitas</div>
                            </div>
                            <div style="font-size: 0.8rem; color: var(--gray-500);">Média</div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">💰 Receita</h4>
                    <div class="retention-chart">
                        Gráfico de receita por nível VIP (implementação futura)
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Paciente VIP
function renderVIPCard(vip) {
    const cssClass = vip.level === 'platinum' ? 'platinum' : vip.level === 'gold' ? 'gold' : vip.level === 'premium' ? 'premium' : 'vip';
    const statusClass = `status-${vip.level}`;
    const points = vip.points || 0;
    const lastVisit = vip.lastVisit ? new Date(vip.lastVisit).toLocaleDateString('pt-BR') : 'Nunca';
    const totalSpent = vip.totalSpent || 0;
    const visits = vip.totalVisits || 0;

    return `
        <div class="vip-card ${cssClass}">
            <div class="vip-header">
                <div class="vip-info">
                    <div class="vip-avatar">💎</div>
                    <div class="vip-details">
                        <h4>${escapeHTML(vip.name)}</h4>
                        <p>${escapeHTML(vip.email)} • ${escapeHTML(vip.phone)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            Última visita: ${lastVisit} • ${visits} visitas
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="vip-status ${statusClass}">${vip.level}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${points} pts</div>
                </div>
            </div>

            <div class="vip-metrics">
                <div class="metric-item">
                    <div class="metric-value" style="color: #fbbf24;">R$ ${totalSpent}</div>
                    <div class="metric-label">Total Gasto</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #10b981;">${visits}</div>
                    <div class="metric-label">Visitas</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #8b5cf6;">${vip.referrals || 0}</div>
                    <div class="metric-label">Indicações</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" style="color: #3b82f6;">${vip.satisfaction || 0}%</div>
                    <div class="metric-label">Satisfação</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Benefícios:</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                    ${vip.benefits ? vip.benefits.map(benefit => `
                        <div style="background: var(--gray-50); padding: 0.5rem; border-radius: 8px; font-size: 0.9rem; text-align: center;">
                            ${escapeHTML(benefit)}
                        </div>
                    `).join('') : ''}
                </div>
            </div>

            <div class="progress-bar-vip">
                <div class="progress-fill-vip" style="width: ${Math.min(100, (points / 1000) * 100)}%; background: ${getVIPColor(vip.level)};"></div>
            </div>

            <div class="vip-actions">
                <button class="btn-vip btn-primary-vip" onclick="viewVIPDetails('${vip.id}')">👁️ Detalhes</button>
                <button class="btn-vip btn-success-vip" onclick="addPoints('${vip.id}')">➕ Pontos</button>
                <button class="btn-vip btn-warning-vip" onclick="upgradeVIP('${vip.id}')">⬆️ Nível</button>
                <button class="btn-vip btn-danger-vip" onclick="removeVIP('${vip.id}')">🗑️ Remover</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Programa de Fidelidade
function renderLoyaltyCard(loyalty) {
    return `
        <div class="loyalty-card">
            <div class="vip-header">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${escapeHTML(loyalty.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        Pontos: ${loyalty.pointsPerDollar} por dólar • Validade: ${loyalty.expiryMonths} meses
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${loyalty.members || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Membros</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(loyalty.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Benefícios:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">
                        ${loyalty.benefits ? loyalty.benefits.join(', ') : ''}
                    </div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Níveis:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">
                        ${loyalty.levels ? loyalty.levels.join(', ') : ''}
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-vip btn-primary-vip" onclick="editLoyalty('${loyalty.id}')">✏️ Editar</button>
                <button class="btn-vip btn-success-vip" onclick="activateLoyalty('${loyalty.id}')">✅ Ativar</button>
                <button class="btn-vip btn-danger-vip" onclick="deleteLoyalty('${loyalty.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Prêmio
function renderRewardCard(reward) {
    return `
        <div class="reward-card">
            <div class="vip-header">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${escapeHTML(reward.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${reward.type} • ${reward.pointsRequired} pontos
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${reward.stock || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Disponíveis</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(reward.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Categoria:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">
                        ${reward.category}
                    </div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Validade:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">
                        ${reward.expiryDays || 'Sem validade'} dias
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-vip btn-primary-vip" onclick="redeemReward('${reward.id}')">🎁 Resgatar</button>
                <button class="btn-vip btn-success-vip" onclick="editReward('${reward.id}')">✏️ Editar</button>
                <button class="btn-vip btn-warning-vip" onclick="restockReward('${reward.id}')">📦 Reabastecer</button>
                <button class="btn-vip btn-danger-vip" onclick="deleteReward('${reward.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Benefício
function renderBenefitCard(benefit) {
    return `
        <div class="benefit-card">
            <div class="vip-header">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${escapeHTML(benefit.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        Nível: ${benefit.level} • Tipo: ${benefit.type}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${benefit.usageCount || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Utilizações</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(benefit.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Condições:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">
                        ${benefit.conditions ? benefit.conditions.join(', ') : ''}
                    </div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Validade:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">
                        ${benefit.validity || 'Sem validade'}
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-vip btn-primary-vip" onclick="assignBenefit('${benefit.id}')">➕ Atribuir</button>
                <button class="btn-vip btn-success-vip" onclick="editBenefit('${benefit.id}')">✏️ Editar</button>
                <button class="btn-vip btn-danger-vip" onclick="deleteBenefit('${benefit.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchVIPTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-vip').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.vip-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`vip-${tabName}`).classList.add('active');
}

// Funções de Pacientes VIP
function showNewVIPForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">💎 Novo Paciente VIP</h4>
            <form id="newVIPForm" onsubmit="saveVIP(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome *</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email *</label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Telefone</label>
                        <input type="tel" class="form-input" name="phone">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Nível VIP</label>
                        <select class="form-select" name="level">
                            <option value="vip">VIP</option>
                            <option value="premium">Premium</option>
                            <option value="gold">Gold</option>
                            <option value="platinum">Platinum</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Pontos</label>
                        <input type="number" class="form-input" name="points" min="0">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Total Gasto</label>
                        <input type="number" class="form-input" name="totalSpent" min="0" step="0.01">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Benefícios</label>
                    <input type="text" class="form-input" name="benefits" placeholder="Benefícios separados por vírgula">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Paciente VIP', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Cadastrar', class: 'btn-primary', onclick: "document.getElementById('newVIPForm').requestSubmit()" }
    ]);
}

function saveVIP(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const vip = {
        id: generateId(),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        level: formData.get('level') || 'vip',
        points: parseInt(formData.get('points')) || 0,
        totalSpent: parseFloat(formData.get('totalSpent')) || 0,
        totalVisits: 0,
        lastVisit: new Date().toISOString(),
        referrals: 0,
        satisfaction: 0,
        benefits: formData.get('benefits') ? formData.get('benefits').split(',').map(b => b.trim()) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    VIPState.vipPatients.push(vip);
    AppState.vipPatients = VIPState.vipPatients;
    saveToStorage(STORAGE_KEYS.VIP_PATIENTS, AppState.vipPatients);

    closeModal();
    renderVIPDashboard();
    showNotification(`Paciente VIP "${vip.name}" cadastrado com sucesso!`, 'success');
}

// Funções de Programas de Fidelidade
function showNewLoyaltyForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎁 Novo Programa de Fidelidade</h4>
            <form id="newLoyaltyForm" onsubmit="saveLoyalty(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Programa *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do programa..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Pontos por Dólar</label>
                        <input type="number" class="form-input" name="pointsPerDollar" min="0" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Validade (meses)</label>
                        <input type="number" class="form-input" name="expiryMonths" min="0">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Benefícios</label>
                    <input type="text" class="form-input" name="benefits" placeholder="Benefícios separados por vírgula">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Níveis</label>
                    <input type="text" class="form-input" name="levels" placeholder="Níveis separados por vírgula">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Programa de Fidelidade', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Programa', class: 'btn-primary', onclick: "document.getElementById('newLoyaltyForm').requestSubmit()" }
    ]);
}

function saveLoyalty(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const loyalty = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        pointsPerDollar: parseFloat(formData.get('pointsPerDollar')) || 1,
        expiryMonths: parseInt(formData.get('expiryMonths')) || 12,
        benefits: formData.get('benefits') ? formData.get('benefits').split(',').map(b => b.trim()) : [],
        levels: formData.get('levels') ? formData.get('levels').split(',').map(l => l.trim()) : ['vip', 'premium', 'gold', 'platinum'],
        members: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    VIPState.loyaltyPrograms.push(loyalty);
    AppState.loyaltyPrograms = VIPState.loyaltyPrograms;
    saveToStorage(STORAGE_KEYS.LOYALTY_PROGRAMS, AppState.loyaltyPrograms);

    closeModal();
    renderVIPDashboard();
    showNotification(`Programa "${loyalty.name}" criado com sucesso!`, 'success');
}

// Funções de Prêmios
function showNewRewardForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">⭐ Novo Prêmio</h4>
            <form id="newRewardForm" onsubmit="saveReward(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Prêmio *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do prêmio..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Desconto">Desconto</option>
                            <option value="Brinde">Brinde</option>
                            <option value="Serviço">Serviço</option>
                            <option value="Experiência">Experiência</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Pontos Necessários</label>
                        <input type="number" class="form-input" name="pointsRequired" min="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria do prêmio">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Estoque</label>
                        <input type="number" class="form-input" name="stock" min="0">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Validade (dias)</label>
                    <input type="number" class="form-input" name="expiryDays" min="0">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Prêmio', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Prêmio', class: 'btn-primary', onclick: "document.getElementById('newRewardForm').requestSubmit()" }
    ]);
}

function saveReward(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const reward = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Desconto',
        pointsRequired: parseInt(formData.get('pointsRequired')) || 0,
        category: formData.get('category') || '',
        stock: parseInt(formData.get('stock')) || 0,
        expiryDays: parseInt(formData.get('expiryDays')) || 0,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    VIPState.rewards.push(reward);
    AppState.rewards = VIPState.rewards;
    saveToStorage(STORAGE_KEYS.REWARDS, AppState.rewards);

    closeModal();
    renderVIPDashboard();
    showNotification(`Prêmio "${reward.name}" criado com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateVIPStats() {
    const totalVIPs = VIPState.vipPatients.length;
    const vipLevel = VIPState.vipPatients.length > 0 ?
        VIPState.vipPatients.reduce((sum, v) => sum + (v.level === 'vip' ? 1 : v.level === 'premium' ? 2 : v.level === 'gold' ? 3 : 4), 0) / VIPState.vipPatients.length : 0;
    const totalRevenue = VIPState.vipPatients.reduce((sum, v) => sum + (v.totalSpent || 0), 0);
    const retentionRate = VIPState.vipAnalytics.reduce((sum, a) => sum + (a.retentionRate || 0), 0) / (VIPState.vipAnalytics.length || 1);

    return {
        totalVIPs,
        vipLevel: Math.round(vipLevel),
        totalRevenue,
        retentionRate: Math.round(retentionRate)
    };
}

function getVIPColor(level) {
    switch (level) {
        case 'platinum': return '#8b5cf6';
        case 'gold': return '#f59e0b';
        case 'premium': return '#10b981';
        default: return '#fbbf24';
    }
}

function filterVIPs(level) {
    const filteredVIPs = level === 'all' ?
        VIPState.vipPatients :
        VIPState.vipPatients.filter(v => v.level === level);

    const vipPatientsList = document.getElementById('vipPatientsList');
    vipPatientsList.innerHTML = filteredVIPs.map(renderVIPCard).join('');
}

function exportVIPs() {
    const csvContent = [
        ['Nome', 'Email', 'Nível', 'Pontos', 'Total Gasto', 'Visitas', 'Indicações'],
        ...VIPState.vipPatients.map(v => [
            v.name, v.email, v.level, v.points, `R$ ${v.totalSpent}`, v.totalVisits, v.referrals
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('pacientes_vip.csv', csvContent, 'text/csv');
    showNotification('Pacientes VIP exportados com sucesso!', 'success');
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
function setupVIPEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('vipUpdated', () => {
        VIPState.vipPatients = AppState.vipPatients;
        VIPState.loyaltyPrograms = AppState.loyaltyPrograms;
        VIPState.rewards = AppState.rewards;
        VIPState.vipAnalytics = AppState.vipAnalytics;
        VIPState.retentionStrategies = AppState.retentionStrategies;
        VIPState.vipBenefits = AppState.vipBenefits;
        renderVIPDashboard();
    });
}

// Exportar funções globais
window.initVIPloyaltyModule = initVIPloyaltyModule;
window.renderVIPDashboard = renderVIPDashboard;
window.setupVIPEvents = setupVIPEvents;
window.switchVIPTab = switchVIPTab;
window.showNewVIPForm = showNewVIPForm;
window.saveVIP = saveVIP;
window.showNewLoyaltyForm = showNewLoyaltyForm;
window.saveLoyalty = saveLoyalty;
window.showNewRewardForm = showNewRewardForm;
window.saveReward = saveReward;
window.calculateVIPStats = calculateVIPStats;
window.getVIPColor = getVIPColor;
window.filterVIPs = filterVIPs;
window.exportVIPs = exportVIPs;
window.downloadFile = downloadFile;