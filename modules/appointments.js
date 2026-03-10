// Appointments Module - CRM Odonto Company
// ==========================================

// Initialize Appointments Module
function initAppointmentsModule() {
    renderAppointmentsView();

    const newAppointmentBtn = document.getElementById('newAppointmentBtn');
    if (newAppointmentBtn && !newAppointmentBtn.hasAttribute('data-initialized')) {
        newAppointmentBtn.addEventListener('click', showNewAppointmentForm);
        newAppointmentBtn.setAttribute('data-initialized', 'true');
    }
}

// Enhanced Appointments Logic
const AppointmentState = {
    currentDate: new Date()
};

// Render Appointments View (Full Revamp)
function renderAppointmentsView() {
    const container = document.getElementById('appointmentsContent');
    if (!container) return;

    const selectedDate = AppointmentState.currentDate;
    const dateStr = selectedDate.toISOString().split('T')[0];

    // Filter appointments for the selected day
    const dayAppointments = AppState.appointments.filter(apt =>
        new Date(apt.date).toISOString().split('T')[0] === dateStr
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate Stats for the day
    const total = dayAppointments.length;
    const completed = dayAppointments.filter(a => a.status === 'completed').length;
    const cancelled = dayAppointments.filter(a => a.status === 'cancelled').length;

    // "Missed" Logic: Time passed + Status is 'scheduled'/'confirmed'
    const now = new Date();
    const isToday = dateStr === now.toISOString().split('T')[0];
    const missed = dayAppointments.filter(a => {
        const aptDate = new Date(a.date);
        return (aptDate < now && ['scheduled', 'confirmed'].includes(a.status));
    }).length;

    const pending = total - completed - cancelled;

    container.innerHTML = `
        <style>
            .appointments-header-card {
                background: white;
                padding: 1.5rem;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                margin-bottom: 2rem;
                display: flex;
                flex-wrap: wrap;
                gap: 2rem;
                align-items: center;
                justify-content: space-between;
            }
            .date-navigator {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .date-display {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
                text-transform: capitalize;
                min-width: 220px;
                text-align: center;
            }
            .stat-badge {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                background: var(--gray-50);
                min-width: 100px;
            }
            .stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--gray-900);
            }
            .stat-label {
                font-size: 0.75rem;
                color: var(--gray-500);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .timeline-container {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .timeline-item {
                display: grid;
                grid-template-columns: 80px 1fr;
                gap: 1.5rem;
                position: relative;
            }
            .time-column {
                text-align: right;
                font-weight: 600;
                color: var(--gray-500);
                padding-top: 1rem;
            }
            .card-column {
                background: white;
                border-radius: 12px;
                padding: 1.25rem;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                border: 1px solid var(--gray-200);
                transition: transform 0.2s, box-shadow 0.2s;
                border-left: 4px solid transparent;
            }
            .card-column:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .status-missed { border-left-color: #ef4444; background: #fef2f2; }
            .status-completed { border-left-color: #10b981; }
            .status-scheduled { border-left-color: #3b82f6; }
            .status-cancelled { border-left-color: #9ca3af; opacity: 0.7; }
        </style>

        <!-- Header with Date Navigator, Search & Stats -->
        <div class="appointments-header-card">
            <div style="display: flex; flex-direction: column; gap: 1rem; flex: 1; min-width: 300px;">
                <div class="date-navigator">
                    <button class="btn btn-secondary btn-icon" onclick="changeDate(-1)">◀</button>
                    <div class="date-display">
                        ${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <button class="btn btn-secondary btn-icon" onclick="changeDate(1)">▶</button>
                    <input type="date" class="form-input" style="width: auto;" value="${dateStr}" onchange="setDate(this.value)">
                    <button class="btn btn-primary" id="newAppointmentBtn">📅 Novo Agendamento</button>
                    <button class="btn btn-whatsapp" onclick="showBulkWhatsAppModal()" style="display: flex; align-items: center; gap: 8px;">
                        <span>💬</span> Lembretes (Amanhã)
                    </button>
                </div>
                    <button class="btn btn-secondary" onclick="setDate(new Date().toISOString().split('T')[0])">Hoje</button>
                    <button class="btn btn-secondary" onclick="showAgendaHeatmap()" title="Mapa de Calor da Agenda">🔥</button>
                </div>

                <!-- NEW: Global Appointment Search -->
                <div style="position: relative; max-width: 450px; z-index: 100;">
                    <div class="search-box">
                        <input type="text" id="aptSearchInput" placeholder="🔍 Buscar data de agendamento do paciente..." 
                               class="form-input" oninput="searchAppointmentDate(this.value)"
                               style="padding-left: 2.5rem; background: var(--gray-50); border-color: var(--gray-200);">
                    </div>
                    <div id="aptSearchResults" style="
                        position: absolute; top: 100%; left: 0; right: 0; 
                        background: white; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                        border: 1px solid var(--gray-200); margin-top: 4px; display: none; max-height: 300px; overflow-y: auto;
                    "></div>
                </div>
            </div>

            <div style="display: flex; gap: 1rem;">
                <div class="stat-badge">
                    <span class="stat-value">${total}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-badge" style="background: #ecfdf5;">
                    <span class="stat-value" style="color: #059669;">${completed}</span>
                    <span class="stat-label" style="color: #059669;">Concluídos</span>
                </div>
                 ${missed > 0 ? `
                <div class="stat-badge" style="background: #fef2f2;">
                    <span class="stat-value" style="color: #dc2626;">${missed}</span>
                    <span class="stat-label" style="color: #dc2626;">Não Compareceu</span>
                </div>` : ''}
                <div class="stat-badge">
                    <span class="stat-value">${pending}</span>
                    <span class="stat-label">Pendentes</span>
                </div>
            </div>
        </div>

        <!-- Appointment Timeline -->
        <div class="timeline-container">
            ${dayAppointments.length > 0 ? dayAppointments.map(apt => renderTimelineItem(apt)).join('') : `
                <div style="text-align: center; padding: 4rem; color: var(--gray-400);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                    <h3>Nenhum agendamento para este dia</h3>
                    <p>Use o botão "Novo Agendamento" para adicionar horário.</p>
                </div>
            `}
        </div>
    `;
}

// Render Single Timeline Item
function renderTimelineItem(apt) {
    const time = new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const patient = AppState.patients.find(p => p.id === apt.patientId);

    // Determine Status Logic (Visual)
    let statusClass = `status-${apt.status}`;
    let statusLabel = getStatusLabel(apt.status);

    // Check for "Missed" visual override
    const isMissed = new Date(apt.date) < new Date() && ['scheduled', 'confirmed'].includes(apt.status);
    if (isMissed) {
        statusClass = 'status-missed';
        statusLabel += ' (Atrasado)';
    }

    const patientName = patient ? escapeHTML(patient.name) : escapeHTML(apt.patientName || '');
    const phone = patient ? patient.phone : '';
    const firstName = patient ? patient.name.split(' ')[0] : '';
    const waButton = phone ? createWhatsAppButton(phone, `Olá ${firstName}, confirmamos seu agendamento para ${time}?`) : '';

    return `
        <div class="timeline-item">
            <div class="time-column">${time}</div>
            <div class="card-column ${statusClass}" data-apt-id="${apt.id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <h4 style="font-size: 1.1rem; font-weight: 600; color: var(--gray-900); margin: 0; display: flex; align-items: center; gap: 8px;">
                            ${patientName}
                            ${(function () {
            if (!patient || !patient.convertedFrom) return '';
            const lead = AppState.leads.find(l => l.id === patient.convertedFrom);
            if (!lead) return '';
            if (lead.saleStatus === 'sold') return '<span class="badge badge-success" style="font-size: 0.7rem; padding: 2px 6px;">💰 Venda</span>';
            if (lead.status === 'visit') return '<span class="badge badge-primary" style="font-size: 0.7rem; padding: 2px 6px;">🏥 Visita</span>';
            return '';
        })()}
                        </h4>
                        <span style="font-size: 0.85rem; color: var(--gray-500);">${escapeHTML(apt.procedure)} • ⏱️ ${apt.duration} min</span>
                    </div>
                    <span class="badge" style="background: white; border: 1px solid var(--gray-200);">${statusLabel}</span>
                </div>
                
                ${apt.notes ? `<p style="font-style: italic; color: var(--gray-600); font-size: 0.9rem; margin-bottom: 1rem;">"${escapeHTML(apt.notes)}"</p>` : ''}
                
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 0.75rem;">
                    ${waButton}
                    <button class="btn btn-small btn-secondary" onclick="rescheduleAppointment('${apt.id}')">🔄 Remarcar</button>
                    <button class="btn btn-small btn-secondary" onclick="editAppointment('${apt.id}')">✏️</button>
                    <button class="btn btn-small" style="background: #25d366; color: white;" onclick="sendWhatsAppReminder('${apt.id}')" title="Enviar Lembrete WhatsApp">🔔</button>
                    ${apt.status !== 'completed' ? `
                        <button class="btn btn-small btn-success" onclick="updateAppointmentStatus('${apt.id}', 'confirmed')">👍 Confirmar</button>
                        <button class="btn btn-small btn-success" style="background: #10b981;" onclick="updateAppointmentStatus('${apt.id}', 'completed')">✅ Atendido</button>
                    ` : ''}
                    <button class="btn btn-small" style="background: #fee2e2; color: #991b1b;" onclick="deleteAppointment('${apt.id}')">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

function getStatusLabel(status) {
    const map = {
        'scheduled': 'Agendado',
        'confirmed': 'Confirmado',
        'in-progress': 'Em Andamento',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
    };
    return map[status] || status;
}

// Date Navigation Helpers
function changeDate(days) {
    const newDate = new Date(AppointmentState.currentDate);
    newDate.setDate(newDate.getDate() + days);
    AppointmentState.currentDate = newDate;
    renderAppointmentsView();
}

function setDate(dateString) {
    if (!dateString) return;
    const parts = dateString.split('-');
    const newDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    AppointmentState.currentDate = newDate;
    renderAppointmentsView();
}

// Expose helpers
window.changeDate = changeDate;
window.setDate = setDate;

// Show New Appointment Form (no date restriction - allows past dates for retroactive entry)
function showNewAppointmentForm() {
    const patientsOptions = AppState.patients.map(p =>
        `<option value="${p.id}">${escapeHTML(p.name)}</option>`
    ).join('');

    const formHTML = `
        <form id="newAppointmentForm" onsubmit="saveAppointment(event)">
            <div class="form-group">
                <label class="form-label">Paciente *</label>
                <select class="form-select" name="patientId" required>
                    <option value="">Selecione um paciente</option>
                    ${patientsOptions}
                </select>
                ${AppState.patients.length === 0 ? '<p style="color: var(--error-500); font-size: 0.875rem; margin-top: 0.5rem;">⚠️ Cadastre pacientes primeiro</p>' : ''}
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Data *</label>
                    <input type="date" class="form-input" name="date" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Horário *</label>
                    <input type="time" class="form-input" name="time" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Procedimento *</label>
                <select class="form-select" name="procedure" required>
                    <option value="">Selecione o procedimento</option>
                    <option value="Avaliação">Avaliação</option>
                    <option value="Consulta">Consulta</option>
                    <option value="Limpeza">Limpeza</option>
                    <option value="Restauração">Restauração</option>
                    <option value="Extração">Extração</option>
                    <option value="Canal">Tratamento de Canal</option>
                    <option value="Clareamento">Clareamento</option>
                    <option value="Implante">Implante</option>
                    <option value="Ortodontia">Ortodontia</option>
                    <option value="Prótese">Prótese</option>
                    <option value="Urgência">Urgência</option>
                    <option value="Outros">Outros</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Duração estimada</label>
                <select class="form-select" name="duration">
                    <option value="30">30 minutos</option>
                    <option value="60" selected>1 hora</option>
                    <option value="90">1 hora e 30 min</option>
                    <option value="120">2 horas</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea class="form-textarea" name="notes" rows="3" placeholder="Informações adicionais sobre o agendamento..."></textarea>
            </div>
        </form>
    `;

    openModal('Novo Agendamento', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Agendar', class: 'btn-primary', onclick: "document.getElementById('newAppointmentForm').requestSubmit()" }
    ]);
}

// Save Appointment
function saveAppointment(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const patientId = formData.get('patientId');
    const patient = AppState.patients.find(p => p.id === patientId);

    if (!patient) {
        showNotification('Selecione um paciente válido', 'error');
        return;
    }

    const dateStr = formData.get('date');
    const timeStr = formData.get('time');
    const dateTime = new Date(`${dateStr}T${timeStr}`);

    const appointment = {
        id: generateId(),
        patientId: patient.id,
        patientName: patient.name,
        date: dateTime.toISOString(),
        procedure: formData.get('procedure'),
        duration: parseInt(formData.get('duration')),
        notes: formData.get('notes') || '',
        status: 'scheduled',
        attended: false,
        createdAt: new Date().toISOString()
    };

    AppState.appointments.push(appointment);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

    closeModal();
    renderAppointmentsView();
    showNotification(`Agendamento criado para ${patient.name}`, 'success');
}

// Update Appointment Status
function updateAppointmentStatus(appointmentId, newStatus) {
    const appointment = AppState.appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    if (newStatus === 'completed') {
        promptSaleCompletion(appointment);
        return;
    }

    appointment.status = newStatus;
    appointment.attended = (newStatus === 'completed');

    appointment.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

    if (typeof updateWeeklyGoals === 'function') updateWeeklyGoals();

    showNotification('Status atualizado', 'success');
    renderAppointmentsView();
    if (typeof updateDashboard === 'function') updateDashboard();
}

// Special flow for finishing appointment with sale question
function promptSaleCompletion(apt) {
    openModal('Finalizar Atendimento', `
        <div style="text-align: center; padding: 1.5rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <h3 style="margin-bottom: 0.5rem; color: var(--gray-900);">Atendimento Concluído!</h3>
            <p style="color: var(--gray-600); margin-bottom: 2rem;">O paciente <strong>${escapeHTML(apt.patientName)}</strong> fechou algum tratamento ou venda nesta visita?</p>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                <button class="btn btn-success" style="padding: 1rem; font-weight: 700; width: 100%;" onclick="processAptSale('${apt.id}', true)">
                    💰 Sim, fechou venda!
                </button>
                <button class="btn btn-secondary" style="padding: 0.75rem; width: 100%;" onclick="processAptSale('${apt.id}', false)">
                    👥 Não, apenas compareceu
                </button>
            </div>
        </div>
    `, []);
}

function processAptSale(aptId, isSold) {
    const apt = AppState.appointments.find(a => a.id === aptId);
    if (!apt) return;

    // 1. Update Appointment Status
    apt.status = 'completed';
    apt.attended = true; // Always attended if reaching here
    apt.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

    // 2. Handle Lead/Sale Link
    const patient = AppState.patients.find(p => p.id === apt.patientId);
    const leadId = patient ? patient.convertedFrom : null;

    if (isSold) {
        closeModal();
        if (leadId && typeof markSale === 'function') {
            const lead = AppState.leads.find(l => l.id === leadId);
            if (lead) {
                lead.visitDate = apt.date; // Use the appointment date as the locked visit date
                saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
            }
            // Trigger the existing markSale which prompts for value
            markSale(leadId, true);
        } else {
            // No lead linked, ask for value manually
            openModal(`Registrar Venda: ${apt.patientName}`, `
                <div class="form-group">
                    <label class="form-label">Valor da Venda (R$)</label>
                    <input type="text" class="form-input" id="manualSaleValue" placeholder="0,00" autofocus>
                    <small style="color:var(--gray-500);">Digite o valor final do tratamento fechado.</small>
                </div>
            `, [
                { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
                { label: 'Confirmar Venda', class: 'btn-primary', onclick: `saveManualAptSale('${apt.id}')` }
            ]);
        }
    } else {
        // Just a visit
        if (leadId && typeof markSale === 'function') {
            const lead = AppState.leads.find(l => l.id === leadId);
            if (lead) {
                lead.saleStatus = 'lost';
                lead.visitDate = apt.date; // Lock visit date
                lead.updatedAt = new Date().toISOString();
                saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
            }
        }
        closeModal();
        showNotification('Atendimento concluído como visita.', 'info');
    }

    // Refresh UI
    renderAppointmentsView();
    if (typeof updateDashboard === 'function') updateDashboard();
}

// Edit Appointment
function editAppointment(appointmentId) {
    const apt = AppState.appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const date = new Date(apt.date);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().substring(0, 5);

    const patientsOptions = AppState.patients.map(p =>
        `<option value="${p.id}" ${p.id === apt.patientId ? 'selected' : ''}>${escapeHTML(p.name)}</option>`
    ).join('');

    const formHTML = `
        <form id="editAppointmentForm" onsubmit="updateAppointment(event, '${appointmentId}')">
            <div class="form-group">
                <label class="form-label">Paciente *</label>
                <select class="form-select" name="patientId" required>
                    ${patientsOptions}
                </select>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Data *</label>
                    <input type="date" class="form-input" name="date" value="${dateStr}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Horário *</label>
                    <input type="time" class="form-input" name="time" value="${timeStr}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Procedimento *</label>
                <select class="form-select" name="procedure" required>
                    <option value="Avaliação" ${apt.procedure === 'Avaliação' ? 'selected' : ''}>Avaliação</option>
                    <option value="Consulta" ${apt.procedure === 'Consulta' ? 'selected' : ''}>Consulta</option>
                    <option value="Limpeza" ${apt.procedure === 'Limpeza' ? 'selected' : ''}>Limpeza</option>
                    <option value="Restauração" ${apt.procedure === 'Restauração' ? 'selected' : ''}>Restauração</option>
                    <option value="Extração" ${apt.procedure === 'Extração' ? 'selected' : ''}>Extração</option>
                    <option value="Canal" ${apt.procedure === 'Canal' ? 'selected' : ''}>Tratamento de Canal</option>
                    <option value="Clareamento" ${apt.procedure === 'Clareamento' ? 'selected' : ''}>Clareamento</option>
                    <option value="Implante" ${apt.procedure === 'Implante' ? 'selected' : ''}>Implante</option>
                    <option value="Ortodontia" ${apt.procedure === 'Ortodontia' ? 'selected' : ''}>Ortodontia</option>
                    <option value="Prótese" ${apt.procedure === 'Prótese' ? 'selected' : ''}>Prótese</option>
                    <option value="Urgência" ${apt.procedure === 'Urgência' ? 'selected' : ''}>Urgência</option>
                    <option value="Outros" ${apt.procedure === 'Outros' ? 'selected' : ''}>Outros</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" name="status">
                    <option value="scheduled" ${apt.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                    <option value="confirmed" ${apt.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                    <option value="in-progress" ${apt.status === 'in-progress' ? 'selected' : ''}>Em andamento</option>
                    <option value="completed" ${apt.status === 'completed' ? 'selected' : ''}>Concluído</option>
                    <option value="cancelled" ${apt.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea class="form-textarea" name="notes" rows="3">${escapeHTML(apt.notes || '')}</textarea>
            </div>
        </form>
        `;

    openModal('Editar Agendamento', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: "document.getElementById('editAppointmentForm').requestSubmit()" }
    ]);
}

// Update Appointment
function updateAppointment(event, appointmentId) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const apt = AppState.appointments.find(a => a.id === appointmentId);

    if (apt) {
        const dateStr = formData.get('date');
        const timeStr = formData.get('time');
        const dateTime = new Date(`${dateStr}T${timeStr}`);

        const patient = AppState.patients.find(p => p.id === formData.get('patientId'));

        apt.patientId = patient.id;
        apt.patientName = patient.name;
        apt.date = dateTime.toISOString();
        apt.procedure = formData.get('procedure');
        apt.status = formData.get('status');
        apt.attended = (apt.status === 'completed');

        apt.notes = formData.get('notes') || '';
        apt.updatedAt = new Date().toISOString();

        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

        if (typeof updateWeeklyGoals === 'function') updateWeeklyGoals();

        closeModal();
        renderAppointmentsView();
        showNotification('Agendamento atualizado', 'success');
    }
}

// Reschedule Appointment
function rescheduleAppointment(appointmentId) {
    const apt = AppState.appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const date = new Date(apt.date);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().substring(0, 5);

    const formHTML = `
        <form id="rescheduleForm" onsubmit="confirmReschedule(event, '${appointmentId}')">
             <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Nova Data *</label>
                    <input type="date" class="form-input" name="date" value="${dateStr}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Novo Horário *</label>
                    <input type="time" class="form-input" name="time" value="${timeStr}" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Motivo (opcional)</label>
                <textarea class="form-textarea" name="reason" rows="2" placeholder="Paciente solicitou alteração..."></textarea>
            </div>
        </form>
    `;

    openModal('Remarcar Consulta', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Confirmar Reagendamento', class: 'btn-primary', onclick: "document.getElementById('rescheduleForm').requestSubmit()" }
    ]);
}

function confirmReschedule(event, appointmentId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const apt = AppState.appointments.find(a => a.id === appointmentId);

    if (apt) {
        const oldDate = formatDateTime(apt.date);
        const newDateStr = formData.get('date');
        const newTimeStr = formData.get('time');
        const newDateTime = new Date(`${newDateStr}T${newTimeStr}`).toISOString();
        const reason = formData.get('reason') || 'Não informado';

        // Update appointment
        apt.date = newDateTime;
        apt.status = 'scheduled'; // Reset to scheduled if it was something else
        apt.updatedAt = new Date().toISOString();

        // Add to patient history
        addPatientHistory(apt.patientId, `🔄 Consulta de ${apt.procedure} remarcada: De ${oldDate} para ${formatDateTime(newDateTime)}. Motivo: ${reason}`);

        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
        closeModal();
        renderAppointmentsView();
        showNotification('Consulta remarcada com sucesso!', 'success');
    }
}

function addPatientHistory(patientId, note) {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (patient) {
        if (!patient.history) patient.history = [];
        patient.history.unshift({
            date: new Date().toISOString(),
            note: note
        });
        saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
    }
}

// Search for an appointment across all dates
function searchAppointmentDate(query) {
    const resultsContainer = document.getElementById('aptSearchResults');
    if (!query || query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    const term = query.toLowerCase();
    const matches = AppState.appointments.filter(apt =>
        apt.patientName.toLowerCase().includes(term) ||
        apt.procedure.toLowerCase().includes(term)
    ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    if (matches.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 12px; color: var(--gray-500); font-size: 0.9rem;">Nenhum agendamento encontrado.</div>';
    } else {
        resultsContainer.innerHTML = matches.map(apt => {
            const dateObj = new Date(apt.date);
            const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            return `
                <div onclick="selectAppointmentResult('${apt.date}', '${apt.id}')" style="
                    padding: 10px 12px; border-bottom: 1px solid var(--gray-100); cursor: pointer;
                    display: flex; justify-content: space-between; align-items: center;
                " class="search-result-item">
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem; color: var(--gray-800);">${escapeHTML(apt.patientName)}</div>
                        <div style="font-size: 0.8rem; color: var(--gray-500);">${escapeHTML(apt.procedure)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: var(--primary-600);">${dateStr}</div>
                        <div style="font-size: 0.8rem; color: var(--gray-400);">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    resultsContainer.style.display = 'block';
}

function selectAppointmentResult(isoDate, aptId) {
    const resultsContainer = document.getElementById('aptSearchResults');
    resultsContainer.style.display = 'none';
    document.getElementById('aptSearchInput').value = '';

    // Set calendar to that date
    const dateObj = new Date(isoDate);
    AppointmentState.currentDate = dateObj;
    renderAppointmentsView();

    // Scroll to and highlight
    setTimeout(() => {
        const items = document.querySelectorAll('.card-column');
        // We'll have to find which one matches... since we don't have IDs on the DOM items usually
        // Let's add IDs to the timeline items or just look for the name
        // Better: re-render with a highlight
        const targetCard = document.querySelector(`.card-column[data-apt-id="${aptId}"]`);
        if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.style.outline = '3px solid var(--primary-500)';
            targetCard.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
            setTimeout(() => {
                targetCard.style.outline = 'none';
                targetCard.style.boxShadow = '';
            }, 3000);
        }
    }, 100);
}

// Delete Appointment
function deleteAppointment(appointmentId) {
    if (!confirm('Tem certeza que deseja desmarcar este agendamento?')) return;

    const index = AppState.appointments.findIndex(a => a.id === appointmentId);
    if (index === -1) return;

    const apt = AppState.appointments[index];
    const patientId = apt.patientId;

    AppState.appointments.splice(index, 1);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

    // Integrafão: Se o paciente veio de um lead, e não tem mais agendamentos, volta o status do lead
    const patient = AppState.patients.find(p => p.id === patientId);
    if (patient && patient.convertedFrom) {
        const lead = AppState.leads.find(l => l.id === patient.convertedFrom);
        const hasOtherAppts = AppState.appointments.some(a => a.patientId === patientId);

        if (lead && !hasOtherAppts && lead.status === 'scheduled') {
            lead.status = 'in-contact';
            lead.scheduledAt = null;
            lead.visitDate = null;
            lead.updatedAt = new Date().toISOString();
            saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
            showNotification('Status do lead revertido para "Em Contato"', 'info');
        }
    }

    renderAppointmentsView();
    showNotification('Agendamento removido', 'success');
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof renderLeadsList === 'function' && AppState.currentModule === 'leads') renderLeadsList();
}

// Export functions
window.initAppointmentsModule = initAppointmentsModule;
window.saveAppointment = saveAppointment;
window.updateAppointmentStatus = updateAppointmentStatus;
window.editAppointment = editAppointment;
window.updateAppointment = updateAppointment;
window.deleteAppointment = deleteAppointment;
window.rescheduleAppointment = rescheduleAppointment;
window.confirmReschedule = confirmReschedule;
window.addPatientHistory = addPatientHistory;
window.promptSaleCompletion = promptSaleCompletion;
window.processAptSale = processAptSale;
window.searchAppointmentDate = searchAppointmentDate;
window.selectAppointmentResult = selectAppointmentResult;

window.showAgendaHeatmap = () => {
    const appointments = AppState.appointments;
    const heatmap = {}; // { dayIndex: { hourIndex: count } }

    appointments.forEach(a => {
        const d = new Date(a.date);
        const day = d.getDay(); // 0-6
        const hour = d.getHours(); // 0-23
        if (!heatmap[day]) heatmap[day] = {};
        heatmap[day][hour] = (heatmap[day][hour] || 0) + 1;
    });

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const generateHeatmapGrid = () => {
        let html = '<div style="display: grid; grid-template-columns: 60px repeat(7, 1fr); gap: 4px; overflow-x: auto;">';

        // Header
        html += '<div></div>' + days.map(d => `<div style="text-align: center; font-weight: bold; font-size: 0.8rem;">${d}</div>`).join('');

        // Rows
        hours.forEach(h => {
            html += `<div style="text-align: right; font-size: 0.75rem; font-weight: bold; padding-right: 8px; color: var(--gray-500);">${h}:00</div>`;
            for (let d = 0; d < 7; d++) {
                const count = heatmap[d]?.[h] || 0;
                const opacity = Math.min(count * 0.2, 1);
                const color = count > 0 ? `rgba(37, 99, 235, ${opacity})` : '#f8fafc';
                const textColor = opacity > 0.6 ? 'white' : 'var(--gray-700)';
                html += `
                    <div style="
                        height: 30px; 
                        background: ${color}; 
                        border-radius: 4px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 0.7rem; 
                        font-weight: bold;
                        color: ${textColor};
                        border: 1px solid var(--gray-100);
                    " title="${count} agendamentos às ${h}:00 na ${days[d]}">
                        ${count > 0 ? count : ''}
                    </div>
                `;
            }
        });
        html += '</div>';
        return html;
    };

    openModal('🔥 Mapa de Calor da Agenda', `
        <div style="padding: 1rem;">
            <p style="color: var(--gray-500); font-size: 0.9rem; margin-bottom: 1.5rem; text-align: center;">
                Visualize os horários de maior movimento na clínica.
            </p>
            ${generateHeatmapGrid()}
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center; font-size: 0.75rem; color: var(--gray-500);">
                <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 12px; height: 12px; background: #f8fafc; border: 1px solid var(--gray-100);"></div> Vazio</div>
                <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 12px; height: 12px; background: rgba(37, 99, 235, 0.4);"></div> Médio</div>
                <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 12px; height: 12px; background: rgba(37, 99, 235, 1);"></div> Alto</div>
            </div>
        </div>
    `, [{ label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }]);
};

window.sendWhatsAppReminder = (aptId) => {
    const apt = AppState.appointments.find(a => a.id === aptId);
    if (!apt) return;

    const patient = AppState.patients.find(p => p.id === apt.patientId);
    if (!patient || !patient.phone) {
        showNotification('Paciente sem telefone cadastrado', 'error');
        return;
    }

    const time = new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const date = new Date(apt.date).toLocaleDateString('pt-BR');
    const firstName = patient.name.split(' ')[0];

    const message = `Olá ${firstName}! 🦷 Passando para confirmar seu agendamento na Odonto Company para o dia ${date} às ${time}. Podemos confirmar?`;

    // In a real scenario, this could call an API. For now, we use the WhatsApp utility.
    if (typeof openWhatsApp === 'function') {
        openWhatsApp(patient.phone, message);
        showNotification('Lembrete enviado!', 'success');
    }
}

function showBulkWhatsAppModal() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tomorrowAppts = AppState.appointments.filter(a => {
        const aDate = new Date(a.date).toISOString().split('T')[0];
        return aDate === tomorrowStr && a.status !== 'cancelled';
    });

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'bulkWhatsAppModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>📢 Lembretes para Amanhã (${tomorrow.toLocaleDateString('pt-BR')})</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <p>O sistema identificou <strong>${tomorrowAppts.length}</strong> agendamentos para amanhã para confirmação.</p>
                <div style="margin: 1.5rem 0; max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--gray-50);">
                            <tr>
                                <th style="text-align: left; padding: 10px;">Paciente</th>
                                <th style="text-align: center; padding: 10px;">Hora</th>
                                <th style="text-align: right; padding: 10px;">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tomorrowAppts.map(a => {
        const patient = AppState.patients.find(p => p.id === a.patientId) || { name: 'Desconhecido', phone: '' };
        const time = new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const msg = `Olá ${patient.name}, aqui é da OdontoCompany! Passando para confirmar seu agendamento de amanhã às ${time}. Podemos confirmar?`;
        return `
                                    <tr style="border-bottom: 1px solid var(--gray-100);">
                                        <td style="padding: 12px 10px;">${patient.name}</td>
                                        <td style="padding: 12px 10px; text-align: center;">${time}</td>
                                        <td style="padding: 12px 10px; text-align: right;">
                                            <button class="btn btn-whatsapp btn-small" onclick="openWhatsApp('${patient.phone}', '${msg}')">Confirmar</button>
                                        </td>
                                    </tr>
                                `;
    }).join('')}
                            ${tomorrowAppts.length === 0 ? '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--gray-400);">Nenhum agendamento para amanhã.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
;
