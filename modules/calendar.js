// Calendário Avançado - CRM Odonto Company
// =============================================

const CalendarState = {
    events: [],
    schedules: [],
    reminders: [],
    holidays: [],
    workingHours: [],
    timeSlots: [],
    conflicts: [],
    availability: []
};

// Inicializar Módulo de Calendário Avançado
function initCalendarModule() {
    CalendarState.events = AppState.events || [];
    CalendarState.schedules = AppState.schedules || [];
    CalendarState.reminders = AppState.reminders || [];
    CalendarState.holidays = AppState.holidays || [];
    CalendarState.workingHours = AppState.workingHours || [];
    CalendarState.timeSlots = AppState.timeSlots || [];
    CalendarState.conflicts = AppState.conflicts || [];
    CalendarState.availability = AppState.availability || [];
    renderCalendarDashboard();
    setupCalendarEvents();
    loadCalendarData();
}

// Renderizar Dashboard de Calendário Avançado
function renderCalendarDashboard() {
    const container = document.getElementById('calendarContent');
    if (!container) return;

    const stats = calculateCalendarStats();

    container.innerHTML = `
        <style>
            .calendar-header {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .calendar-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .calendar-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .calendar-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .calendar-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .calendar-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .calendar-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .calendar-card.conflict {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .calendar-card.available {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .calendar-card.busy {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .calendar-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .calendar-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .calendar-icon {
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

            .calendar-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .calendar-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .calendar-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-conflict { background: #fee2e2; color: #991b1b; }
            .status-available { background: #f0fdf4; color: #065f46; }
            .status-busy { background: #fffbeb; color: #92400e; }

            .event-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .event-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #06b6d4;
            }

            .event-item.conflict {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .event-item.available {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .event-item.busy {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .event-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .event-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .event-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-calendar {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-calendar {
                height: 100%;
                background: linear-gradient(90deg, #06b6d4, #3b82f6);
                transition: width 0.3s ease;
            }

            .schedule-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .schedule-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .schedule-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .schedule-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .calendar-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-calendar {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-calendar:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-calendar {
                background: #06b6d4;
                color: white;
                border-color: #06b6d4;
            }

            .btn-primary-calendar:hover {
                background: #0891b2;
            }

            .btn-success-calendar {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-calendar:hover {
                background: #059669;
            }

            .btn-warning-calendar {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-calendar:hover {
                background: #d97706;
            }

            .btn-danger-calendar {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-calendar:hover {
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

        <!-- Header de Calendário -->
        <div class="calendar-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">📅 Calendário Avançado</h2>
                    <p style="margin: 0; opacity: 0.9;">Gestão de agenda, horários e disponibilidade</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-calendar" onclick="showNewEventForm()">➕ Novo Evento</button>
                    <button class="btn-success-calendar" onclick="showNewScheduleForm()">⏰ Novo Horário</button>
                    <button class="btn-warning-calendar" onclick="showNewReminderForm()">⏰ Novo Lembrete</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="calendar-stats-grid">
            <div class="calendar-stat-card">
                <div class="calendar-stat-value">${stats.totalEvents}</div>
                <div class="calendar-stat-label">Eventos</div>
            </div>

            <div class="calendar-stat-card">
                <div class="calendar-stat-value" style="color: #10b981;">${stats.availableSlots}</div>
                <div class="calendar-stat-label">Disponíveis</div>
            </div>

            <div class="calendar-stat-card">
                <div class="calendar-stat-value" style="color: #ef4444;">${stats.conflicts}</div>
                <div class="calendar-stat-label">Conflitos</div>
            </div>

            <div class="calendar-stat-card">
                <div class="calendar-stat-value" style="color: #f59e0b;">${stats.busySlots}</div>
                <div class="calendar-stat-label">Ocupados</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="calendar-controls">
            <button class="btn-primary-calendar active" onclick="switchCalendarTab('events')" id="tab-events">
                📅 Eventos
            </button>
            <button class="btn-primary-calendar" onclick="switchCalendarTab('schedules')" id="tab-schedules">
                ⏰ Horários
            </button>
            <button class="btn-primary-calendar" onclick="switchCalendarTab('reminders')" id="tab-reminders">
                ⏰ Lembretes
            </button>
            <button class="btn-primary-calendar" onclick="switchCalendarTab('availability')" id="tab-availability">
                📊 Disponibilidade
            </button>
            <button class="btn-primary-calendar" onclick="switchCalendarTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="calendar-events" class="calendar-content active">
            ${renderEventsTab()}
        </div>

        <div id="calendar-schedules" class="calendar-content">
            ${renderSchedulesTab()}
        </div>

        <div id="calendar-reminders" class="calendar-content">
            ${renderRemindersTab()}
        </div>

        <div id="calendar-availability" class="calendar-content">
            ${renderAvailabilityTab()}
        </div>

        <div id="calendar-analytics" class="calendar-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Eventos
function renderEventsTab() {
    return `
        <div class="calendar-card">
            <div class="calendar-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📅 Lista de Eventos</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="eventFilter" onchange="filterEvents(this.value)">
                        <option value="all">Todos</option>
                        <option value="available">Disponíveis</option>
                        <option value="busy">Ocupados</option>
                        <option value="conflict">Conflitos</option>
                    </select>
                    <button class="btn-primary-calendar" onclick="exportEvents()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="eventsList" style="display: grid; gap: 1rem;">
                ${CalendarState.events.map(renderEventCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Horários
function renderSchedulesTab() {
    return `
        <div class="calendar-card">
            <div class="calendar-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⏰ Gestão de Horários</h3>
                <button class="btn-success-calendar" onclick="showNewScheduleForm()">➕ Novo Horário</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${CalendarState.schedules.map(renderScheduleCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Lembretes
function renderRemindersTab() {
    return `
        <div class="calendar-card">
            <div class="calendar-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⏰ Gestão de Lembretes</h3>
                <button class="btn-warning-calendar" onclick="showNewReminderForm()">➕ Novo Lembrete</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${CalendarState.reminders.map(renderReminderCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Disponibilidade
function renderAvailabilityTab() {
    return `
        <div class="calendar-card">
            <div class="calendar-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Gestão de Disponibilidade</h3>
                <button class="btn-primary-calendar" onclick="showNewAvailabilityForm()">➕ Nova Disponibilidade</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${CalendarState.availability.map(renderAvailabilityCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="calendar-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Calendário</h3>
                <button class="btn-success-calendar" onclick="generateCalendarReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Eventos Concluídos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${CalendarState.events.filter(e => e.status === 'completed').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Conflitos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${CalendarState.conflicts.length}
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
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Disponibilidade</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateAverageAvailability()}h
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Satisfação</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Agenda</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateCalendarSatisfaction()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Evento
function renderEventCard(event) {
    const cssClass = event.status === 'conflict' ? 'conflict' : event.status === 'available' ? 'available' : 'busy';
    const statusClass = `status-${event.status}`;
    const schedules = CalendarState.schedules.filter(s => s.eventId === event.id);
    const reminders = CalendarState.reminders.filter(r => r.eventId === event.id);
    const conflicts = CalendarState.conflicts.filter(c => c.eventId === event.id);
    const availableSlots = schedules.filter(s => s.status === 'available').length;

    return `
        <div class="calendar-card ${cssClass}">
            <div class="calendar-header-info">
                <div class="calendar-info">
                    <div class="calendar-icon">📅</div>
                    <div class="calendar-details">
                        <h4>${escapeHTML(event.name)}</h4>
                        <p>${escapeHTML(event.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${event.type} • ${event.priority} • ${event.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="calendar-status ${statusClass}">${event.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${event.duration || 0}h</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Horários do Evento:</div>
                <div class="event-list">
                    ${schedules.slice(0, 4).map(schedule => `
                        <div class="event-item ${schedule.status}">
                            <div class="event-info">
                                <h6>${escapeHTML(schedule.name)}</h6>
                                <p>${schedule.type} • ${schedule.status}</p>
                            </div>
                            <div class="event-value" style="color: ${getScheduleColor(schedule.status)};">
                                ${schedule.time || 'N/A'}
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhum horário</div>'}
                </div>
            </div>

            <div class="schedule-grid">
                <div class="schedule-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">⏰ Horários</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Disponíveis:</span>
                            <span style="font-weight: 700;">${availableSlots}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Lembretes:</span>
                            <span style="font-weight: 700;">${reminders.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Conflitos:</span>
                            <span style="font-weight: 700;">${conflicts.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="schedule-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Duração:</span>
                            <span style="font-weight: 700;">${event.duration || 0}h</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Início:</span>
                            <span style="font-weight: 700;">${new Date(event.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Data Fim:</span>
                            <span style="font-weight: 700;">${new Date(event.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-calendar">
                <div class="progress-fill-calendar" style="width: ${event.duration}%; background: ${getEventColor(event.duration)};"></div>
            </div>

            <div class="calendar-actions">
                <button class="btn-calendar btn-primary-calendar" onclick="viewEventDetails('${event.id}')">👁️ Detalhes</button>
                <button class="btn-calendar btn-success-calendar" onclick="addScheduleToEvent('${event.id}')">⏰ Horário</button>
                <button class="btn-calendar btn-warning-calendar" onclick="updateEventStatus('${event.id}')">✅ Status</button>
                <button class="btn-calendar btn-danger-calendar" onclick="deleteEvent('${event.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Horário
function renderScheduleCard(schedule) {
    const event = CalendarState.events.find(e => e.id === schedule.eventId);
    const cssClass = schedule.status === 'available' ? 'available' : schedule.status === 'busy' ? 'busy' : 'conflict';
    const duration = schedule.duration || 0;

    return `
        <div class="calendar-card ${cssClass}">
            <div class="calendar-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⏰ ${escapeHTML(schedule.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${event ? event.name : 'Evento desconhecido'} • ${schedule.type} • ${schedule.status}
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
                    ${escapeHTML(schedule.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${schedule.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tempo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${schedule.time || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(schedule.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Última Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(schedule.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-calendar btn-primary-calendar" onclick="editSchedule('${schedule.id}')">✏️ Editar</button>
                <button class="btn-calendar btn-success-calendar" onclick="updateScheduleStatus('${schedule.id}')">✅ Status</button>
                <button class="btn-calendar btn-warning-calendar" onclick="updateScheduleTime('${schedule.id}')">⏰ Tempo</button>
                <button class="btn-calendar btn-danger-calendar" onclick="deleteSchedule('${schedule.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Lembrete
function renderReminderCard(reminder) {
    const event = CalendarState.events.find(e => e.id === reminder.eventId);
    const cssClass = reminder.status === 'completed' ? 'available' : reminder.status === 'pending' ? 'busy' : 'conflict';

    return `
        <div class="calendar-card ${cssClass}">
            <div class="calendar-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⏰ ${escapeHTML(reminder.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${event ? event.name : 'Evento desconhecido'} • ${reminder.type} • ${reminder.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${reminder.time || 'N/A'}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Tempo</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(reminder.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${reminder.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Prioridade:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${reminder.priority || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(reminder.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data do Lembrete:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(reminder.reminderDate).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-calendar btn-primary-calendar" onclick="editReminder('${reminder.id}')">✏️ Editar</button>
                <button class="btn-calendar btn-success-calendar" onclick="updateReminderStatus('${reminder.id}')">✅ Status</button>
                <button class="btn-calendar btn-warning-calendar" onclick="updateReminderTime('${reminder.id}')">⏰ Tempo</button>
                <button class="btn-calendar btn-danger-calendar" onclick="deleteReminder('${reminder.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Disponibilidade
function renderAvailabilityCard(availability) {
    const cssClass = availability.status === 'available' ? 'available' : availability.status === 'busy' ? 'busy' : 'conflict';

    return `
        <div class="calendar-card ${cssClass}">
            <div class="calendar-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 ${escapeHTML(availability.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${availability.type} • ${availability.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${availability.hours || 0}h</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Horas</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(availability.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${availability.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Horas:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${availability.hours || 0}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Início:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(availability.startDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Fim:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(availability.endDate).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-calendar btn-primary-calendar" onclick="editAvailability('${availability.id}')">✏️ Editar</button>
                <button class="btn-calendar btn-success-calendar" onclick="updateAvailabilityStatus('${availability.id}')">✅ Status</button>
                <button class="btn-calendar btn-warning-calendar" onclick="updateAvailabilityHours('${availability.id}')">📊 Horas</button>
                <button class="btn-calendar btn-danger-calendar" onclick="deleteAvailability('${availability.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchCalendarTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-calendar').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.calendar-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`calendar-${tabName}`).classList.add('active');
}

// Funções de Eventos
function showNewEventForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📅 Novo Evento</h4>
            <form id="newEventForm" onsubmit="saveEvent(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Evento *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do evento..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Consulta">Consulta</option>
                            <option value="Procedimento">Procedimento</option>
                            <option value="Reunião">Reunião</option>
                            <option value="Outro">Outro</option>
                        </select>
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
                
                <div class="form-group">
                    <label class="form-label">Duração (horas)</label>
                    <input type="number" class="form-input" name="duration" min="0" step="0.5">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Evento', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Evento', class: 'btn-primary', onclick: "document.getElementById('newEventForm').requestSubmit()" }
    ]);
}

function saveEvent(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const eventObj = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Consulta',
        priority: formData.get('priority') || 'Média',
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        duration: parseFloat(formData.get('duration')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    CalendarState.events.push(eventObj);
    AppState.events = CalendarState.events;
    saveToStorage(STORAGE_KEYS.EVENTS, AppState.events);

    closeModal();
    renderCalendarDashboard();
    showNotification(`Evento "${eventObj.name}" criado com sucesso!`, 'success');
}

// Funções de Horários
function showNewScheduleForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">⏰ Novo Horário</h4>
            <form id="newScheduleForm" onsubmit="saveSchedule(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Horário *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do horário..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Evento</label>
                        <select class="form-select" name="eventId">
                            ${CalendarState.events.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Manhã">Manhã</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Noite">Noite</option>
                            <option value="Integral">Integral</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tempo</label>
                        <input type="text" class="form-input" name="time" placeholder="Ex: 09:00 - 10:00">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Duração (horas)</label>
                        <input type="number" class="form-input" name="duration" min="0" step="0.5">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Horário', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Horário', class: 'btn-primary', onclick: "document.getElementById('newScheduleForm').requestSubmit()" }
    ]);
}

function saveSchedule(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const schedule = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        eventId: formData.get('eventId'),
        type: formData.get('type') || 'Manhã',
        time: formData.get('time') || '',
        duration: parseFloat(formData.get('duration')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    CalendarState.schedules.push(schedule);
    AppState.schedules = CalendarState.schedules;
    saveToStorage(STORAGE_KEYS.SCHEDULES, AppState.schedules);

    closeModal();
    renderCalendarDashboard();
    showNotification(`Horário "${schedule.name}" criado com sucesso!`, 'success');
}

// Funções de Lembretes
function showNewReminderForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">⏰ Novo Lembrete</h4>
            <form id="newReminderForm" onsubmit="saveReminder(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Lembrete *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do lembrete..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Evento</label>
                        <select class="form-select" name="eventId">
                            ${CalendarState.events.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Email">Email</option>
                            <option value="SMS">SMS</option>
                            <option value="Push">Push</option>
                            <option value="Notificação">Notificação</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Prioridade</label>
                        <select class="form-select" name="priority">
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tempo</label>
                        <input type="text" class="form-input" name="time" placeholder="Ex: 30 minutos antes">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data do Lembrete</label>
                    <input type="date" class="form-input" name="reminderDate">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Lembrete', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Lembrete', class: 'btn-primary', onclick: "document.getElementById('newReminderForm').requestSubmit()" }
    ]);
}

function saveReminder(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const reminder = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        eventId: formData.get('eventId'),
        type: formData.get('type') || 'Email',
        priority: formData.get('priority') || 'Média',
        time: formData.get('time') || '',
        reminderDate: formData.get('reminderDate'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    CalendarState.reminders.push(reminder);
    AppState.reminders = CalendarState.reminders;
    saveToStorage(STORAGE_KEYS.REMINDERS, AppState.reminders);

    closeModal();
    renderCalendarDashboard();
    showNotification(`Lembrete "${reminder.name}" criado com sucesso!`, 'success');
}

// Funções de Disponibilidade
function showNewAvailabilityForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📊 Nova Disponibilidade</h4>
            <form id="newAvailabilityForm" onsubmit="saveAvailability(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Disponibilidade *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da disponibilidade..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Diária">Diária</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Especial">Especial</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Horas</label>
                        <input type="number" class="form-input" name="hours" min="0" step="0.5">
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

    openModal('Nova Disponibilidade', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Disponibilidade', class: 'btn-primary', onclick: "document.getElementById('newAvailabilityForm').requestSubmit()" }
    ]);
}

function saveAvailability(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const availability = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Diária',
        hours: parseFloat(formData.get('hours')) || 0,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    CalendarState.availability.push(availability);
    AppState.availability = CalendarState.availability;
    saveToStorage(STORAGE_KEYS.AVAILABILITY, AppState.availability);

    closeModal();
    renderCalendarDashboard();
    showNotification(`Disponibilidade "${availability.name}" criada com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateCalendarStats() {
    const totalEvents = CalendarState.events.length;
    const availableSlots = CalendarState.schedules.filter(s => s.status === 'available').length;
    const conflicts = CalendarState.conflicts.length;
    const busySlots = CalendarState.schedules.filter(s => s.status === 'busy').length;

    return {
        totalEvents,
        availableSlots,
        conflicts,
        busySlots
    };
}

function getEventColor(duration) {
    if (duration <= 2) return '#10b981';
    if (duration <= 4) return '#3b82f6';
    if (duration <= 6) return '#f59e0b';
    return '#ef4444';
}

function getScheduleColor(status) {
    if (status === 'available') return '#10b981';
    if (status === 'busy') return '#f59e0b';
    return '#ef4444';
}

function calculateAverageAvailability() {
    const totalHours = CalendarState.availability.reduce((sum, a) => sum + (a.hours || 0), 0);
    const count = CalendarState.availability.length;
    return count > 0 ? Math.round(totalHours / count) : 0;
}

function calculateCalendarSatisfaction() {
    const avgAvailability = CalendarState.availability.length > 0 ?
        Math.round(CalendarState.availability.reduce((sum, a) => sum + (a.hours || 0), 0) / CalendarState.availability.length) : 0;
    return Math.max(0, 100 - avgAvailability);
}

function filterEvents(status) {
    const filteredEvents = status === 'all' ?
        CalendarState.events :
        CalendarState.events.filter(e => e.status === status);

    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = filteredEvents.map(renderEventCard).join('');
}

function exportEvents() {
    const csvContent = [
        ['Evento', 'Status', 'Duração', 'Tipo', 'Prioridade', 'Data Início', 'Data Fim'],
        ...CalendarState.events.map(e => [
            e.name, e.status, `${e.duration}h`, e.type, e.priority,
            new Date(e.startDate).toLocaleDateString('pt-BR'),
            new Date(e.endDate).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('eventos.csv', csvContent, 'text/csv');
    showNotification('Eventos exportados com sucesso!', 'success');
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
function setupCalendarEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('calendarUpdated', () => {
        CalendarState.events = AppState.events;
        CalendarState.schedules = AppState.schedules;
        CalendarState.reminders = AppState.reminders;
        CalendarState.holidays = AppState.holidays;
        CalendarState.workingHours = AppState.workingHours;
        CalendarState.timeSlots = AppState.timeSlots;
        CalendarState.conflicts = AppState.conflicts;
        CalendarState.availability = AppState.availability;
        renderCalendarDashboard();
    });
}

// Exportar funções globais
window.initCalendarModule = initCalendarModule;
window.renderCalendarDashboard = renderCalendarDashboard;
window.setupCalendarEvents = setupCalendarEvents;
window.switchCalendarTab = switchCalendarTab;
window.showNewEventForm = showNewEventForm;
window.saveEvent = saveEvent;
window.showNewScheduleForm = showNewScheduleForm;
window.saveSchedule = saveSchedule;
window.showNewReminderForm = showNewReminderForm;
window.saveReminder = saveReminder;
window.showNewAvailabilityForm = showNewAvailabilityForm;
window.saveAvailability = saveAvailability;
window.calculateCalendarStats = calculateCalendarStats;
window.getEventColor = getEventColor;
window.getScheduleColor = getScheduleColor;
window.calculateAverageAvailability = calculateAverageAvailability;
window.calculateCalendarSatisfaction = calculateCalendarSatisfaction;
window.filterEvents = filterEvents;
window.exportEvents = exportEvents;
window.downloadFile = downloadFile;