// Auditoria de Qualidade - CRM Odonto Company
// =============================================

const QualityState = {
    audits: [],
    checklists: [],
    findings: [],
    correctiveActions: [],
    compliance: [],
    qualityMetrics: [],
    incidents: [],
    improvements: []
};

// Inicializar Módulo de Auditoria de Qualidade
function initQualityAuditModule() {
    QualityState.audits = AppState.audits || [];
    QualityState.checklists = AppState.checklists || [];
    QualityState.findings = AppState.findings || [];
    QualityState.correctiveActions = AppState.correctiveActions || [];
    QualityState.compliance = AppState.compliance || [];
    QualityState.qualityMetrics = AppState.qualityMetrics || [];
    QualityState.incidents = AppState.incidents || [];
    QualityState.improvements = AppState.improvements || [];
    renderQualityDashboard();
    setupQualityEvents();
    loadQualityData();
}

// Carregar Dados de Qualidade
function loadQualityData() {
    console.log('📦 Usando dados de Qualidade do AppState...');
}

// Renderizar Dashboard de Auditoria de Qualidade
function renderQualityDashboard() {
    const container = document.getElementById('qualityContent');
    if (!container) return;

    const stats = calculateQualityStats();

    container.innerHTML = `
        <style>
            .quality-header {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .quality-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .quality-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .quality-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .quality-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .quality-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .quality-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .quality-card.compliant {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .quality-card.non-compliant {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .quality-card.partial {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .quality-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .quality-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .quality-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .quality-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .quality-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .quality-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-compliant { background: #f0fdf4; color: #065f46; }
            .status-non-compliant { background: #fef2f2; color: #991b1b; }
            .status-partial { background: #fffbeb; color: #92400e; }

            .finding-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .finding-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #6366f1;
            }

            .finding-item.compliant {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .finding-item.non-compliant {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .finding-item.partial {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .finding-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .finding-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .finding-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-quality {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-quality {
                height: 100%;
                background: linear-gradient(90deg, #6366f1, #8b5cf6);
                transition: width 0.3s ease;
            }

            .metric-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .metric-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .metric-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .metric-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .quality-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-quality {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-quality:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-quality {
                background: #6366f1;
                color: white;
                border-color: #6366f1;
            }

            .btn-primary-quality:hover {
                background: #4f46e5;
            }

            .btn-success-quality {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-quality:hover {
                background: #059669;
            }

            .btn-warning-quality {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-quality:hover {
                background: #d97706;
            }

            .btn-danger-quality {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-quality:hover {
                background: #dc2626;
            }

            .analytics-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .chart-container {
                width: 100%;
                height: 300px;
                margin-top: 1rem;
            }
        </style>

        <!-- Header de Qualidade -->
        <div class="quality-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">🔍 Auditoria de Qualidade</h2>
                    <p style="margin: 0; opacity: 0.9;">Gestão de qualidade, conformidade e melhorias</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-quality" onclick="showNewAuditForm()">➕ Nova Auditoria</button>
                    <button class="btn-success-quality" onclick="showNewFindingForm()">📋 Novo Encontrado</button>
                    <button class="btn-warning-quality" onclick="showNewActionForm()">🔧 Nova Ação</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="quality-stats-grid">
            <div class="quality-stat-card">
                <div class="quality-stat-value">${stats.totalAudits}</div>
                <div class="quality-stat-label">Auditorias</div>
            </div>

            <div class="quality-stat-card">
                <div class="quality-stat-value" style="color: #10b981;">${stats.compliantAudits}</div>
                <div class="quality-stat-label">Conformes</div>
            </div>

            <div class="quality-stat-card">
                <div class="quality-stat-value" style="color: #ef4444;">${stats.nonCompliantAudits}</div>
                <div class="quality-stat-label">Não Conformes</div>
            </div>

            <div class="quality-stat-card">
                <div class="quality-stat-value" style="color: #f59e0b;">${stats.avgCompliance}%</div>
                <div class="quality-stat-label">Conformidade Média</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="quality-controls">
            <button class="btn-primary-quality active" onclick="switchQualityTab('audits')" id="tab-audits">
                🔍 Auditorias
            </button>
            <button class="btn-primary-quality" onclick="switchQualityTab('findings')" id="tab-findings">
                📋 Encontrados
            </button>
            <button class="btn-primary-quality" onclick="switchQualityTab('actions')" id="tab-actions">
                🔧 Ações
            </button>
            <button class="btn-primary-quality" onclick="switchQualityTab('metrics')" id="tab-metrics">
                📊 Métricas
            </button>
            <button class="btn-primary-quality" onclick="switchQualityTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="quality-audits" class="quality-content active">
            ${renderAuditsTab()}
        </div>

        <div id="quality-findings" class="quality-content">
            ${renderFindingsTab()}
        </div>

        <div id="quality-actions" class="quality-content">
            ${renderActionsTab()}
        </div>

        <div id="quality-metrics" class="quality-content">
            ${renderMetricsTab()}
        </div>

        <div id="quality-analytics" class="quality-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Auditorias
function renderAuditsTab() {
    return `
        <div class="quality-card">
            <div class="quality-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔍 Lista de Auditorias</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="auditFilter" onchange="filterAudits(this.value)">
                        <option value="all">Todos</option>
                        <option value="compliant">Conformes</option>
                        <option value="non-compliant">Não Conformes</option>
                        <option value="partial">Parciais</option>
                    </select>
                    <button class="btn-primary-quality" onclick="exportAudits()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="auditsList" style="display: grid; gap: 1rem;">
                ${QualityState.audits.map(renderAuditCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Encontrados
function renderFindingsTab() {
    return `
        <div class="quality-card">
            <div class="quality-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📋 Gestão de Encontrados</h3>
                <button class="btn-success-quality" onclick="showNewFindingForm()">➕ Novo Encontrado</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${QualityState.findings.map(renderFindingCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Ações
function renderActionsTab() {
    return `
        <div class="quality-card">
            <div class="quality-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔧 Gestão de Ações</h3>
                <button class="btn-warning-quality" onclick="showNewActionForm()">➕ Nova Ação</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${QualityState.correctiveActions.map(renderActionCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Métricas
function renderMetricsTab() {
    return `
        <div class="quality-card">
            <div class="quality-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Gestão de Métricas</h3>
                <button class="btn-primary-quality" onclick="showNewMetricForm()">➕ Nova Métrica</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${QualityState.qualityMetrics.map(renderMetricCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="quality-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Qualidade</h3>
                <button class="btn-success-quality" onclick="generateQualityReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Conformidade</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Auditorias Conformes</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${QualityState.audits.filter(a => a.status === 'compliant').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Ações Corretivas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${QualityState.correctiveActions.filter(a => a.status === 'completed').length}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📊 Métricas</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Tempo Médio</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Resolução</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateAverageResolutionTime()} dias
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Satisfação</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Qualidade</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateQualitySatisfaction()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Auditoria
function renderAuditCard(audit) {
    const cssClass = audit.status === 'compliant' ? 'compliant' : audit.status === 'non_compliant' ? 'non-compliant' : 'partial';
    const statusClass = `status-${audit.status}`;
    const findings = QualityState.findings.filter(f => f.auditId === audit.id);
    const actions = QualityState.correctiveActions.filter(a => findings.some(f => f.id === a.findingId));
    const compliantFindings = findings.filter(f => f.status === 'resolved').length;
    const complianceRate = calculateAuditCompliance(audit.id);

    return `
        <div class="quality-card ${cssClass}">
            <div class="quality-header-info">
                <div class="quality-info">
                    <div class="quality-icon">🔍</div>
                    <div class="quality-details">
                        <h4>${escapeHTML(audit.name)}</h4>
                        <p>${escapeHTML(audit.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${audit.type} • ${audit.scope} • ${audit.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="quality-status ${statusClass}">${audit.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${complianceRate}%</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Encontrados da Auditoria:</div>
                <div class="finding-list">
                    ${findings.slice(0, 4).map(finding => `
                        <div class="finding-item ${finding.status}">
                            <div class="finding-info">
                                <h6>${escapeHTML(finding.name)}</h6>
                                <p>${finding.type} • ${finding.status}</p>
                            </div>
                            <div class="finding-value" style="color: ${getFindingColor(finding.status)};">
                                ${finding.severity || 'Média'}
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhum encontrado</div>'}
                </div>
            </div>

            <div class="metric-grid">
                <div class="metric-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">📋 Encontrados</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Resolvidos:</span>
                            <span style="font-weight: 700;">${compliantFindings}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Ações:</span>
                            <span style="font-weight: 700;">${actions.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Incidentes:</span>
                            <span style="font-weight: 700;">${QualityState.incidents.filter(i => i.auditId === audit.id).length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="metric-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Auditor:</span>
                            <span style="font-weight: 700;">${audit.auditor || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Início:</span>
                            <span style="font-weight: 700;">${new Date(audit.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Data Fim:</span>
                            <span style="font-weight: 700;">${new Date(audit.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-quality">
                <div class="progress-fill-quality" style="width: ${complianceRate}%; background: ${getAuditColor(complianceRate)};"></div>
            </div>

            <div class="quality-actions">
                <button class="btn-quality btn-primary-quality" onclick="viewAuditDetails('${audit.id}')">👁️ Detalhes</button>
                <button class="btn-quality btn-success-quality" onclick="addFindingToAudit('${audit.id}')">📋 Encontrado</button>
                <button class="btn-quality btn-warning-quality" onclick="updateAuditStatus('${audit.id}')">✅ Status</button>
                <button class="btn-quality btn-danger-quality" onclick="deleteAudit('${audit.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Encontrado
function renderFindingCard(finding) {
    const audit = QualityState.audits.find(a => a.id === finding.auditId);
    const cssClass = finding.status === 'resolved' ? 'compliant' : finding.status === 'open' ? 'non-compliant' : 'partial';
    const actions = QualityState.correctiveActions.filter(a => a.findingId === finding.id);
    const severity = finding.severity || 'Média';

    return `
        <div class="quality-card ${cssClass}">
            <div class="quality-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📋 ${escapeHTML(finding.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${audit ? audit.name : 'Auditoria desconhecida'} • ${finding.type} • ${finding.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${severity}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Severidade</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(finding.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${finding.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Categoria:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${finding.category || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Identificação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(finding.identifiedAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Resolução:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${finding.resolvedAt ? new Date(finding.resolvedAt).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-quality btn-primary-quality" onclick="editFinding('${finding.id}')">✏️ Editar</button>
                <button class="btn-quality btn-success-quality" onclick="updateFindingStatus('${finding.id}')">✅ Status</button>
                <button class="btn-quality btn-warning-quality" onclick="updateFindingSeverity('${finding.id}')">🎯 Severidade</button>
                <button class="btn-quality btn-danger-quality" onclick="deleteFinding('${finding.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Ação
function renderActionCard(action) {
    const finding = QualityState.findings.find(f => f.id === action.findingId);
    const audit = QualityState.audits.find(a => a.id === finding.auditId);
    const cssClass = action.status === 'completed' ? 'compliant' : action.status === 'in_progress' ? 'partial' : 'non-compliant';

    return `
        <div class="quality-card ${cssClass}">
            <div class="quality-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔧 ${escapeHTML(action.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${audit ? audit.name : 'Auditoria desconhecida'} • ${finding ? finding.name : 'Encontrado desconhecido'} • ${action.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${action.priority || 'Média'}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Prioridade</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(action.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${action.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Responsável:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${action.responsible || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Início:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(action.startedAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Conclusão:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${action.completedAt ? new Date(action.completedAt).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-quality btn-primary-quality" onclick="editAction('${action.id}')">✏️ Editar</button>
                <button class="btn-quality btn-success-quality" onclick="updateActionStatus('${action.id}')">✅ Status</button>
                <button class="btn-quality btn-warning-quality" onclick="updateActionPriority('${action.id}')">🎯 Prioridade</button>
                <button class="btn-quality btn-danger-quality" onclick="deleteAction('${action.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Métrica
function renderMetricCard(metric) {
    const cssClass = metric.status === 'compliant' ? 'compliant' : metric.status === 'non_compliant' ? 'non-compliant' : 'partial';

    return `
        <div class="quality-card ${cssClass}">
            <div class="quality-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 ${escapeHTML(metric.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${metric.type} • ${metric.category} • ${metric.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${metric.value || 0}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Valor</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(metric.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Objetivo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${metric.target || 0}%</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Unidade:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${metric.unit || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Medição:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(metric.measuredAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(metric.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-quality btn-primary-quality" onclick="editMetric('${metric.id}')">✏️ Editar</button>
                <button class="btn-quality btn-success-quality" onclick="updateMetricStatus('${metric.id}')">✅ Status</button>
                <button class="btn-quality btn-warning-quality" onclick="updateMetricValue('${metric.id}')">📊 Valor</button>
                <button class="btn-quality btn-danger-quality" onclick="deleteMetric('${metric.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchQualityTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-quality').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.quality-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`quality-${tabName}`).classList.add('active');
}

// Funções de Auditorias
function showNewAuditForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🔍 Nova Auditoria</h4>
            <form id="newAuditForm" onsubmit="saveAudit(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Auditoria *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da auditoria..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Interna">Interna</option>
                            <option value="Externa">Externa</option>
                            <option value="Processo">Processo</option>
                            <option value="Produto">Produto</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Escopo</label>
                        <input type="text" class="form-input" name="scope" placeholder="Escopo da auditoria">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Auditor</label>
                        <input type="text" class="form-input" name="auditor" placeholder="Auditor responsável">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Prioridade</label>
                        <select class="form-select" name="priority">
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data de Início</label>
                        <input type="date" class="form-input" name="startDate">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data de Fim</label>
                        <input type="date" class="form-input" name="endDate">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Auditoria', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Auditoria', class: 'btn-primary', onclick: "document.getElementById('newAuditForm').requestSubmit()" }
    ]);
}

function saveAudit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const audit = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Interna',
        scope: formData.get('scope') || '',
        auditor: formData.get('auditor') || '',
        priority: formData.get('priority') || 'Média',
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    QualityState.audits.push(audit);
    AppState.audits = QualityState.audits;
    saveToStorage(STORAGE_KEYS.AUDITS, AppState.audits);

    closeModal();
    renderQualityDashboard();
    showNotification(`Auditoria "${audit.name}" criada com sucesso!`, 'success');
}

// Funções de Encontrados
function showNewFindingForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📋 Novo Encontrado</h4>
            <form id="newFindingForm" onsubmit="saveFinding(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Encontrado *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do encontrado..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Auditoria</label>
                        <select class="form-select" name="auditId">
                            ${QualityState.audits.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Procedimento">Procedimento</option>
                            <option value="Equipamento">Equipamento</option>
                            <option value="Pessoal">Pessoal</option>
                            <option value="Documentação">Documentação</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria do encontrado">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Severidade</label>
                        <select class="form-select" name="severity">
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                            <option value="Crítica">Crítica</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data de Identificação</label>
                    <input type="date" class="form-input" name="identifiedAt">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Encontrado', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Encontrado', class: 'btn-primary', onclick: "document.getElementById('newFindingForm').requestSubmit()" }
    ]);
}

function saveFinding(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const finding = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        auditId: formData.get('auditId'),
        type: formData.get('type') || 'Procedimento',
        category: formData.get('category') || '',
        severity: formData.get('severity') || 'Média',
        status: 'open',
        identifiedAt: formData.get('identifiedAt'),
        resolvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    QualityState.findings.push(finding);
    AppState.findings = QualityState.findings;
    saveToStorage(STORAGE_KEYS.FINDINGS, AppState.findings);

    closeModal();
    renderQualityDashboard();
    showNotification(`Encontrado "${finding.name}" criado com sucesso!`, 'success');
}

// Funções de Ações Corretivas
function showNewActionForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🔧 Nova Ação Corretiva</h4>
            <form id="newActionForm" onsubmit="saveAction(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Ação *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da ação..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Encontrado</label>
                        <select class="form-select" name="findingId">
                            ${QualityState.findings.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Corretiva">Corretiva</option>
                            <option value="Preventiva">Preventiva</option>
                            <option value="Melhoria">Melhoria</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Responsável</label>
                        <input type="text" class="form-input" name="responsible" placeholder="Responsável pela ação">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Prioridade</label>
                        <select class="form-select" name="priority">
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data de Início</label>
                        <input type="date" class="form-input" name="startedAt">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data de Conclusão</label>
                        <input type="date" class="form-input" name="completedAt">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Ação', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Ação', class: 'btn-primary', onclick: "document.getElementById('newActionForm').requestSubmit()" }
    ]);
}

function saveAction(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const action = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        findingId: formData.get('findingId'),
        type: formData.get('type') || 'Corretiva',
        responsible: formData.get('responsible') || '',
        priority: formData.get('priority') || 'Média',
        startedAt: formData.get('startedAt'),
        completedAt: formData.get('completedAt'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    QualityState.correctiveActions.push(action);
    AppState.correctiveActions = QualityState.correctiveActions;
    saveToStorage(STORAGE_KEYS.CORRECTIVE_ACTIONS, AppState.correctiveActions);

    closeModal();
    renderQualityDashboard();
    showNotification(`Ação "${action.name}" criada com sucesso!`, 'success');
}

// Funções de Métricas
function showNewMetricForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📊 Nova Métrica</h4>
            <form id="newMetricForm" onsubmit="saveMetric(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Métrica *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da métrica..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Processo">Processo</option>
                            <option value="Produto">Produto</option>
                            <option value="Cliente">Cliente</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria da métrica">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Valor</label>
                        <input type="number" class="form-input" name="value" min="0" max="100" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Objetivo</label>
                        <input type="number" class="form-input" name="target" min="0" max="100" step="0.01">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Unidade</label>
                        <input type="text" class="form-input" name="unit" placeholder="Unidade de medida">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data de Medição</label>
                        <input type="date" class="form-input" name="measuredAt">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Métrica', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Métrica', class: 'btn-primary', onclick: "document.getElementById('newMetricForm').requestSubmit()" }
    ]);
}

function saveMetric(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const metric = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Processo',
        category: formData.get('category') || '',
        value: parseFloat(formData.get('value')) || 0,
        target: parseFloat(formData.get('target')) || 0,
        unit: formData.get('unit') || '',
        status: 'pending',
        measuredAt: formData.get('measuredAt'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    QualityState.qualityMetrics.push(metric);
    AppState.qualityMetrics = QualityState.qualityMetrics;
    saveToStorage(STORAGE_KEYS.QUALITY_METRICS, AppState.qualityMetrics);

    closeModal();
    renderQualityDashboard();
    showNotification(`Métrica "${metric.name}" criada com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateQualityStats() {
    const totalAudits = QualityState.audits.length;
    const compliantAudits = QualityState.audits.filter(a => a.status === 'compliant').length;
    const nonCompliantAudits = QualityState.audits.filter(a => a.status === 'non_compliant').length;
    const avgCompliance = QualityState.compliance.length > 0 ?
        Math.round(QualityState.compliance.reduce((sum, c) => sum + (c.rate || 0), 0) / QualityState.compliance.length) : 0;

    return {
        totalAudits,
        compliantAudits,
        nonCompliantAudits,
        avgCompliance
    };
}

function getAuditColor(compliance) {
    if (compliance >= 90) return '#10b981';
    if (compliance >= 70) return '#3b82f6';
    if (compliance >= 50) return '#f59e0b';
    return '#ef4444';
}

function getFindingColor(status) {
    if (status === 'resolved') return '#10b981';
    if (status === 'open') return '#ef4444';
    return '#f59e0b';
}

function calculateAuditCompliance(auditId) {
    const findings = QualityState.findings.filter(f => f.auditId === auditId);
    if (findings.length === 0) return 100;

    const resolvedFindings = findings.filter(f => f.status === 'resolved').length;
    return Math.round((resolvedFindings / findings.length) * 100);
}

function calculateAverageResolutionTime() {
    const resolvedFindings = QualityState.findings.filter(f => f.status === 'resolved');
    if (resolvedFindings.length === 0) return 0;

    const totalDays = resolvedFindings.reduce((sum, f) => {
        const identified = new Date(f.identifiedAt);
        const resolved = new Date(f.resolvedAt);
        return sum + Math.ceil((resolved - identified) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / resolvedFindings.length);
}

function calculateQualitySatisfaction() {
    const avgCompliance = QualityState.compliance.length > 0 ?
        Math.round(QualityState.compliance.reduce((sum, c) => sum + (c.rate || 0), 0) / QualityState.compliance.length) : 0;
    return Math.max(0, 100 - avgCompliance);
}

function filterAudits(status) {
    const filteredAudits = status === 'all' ?
        QualityState.audits :
        QualityState.audits.filter(a => a.status === status);

    const auditsList = document.getElementById('auditsList');
    auditsList.innerHTML = filteredAudits.map(renderAuditCard).join('');
}

function exportAudits() {
    const csvContent = [
        ['Auditoria', 'Status', 'Conformidade', 'Tipo', 'Escopo', 'Auditor', 'Prioridade', 'Data Início', 'Data Fim'],
        ...QualityState.audits.map(a => [
            a.name, a.status, `${calculateAuditCompliance(a.id)}%`, a.type, a.scope, a.auditor, a.priority,
            new Date(a.startDate).toLocaleDateString('pt-BR'),
            new Date(a.endDate).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('auditorias.csv', csvContent, 'text/csv');
    showNotification('Auditorias exportadas com sucesso!', 'success');
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
function setupQualityEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('qualityUpdated', () => {
        QualityState.audits = AppState.audits;
        QualityState.checklists = AppState.checklists;
        QualityState.findings = AppState.findings;
        QualityState.correctiveActions = AppState.correctiveActions;
        QualityState.compliance = AppState.compliance;
        QualityState.qualityMetrics = AppState.qualityMetrics;
        QualityState.incidents = AppState.incidents;
        QualityState.improvements = AppState.improvements;
        renderQualityDashboard();
    });
}

// Exportar funções globais
window.initQualityAuditModule = initQualityAuditModule;
window.renderQualityDashboard = renderQualityDashboard;
window.setupQualityEvents = setupQualityEvents;
window.switchQualityTab = switchQualityTab;
window.showNewAuditForm = showNewAuditForm;
window.saveAudit = saveAudit;
window.showNewFindingForm = showNewFindingForm;
window.saveFinding = saveFinding;
window.showNewActionForm = showNewActionForm;
window.saveAction = saveAction;
window.showNewMetricForm = showNewMetricForm;
window.saveMetric = saveMetric;
window.calculateQualityStats = calculateQualityStats;
window.getAuditColor = getAuditColor;
window.getFindingColor = getFindingColor;
window.calculateAuditCompliance = calculateAuditCompliance;
window.calculateAverageResolutionTime = calculateAverageResolutionTime;
window.calculateQualitySatisfaction = calculateQualitySatisfaction;
window.filterAudits = filterAudits;
window.exportAudits = exportAudits;
window.downloadFile = downloadFile;