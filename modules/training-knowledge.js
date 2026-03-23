// Treinamento e Conhecimento - CRM Odonto Company
// =============================================

const TrainingState = {
    courses: [],
    modules: [],
    lessons: [],
    certifications: [],
    progress: [],
    assessments: [],
    resources: [],
    feedback: []
};

// Inicializar Módulo de Treinamento e Conhecimento
function initTrainingKnowledgeModule() {
    TrainingState.courses = AppState.courses || [];
    TrainingState.modules = AppState.modules || [];
    TrainingState.lessons = AppState.lessons || [];
    TrainingState.certifications = AppState.certifications || [];
    TrainingState.progress = AppState.progress || [];
    TrainingState.assessments = AppState.assessments || [];
    TrainingState.resources = AppState.resources || [];
    TrainingState.feedback = AppState.feedback || [];
    renderTrainingDashboard();
    setupTrainingEvents();
    loadTrainingData();
}

// Renderizar Dashboard de Treinamento e Conhecimento
function renderTrainingDashboard() {
    const container = document.getElementById('trainingContent');
    if (!container) return;

    const stats = calculateTrainingStats();

    container.innerHTML = `
        <style>
            .training-header {
                background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .training-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .training-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .training-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .training-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .training-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .training-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .training-card.active {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .training-card.completed {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .training-card.pending {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .training-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .training-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .training-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #f59e0b, #ef4444);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .training-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .training-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .training-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #fffbeb; color: #92400e; }
            .status-completed { background: #f0fdf4; color: #065f46; }
            .status-pending { background: #fef2f2; color: #991b1b; }

            .module-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .module-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #f59e0b;
            }

            .module-item.active {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .module-item.completed {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .module-item.pending {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .module-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .module-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .module-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-training {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-training {
                height: 100%;
                background: linear-gradient(90deg, #f59e0b, #ef4444);
                transition: width 0.3s ease;
            }

            .lesson-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .lesson-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .lesson-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .lesson-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .training-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-training {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-training:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-training {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-primary-training:hover {
                background: #d97706;
            }

            .btn-success-training {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-training:hover {
                background: #059669;
            }

            .btn-warning-training {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-warning-training:hover {
                background: #2563eb;
            }

            .btn-danger-training {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-training:hover {
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

        <!-- Header de Treinamento -->
        <div class="training-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">🎓 Treinamento & Conhecimento</h2>
                    <p style="margin: 0; opacity: 0.9;">Desenvolvimento profissional e gestão de conhecimento</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-training" onclick="showNewCourseForm()">➕ Novo Curso</button>
                    <button class="btn-success-training" onclick="showNewModuleForm()">📚 Novo Módulo</button>
                    <button class="btn-warning-training" onclick="showNewLessonForm()">📖 Nova Aula</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="training-stats-grid">
            <div class="training-stat-card">
                <div class="training-stat-value">${stats.totalCourses}</div>
                <div class="training-stat-label">Cursos</div>
            </div>

            <div class="training-stat-card">
                <div class="training-stat-value" style="color: #10b981;">${stats.completedCourses}</div>
                <div class="training-stat-label">Concluídos</div>
            </div>

            <div class="training-stat-card">
                <div class="training-stat-value" style="color: #f59e0b;">${stats.activeCourses}</div>
                <div class="training-stat-label">Em Andamento</div>
            </div>

            <div class="training-stat-card">
                <div class="training-stat-value" style="color: #ef4444;">${stats.avgCompletion}%</div>
                <div class="training-stat-label">Média Conclusão</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="training-controls">
            <button class="btn-primary-training active" onclick="switchTrainingTab('courses')" id="tab-courses">
                🎓 Cursos
            </button>
            <button class="btn-primary-training" onclick="switchTrainingTab('modules')" id="tab-modules">
                📚 Módulos
            </button>
            <button class="btn-primary-training" onclick="switchTrainingTab('lessons')" id="tab-lessons">
                📖 Aulas
            </button>
            <button class="btn-primary-training" onclick="switchTrainingTab('progress')" id="tab-progress">
                📊 Progresso
            </button>
            <button class="btn-primary-training" onclick="switchTrainingTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="training-courses" class="training-content active">
            ${renderCoursesTab()}
        </div>

        <div id="training-modules" class="training-content">
            ${renderModulesTab()}
        </div>

        <div id="training-lessons" class="training-content">
            ${renderLessonsTab()}
        </div>

        <div id="training-progress" class="training-content">
            ${renderProgressTab()}
        </div>

        <div id="training-analytics" class="training-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Cursos
function renderCoursesTab() {
    return `
        <div class="training-card">
            <div class="training-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎓 Lista de Cursos</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="courseFilter" onchange="filterCourses(this.value)">
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="completed">Concluídos</option>
                        <option value="pending">Pendentes</option>
                    </select>
                    <button class="btn-primary-training" onclick="exportCourses()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="coursesList" style="display: grid; gap: 1rem;">
                ${TrainingState.courses.map(renderCourseCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Módulos
function renderModulesTab() {
    return `
        <div class="training-card">
            <div class="training-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📚 Gestão de Módulos</h3>
                <button class="btn-success-training" onclick="showNewModuleForm()">➕ Novo Módulo</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${TrainingState.modules.map(renderModuleCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Aulas
function renderLessonsTab() {
    return `
        <div class="training-card">
            <div class="training-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📖 Gestão de Aulas</h3>
                <button class="btn-warning-training" onclick="showNewLessonForm()">➕ Nova Aula</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${TrainingState.lessons.map(renderLessonCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Progresso
function renderProgressTab() {
    return `
        <div class="training-card">
            <div class="training-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Gestão de Progresso</h3>
                <button class="btn-primary-training" onclick="showNewProgressForm()">➕ Novo Progresso</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${TrainingState.progress.map(renderProgressCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="training-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Treinamento</h3>
                <button class="btn-success-training" onclick="generateTrainingReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Desempenho</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Cursos Concluídos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${TrainingState.courses.filter(c => c.status === 'completed').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Média de Notas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Avaliações</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateAverageScore()}
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
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Conclusão</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateAverageCompletionTime()} dias
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Satisfação</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Cursos</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateCourseSatisfaction()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Curso
function renderCourseCard(course) {
    const cssClass = course.status === 'completed' ? 'completed' : course.status === 'active' ? 'active' : 'pending';
    const statusClass = `status-${course.status}`;
    const modules = TrainingState.modules.filter(m => m.courseId === course.id);
    const lessons = TrainingState.lessons.filter(l => modules.some(m => m.id === l.moduleId));
    const progress = TrainingState.progress.filter(p => p.courseId === course.id);
    const activeModules = modules.filter(m => m.status === 'active').length;
    const completionRate = calculateCourseCompletion(course.id);

    return `
        <div class="training-card ${cssClass}">
            <div class="training-header-info">
                <div class="training-info">
                    <div class="training-icon">🎓</div>
                    <div class="training-details">
                        <h4>${escapeHTML(course.name)}</h4>
                        <p>${escapeHTML(course.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${course.category} • ${course.level} • ${course.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="training-status ${statusClass}">${course.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${completionRate}%</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Módulos do Curso:</div>
                <div class="module-list">
                    ${modules.slice(0, 4).map(module => `
                        <div class="module-item ${module.status}">
                            <div class="module-info">
                                <h6>${escapeHTML(module.name)}</h6>
                                <p>${module.type} • ${module.status}</p>
                            </div>
                            <div class="module-value" style="color: ${getModuleColor(module.status)};">
                                ${module.duration || 0}h
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhum módulo</div>'}
                </div>
            </div>

            <div class="lesson-grid">
                <div class="lesson-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">📚 Módulos</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Ativos:</span>
                            <span style="font-weight: 700;">${activeModules}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Aulas:</span>
                            <span style="font-weight: 700;">${lessons.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Progresso:</span>
                            <span style="font-weight: 700;">${progress.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="lesson-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Instrutor:</span>
                            <span style="font-weight: 700;">${course.instructor || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Início:</span>
                            <span style="font-weight: 700;">${new Date(course.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Data Fim:</span>
                            <span style="font-weight: 700;">${new Date(course.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-training">
                <div class="progress-fill-training" style="width: ${completionRate}%; background: ${getCourseColor(completionRate)};"></div>
            </div>

            <div class="training-actions">
                <button class="btn-training btn-primary-training" onclick="viewCourseDetails('${course.id}')">👁️ Detalhes</button>
                <button class="btn-training btn-success-training" onclick="addModuleToCourse('${course.id}')">📚 Módulo</button>
                <button class="btn-training btn-warning-training" onclick="updateCourseStatus('${course.id}')">✅ Status</button>
                <button class="btn-training btn-danger-training" onclick="deleteCourse('${course.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Módulo
function renderModuleCard(module) {
    const course = TrainingState.courses.find(c => c.id === module.courseId);
    const cssClass = module.status === 'completed' ? 'completed' : module.status === 'active' ? 'active' : 'pending';
    const lessons = TrainingState.lessons.filter(l => l.moduleId === module.id);
    const duration = module.duration || 0;

    return `
        <div class="training-card ${cssClass}">
            <div class="training-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📚 ${escapeHTML(module.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${course ? course.name : 'Curso desconhecido'} • ${module.type} • ${module.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${duration}h</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Duração</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(module.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${module.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Nível:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${module.level || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(module.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(module.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-training btn-primary-training" onclick="editModule('${module.id}')">✏️ Editar</button>
                <button class="btn-training btn-success-training" onclick="updateModuleStatus('${module.id}')">✅ Status</button>
                <button class="btn-training btn-warning-training" onclick="updateModuleDuration('${module.id}')">⏰ Duração</button>
                <button class="btn-training btn-danger-training" onclick="deleteModule('${module.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Aula
function renderLessonCard(lesson) {
    const module = TrainingState.modules.find(m => m.id === lesson.moduleId);
    const course = TrainingState.courses.find(c => c.id === module.courseId);
    const cssClass = lesson.status === 'completed' ? 'completed' : lesson.status === 'active' ? 'active' : 'pending';

    return `
        <div class="training-card ${cssClass}">
            <div class="training-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📖 ${escapeHTML(lesson.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${course ? course.name : 'Curso desconhecido'} • ${module ? module.name : 'Módulo desconhecido'} • ${lesson.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${lesson.duration || 0}min</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Duração</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(lesson.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${lesson.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Formato:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${lesson.format || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(lesson.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(lesson.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-training btn-primary-training" onclick="editLesson('${lesson.id}')">✏️ Editar</button>
                <button class="btn-training btn-success-training" onclick="updateLessonStatus('${lesson.id}')">✅ Status</button>
                <button class="btn-training btn-warning-training" onclick="updateLessonDuration('${lesson.id}')">⏰ Duração</button>
                <button class="btn-training btn-danger-training" onclick="deleteLesson('${lesson.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Progresso
function renderProgressCard(progress) {
    const course = TrainingState.courses.find(c => c.id === progress.courseId);
    const module = TrainingState.modules.find(m => m.id === progress.moduleId);
    const cssClass = progress.status === 'completed' ? 'completed' : progress.status === 'active' ? 'active' : 'pending';

    return `
        <div class="training-card ${cssClass}">
            <div class="training-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 ${escapeHTML(progress.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${course ? course.name : 'Curso desconhecido'} • ${module ? module.name : 'Módulo desconhecido'} • ${progress.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${progress.completionRate || 0}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Conclusão</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(progress.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Progresso:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${progress.completionRate || 0}%</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tempo Gasto:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${progress.timeSpent || 0}h</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Início:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(progress.startedAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Conclusão:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${progress.completedAt ? new Date(progress.completedAt).toLocaleDateString('pt-BR') : 'N/A'}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-training btn-primary-training" onclick="editProgress('${progress.id}')">✏️ Editar</button>
                <button class="btn-training btn-success-training" onclick="updateProgressStatus('${progress.id}')">✅ Status</button>
                <button class="btn-training btn-warning-training" onclick="updateProgressRate('${progress.id}')">📊 Progresso</button>
                <button class="btn-training btn-danger-training" onclick="deleteProgress('${progress.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchTrainingTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-training').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.training-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`training-${tabName}`).classList.add('active');
}

// Funções de Cursos
function showNewCourseForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎓 Novo Curso</h4>
            <form id="newCourseForm" onsubmit="saveCourse(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Curso *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do curso..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <select class="form-select" name="category">
                            <option value="Técnico">Técnico</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Administrativo">Administrativo</option>
                            <option value="Gestão">Gestão</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Nível</label>
                        <select class="form-select" name="level">
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Instrutor</label>
                        <input type="text" class="form-input" name="instructor" placeholder="Instrutor do curso">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Duração (horas)</label>
                        <input type="number" class="form-input" name="duration" min="0" step="0.5">
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

    openModal('Novo Curso', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Curso', class: 'btn-primary', onclick: "document.getElementById('newCourseForm').requestSubmit()" }
    ]);
}

function saveCourse(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const course = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        category: formData.get('category') || 'Técnico',
        level: formData.get('level') || 'Iniciante',
        instructor: formData.get('instructor') || '',
        duration: parseFloat(formData.get('duration')) || 0,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TrainingState.courses.push(course);
    AppState.courses = TrainingState.courses;
    saveToStorage(STORAGE_KEYS.COURSES, AppState.courses);

    closeModal();
    renderTrainingDashboard();
    showNotification(`Curso "${course.name}" criado com sucesso!`, 'success');
}

// Funções de Módulos
function showNewModuleForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📚 Novo Módulo</h4>
            <form id="newModuleForm" onsubmit="saveModule(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Módulo *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do módulo..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Curso</label>
                        <select class="form-select" name="courseId">
                            ${TrainingState.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Teórico">Teórico</option>
                            <option value="Prático">Prático</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nível</label>
                        <select class="form-select" name="level">
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Duração (horas)</label>
                        <input type="number" class="form-input" name="duration" min="0" step="0.5">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Módulo', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Módulo', class: 'btn-primary', onclick: "document.getElementById('newModuleForm').requestSubmit()" }
    ]);
}

function saveModule(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const module = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        courseId: formData.get('courseId'),
        type: formData.get('type') || 'Teórico',
        level: formData.get('level') || 'Iniciante',
        duration: parseFloat(formData.get('duration')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TrainingState.modules.push(module);
    AppState.modules = TrainingState.modules;
    saveToStorage(STORAGE_KEYS.MODULES, AppState.modules);

    closeModal();
    renderTrainingDashboard();
    showNotification(`Módulo "${module.name}" criado com sucesso!`, 'success');
}

// Funções de Aulas
function showNewLessonForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📖 Nova Aula</h4>
            <form id="newLessonForm" onsubmit="saveLesson(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Aula *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da aula..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Módulo</label>
                        <select class="form-select" name="moduleId">
                            ${TrainingState.modules.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Videoaula">Videoaula</option>
                            <option value="Texto">Texto</option>
                            <option value="Quiz">Quiz</option>
                            <option value="Prática">Prática</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Formato</label>
                        <select class="form-select" name="format">
                            <option value="Online">Online</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Duração (minutos)</label>
                        <input type="number" class="form-input" name="duration" min="0" step="1">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Aula', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Aula', class: 'btn-primary', onclick: "document.getElementById('newLessonForm').requestSubmit()" }
    ]);
}

function saveLesson(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const lesson = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        moduleId: formData.get('moduleId'),
        type: formData.get('type') || 'Videoaula',
        format: formData.get('format') || 'Online',
        duration: parseInt(formData.get('duration')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TrainingState.lessons.push(lesson);
    AppState.lessons = TrainingState.lessons;
    saveToStorage(STORAGE_KEYS.LESSONS, AppState.lessons);

    closeModal();
    renderTrainingDashboard();
    showNotification(`Aula "${lesson.name}" criada com sucesso!`, 'success');
}

// Funções de Progresso
function showNewProgressForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📊 Novo Progresso</h4>
            <form id="newProgressForm" onsubmit="saveProgress(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Progresso *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do progresso..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Curso</label>
                        <select class="form-select" name="courseId">
                            ${TrainingState.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Módulo</label>
                        <select class="form-select" name="moduleId">
                            ${TrainingState.modules.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Taxa de Conclusão (%)</label>
                        <input type="number" class="form-input" name="completionRate" min="0" max="100" step="1">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tempo Gasto (horas)</label>
                        <input type="number" class="form-input" name="timeSpent" min="0" step="0.5">
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

    openModal('Novo Progresso', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Progresso', class: 'btn-primary', onclick: "document.getElementById('newProgressForm').requestSubmit()" }
    ]);
}

function saveProgress(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const progress = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        courseId: formData.get('courseId'),
        moduleId: formData.get('moduleId'),
        completionRate: parseInt(formData.get('completionRate')) || 0,
        timeSpent: parseFloat(formData.get('timeSpent')) || 0,
        startedAt: formData.get('startedAt'),
        completedAt: formData.get('completedAt'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    TrainingState.progress.push(progress);
    AppState.progress = TrainingState.progress;
    saveToStorage(STORAGE_KEYS.PROGRESS, AppState.progress);

    closeModal();
    renderTrainingDashboard();
    showNotification(`Progresso "${progress.name}" criado com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateTrainingStats() {
    const totalCourses = TrainingState.courses.length;
    const completedCourses = TrainingState.courses.filter(c => c.status === 'completed').length;
    const activeCourses = TrainingState.courses.filter(c => c.status === 'active').length;
    const avgCompletion = TrainingState.progress.length > 0 ?
        Math.round(TrainingState.progress.reduce((sum, p) => sum + (p.completionRate || 0), 0) / TrainingState.progress.length) : 0;

    return {
        totalCourses,
        completedCourses,
        activeCourses,
        avgCompletion
    };
}

function getCourseColor(completion) {
    if (completion >= 90) return '#10b981';
    if (completion >= 70) return '#3b82f6';
    if (completion >= 50) return '#f59e0b';
    return '#ef4444';
}

function getModuleColor(status) {
    if (status === 'completed') return '#10b981';
    if (status === 'active') return '#f59e0b';
    return '#ef4444';
}

function calculateCourseCompletion(courseId) {
    const modules = TrainingState.modules.filter(m => m.courseId === courseId);
    if (modules.length === 0) return 0;

    const completedModules = modules.filter(m => m.status === 'completed').length;
    return Math.round((completedModules / modules.length) * 100);
}

function calculateAverageScore() {
    const assessments = TrainingState.assessments.filter(a => a.status === 'completed');
    if (assessments.length === 0) return 0;

    const totalScore = assessments.reduce((sum, a) => sum + (a.score || 0), 0);
    return Math.round(totalScore / assessments.length);
}

function calculateAverageCompletionTime() {
    const completedCourses = TrainingState.courses.filter(c => c.status === 'completed');
    if (completedCourses.length === 0) return 0;

    const totalDays = completedCourses.reduce((sum, c) => {
        const started = new Date(c.startDate);
        const completed = new Date(c.endDate);
        return sum + Math.ceil((completed - started) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / completedCourses.length);
}

function calculateCourseSatisfaction() {
    const avgScore = TrainingState.assessments.length > 0 ?
        Math.round(TrainingState.assessments.reduce((sum, a) => sum + (a.score || 0), 0) / TrainingState.assessments.length) : 0;
    return Math.max(0, 100 - avgScore);
}

function filterCourses(status) {
    const filteredCourses = status === 'all' ?
        TrainingState.courses :
        TrainingState.courses.filter(c => c.status === status);

    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = filteredCourses.map(renderCourseCard).join('');
}

function exportCourses() {
    const csvContent = [
        ['Curso', 'Status', 'Conclusão', 'Categoria', 'Nível', 'Instrutor', 'Duração', 'Data Início', 'Data Fim'],
        ...TrainingState.courses.map(c => [
            c.name, c.status, `${calculateCourseCompletion(c.id)}%`, c.category, c.level, c.instructor, `${c.duration}h`,
            new Date(c.startDate).toLocaleDateString('pt-BR'),
            new Date(c.endDate).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('cursos.csv', csvContent, 'text/csv');
    showNotification('Cursos exportados com sucesso!', 'success');
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
function setupTrainingEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('trainingUpdated', () => {
        TrainingState.courses = AppState.courses;
        TrainingState.modules = AppState.modules;
        TrainingState.lessons = AppState.lessons;
        TrainingState.certifications = AppState.certifications;
        TrainingState.progress = AppState.progress;
        TrainingState.assessments = AppState.assessments;
        TrainingState.resources = AppState.resources;
        TrainingState.feedback = AppState.feedback;
        renderTrainingDashboard();
    });
}

// Exportar funções globais
window.initTrainingKnowledgeModule = initTrainingKnowledgeModule;
window.renderTrainingDashboard = renderTrainingDashboard;
window.setupTrainingEvents = setupTrainingEvents;
window.switchTrainingTab = switchTrainingTab;
window.showNewCourseForm = showNewCourseForm;
window.saveCourse = saveCourse;
window.showNewModuleForm = showNewModuleForm;
window.saveModule = saveModule;
window.showNewLessonForm = showNewLessonForm;
window.saveLesson = saveLesson;
window.showNewProgressForm = showNewProgressForm;
window.saveProgress = saveProgress;
window.calculateTrainingStats = calculateTrainingStats;
window.getCourseColor = getCourseColor;
window.getModuleColor = getModuleColor;
window.calculateCourseCompletion = calculateCourseCompletion;
window.calculateAverageScore = calculateAverageScore;
window.calculateAverageCompletionTime = calculateAverageCompletionTime;
window.calculateCourseSatisfaction = calculateCourseSatisfaction;
window.filterCourses = filterCourses;
window.exportCourses = exportCourses;
window.downloadFile = downloadFile;