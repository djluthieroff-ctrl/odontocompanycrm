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

    const pending = total - completed - cancelled; // Remaining to do (including missed if we want to count them as pending or separate)

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

        <!-- Header with Date Navigator & Stats -->
        <div class="appointments-header-card">
            <div class="date-navigator">
                <button class="btn btn-secondary btn-icon" onclick="changeDate(-1)">◀</button>
                <div class="date-display">
                    ${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <button class="btn btn-secondary btn-icon" onclick="changeDate(1)">▶</button>
                <input type="date" class="form-input" style="width: auto;" value="${dateStr}" onchange="setDate(this.value)">
                <button class="btn btn-secondary" onclick="setDate(new Date().toISOString().split('T')[0])">Hoje</button>
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

    // Phone for WhatsApp
    // Fallback to patient phone if not in apt (should be) or lead phone logic
    // Actually apt doesn't store phone directly usually, relies on patient.
    const phone = patient ? patient.phone : '';
    const waButton = phone ? createWhatsAppButton(phone, `Olá ${patient.name.split(' ')[0]}, confirmamos seu agendamento para ${time}?`) : '';

    return `
        <div class="timeline-item">
            <div class="time-column">${time}</div>
            <div class="card-column ${statusClass}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div>
                        <h4 style="font-size: 1.1rem; font-weight: 600; color: var(--gray-900); margin: 0;">
                            ${patient ? patient.name : apt.patientName}
                        </h4>
                        <span style="font-size: 0.85rem; color: var(--gray-500);">${apt.procedure} • ⏱️ ${apt.duration} min</span>
                    </div>
                    <span class="badge" style="background: white; border: 1px solid var(--gray-200);">${statusLabel}</span>
                </div>
                
                ${apt.notes ? `<p style="font-style: italic; color: var(--gray-600); font-size: 0.9rem; margin-bottom: 1rem;">"${apt.notes}"</p>` : ''}
                
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 0.75rem;">
                    ${waButton}
                    <button class="btn btn-small btn-secondary" onclick="editAppointment('${apt.id}')">✏️ Editar</button>
                    ${apt.status !== 'completed' ? `
                        <button class="btn btn-small btn-success" onclick="updateAppointmentStatus('${apt.id}', 'completed')">✅ Concluir</button>
                    ` : ''}
                     ${apt.status !== 'cancelled' ? `
                        <button class="btn btn-small btn-error" onclick="updateAppointmentStatus('${apt.id}', 'cancelled')">🚫 Cancelar</button>
                    ` : ''}
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
    // Handle timezone offset by setting hours to 12
    const parts = dateString.split('-');
    const newDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    AppointmentState.currentDate = newDate;
    renderAppointmentsView();
}

// Expose helpers
window.changeDate = changeDate;
window.setDate = setDate;

// Show New Appointment Form
function showNewAppointmentForm() {
    const patientsOptions = AppState.patients.map(p =>
        `<option value="${p.id}">${p.name}</option>`
    ).join('');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

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
                    <input type="date" class="form-input" name="date" min="${minDate}" required>
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
        { label: 'Agendar', class: 'btn-primary', onclick: 'document.getElementById("newAppointmentForm").requestSubmit()' }
    ]);
}

// Save Appointment
function saveAppointment(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const patientId = formData.get('patientId');
    const patient = AppState.patients.find(p => p.id === patientId);

    if (!patient) {
        alert('Selecione um paciente válido');
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
    if (appointment) {
        appointment.status = newStatus;
        // Auto-set attended flag
        appointment.attended = (newStatus === 'completed');

        appointment.updatedAt = new Date().toISOString();
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

        // Trigger generic update to refresh goals
        if (typeof updateWeeklyGoals === 'function') updateWeeklyGoals();

        showNotification('Status atualizado', 'success');
    }
}

// Edit Appointment
function editAppointment(appointmentId) {
    const apt = AppState.appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const date = new Date(apt.date);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().substring(0, 5);

    const patientsOptions = AppState.patients.map(p =>
        `<option value="${p.id}" ${p.id === apt.patientId ? 'selected' : ''}>${p.name}</option>`
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
                <textarea class="form-textarea" name="notes" rows="3">${apt.notes || ''}</textarea>
            </div>
        </form>
    `;

    openModal('Editar Agendamento', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: 'document.getElementById("editAppointmentForm").requestSubmit()' }
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
        // Auto-set attended flag
        apt.attended = (apt.status === 'completed');

        apt.notes = formData.get('notes') || '';
        apt.updatedAt = new Date().toISOString();

        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);

        // Trigger generic update to refresh goals
        if (typeof updateWeeklyGoals === 'function') updateWeeklyGoals();

        closeModal();
        renderAppointmentsView();
        showNotification('Agendamento atualizado', 'success');
    }
}

// Delete Appointment
function deleteAppointment(appointmentId) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        AppState.appointments = AppState.appointments.filter(a => a.id !== appointmentId);
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
        renderAppointmentsView();
        showNotification('Agendamento excluído', 'info');
    }
}

// Export functions
window.initAppointmentsModule = initAppointmentsModule;
window.saveAppointment = saveAppointment;
window.updateAppointmentStatus = updateAppointmentStatus;
window.editAppointment = editAppointment;
window.updateAppointment = updateAppointment;
window.deleteAppointment = deleteAppointment;
