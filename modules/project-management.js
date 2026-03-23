// Gestão de Projetos - CRM Odonto Company
// =============================================

const ProjectState = {
    projects: [],
    tasks: [],
    milestones: [],
    resources: [],
    timelines: [],
    budgets: [],
    risks: []
};

// Inicializar Módulo de Gestão de Projetos
function initProjectManagementModule() {
    ProjectState.projects = AppState.projects || [];
    ProjectState.tasks = AppState.tasks || [];
    ProjectState.milestones = AppState.milestones || [];
    ProjectState.resources = AppState.resources || [];
    ProjectState.timelines = AppState.timelines || [];
    ProjectState.budgets = AppState.budgets || [];
    ProjectState.risks = AppState.risks || [];
    renderProjectDashboard();
    setupProjectEvents();
    loadProjectData();
}

// Renderizar Dashboard de Gestão de Projetos
function renderProjectDashboard() {
    const container = document.getElementById('projectContent');
    if (!container) return;

    const stats = calculateProjectStats();

    container.innerHTML = `
        <style>
            .project-header {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .project-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .project-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .project-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .project-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .project-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .project-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .project-card.active {
                border-color: #3b82f6;
                background: linear-gradient(135deg, #e0f2fe, #dbeafe);
            }

            .project-card.completed {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .project-card.delayed {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .project-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .project-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .project-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .project-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .project-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .project-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #e0f2fe; color: #0c4a6e; }
            .status-completed { background: #f0fdf4; color: #065f46; }
            .status-delayed { background: #fee2e2; color: #991b1b; }
            .status-pending { background: #fffbeb; color: #92400e; }

            .task-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .task-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }

            .task-item.completed {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .task-item.delayed {
                border-left-color: #ef4444;
                background: #fee2e2;
            }

            .task-item.pending {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .task-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .task-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .task-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-projects {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-projects {
                height: 100%;
                background: linear-gradient(90deg, #06b6d4, #3b82f6);
                transition: width 0.3s ease;
            }

            .milestone-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .milestone-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .milestone-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .milestone-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .project-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-projects {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-projects:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-projects {
                background: #06b6d4;
                color: white;
                border-color: #06b6d4;
            }

            .btn-primary-projects:hover {
                background: #0891b2;
            }

            .btn-success-projects {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-projects:hover {
                background: #059669;
            }

            .btn-warning-projects {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-projects:hover {
                background: #d97706;
            }

            .btn-danger-projects {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-projects:hover {
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

        <!-- Header de Projetos -->
        <div class="project-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">📋 Gestão de Projetos</h2>
                    <p style="margin: 0; opacity: 0.9;">Planejamento, execução e controle de projetos</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-projects" onclick="showNewProjectForm()">➕ Novo Projeto</button>
                    <button class="btn-success-projects" onclick="showNewTaskForm()">✅ Nova Tarefa</button>
                    <button class="btn-warning-projects" onclick="showNewMilestoneForm()">🎯 Novo Marco</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="project-stats-grid">
            <div class="project-stat-card">
                <div class="project-stat-value">${stats.totalProjects}</div>
                <div class="project-stat-label">Projetos</div>
            </div>

            <div class="project-stat-card">
                <div class="project-stat-value" style="color: #3b82f6;">${stats.activeProjects}</div>
                <div class="project-stat-label">Em Andamento</div>
            </div>

            <div class="project-stat-card">
                <div class="project-stat-value" style="color: #10b981;">${stats.completedProjects}</div>
                <div class="project-stat-label">Concluídos</div>
            </div>

            <div class="project-stat-card">
                <div class="project-stat-value" style="color: #ef4444;">${stats.delayedProjects}</div>
                <div class="project-stat-label">Atrasados</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="project-controls">
            <button class="btn-primary-projects active" onclick="switchProjectTab('projects')" id="tab-projects">
                📋 Projetos
            </button>
            <button class="btn-primary-projects" onclick="switchProjectTab('tasks')" id="tab-tasks">
                ✅ Tarefas
            </button>
            <button class="btn-primary-projects" onclick="switchProjectTab('milestones')" id="tab-milestones">
                🎯 Marcos
            </button>
            <button class="btn-primary-projects" onclick="switchProjectTab('resources')" id="tab-resources">
                🏗️ Recursos
            </button>
            <button class="btn-primary-projects" onclick="switchProjectTab('analytics')" id="tab-analytics">
                📊 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="project-projects" class="project-content active">
            ${renderProjectsTab()}
        </div>

        <div id="project-tasks" class="project-content">
            ${renderTasksTab()}
        </div>

        <div id="project-milestones" class="project-content">
            ${renderMilestonesTab()}
        </div>

        <div id="project-resources" class="project-content">
            ${renderResourcesTab()}
        </div>

        <div id="project-analytics" class="project-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Projetos
function renderProjectsTab() {
    return `
        <div class="project-card">
            <div class="project-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📋 Lista de Projetos</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="projectFilter" onchange="filterProjects(this.value)">
                        <option value="all">Todos</option>
                        <option value="active">Em Andamento</option>
                        <option value="completed">Concluídos</option>
                        <option value="delayed">Atrasados</option>
                        <option value="pending">Pendentes</option>
                    </select>
                    <button class="btn-primary-projects" onclick="exportProjects()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="projectsList" style="display: grid; gap: 1rem;">
                ${ProjectState.projects.map(renderProjectCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Tarefas
function renderTasksTab() {
    return `
        <div class="project-card">
            <div class="project-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">✅ Gestão de Tarefas</h3>
                <button class="btn-success-projects" onclick="showNewTaskForm()">➕ Nova Tarefa</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${ProjectState.tasks.map(renderTaskCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Marcos
function renderMilestonesTab() {
    return `
        <div class="project-card">
            <div class="project-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 Gestão de Marcos</h3>
                <button class="btn-warning-projects" onclick="showNewMilestoneForm()">➕ Novo Marco</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${ProjectState.milestones.map(renderMilestoneCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Recursos
function renderResourcesTab() {
    return `
        <div class="project-card">
            <div class="project-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🏗️ Gestão de Recursos</h3>
                <button class="btn-primary-projects" onclick="showNewResourceForm()">➕ Novo Recurso</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${ProjectState.resources.map(renderResourceCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="project-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Analytics de Projetos</h3>
                <button class="btn-success-projects" onclick="generateProjectReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Projetos Concluídos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${ProjectState.projects.filter(p => p.status === 'completed').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Tarefas Concluídas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${ProjectState.tasks.filter(t => t.status === 'completed').length}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📈 Métricas</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Tempo Médio</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Conclusão</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateAverageProjectTime()} dias
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Satisfação</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Projetos</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateProjectSatisfaction()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Projeto
function renderProjectCard(project) {
    const cssClass = project.status === 'completed' ? 'completed' : project.status === 'active' ? 'active' : 'delayed';
    const statusClass = `status-${project.status}`;
    const tasks = ProjectState.tasks.filter(t => t.projectId === project.id);
    const milestones = ProjectState.milestones.filter(m => m.projectId === project.id);
    const progress = calculateProjectProgress(project.id);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    return `
        <div class="project-card ${cssClass}">
            <div class="project-header-info">
                <div class="project-info">
                    <div class="project-icon">📋</div>
                    <div class="project-details">
                        <h4>${escapeHTML(project.name)}</h4>
                        <p>${escapeHTML(project.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${project.type} • ${project.priority} • ${new Date(project.endDate).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="project-status ${statusClass}">${project.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${progress}%</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tarefas do Projeto:</div>
                <div class="task-list">
                    ${tasks.slice(0, 4).map(task => `
                        <div class="task-item ${task.status}">
                            <div class="task-info">
                                <h6>${escapeHTML(task.name)}</h6>
                                <p>${task.priority} • ${task.status}</p>
                            </div>
                            <div class="task-value" style="color: ${getTaskColor(task.status)};">
                                ${task.assignedTo || 'N/A'}
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhuma tarefa</div>'}
                </div>
            </div>

            <div class="progress-bar-projects">
                <div class="progress-fill-projects" style="width: ${progress}%; background: ${getProjectColor(progress)};"></div>
            </div>

            <div class="project-actions">
                <button class="btn-projects btn-primary-projects" onclick="viewProjectDetails('${project.id}')">👁️ Detalhes</button>
                <button class="btn-projects btn-success-projects" onclick="addTaskToProject('${project.id}')">✅ Tarefa</button>
                <button class="btn-projects btn-warning-projects" onclick="updateProjectProgress('${project.id}')">📊 Progresso</button>
                <button class="btn-projects btn-danger-projects" onclick="deleteProject('${project.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Tarefa
function renderTaskCard(task) {
    const project = ProjectState.projects.find(p => p.id === task.projectId);
    const cssClass = task.status === 'completed' ? 'completed' : task.status === 'in_progress' ? 'active' : 'delayed';
    const progress = task.progress || 0;

    return `
        <div class="project-card ${cssClass}">
            <div class="project-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">✅ ${escapeHTML(task.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${project ? project.name : 'Projeto desconhecido'} • ${task.priority} • ${task.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${progress}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Progresso</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(task.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Responsável:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${task.assignedTo || 'N/A'}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Prazo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(task.dueDate).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-projects btn-primary-projects" onclick="editTask('${task.id}')">✏️ Editar</button>
                <button class="btn-projects btn-success-projects" onclick="updateTaskProgress('${task.id}')">📊 Progresso</button>
                <button class="btn-projects btn-warning-projects" onclick="assignTask('${task.id}')">👤 Atribuir</button>
                <button class="btn-projects btn-danger-projects" onclick="deleteTask('${task.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Marco
function renderMilestoneCard(milestone) {
    const project = ProjectState.projects.find(p => p.id === milestone.projectId);
    const cssClass = milestone.status === 'completed' ? 'completed' : milestone.status === 'in_progress' ? 'active' : 'delayed';

    return `
        <div class="project-card ${cssClass}">
            <div class="project-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 ${escapeHTML(milestone.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${project ? project.name : 'Projeto desconhecido'} • ${milestone.type} • ${milestone.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${milestone.targetDate ? new Date(milestone.targetDate).toLocaleDateString('pt-BR') : 'N/A'}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Data Alvo</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(milestone.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Orçamento:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">R$ ${milestone.budget || 0}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Responsável:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${milestone.responsible || 'N/A'}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-projects btn-primary-projects" onclick="editMilestone('${milestone.id}')">✏️ Editar</button>
                <button class="btn-projects btn-success-projects" onclick="updateMilestoneStatus('${milestone.id}')">✅ Status</button>
                <button class="btn-projects btn-warning-projects" onclick="updateMilestoneDate('${milestone.id}')">📅 Data</button>
                <button class="btn-projects btn-danger-projects" onclick="deleteMilestone('${milestone.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Recurso
function renderResourceCard(resource) {
    return `
        <div class="project-card">
            <div class="project-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🏗️ ${escapeHTML(resource.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${resource.type} • ${resource.category} • ${resource.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${resource.quantity || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Quantidade</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(resource.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Custo Unitário:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">R$ ${resource.unitCost || 0}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Disponibilidade:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${resource.availability || 'N/A'}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-projects btn-primary-projects" onclick="editResource('${resource.id}')">✏️ Editar</button>
                <button class="btn-projects btn-success-projects" onclick="updateResourceQuantity('${resource.id}')">📊 Quantidade</button>
                <button class="btn-projects btn-warning-projects" onclick="assignResource('${resource.id}')">🔗 Atribuir</button>
                <button class="btn-projects btn-danger-projects" onclick="deleteResource('${resource.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchProjectTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-projects').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.project-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`project-${tabName}`).classList.add('active');
}

// Funções de Projetos
function showNewProjectForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📋 Novo Projeto</h4>
            <form id="newProjectForm" onsubmit="saveProject(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Projeto *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do projeto..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Clínico">Clínico</option>
                            <option value="Administrativo">Administrativo</option>
                            <option value="Técnico">Técnico</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Infraestrutura">Infraestrutura</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Prioridade</label>
                        <select class="form-select" name="priority">
                            <option value="Alta">Alta</option>
                            <option value="Média">Média</option>
                            <option value="Baixa">Baixa</option>
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
                
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status">
                        <option value="pending">Pendente</option>
                        <option value="active">Em Andamento</option>
                        <option value="completed">Concluído</option>
                        <option value="delayed">Atrasado</option>
                    </select>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Projeto', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Projeto', class: 'btn-primary', onclick: "document.getElementById('newProjectForm').requestSubmit()" }
    ]);
}

function saveProject(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const project = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Administrativo',
        priority: formData.get('priority') || 'Média',
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: formData.get('status') || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ProjectState.projects.push(project);
    AppState.projects = ProjectState.projects;
    saveToStorage(STORAGE_KEYS.PROJECTS, AppState.projects);

    closeModal();
    renderProjectDashboard();
    showNotification(`Projeto "${project.name}" criado com sucesso!`, 'success');
}

// Funções de Tarefas
function showNewTaskForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">✅ Nova Tarefa</h4>
            <form id="newTaskForm" onsubmit="saveTask(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Tarefa *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da tarefa..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Projeto</label>
                        <select class="form-select" name="projectId">
                            ${ProjectState.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Prioridade</label>
                        <select class="form-select" name="priority">
                            <option value="Alta">Alta</option>
                            <option value="Média">Média</option>
                            <option value="Baixa">Baixa</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data de Vencimento</label>
                        <input type="date" class="form-input" name="dueDate">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Responsável</label>
                        <input type="text" class="form-input" name="assignedTo" placeholder="Responsável pela tarefa">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-select" name="status">
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="completed">Concluída</option>
                    </select>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Tarefa', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Tarefa', class: 'btn-primary', onclick: "document.getElementById('newTaskForm').requestSubmit()" }
    ]);
}

function saveTask(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const task = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        projectId: formData.get('projectId'),
        priority: formData.get('priority') || 'Média',
        dueDate: formData.get('dueDate'),
        assignedTo: formData.get('assignedTo') || '',
        status: formData.get('status') || 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ProjectState.tasks.push(task);
    AppState.tasks = ProjectState.tasks;
    saveToStorage(STORAGE_KEYS.TASKS, AppState.tasks);

    closeModal();
    renderProjectDashboard();
    showNotification(`Tarefa "${task.name}" criada com sucesso!`, 'success');
}

// Funções de Marcos
function showNewMilestoneForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎯 Novo Marco</h4>
            <form id="newMilestoneForm" onsubmit="saveMilestone(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Marco *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do marco..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Projeto</label>
                        <select class="form-select" name="projectId">
                            ${ProjectState.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Entrega">Entrega</option>
                            <option value="Aprovação">Aprovação</option>
                            <option value="Revisão">Revisão</option>
                            <option value="Teste">Teste</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data Alvo</label>
                        <input type="date" class="form-input" name="targetDate">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Orçamento</label>
                        <input type="number" class="form-input" name="budget" min="0" step="0.01">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Responsável</label>
                    <input type="text" class="form-input" name="responsible" placeholder="Responsável pelo marco">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Marco', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Marco', class: 'btn-primary', onclick: "document.getElementById('newMilestoneForm').requestSubmit()" }
    ]);
}

function saveMilestone(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const milestone = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        projectId: formData.get('projectId'),
        type: formData.get('type') || 'Entrega',
        targetDate: formData.get('targetDate'),
        budget: parseFloat(formData.get('budget')) || 0,
        responsible: formData.get('responsible') || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ProjectState.milestones.push(milestone);
    AppState.milestones = ProjectState.milestones;
    saveToStorage(STORAGE_KEYS.MILESTONES, AppState.milestones);

    closeModal();
    renderProjectDashboard();
    showNotification(`Marco "${milestone.name}" criado com sucesso!`, 'success');
}

// Funções de Recursos
function showNewResourceForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🏗️ Novo Recurso</h4>
            <form id="newResourceForm" onsubmit="saveResource(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Recurso *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do recurso..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Humano">Humano</option>
                            <option value="Financeiro">Financeiro</option>
                            <option value="Material">Material</option>
                            <option value="Tecnológico">Tecnológico</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria do recurso">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Quantidade</label>
                        <input type="number" class="form-input" name="quantity" min="0">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Custo Unitário</label>
                        <input type="number" class="form-input" name="unitCost" min="0" step="0.01">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Disponibilidade</label>
                    <input type="text" class="form-input" name="availability" placeholder="Disponibilidade do recurso">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Recurso', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Recurso', class: 'btn-primary', onclick: "document.getElementById('newResourceForm').requestSubmit()" }
    ]);
}

function saveResource(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const resource = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Humano',
        category: formData.get('category') || '',
        quantity: parseInt(formData.get('quantity')) || 0,
        unitCost: parseFloat(formData.get('unitCost')) || 0,
        availability: formData.get('availability') || '',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ProjectState.resources.push(resource);
    AppState.resources = ProjectState.resources;
    saveToStorage(STORAGE_KEYS.RESOURCES, AppState.resources);

    closeModal();
    renderProjectDashboard();
    showNotification(`Recurso "${resource.name}" criado com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateProjectStats() {
    const totalProjects = ProjectState.projects.length;
    const activeProjects = ProjectState.projects.filter(p => p.status === 'active').length;
    const completedProjects = ProjectState.projects.filter(p => p.status === 'completed').length;
    const delayedProjects = ProjectState.projects.filter(p => p.status === 'delayed').length;

    return {
        totalProjects,
        activeProjects,
        completedProjects,
        delayedProjects
    };
}

function getProjectColor(progress) {
    if (progress >= 100) return '#10b981';
    if (progress >= 70) return '#3b82f6';
    if (progress >= 30) return '#f59e0b';
    return '#ef4444';
}

function getTaskColor(status) {
    if (status === 'completed') return '#10b981';
    if (status === 'in_progress') return '#3b82f6';
    return '#ef4444';
}

function calculateProjectProgress(projectId) {
    const tasks = ProjectState.tasks.filter(t => t.projectId === projectId);
    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    return Math.round(totalProgress / tasks.length);
}

function calculateAverageProjectTime() {
    const completedProjects = ProjectState.projects.filter(p => p.status === 'completed');
    if (completedProjects.length === 0) return 0;

    const totalDays = completedProjects.reduce((sum, p) => {
        const startDate = new Date(p.startDate);
        const endDate = new Date(p.endDate);
        return sum + Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / completedProjects.length);
}

function calculateProjectSatisfaction() {
    const avgProgress = ProjectState.projects.length > 0 ?
        Math.round(ProjectState.projects.reduce((sum, p) => sum + calculateProjectProgress(p.id), 0) / ProjectState.projects.length) : 0;
    return avgProgress;
}

function filterProjects(status) {
    const filteredProjects = status === 'all' ?
        ProjectState.projects :
        ProjectState.projects.filter(p => p.status === status);

    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = filteredProjects.map(renderProjectCard).join('');
}

function exportProjects() {
    const csvContent = [
        ['Projeto', 'Status', 'Progresso', 'Tipo', 'Prioridade', 'Data Início', 'Data Término'],
        ...ProjectState.projects.map(p => [
            p.name, p.status, `${calculateProjectProgress(p.id)}%`, p.type, p.priority,
            p.startDate ? new Date(p.startDate).toLocaleDateString('pt-BR') : '',
            p.endDate ? new Date(p.endDate).toLocaleDateString('pt-BR') : ''
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('projetos.csv', csvContent, 'text/csv');
    showNotification('Projetos exportados com sucesso!', 'success');
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
function setupProjectEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('projectsUpdated', () => {
        ProjectState.projects = AppState.projects;
        ProjectState.tasks = AppState.tasks;
        ProjectState.milestones = AppState.milestones;
        ProjectState.resources = AppState.resources;
        ProjectState.timelines = AppState.timelines;
        ProjectState.budgets = AppState.budgets;
        ProjectState.risks = AppState.risks;
        renderProjectDashboard();
    });
}

// Exportar funções globais
window.initProjectManagementModule = initProjectManagementModule;
window.renderProjectDashboard = renderProjectDashboard;
window.setupProjectEvents = setupProjectEvents;
window.switchProjectTab = switchProjectTab;
window.showNewProjectForm = showNewProjectForm;
window.saveProject = saveProject;
window.showNewTaskForm = showNewTaskForm;
window.saveTask = saveTask;
window.showNewMilestoneForm = showNewMilestoneForm;
window.saveMilestone = saveMilestone;
window.showNewResourceForm = showNewResourceForm;
window.saveResource = saveResource;
window.calculateProjectStats = calculateProjectStats;
window.getProjectColor = getProjectColor;
window.getTaskColor = getTaskColor;
window.calculateProjectProgress = calculateProjectProgress;
window.calculateAverageProjectTime = calculateAverageProjectTime;
window.calculateProjectSatisfaction = calculateProjectSatisfaction;
window.filterProjects = filterProjects;
window.exportProjects = exportProjects;
window.downloadFile = downloadFile;