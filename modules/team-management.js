// Gestão de Equipes - CRM Odonto Company
// =============================================

const TeamState = {
    teams: [],
    members: [],
    roles: [],
    permissions: [],
    schedules: [],
    performance: [],
    training: [],
    communications: []
};

// Inicializar Módulo de Gestão de Equipes
function initTeamManagementModule() {
    TeamState.teams = AppState.teams || [];
    TeamState.members = AppState.members || [];
    TeamState.roles = AppState.roles || [];
    TeamState.permissions = AppState.permissions || [];
    TeamState.schedules = AppState.schedules || [];
    TeamState.performance = AppState.performance || [];
    TeamState.training = AppState.training || [];
    TeamState.communications = AppState.communications || [];
    renderTeamDashboard();
    setupTeamEvents();
    loadTeamData();
}

// Carregar Dados da Equipe
function loadTeamData() {
    console.log('📦 Usando dados de Equipe do AppState...');
}

// Renderizar Dashboard de Gestão de Equipes
function renderTeamDashboard() {
    const container = document.getElementById('teamContent');
    if (!container) return;

    const stats = calculateTeamStats();

    container.innerHTML = `
        <style>
            .team-header {
                background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .team-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .team-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .team-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .team-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .team-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .team-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .team-card.active {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .team-card.inactive {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .team-card.pending {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .team-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .team-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .team-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #10b981, #3b82f6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .team-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .team-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .team-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #f0fdf4; color: #065f46; }
            .status-inactive { background: #fee2e2; color: #991b1b; }
            .status-pending { background: #fffbeb; color: #92400e; }

            .member-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .member-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #10b981;
            }

            .member-item.active {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .member-item.inactive {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .member-item.pending {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .member-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .member-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .member-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-team {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-team {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #3b82f6);
                transition: width 0.3s ease;
            }

            .performance-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .performance-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .performance-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .performance-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .team-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-team {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-team:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-team {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-primary-team:hover {
                background: #059669;
            }

            .btn-success-team {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-success-team:hover {
                background: #2563eb;
            }

            .btn-warning-team {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-team:hover {
                background: #d97706;
            }

            .btn-danger-team {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-team:hover {
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

        <!-- Header de Equipes -->
        <div class="team-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">👥 Gestão de Equipes</h2>
                    <p style="margin: 0; opacity: 0.9;">Gestão de pessoas, performance e comunicação</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-team" onclick="showNewTeamForm()">➕ Nova Equipe</button>
                    <button class="btn-success-team" onclick="showNewMemberForm()">👤 Novo Membro</button>
                    <button class="btn-warning-team" onclick="showNewRoleForm()">🎯 Novo Cargo</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="team-stats-grid">
            <div class="team-stat-card">
                <div class="team-stat-value">${stats.totalTeams}</div>
                <div class="team-stat-label">Equipes</div>
            </div>

            <div class="team-stat-card">
                <div class="team-stat-value" style="color: #10b981;">${stats.activeMembers}</div>
                <div class="team-stat-label">Membros Ativos</div>
            </div>

            <div class="team-stat-card">
                <div class="team-stat-value" style="color: #ef4444;">${stats.inactiveMembers}</div>
                <div class="team-stat-label">Membros Inativos</div>
            </div>

            <div class="team-stat-card">
                <div class="team-stat-value" style="color: #f59e0b;">${stats.avgPerformance}%</div>
                <div class="team-stat-label">Performance Média</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="team-controls">
            <button class="btn-primary-team active" onclick="switchTeamTab('teams')" id="tab-teams">
                👥 Equipes
            </button>
            <button class="btn-primary-team" onclick="switchTeamTab('members')" id="tab-members">
                👤 Membros
            </button>
            <button class="btn-primary-team" onclick="switchTeamTab('roles')" id="tab-roles">
                🎯 Cargos
            </button>
            <button class="btn-primary-team" onclick="switchTeamTab('performance')" id="tab-performance">
                📊 Performance
            </button>
            <button class="btn-primary-team" onclick="switchTeamTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="team-teams" class="team-content active">
            ${renderTeamsTab()}
        </div>

        <div id="team-members" class="team-content">
            ${renderMembersTab()}
        </div>

        <div id="team-roles" class="team-content">
            ${renderRolesTab()}
        </div>

        <div id="team-performance" class="team-content">
            ${renderPerformanceTab()}
        </div>

        <div id="team-analytics" class="team-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Equipes
function renderTeamsTab() {
    return `
        <div class="team-card">
            <div class="team-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">👥 Lista de Equipes</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="teamFilter" onchange="filterTeams(this.value)">
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                        <option value="pending">Pendentes</option>
                    </select>
                    <button class="btn-primary-team" onclick="exportTeams()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="teamsList" style="display: grid; gap: 1rem;">
                ${TeamState.teams.map(renderTeamCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Membros
function renderMembersTab() {
    return `
        <div class="team-card">
            <div class="team-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">👤 Gestão de Membros</h3>
                <button class="btn-success-team" onclick="showNewMemberForm()">➕ Novo Membro</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${TeamState.members.map(renderMemberCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Cargos
function renderRolesTab() {
    return `
        <div class="team-card">
            <div class="team-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 Gestão de Cargos</h3>
                <button class="btn-warning-team" onclick="showNewRoleForm()">➕ Novo Cargo</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${TeamState.roles.map(renderRoleCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Performance
function renderPerformanceTab() {
    return `
        <div class="team-card">
            <div class="team-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Gestão de Performance</h3>
                <button class="btn-primary-team" onclick="showNewPerformanceForm()">➕ Nova Avaliação</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${TeamState.performance.map(renderPerformanceCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="team-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Equipes</h3>
                <button class="btn-success-team" onclick="generateTeamReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Membros Ativos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${TeamState.members.filter(m => m.status === 'active').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Equipes Ativas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${TeamState.teams.filter(t => t.status === 'active').length}
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
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Treinamento</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateAverageTrainingTime()} dias
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Satisfação</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Equipes</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateTeamSatisfaction()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Equipe
function renderTeamCard(team) {
    const cssClass = team.status === 'active' ? 'active' : team.status === 'inactive' ? 'inactive' : 'pending';
    const statusClass = `status-${team.status}`;
    const members = TeamState.members.filter(m => m.teamId === team.id);
    const roles = TeamState.roles.filter(r => r.teamId === team.id);
    const performance = TeamState.performance.filter(p => p.teamId === team.id);
    const activeMembers = members.filter(m => m.status === 'active').length;
    const avgPerformance = calculateTeamPerformance(team.id);

    return `
        <div class="team-card ${cssClass}">
            <div class="team-header-info">
                <div class="team-info">
                    <div class="team-icon">👥</div>
                    <div class="team-details">
                        <h4>${escapeHTML(team.name)}</h4>
                        <p>${escapeHTML(team.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${team.type} • ${team.department} • ${team.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="team-status ${statusClass}">${team.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${avgPerformance}%</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Membros da Equipe:</div>
                <div class="member-list">
                    ${members.slice(0, 4).map(member => `
                        <div class="member-item ${member.status}">
                            <div class="member-info">
                                <h6>${escapeHTML(member.name)}</h6>
                                <p>${member.role} • ${member.status}</p>
                            </div>
                            <div class="member-value" style="color: ${getMemberColor(member.status)};">
                                ${member.performance || 0}%
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhum membro</div>'}
                </div>
            </div>

            <div class="performance-grid">
                <div class="performance-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">👤 Membros</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Ativos:</span>
                            <span style="font-weight: 700;">${activeMembers}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Cargos:</span>
                            <span style="font-weight: 700;">${roles.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Avaliações:</span>
                            <span style="font-weight: 700;">${performance.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="performance-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Líder:</span>
                            <span style="font-weight: 700;">${team.leader || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Criação:</span>
                            <span style="font-weight: 700;">${new Date(team.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Última Atualização:</span>
                            <span style="font-weight: 700;">${new Date(team.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-team">
                <div class="progress-fill-team" style="width: ${avgPerformance}%; background: ${getTeamColor(avgPerformance)};"></div>
            </div>

            <div class="team-actions">
                <button class="btn-team btn-primary-team" onclick="viewTeamDetails('${team.id}')">👁️ Detalhes</button>
                <button class="btn-team btn-success-team" onclick="addMemberToTeam('${team.id}')">👤 Membro</button>
                <button class="btn-team btn-warning-team" onclick="updateTeamStatus('${team.id}')">✅ Status</button>
                <button class="btn-team btn-danger-team" onclick="deleteTeam('${team.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Membro
function renderMemberCard(member) {
    const team = TeamState.teams.find(t => t.id === member.teamId);
    const role = TeamState.roles.find(r => r.id === member.roleId);
    const cssClass = member.status === 'active' ? 'active' : member.status === 'inactive' ? 'inactive' : 'pending';
    const performance = member.performance || 0;

    return `
        <div class="team-card ${cssClass}">
            <div class="team-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">👤 ${escapeHTML(member.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${team ? team.name : 'Equipe desconhecida'} • ${role ? role.name : 'Cargo desconhecido'} • ${member.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${performance}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Performance</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(member.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Cargo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${role ? role.name : 'N/A'}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Departamento:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${member.department || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Admissão:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(member.hireDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Última Avaliação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${member.lastEvaluation ? new Date(member.lastEvaluation).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-team btn-primary-team" onclick="editMember('${member.id}')">✏️ Editar</button>
                <button class="btn-team btn-success-team" onclick="updateMemberStatus('${member.id}')">✅ Status</button>
                <button class="btn-team btn-warning-team" onclick="updateMemberPerformance('${member.id}')">📊 Performance</button>
                <button class="btn-team btn-danger-team" onclick="deleteMember('${member.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Cargo
function renderRoleCard(role) {
    const team = TeamState.teams.find(t => t.id === role.teamId);
    const cssClass = role.status === 'active' ? 'active' : role.status === 'inactive' ? 'inactive' : 'pending';

    return `
        <div class="team-card ${cssClass}">
            <div class="team-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 ${escapeHTML(role.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${team ? team.name : 'Equipe desconhecida'} • ${role.type} • ${role.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">R$ ${role.salary || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Salário</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(role.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${role.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Nível:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${role.level || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(role.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Última Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(role.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-team btn-primary-team" onclick="editRole('${role.id}')">✏️ Editar</button>
                <button class="btn-team btn-success-team" onclick="updateRoleStatus('${role.id}')">✅ Status</button>
                <button class="btn-team btn-warning-team" onclick="updateRoleSalary('${role.id}')">💰 Salário</button>
                <button class="btn-team btn-danger-team" onclick="deleteRole('${role.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Performance
function renderPerformanceCard(performance) {
    const member = TeamState.members.find(m => m.id === performance.memberId);
    const team = TeamState.teams.find(t => t.id === performance.teamId);
    const cssClass = performance.status === 'completed' ? 'active' : performance.status === 'pending' ? 'pending' : 'inactive';

    return `
        <div class="team-card ${cssClass}">
            <div class="team-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 ${escapeHTML(performance.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${member ? member.name : 'Membro desconhecido'} • ${team ? team.name : 'Equipe desconhecida'} • ${performance.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${performance.score || 0}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Pontuação</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(performance.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${performance.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Objetivo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${performance.target || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Avaliação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(performance.evaluationDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Próxima Avaliação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(performance.nextEvaluationDate).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-team btn-primary-team" onclick="editPerformance('${performance.id}')">✏️ Editar</button>
                <button class="btn-team btn-success-team" onclick="updatePerformanceStatus('${performance.id}')">✅ Status</button>
                <button class="btn-team btn-warning-team" onclick="updatePerformanceScore('${performance.id}')">📊 Pontuação</button>
                <button class="btn-team btn-danger-team" onclick="deletePerformance('${performance.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchTeamTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-team').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.team-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`team-${tabName}`).classList.add('active');
}

// Funções de Equipes
function showNewTeamForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">👥 Nova Equipe</h4>
            <form id="newTeamForm" onsubmit="saveTeam(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Equipe *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da equipe..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Operacional">Operacional</option>
                            <option value="Administrativo">Administrativo</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Tecnologia">Tecnologia</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Departamento</label>
                        <input type="text" class="form-input" name="department" placeholder="Departamento da equipe">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Líder</label>
                        <input type="text" class="form-input" name="leader" placeholder="Líder da equipe">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tamanho</label>
                        <input type="number" class="form-input" name="size" min="0" step="1">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Equipe', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Equipe', class: 'btn-primary', onclick: "document.getElementById('newTeamForm').requestSubmit()" }
    ]);
}

function saveTeam(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const team = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Operacional',
        department: formData.get('department') || '',
        leader: formData.get('leader') || '',
        size: parseInt(formData.get('size')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TeamState.teams.push(team);
    AppState.teams = TeamState.teams;
    saveToStorage(STORAGE_KEYS.TEAMS, AppState.teams);

    closeModal();
    renderTeamDashboard();
    showNotification(`Equipe "${team.name}" criada com sucesso!`, 'success');
}

// Funções de Membros
function showNewMemberForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">👤 Novo Membro</h4>
            <form id="newMemberForm" onsubmit="saveMember(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Membro *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do membro..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Equipe</label>
                        <select class="form-select" name="teamId">
                            ${TeamState.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cargo</label>
                        <select class="form-select" name="roleId">
                            ${TeamState.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Departamento</label>
                        <input type="text" class="form-input" name="department" placeholder="Departamento do membro">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data de Admissão</label>
                        <input type="date" class="form-input" name="hireDate">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Performance (%)</label>
                    <input type="number" class="form-input" name="performance" min="0" max="100" step="1">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Membro', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Membro', class: 'btn-primary', onclick: "document.getElementById('newMemberForm').requestSubmit()" }
    ]);
}

function saveMember(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const member = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        teamId: formData.get('teamId'),
        roleId: formData.get('roleId'),
        department: formData.get('department') || '',
        hireDate: formData.get('hireDate'),
        performance: parseInt(formData.get('performance')) || 0,
        status: 'pending',
        lastEvaluation: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TeamState.members.push(member);
    AppState.members = TeamState.members;
    saveToStorage(STORAGE_KEYS.MEMBERS, AppState.members);

    closeModal();
    renderTeamDashboard();
    showNotification(`Membro "${member.name}" criado com sucesso!`, 'success');
}

// Funções de Cargos
function showNewRoleForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎯 Novo Cargo</h4>
            <form id="newRoleForm" onsubmit="saveRole(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Cargo *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do cargo..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Equipe</label>
                        <select class="form-select" name="teamId">
                            ${TeamState.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Operacional">Operacional</option>
                            <option value="Administrativo">Administrativo</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Tecnologia">Tecnologia</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nível</label>
                        <input type="text" class="form-input" name="level" placeholder="Nível do cargo">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Salário (R$)</label>
                        <input type="number" class="form-input" name="salary" min="0" step="0.01">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Cargo', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Cargo', class: 'btn-primary', onclick: "document.getElementById('newRoleForm').requestSubmit()" }
    ]);
}

function saveRole(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const role = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        teamId: formData.get('teamId'),
        type: formData.get('type') || 'Operacional',
        level: formData.get('level') || '',
        salary: parseFloat(formData.get('salary')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TeamState.roles.push(role);
    AppState.roles = TeamState.roles;
    saveToStorage(STORAGE_KEYS.ROLES, AppState.roles);

    closeModal();
    renderTeamDashboard();
    showNotification(`Cargo "${role.name}" criado com sucesso!`, 'success');
}

// Funções de Performance
function showNewPerformanceForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📊 Nova Avaliação</h4>
            <form id="newPerformanceForm" onsubmit="savePerformance(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Avaliação *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da avaliação..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Membro</label>
                        <select class="form-select" name="memberId">
                            ${TeamState.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Equipe</label>
                        <select class="form-select" name="teamId">
                            ${TeamState.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Mensal">Mensal</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Semestral">Semestral</option>
                            <option value="Anual">Anual</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Objetivo</label>
                        <input type="text" class="form-input" name="target" placeholder="Objetivo da avaliação">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data de Avaliação</label>
                        <input type="date" class="form-input" name="evaluationDate">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Próxima Avaliação</label>
                        <input type="date" class="form-input" name="nextEvaluationDate">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Pontuação (%)</label>
                    <input type="number" class="form-input" name="score" min="0" max="100" step="1">
                </div>
            </form>
        </div>
    `;

    openModal('Nova Avaliação', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Avaliação', class: 'btn-primary', onclick: "document.getElementById('newPerformanceForm').requestSubmit()" }
    ]);
}

function savePerformance(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const performance = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        memberId: formData.get('memberId'),
        teamId: formData.get('teamId'),
        type: formData.get('type') || 'Mensal',
        target: formData.get('target') || '',
        evaluationDate: formData.get('evaluationDate'),
        nextEvaluationDate: formData.get('nextEvaluationDate'),
        score: parseInt(formData.get('score')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TeamState.performance.push(performance);
    AppState.performance = TeamState.performance;
    saveToStorage(STORAGE_KEYS.PERFORMANCE, AppState.performance);

    closeModal();
    renderTeamDashboard();
    showNotification(`Avaliação "${performance.name}" criada com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateTeamStats() {
    const totalTeams = TeamState.teams.length;
    const activeMembers = TeamState.members.filter(m => m.status === 'active').length;
    const inactiveMembers = TeamState.members.filter(m => m.status === 'inactive').length;
    const avgPerformance = TeamState.performance.length > 0 ?
        Math.round(TeamState.performance.reduce((sum, p) => sum + (p.score || 0), 0) / TeamState.performance.length) : 0;

    return {
        totalTeams,
        activeMembers,
        inactiveMembers,
        avgPerformance
    };
}

function getTeamColor(performance) {
    if (performance >= 90) return '#10b981';
    if (performance >= 70) return '#3b82f6';
    if (performance >= 50) return '#f59e0b';
    return '#ef4444';
}

function getMemberColor(status) {
    if (status === 'active') return '#10b981';
    if (status === 'inactive') return '#ef4444';
    return '#f59e0b';
}

function calculateTeamPerformance(teamId) {
    const members = TeamState.members.filter(m => m.teamId === teamId);
    if (members.length === 0) return 0;

    const totalPerformance = members.reduce((sum, member) => sum + (member.performance || 0), 0);
    return Math.round(totalPerformance / members.length);
}

function calculateAverageTrainingTime() {
    const trainingRecords = TeamState.training.filter(t => t.status === 'completed');
    if (trainingRecords.length === 0) return 0;

    const totalDays = trainingRecords.reduce((sum, t) => {
        const started = new Date(t.startedAt);
        const completed = new Date(t.completedAt);
        return sum + Math.ceil((completed - started) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / trainingRecords.length);
}

function calculateTeamSatisfaction() {
    const avgPerformance = TeamState.performance.length > 0 ?
        Math.round(TeamState.performance.reduce((sum, p) => sum + (p.score || 0), 0) / TeamState.performance.length) : 0;
    return Math.max(0, 100 - avgPerformance);
}

function filterTeams(status) {
    const filteredTeams = status === 'all' ?
        TeamState.teams :
        TeamState.teams.filter(t => t.status === status);

    const teamsList = document.getElementById('teamsList');
    teamsList.innerHTML = filteredTeams.map(renderTeamCard).join('');
}

function exportTeams() {
    const csvContent = [
        ['Equipe', 'Status', 'Performance', 'Tipo', 'Departamento', 'Líder', 'Tamanho', 'Data Criação'],
        ...TeamState.teams.map(t => [
            t.name, t.status, `${calculateTeamPerformance(t.id)}%`, t.type, t.department, t.leader, t.size,
            new Date(t.createdAt).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('equipes.csv', csvContent, 'text/csv');
    showNotification('Equipes exportadas com sucesso!', 'success');
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
function setupTeamEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('teamUpdated', () => {
        TeamState.teams = AppState.teams;
        TeamState.members = AppState.members;
        TeamState.roles = AppState.roles;
        TeamState.permissions = AppState.permissions;
        TeamState.schedules = AppState.schedules;
        TeamState.performance = AppState.performance;
        TeamState.training = AppState.training;
        TeamState.communications = AppState.communications;
        renderTeamDashboard();
    });
}

// Exportar funções globais
window.initTeamManagementModule = initTeamManagementModule;
window.renderTeamDashboard = renderTeamDashboard;
window.setupTeamEvents = setupTeamEvents;
window.switchTeamTab = switchTeamTab;
window.showNewTeamForm = showNewTeamForm;
window.saveTeam = saveTeam;
window.showNewMemberForm = showNewMemberForm;
window.saveMember = saveMember;
window.showNewRoleForm = showNewRoleForm;
window.saveRole = saveRole;
window.showNewPerformanceForm = showNewPerformanceForm;
window.savePerformance = savePerformance;
window.calculateTeamStats = calculateTeamStats;
window.getTeamColor = getTeamColor;
window.getMemberColor = getMemberColor;
window.calculateTeamPerformance = calculateTeamPerformance;
window.calculateAverageTrainingTime = calculateAverageTrainingTime;
window.calculateTeamSatisfaction = calculateTeamSatisfaction;
window.filterTeams = filterTeams;
window.exportTeams = exportTeams;
window.downloadFile = downloadFile;