// Patients Module - CRM Odonto Company
// ======================================

// Initialize Patients Module
function initPatientsModule() {
    renderPatientsList();

    const newPatientBtn = document.getElementById('newPatientBtn');
    if (newPatientBtn && !newPatientBtn.hasAttribute('data-initialized')) {
        newPatientBtn.addEventListener('click', showNewPatientForm);
        newPatientBtn.setAttribute('data-initialized', 'true');
    }
}

// Render Patients List
function renderPatientsList() {
    const container = document.getElementById('patientsContent');

    if (AppState.patients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <h3>Nenhum paciente cadastrado</h3>
                <p>Adicione pacientes manualmente ou converta leads</p>
            </div>
        `;
        return;
    }

    const sortedPatients = [...AppState.patients].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    const patientsHTML = sortedPatients.map(patient => `
        <div class="list-item">
            <div class="list-item-content">
                <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem;">
                    ${patient.name}
                </h4>
                <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 0.25rem;">
                    ${patient.phone ? `📱 ${patient.phone}` : ''} 
                    ${patient.email ? `• ✉️ ${patient.email}` : ''}
                    ${patient.cpf ? `• 🆔 ${patient.cpf}` : ''}
                </p>
                ${patient.mainComplaint ? `
                    <p style="color: var(--gray-500); font-size: 0.875rem;">
                        <strong>Queixa:</strong> ${patient.mainComplaint}
                    </p>
                ` : ''}
                <p style="color: var(--gray-400); font-size: 0.75rem; margin-top: 0.5rem;">
                    Cadastrado em ${formatDate(patient.createdAt)}
                </p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-small btn-primary" onclick="viewPatientDetails('${patient.id}')">
                    Ver Ficha
                </button>
                <button class="btn btn-small btn-secondary" onclick="editPatient('${patient.id}')">
                    ✏️ Editar
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="list-container">${patientsHTML}</div>`;
}

// Show New Patient Form
function showNewPatientForm() {
    const formHTML = `
        <form id="newPatientForm" onsubmit="savePatient(event)">
            <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1.125rem;">Dados Pessoais</h4>
            
            <div class="form-group">
                <label class="form-label">Nome completo *</label>
                <input type="text" class="form-input" name="name" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">CPF</label>
                    <input type="text" class="form-input" name="cpf" placeholder="000.000.000-00">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data de nascimento</label>
                    <input type="date" class="form-input" name="birthDate">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Telefone *</label>
                    <input type="tel" class="form-input" name="phone" placeholder="(00) 00000-0000" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">E-mail</label>
                    <input type="email" class="form-input" name="email">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Endereço completo</label>
                <input type="text" class="form-input" name="address" placeholder="Rua, número, bairro, cidade, estado">
            </div>
            
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--gray-200);">
            
            <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1.125rem;">Anamnese Odontológica</h4>
            
            <div class="form-group">
                <label class="form-label">Queixa principal</label>
                <textarea class="form-textarea" name="mainComplaint" rows="2" placeholder="Qual o motivo da consulta?"></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Histórico médico</label>
                <textarea class="form-textarea" name="medicalHistory" rows="3" placeholder="Doenças, cirurgias, condições de saúde..."></textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Medicações em uso</label>
                    <textarea class="form-textarea" name="medications" rows="2" placeholder="Liste os medicamentos"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Alergias</label>
                    <textarea class="form-textarea" name="allergies" rows="2" placeholder="Medicamentos, materiais, etc."></textarea>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Condições de saúde bucal</label>
                <textarea class="form-textarea" name="dentalConditions" rows="3" placeholder="Sensibilidade, sangramentos, dor, hábitos..."></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tratamentos odontológicos anteriores</label>
                <textarea class="form-textarea" name="previousTreatments" rows="2" placeholder="Implantes, ortodontia, restaurações..."></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Observações adicionais</label>
                <textarea class="form-textarea" name="notes" rows="2"></textarea>
            </div>
        </form>
    `;

    openModal('Nova Ficha de Paciente', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Paciente', class: 'btn-primary', onclick: 'document.getElementById("newPatientForm").requestSubmit()' }
    ]);
}

// Save Patient
function savePatient(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const patient = {
        id: generateId(),
        name: formData.get('name'),
        cpf: formData.get('cpf') || '',
        birthDate: formData.get('birthDate') || '',
        phone: formData.get('phone'),
        email: formData.get('email') || '',
        address: formData.get('address') || '',
        mainComplaint: formData.get('mainComplaint') || '',
        medicalHistory: formData.get('medicalHistory') || '',
        medications: formData.get('medications') || '',
        allergies: formData.get('allergies') || '',
        dentalConditions: formData.get('dentalConditions') || '',
        previousTreatments: formData.get('previousTreatments') || '',
        notes: formData.get('notes') || '',
        createdAt: new Date().toISOString()
    };

    AppState.patients.push(patient);
    saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);

    closeModal();
    renderPatientsList();
    showNotification('Paciente cadastrado com sucesso!', 'success');
}

// View Patient Details
function viewPatientDetails(patientId) {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;

    const detailsHTML = `
        <div style="max-height: 70vh; overflow-y: auto;">
            <div style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.5rem; color: var(--gray-900); margin-bottom: 0.5rem;">${patient.name}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.875rem; color: var(--gray-600);">
                    ${patient.cpf ? `<p><strong>CPF:</strong> ${patient.cpf}</p>` : ''}
                    ${patient.birthDate ? `<p><strong>Nascimento:</strong> ${formatDate(patient.birthDate)}</p>` : ''}
                    <p><strong>Telefone:</strong> ${patient.phone}</p>
                    ${patient.email ? `<p><strong>E-mail:</strong> ${patient.email}</p>` : ''}
                </div>
                ${patient.address ? `<p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--gray-600);"><strong>Endereço:</strong> ${patient.address}</p>` : ''}
            </div>
            
            <h4 style="color: var(--primary-700); margin-bottom: 1rem; font-size: 1.125rem;">📋 Anamnese Odontológica</h4>
            
            ${patient.mainComplaint ? `
                <div style="margin-bottom: 1.5rem;">
                    <h5 style="color: var(--gray-700); font-weight: 600; margin-bottom: 0.5rem;">Queixa Principal</h5>
                    <p style="color: var(--gray-600); line-height: 1.6;">${patient.mainComplaint}</p>
                </div>
            ` : ''}
            
            ${patient.medicalHistory ? `
                <div style="margin-bottom: 1.5rem;">
                    <h5 style="color: var(--gray-700); font-weight: 600; margin-bottom: 0.5rem;">Histórico Médico</h5>
                    <p style="color: var(--gray-600); line-height: 1.6;">${patient.medicalHistory}</p>
                </div>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                ${patient.medications ? `
                    <div>
                        <h5 style="color: var(--gray-700); font-weight: 600; margin-bottom: 0.5rem;">Medicações</h5>
                        <p style="color: var(--gray-600); line-height: 1.6;">${patient.medications}</p>
                    </div>
                ` : ''}
                
                ${patient.allergies ? `
                    <div>
                        <h5 style="color: var(--gray-700); font-weight: 600; margin-bottom: 0.5rem;">Alergias</h5>
                        <p style="color: var(--error-500); font-weight: 500; line-height: 1.6;">⚠️ ${patient.allergies}</p>
                    </div>
                ` : ''}
            </div>
            
            ${patient.dentalConditions ? `
                <div style="margin-bottom: 1.5rem;">
                    <h5 style="color: var(--gray-700); font-weight: 600; margin-bottom: 0.5rem;">Condições de Saúde Bucal</h5>
                    <p style="color: var(--gray-600); line-height: 1.6;">${patient.dentalConditions}</p>
                </div>
            ` : ''}
            
            ${patient.previousTreatments ? `
                <div style="margin-bottom: 1.5rem;">
                    <h5 style="color: var(--gray-700); font-weight: 600; margin-bottom: 0.5rem;">Tratamentos Anteriores</h5>
                    <p style="color: var(--gray-600); line-height: 1.6;">${patient.previousTreatments}</p>
                </div>
            ` : ''}
            
            ${patient.notes ? `
                <div style="margin-bottom: 1.5rem;">
                    <h5 style="color: var(--gray-700); font-weight: 600; margin-bottom: 0.5rem;">Observações</h5>
                    <p style="color: var(--gray-600); line-height: 1.6;">${patient.notes}</p>
                </div>
            ` : ''}
            
            <p style="color: var(--gray-400); font-size: 0.75rem; text-align: right; margin-top: 2rem;">
                Cadastrado em ${formatDateTime(patient.createdAt)}
            </p>
        </div>
    `;

    openModal(`Ficha do Paciente`, detailsHTML, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Editar', class: 'btn-primary', onclick: `closeModal(); editPatient('${patientId}')` }
    ]);
}

// Edit Patient
function editPatient(patientId) {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;

    const formHTML = `
        <form id="editPatientForm" onsubmit="updatePatient(event, '${patientId}')">
            <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1.125rem;">Dados Pessoais</h4>
            
            <div class="form-group">
                <label class="form-label">Nome completo *</label>
                <input type="text" class="form-input" name="name" value="${patient.name}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">CPF</label>
                    <input type="text" class="form-input" name="cpf" value="${patient.cpf || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data de nascimento</label>
                    <input type="date" class="form-input" name="birthDate" value="${patient.birthDate || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Telefone *</label>
                    <input type="tel" class="form-input" name="phone" value="${patient.phone}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">E-mail</label>
                    <input type="email" class="form-input" name="email" value="${patient.email || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Endereço completo</label>
                <input type="text" class="form-input" name="address" value="${patient.address || ''}">
            </div>
            
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--gray-200);">
            
            <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1.125rem;">Anamnese Odontológica</h4>
            
            <div class="form-group">
                <label class="form-label">Queixa principal</label>
                <textarea class="form-textarea" name="mainComplaint" rows="2">${patient.mainComplaint || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Histórico médico</label>
                <textarea class="form-textarea" name="medicalHistory" rows="3">${patient.medicalHistory || ''}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Medicações em uso</label>
                    <textarea class="form-textarea" name="medications" rows="2">${patient.medications || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Alergias</label>
                    <textarea class="form-textarea" name="allergies" rows="2">${patient.allergies || ''}</textarea>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Condições de saúde bucal</label>
                <textarea class="form-textarea" name="dentalConditions" rows="3">${patient.dentalConditions || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tratamentos odontológicos anteriores</label>
                <textarea class="form-textarea" name="previousTreatments" rows="2">${patient.previousTreatments || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Observações adicionais</label>
                <textarea class="form-textarea" name="notes" rows="2">${patient.notes || ''}</textarea>
            </div>
        </form>
    `;

    openModal('Editar Ficha de Paciente', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Alterações', class: 'btn-primary', onclick: 'document.getElementById("editPatientForm").requestSubmit()' }
    ]);
}

// Update Patient
function updatePatient(event, patientId) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const patient = AppState.patients.find(p => p.id === patientId);

    if (patient) {
        patient.name = formData.get('name');
        patient.cpf = formData.get('cpf') || '';
        patient.birthDate = formData.get('birthDate') || '';
        patient.phone = formData.get('phone');
        patient.email = formData.get('email') || '';
        patient.address = formData.get('address') || '';
        patient.mainComplaint = formData.get('mainComplaint') || '';
        patient.medicalHistory = formData.get('medicalHistory') || '';
        patient.medications = formData.get('medications') || '';
        patient.allergies = formData.get('allergies') || '';
        patient.dentalConditions = formData.get('dentalConditions') || '';
        patient.previousTreatments = formData.get('previousTreatments') || '';
        patient.notes = formData.get('notes') || '';
        patient.updatedAt = new Date().toISOString();

        saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);

        closeModal();
        renderPatientsList();
        showNotification('Paciente atualizado com sucesso!', 'success');
    }
}

// Export functions
window.initPatientsModule = initPatientsModule;
window.viewPatientDetails = viewPatientDetails;
window.editPatient = editPatient;
window.savePatient = savePatient;
window.updatePatient = updatePatient;
