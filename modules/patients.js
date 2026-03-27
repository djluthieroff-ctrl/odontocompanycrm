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

    const patientsHTML = sortedPatients.map(patient => {
        const safeName = escapeHTML(patient.name);
        const safePhone = escapeHTML(patient.phone || '');
        const safeEmail = escapeHTML(patient.email || '');
        const safeCPF = escapeHTML(patient.cpf || '');
        const safeComplaint = escapeHTML(patient.mainComplaint || '');

        return `
            <div class="list-item" data-patient-id="${patient.id}">
                <div class="list-item-content">
                    <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem;">
                        ${safeName}
                    </h4>
                    <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        ${safePhone ? `📱 ${safePhone}` : ''} 
                        ${safeEmail ? `• ✉️ ${safeEmail}` : ''}
                        ${safeCPF ? `• 🆔 ${safeCPF}` : ''}
                    </p>
                    ${safeComplaint ? `
                        <p style="color: var(--gray-500); font-size: 0.875rem;">
                            <strong>Queixa:</strong> ${safeComplaint}
                        </p>
                    ` : ''}
                    <p style="color: var(--gray-400); font-size: 0.75rem; margin-top: 0.5rem;">
                        Cadastrado em ${formatDate(patient.createdAt)}
                    </p>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-small btn-primary" onclick="viewPatientDetails('${patient.id}')">
                        Ver Ficha Completa
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="editPatient('${patient.id}')">
                        ✏️ Editar
                    </button>
                </div>
            </div>
        `;
    }).join('');

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
                    <input type="text" class="form-input mask-cpf" name="cpf" placeholder="000.000.000-00">
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
        { label: 'Salvar Paciente', class: 'btn-primary', onclick: "document.getElementById('newPatientForm').requestSubmit()" }
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
        odontogram: {}, // Default empty odontogram
        history: [], // Default empty history
        createdAt: new Date().toISOString()
    };

    AppState.patients.push(patient);
    saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);

    closeModal();
    renderPatientsList();
    showNotification('Paciente cadastrado com sucesso!', 'success');
}

// View Patient Details (Enhanced with Tabs)
function viewPatientDetails(patientId) {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;

    window.lastViewedPatientId = patientId;
    const safeName = escapeHTML(patient.name);

    const detailsHTML = `
        <div style="display: flex; flex-direction: column; height: 85vh; max-height: 900px;">
            <div class="patient-details-header" style="background: var(--primary-600); color: white; padding: 1.5rem; border-radius: 12px 12px 0 0; margin-bottom: 0; flex-shrink: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="font-size: 1.5rem; margin: 0;">${safeName}</h3>
                        <p style="margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 0.9rem;">
                            📱 ${escapeHTML(patient.phone)} | 📧 ${escapeHTML(patient.email || 'N/A')}
                        </p>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
                        ID: ${patient.id}
                    </div>
                </div>
            </div>

            <div class="patient-tabs" style="display: flex; background: white; border-bottom: 1px solid var(--gray-200); position: sticky; top: 0; z-index: 20; flex-shrink: 0;">
                <button class="tab-btn active" onclick="switchPatientTab(this, 'resumo')">Resumo / Anamnese</button>
                <button class="tab-btn" onclick="switchPatientTab(this, 'odontograma')">Odontograma Visual</button>
                <button class="tab-btn" onclick="switchPatientTab(this, 'historico')">Histórico / Evolução</button>
                <button class="tab-btn" onclick="switchPatientTab(this, 'orcamento')">Gerar Orçamento 💰</button>
            </div>

            <div id="patientTabContent" style="flex: 1; overflow-y: auto; padding: 1.5rem; background: var(--gray-50);">
                ${renderPatientResumo(patient)}
            </div>
        </div>

        <style>
            .tab-btn {
                padding: 1rem 1.5rem;
                border: none;
                background: none;
                font-weight: 600;
                color: var(--gray-500);
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
            }
            .tab-btn:hover { color: var(--primary-600); }
            .tab-btn.active {
                color: var(--primary-600);
                border-bottom-color: var(--primary-600);
                background: var(--primary-50);
            }
            .odontogram-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                padding: 1rem;
                background: white;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            }
            .odontogram-row {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .tooth-group {
                display: flex;
                gap: 4px;
            }
            .tooth-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
            }
            .tooth-num {
                font-size: 11px;
                font-weight: 700;
                color: var(--gray-400);
            }
            .tooth-viz {
                width: 38px;
                height: 52px;
                background: #f8fafc;
                border: 2px solid var(--gray-300);
                border-radius: 6px 6px 16px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 800;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
            }
            .tooth-viz:hover { 
                border-color: var(--primary-400); 
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .tooth-viz.caries { background: #fee2e2; border-color: #ef4444; color: #b91c1c; }
            .tooth-viz.restored { background: #dbeafe; border-color: #3b82f6; color: #1e3a8a; }
            .tooth-viz.missing { background: #1e293b; border-color: #0f172a; color: white; opacity: 0.4; }
            
            .odontogram-legend {
                display: flex;
                gap: 2rem;
                margin-top: 2rem;
                padding: 1rem;
                background: var(--gray-50);
                border-radius: 12px;
                font-size: 0.85rem;
                flex-wrap: wrap;
                justify-content: center;
            }
            .legend-item { display: flex; align-items: center; gap: 8px; font-weight: 500; color: var(--gray-600); }
            .legend-box { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.1); }
        </style>
    `;

    openModal(`Ficha do Paciente`, detailsHTML, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Editar Dados', class: 'btn-primary', onclick: `closeModal(); editPatient('${patientId}')` }
    ]);
}

window.switchPatientTab = (btn, tab) => {
    // UI update
    const tabs = btn.parentElement.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const content = document.getElementById('patientTabContent');
    const patientId = btn.closest('#modalContainer').querySelector('[data-patient-id]')?.dataset.patientId;
    // Finding patientId is tricky here, I'll pass it in the function call or use a global currentPatient variable.
    // Let's use a simpler approach: get it from the modal title or store it globally.
    const activePatientId = window.lastViewedPatientId;
    const patient = AppState.patients.find(p => p.id === activePatientId);

    if (!patient) return;

    if (tab === 'resumo') {
        content.innerHTML = renderPatientResumo(patient);
    } else if (tab === 'odontograma') {
        content.innerHTML = renderOdontogram(patient);
    } else if (tab === 'historico') {
        content.innerHTML = renderPatientHistory(patient);
    } else if (tab === 'orcamento') {
        content.innerHTML = renderBudgetGenerator(patient);
    }
};

function renderBudgetGenerator(patient) {
    return `
        <div style="background: white; padding: 2rem; border-radius: 12px; border: 1px solid var(--gray-200);">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--gray-800);">Gerador de Orçamentos</h4>
                <p style="color: var(--gray-500); font-size: 0.9rem;">Selecione os procedimentos para gerar o PDF.</p>
            </div>

            <div id="budgetItems" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                <div class="budget-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 1rem; align-items: end;">
                    <div class="form-group" style="margin: 0;">
                        <label class="form-label">Procedimento</label>
                        <input type="text" class="form-input procedure-name" placeholder="Ex: Limpeza, Canal...">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label class="form-label">Valor (R$)</label>
                        <input type="number" class="form-input procedure-value" placeholder="0,00" step="0.01">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label class="form-label">Qtd</label>
                        <input type="number" class="form-input procedure-qty" value="1">
                    </div>
                    <button class="btn btn-icon" style="color: var(--error-500);" onclick="this.parentElement.remove()">🗑️</button>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: space-between; align-items: center; border-top: 1px solid var(--gray-100); padding-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="addBudgetItem()">➕ Adicionar Item</button>
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-bottom: 4px;">Forma de Pagamento</div>
                    <select id="budgetPayment" class="form-select" style="width: 200px; margin-bottom: 1rem;">
                        <option value="À vista (Dinheiro/PIX)">À vista (Dinheiro/PIX)</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Parcelado 10x sem juros">Parcelado 10x sem juros</option>
                        <option value="Boleto Bancário">Boleto Bancário</option>
                    </select>
                    <br>
                    <button class="btn btn-primary" style="padding: 1rem 2rem;" onclick="generateBudgetPDF('${patient.id}')">📄 Gerar PDF Profissional</button>
                </div>
            </div>
        </div>
    `;
}

window.addBudgetItem = () => {
    const container = document.getElementById('budgetItems');
    const div = document.createElement('div');
    div.className = 'budget-item';
    div.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 1rem; align-items: end;';
    div.innerHTML = `
        <div class="form-group" style="margin: 0;">
            <label class="form-label">Procedimento</label>
            <input type="text" class="form-input procedure-name" placeholder="Ex: Limpeza, Canal...">
        </div>
        <div class="form-group" style="margin: 0;">
            <label class="form-label">Valor (R$)</label>
            <input type="number" class="form-input procedure-value" placeholder="0,00" step="0.01">
        </div>
        <div class="form-group" style="margin: 0;">
            <label class="form-label">Qtd</label>
            <input type="number" class="form-input procedure-qty" value="1">
        </div>
        <button class="btn btn-icon" style="color: var(--error-500);" onclick="this.parentElement.remove()">🗑️</button>
    `;
    container.appendChild(div);
};

window.generateBudgetPDF = (patientId) => {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235); // Primary 600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ODONTO COMPANY', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('ORÇAMENTO DE TRATAMENTO ODONTOLÓGICO', 105, 30, { align: 'center' });

    // Patient Info
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PACIENTE:', 15, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(patient.name.toUpperCase(), 45, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('DATA:', 150, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('pt-BR'), 165, 55);

    // Table
    const items = [];
    let total = 0;
    document.querySelectorAll('.budget-item').forEach(item => {
        const name = item.querySelector('.procedure-name').value;
        const val = parseFloat(item.querySelector('.procedure-value').value) || 0;
        const qty = parseInt(item.querySelector('.procedure-qty').value) || 1;
        if (name) {
            const subtotal = val * qty;
            items.push([name, qty, `R$ ${val.toFixed(2)}`, `R$ ${subtotal.toFixed(2)}`]);
            total += subtotal;
        }
    });

    doc.autoTable({
        startY: 65,
        head: [['Procedimento', 'Qtd', 'Unitário', 'Subtotal']],
        body: items,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        foot: [['', '', 'TOTAL:', `R$ ${total.toFixed(2)}`]],
        footStyles: { fillColor: [243, 244, 246], textColor: [31, 41, 55], fontStyle: 'bold' }
    });

    // Payment & Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('FORMA DE PAGAMENTO:', 15, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(document.getElementById('budgetPayment').value, 70, finalY);

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    const disclaimer = 'Este orçamento tem validade de 30 dias. Os valores podem sofrer alterações após este período.';
    doc.text(disclaimer, 105, 280, { align: 'center' });

    doc.save(`Orcamento_${patient.name.replace(/\s+/g, '_')}.pdf`);
    showNotification('Orçamento gerado com sucesso!', 'success');
};

function renderPatientResumo(patient) {
    window.lastViewedPatientId = patient.id; // Store for tab switching
    return `
        <div data-patient-id="${patient.id}">
            <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; border: 1px solid var(--gray-200);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                    <p><strong>CPF:</strong> ${escapeHTML(patient.cpf || 'N/A')}</p>
                    <p><strong>Nascimento:</strong> ${patient.birthDate ? formatDate(patient.birthDate) : 'N/A'}</p>
                    <p><strong>Endereço:</strong> ${escapeHTML(patient.address || 'N/A')}</p>
                </div>
            </div>
            
            <h4 style="color: var(--gray-700); margin-bottom: 1rem; border-left: 4px solid var(--primary-500); padding-left: 10px;">📋 Anamnese</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div class="card" style="padding: 1rem;">
                    <h5 style="margin-bottom: 0.5rem; color: var(--gray-600);">Queixa Principal</h5>
                    <p style="color: var(--gray-800);">${escapeHTML(patient.mainComplaint || 'Nenhuma registrada')}</p>
                </div>
                <div class="card" style="padding: 1rem;">
                    <h5 style="margin-bottom: 0.5rem; color: var(--gray-600);">Histórico Médico</h5>
                    <p style="color: var(--gray-800);">${escapeHTML(patient.medicalHistory || 'Sem observações')}</p>
                </div>
                <div class="card" style="padding: 1rem;">
                    <h5 style="margin-bottom: 0.5rem; color: var(--gray-600);">Alergias</h5>
                    <p style="color: var(--error-600); font-weight: 600;">⚠️ ${escapeHTML(patient.allergies || 'Nenhuma conhecida')}</p>
                </div>
                <div class="card" style="padding: 1rem;">
                    <h5 style="margin-bottom: 0.5rem; color: var(--gray-600);">Medicações</h5>
                    <p style="color: var(--gray-800);">${escapeHTML(patient.medications || 'Nenhuma')}</p>
                </div>
            </div>
        </div>
    `;
}

function renderOdontogram(patient) {
    const quadrants = {
        topRight: [18, 17, 16, 15, 14, 13, 12, 11],
        topLeft: [21, 22, 23, 24, 25, 26, 27, 28],
        bottomRight: [48, 47, 46, 45, 44, 43, 42, 41],
        bottomLeft: [31, 32, 33, 34, 35, 36, 37, 38]
    };

    const generateGroup = (teeth) => teeth.map(num => {
        const statuses = patient.odontogram || {};
        const status = statuses[num] || 'healthy';
        const label = status === 'caries' ? 'C' : status === 'restored' ? 'R' : status === 'missing' ? 'X' : '';
        return `
            <div class="tooth-item">
                <span class="tooth-num">${num}</span>
                <div class="tooth-viz ${status}" onclick="cycleToothStatus('${patient.id}', ${num})">
                    ${label}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div data-patient-id="${patient.id}">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.5rem;">Mapa Odontológico Visual</h4>
                <p style="color: var(--gray-500); font-size: 0.9rem;">Toque no dente para selecionar o estado clínico.</p>
            </div>
            
            <div class="odontogram-container">
                <!-- Superior Row -->
                <div style="display: flex; gap: 40px; border-bottom: 1px dashed var(--gray-200); padding-bottom: 24px; width: 100%; justify-content: center;">
                    <div class="tooth-group">${generateGroup(quadrants.topRight)}</div>
                    <div style="width: 2px; background: var(--gray-100); height: 70px;"></div>
                    <div class="tooth-group">${generateGroup(quadrants.topLeft)}</div>
                </div>
                
                <!-- Inferior Row -->
                <div style="display: flex; gap: 40px; padding-top: 24px; width: 100%; justify-content: center;">
                    <div class="tooth-group">${generateGroup(quadrants.bottomRight)}</div>
                    <div style="width: 2px; background: var(--gray-100); height: 70px;"></div>
                    <div class="tooth-group">${generateGroup(quadrants.bottomLeft)}</div>
                </div>
            </div>

            <div class="odontogram-legend">
                <div class="legend-item"><div class="legend-box" style="background: #f8fafc;"></div> Saudável</div>
                <div class="legend-item"><div class="legend-box" style="background: #fee2e2; border-color: #ef4444;"></div> Cárie (C)</div>
                <div class="legend-item"><div class="legend-box" style="background: #dbeafe; border-color: #3b82f6;"></div> Restaurado (R)</div>
                <div class="legend-item"><div class="legend-box" style="background: #1e293b;"></div> Ausente (X)</div>
            </div>
        </div>
    `;
}

window.cycleToothStatus = (patientId, toothNum) => {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;

    if (!patient.odontogram) patient.odontogram = {};
    const statuses = ['healthy', 'caries', 'restored', 'missing'];
    let currentIdx = statuses.indexOf(patient.odontogram[toothNum] || 'healthy');
    let nextIdx = (currentIdx + 1) % statuses.length;

    patient.odontogram[toothNum] = statuses[nextIdx];
    saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);

    // Re-render
    const content = document.getElementById('patientTabContent');
    content.innerHTML = renderOdontogram(patient);
};

function renderPatientHistory(patient) {
    const history = patient.history || [];
    const appointments = AppState.appointments.filter(a => a.patientId === patient.id);

    // Combine for a complete timeline
    const timeline = [
        ...history.map(h => ({ ...h, type: 'note' })),
        ...appointments.map(a => ({
            date: a.date,
            note: `📅 Agendamento: ${a.procedure} | Status: ${a.status} ${a.attended ? '(Compareceu)' : ''}`,
            type: 'appointment'
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h4 style="margin: 0;">Linha do Tempo</h4>
                <button class="btn btn-small btn-primary" onclick="showAddPatientNote('${patient.id}')">+ Nova Evolução</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${timeline.length > 0 ? timeline.map(item => `
                    <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid ${item.type === 'appointment' ? 'var(--info-500)' : 'var(--primary-400)'}; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.25rem;">${formatDateTime(item.date)}</div>
                        <p style="margin: 0; color: var(--gray-800); font-size: 0.9rem;">${item.note}</p>
                    </div>
                `).join('') : '<p style="text-align: center; color: var(--gray-400); padding: 2rem;">Nenhuma atividade registrada.</p>'}
            </div>
        </div>
    `;
}

window.showAddPatientNote = (patientId) => {
    const html = `
        <div class="form-group">
            <label class="form-label">Evolução do Caso / Observação</label>
            <textarea id="patientNote" class="form-textarea" rows="4" placeholder="Descreva o procedimento realizado hoje..."></textarea>
        </div>
    `;
    // We need to keep the modal context. This is reaching the limit of openModal simplicity.
    // I'll just use a prompt for now or a sub-modal. Actually, I'll use a prompt to not mess up the viewPatientDetails modal.
    const note = prompt("Digite a evolução do paciente:");
    if (note) {
        if (typeof addPatientHistory === 'function') {
            addPatientHistory(patientId, note);
            // Refresh view
            const patient = AppState.patients.find(p => p.id === patientId);
            document.getElementById('patientTabContent').innerHTML = renderPatientHistory(patient);
        }
    }
};

// Edit Patient
function editPatient(patientId) {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;

    const formHTML = `
        <form id="editPatientForm" onsubmit="updatePatient(event, '${patientId}')">
            <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1.125rem;">Dados Pessoais</h4>
            
            <div class="form-group">
                <label class="form-label">Nome completo *</label>
                <input type="text" class="form-input" name="name" value="${escapeHTML(patient.name)}" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">CPF</label>
                    <input type="text" class="form-input mask-cpf" name="cpf" value="${escapeHTML(patient.cpf || '')}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Data de nascimento</label>
                    <input type="date" class="form-input" name="birthDate" value="${patient.birthDate || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Telefone *</label>
                    <input type="tel" class="form-input" name="phone" value="${escapeHTML(patient.phone)}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">E-mail</label>
                    <input type="email" class="form-input" name="email" value="${escapeHTML(patient.email || '')}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Endereço completo</label>
                <input type="text" class="form-input" name="address" value="${escapeHTML(patient.address || '')}">
            </div>
            
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--gray-200);">
            
            <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1.125rem;">Anamnese Odontológica</h4>
            
            <div class="form-group">
                <label class="form-label">Queixa principal</label>
                <textarea class="form-textarea" name="mainComplaint" rows="2">${escapeHTML(patient.mainComplaint || '')}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Histórico médico</label>
                <textarea class="form-textarea" name="medicalHistory" rows="3">${escapeHTML(patient.medicalHistory || '')}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Medicações em uso</label>
                    <textarea class="form-textarea" name="medications" rows="2">${escapeHTML(patient.medications || '')}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Alergias</label>
                    <textarea class="form-textarea" name="allergies" rows="2">${escapeHTML(patient.allergies || '')}</textarea>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Condições de saúde bucal</label>
                <textarea class="form-textarea" name="dentalConditions" rows="3">${escapeHTML(patient.dentalConditions || '')}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tratamentos odontológicos anteriores</label>
                <textarea class="form-textarea" name="previousTreatments" rows="2">${escapeHTML(patient.previousTreatments || '')}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Observações adicionais</label>
                <textarea class="form-textarea" name="notes" rows="2">${escapeHTML(patient.notes || '')}</textarea>
            </div>
        </form>
    `;

    openModal('Editar Ficha de Paciente', formHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Alterações', class: 'btn-primary', onclick: "document.getElementById('editPatientForm').requestSubmit()" }
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
window.renderPatientsList = renderPatientsList;
window.viewPatientDetails = viewPatientDetails;
window.editPatient = editPatient;
window.savePatient = savePatient;
window.updatePatient = updatePatient;
window.showPatientDetails = viewPatientDetails; // Alias for global search
