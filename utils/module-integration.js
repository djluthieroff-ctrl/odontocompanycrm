// Module Integration Utility - Campaigns Module
// ================================================

// Global state for module integration
const ModuleIntegrationState = {
    // Integration points with other modules
    integrations: {
        leads: {
            enabled: true,
            syncContacts: true,
            createCampaigns: true
        },
        patients: {
            enabled: true,
            syncData: true,
            createCampaigns: true
        },
        appointments: {
            enabled: true,
            syncReminders: true,
            createCampaigns: true
        },
        redFolder: {
            enabled: true,
            syncLeads: true,
            createCampaigns: true
        },
        reports: {
            enabled: true,
            syncData: true,
            generateReports: true
        }
    },

    // Cross-module data mapping
    dataMapping: {
        leads: {
            source: 'leads',
            fields: {
                name: ['name', 'nome'],
                phone: ['phone', 'telefone', 'celular', 'whatsapp'],
                email: ['email'],
                source: ['source', 'canal_origem'],
                created_at: ['created_at', 'data_cadastro']
            }
        },
        patients: {
            source: 'patients',
            fields: {
                name: ['name', 'nome'],
                phone: ['phone', 'telefone', 'celular', 'whatsapp'],
                email: ['email'],
                last_appointment: ['last_appointment_date', 'ultima_consulta'],
                next_appointment: ['next_appointment_date', 'proxima_consulta'],
                treatment_status: ['treatment_status', 'status_tratamento']
            }
        },
        appointments: {
            source: 'appointments',
            fields: {
                patient_name: ['patient_name', 'nome_paciente'],
                patient_phone: ['patient_phone', 'telefone_paciente'],
                appointment_date: ['date', 'data_consulta'],
                appointment_time: ['time', 'horario'],
                procedure: ['procedure', 'procedimento'],
                status: ['status']
            }
        }
    }
};

// Initialize Module Integration
function initModuleIntegration() {
    console.log('🔗 Module Integration initialized');
    setupModuleEventListeners();
    loadIntegrationSettings();
    setupCrossModuleSync();
}

// Load Integration Settings from Storage
function loadIntegrationSettings() {
    try {
        const saved = localStorage.getItem('moduleIntegrationSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            Object.assign(ModuleIntegrationState.integrations, settings);
        }
    } catch (error) {
        console.error('❌ Error loading integration settings:', error);
    }
}

// Save Integration Settings to Storage
function saveIntegrationSettings() {
    try {
        localStorage.setItem('moduleIntegrationSettings', JSON.stringify(ModuleIntegrationState.integrations));
    } catch (error) {
        console.error('❌ Error saving integration settings:', error);
    }
}

// Setup Module Event Listeners
function setupModuleEventListeners() {
    // Listen for data changes in other modules
    document.addEventListener('leadsDataUpdated', handleLeadsDataUpdate);
    document.addEventListener('patientsDataUpdated', handlePatientsDataUpdate);
    document.addEventListener('appointmentsDataUpdated', handleAppointmentsDataUpdate);
    document.addEventListener('redFolderDataUpdated', handleRedFolderDataUpdate);
}

// Setup Cross-Module Sync
function setupCrossModuleSync() {
    // Sync leads to campaigns
    if (ModuleIntegrationState.integrations.leads.syncContacts) {
        syncLeadsToCampaigns();
    }

    // Sync patients to campaigns
    if (ModuleIntegrationState.integrations.patients.syncData) {
        syncPatientsToCampaigns();
    }

    // Sync appointments for reminders
    if (ModuleIntegrationState.integrations.appointments.syncReminders) {
        setupAppointmentReminders();
    }
}

// Handle Leads Data Update
function handleLeadsDataUpdate(event) {
    if (!ModuleIntegrationState.integrations.leads.enabled) return;

    const leads = event.detail.leads;
    if (leads && ModuleIntegrationState.integrations.leads.syncContacts) {
        syncLeadsToContacts(leads);
    }
}

// Handle Patients Data Update
function handlePatientsDataUpdate(event) {
    if (!ModuleIntegrationState.integrations.patients.enabled) return;

    const patients = event.detail.patients;
    if (patients && ModuleIntegrationState.integrations.patients.syncData) {
        syncPatientsToContacts(patients);
    }
}

// Handle Appointments Data Update
function handleAppointmentsDataUpdate(event) {
    if (!ModuleIntegrationState.integrations.appointments.enabled) return;

    const appointments = event.detail.appointments;
    if (appointments && ModuleIntegrationState.integrations.appointments.syncReminders) {
        generateAppointmentReminders(appointments);
    }
}

// Handle Red Folder Data Update
function handleRedFolderDataUpdate(event) {
    if (!ModuleIntegrationState.integrations.redFolder.enabled) return;

    const redFolderLeads = event.detail.leads;
    if (redFolderLeads && ModuleIntegrationState.integrations.redFolder.syncLeads) {
        createRedFolderCampaigns(redFolderLeads);
    }
}

// Sync Leads to Campaigns Contacts
function syncLeadsToContacts(leads) {
    const newContacts = [];

    leads.forEach(lead => {
        // Check if contact already exists
        const existingContact = CampaignsState.contacts.find(c =>
            c.phone === lead.phone || c.email === lead.email
        );

        if (!existingContact) {
            const contact = {
                id: generateId(),
                contact_list_id: null, // Will be assigned to a default list
                name: lead.name || lead.nome || 'Lead',
                phone: lead.phone || lead.telefone || '',
                email: lead.email || '',
                status: 'valid',
                variables: {
                    fonte_lead: lead.source || lead.canal_origem || 'Desconhecida',
                    data_cadastro: lead.created_at || lead.data_cadastro || new Date().toISOString(),
                    score_lead: lead.score || 0,
                    etapa_vendas: lead.stage || 'Novo'
                },
                is_blacklisted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            newContacts.push(contact);
        }
    });

    if (newContacts.length > 0) {
        // Create or update default contact list for leads
        let leadsList = CampaignsState.contactLists.find(cl => cl.name === 'Leads Importados');
        if (!leadsList) {
            leadsList = {
                id: generateId(),
                name: 'Leads Importados',
                description: 'Contatos importados automaticamente dos leads',
                total_contacts: 0,
                valid_contacts: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            CampaignsState.contactLists.push(leadsList);
        }

        // Assign contact list ID to new contacts
        newContacts.forEach(contact => {
            contact.contact_list_id = leadsList.id;
        });

        // Add contacts to campaigns state
        CampaignsState.contacts = CampaignsState.contacts.concat(newContacts);
        leadsList.total_contacts += newContacts.length;
        leadsList.valid_contacts += newContacts.length;

        saveCampaignsData();
        showNotification(`${newContacts.length} novos leads sincronizados para campanhas`, 'success');
    }
}

// Sync Patients to Campaigns Contacts
function syncPatientsToContacts(patients) {
    const newContacts = [];

    patients.forEach(patient => {
        // Check if contact already exists
        const existingContact = CampaignsState.contacts.find(c =>
            c.phone === patient.phone || c.email === patient.email
        );

        if (!existingContact) {
            const contact = {
                id: generateId(),
                contact_list_id: null, // Will be assigned to a default list
                name: patient.name || patient.nome || 'Paciente',
                phone: patient.phone || patient.telefone || '',
                email: patient.email || '',
                status: 'valid',
                variables: {
                    data_nascimento: patient.birth_date || patient.data_nascimento || '',
                    cpf: patient.cpf || '',
                    endereco: patient.address || patient.endereco || '',
                    cidade: patient.city || patient.cidade || '',
                    estado: patient.state || patient.estado || '',
                    profissao: patient.profession || patient.profissao || '',
                    convenio: patient.insurance || patient.convenio || '',
                    plano: patient.plan || patient.plano || '',
                    validade_convenio: patient.insurance_validity || patient.validade_convenio || '',
                    ultima_consulta: patient.last_appointment || patient.ultima_consulta || '',
                    proxima_consulta: patient.next_appointment || patient.proxima_consulta || '',
                    tratamento_recomendado: patient.recommended_treatment || patient.tratamento_recomendado || '',
                    status_tratamento: patient.treatment_status || patient.status_tratamento || 'Ativo'
                },
                is_blacklisted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            newContacts.push(contact);
        }
    });

    if (newContacts.length > 0) {
        // Create or update default contact list for patients
        let patientsList = CampaignsState.contactLists.find(cl => cl.name === 'Pacientes Importados');
        if (!patientsList) {
            patientsList = {
                id: generateId(),
                name: 'Pacientes Importados',
                description: 'Contatos importados automaticamente dos pacientes',
                total_contacts: 0,
                valid_contacts: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            CampaignsState.contactLists.push(patientsList);
        }

        // Assign contact list ID to new contacts
        newContacts.forEach(contact => {
            contact.contact_list_id = patientsList.id;
        });

        // Add contacts to campaigns state
        CampaignsState.contacts = CampaignsState.contacts.concat(newContacts);
        patientsList.total_contacts += newContacts.length;
        patientsList.valid_contacts += newContacts.length;

        saveCampaignsData();
        showNotification(`${newContacts.length} novos pacientes sincronizados para campanhas`, 'success');
    }
}

// Setup Appointment Reminders
function setupAppointmentReminders() {
    // Generate reminder campaigns for upcoming appointments
    const appointments = getUpcomingAppointments();
    if (appointments.length > 0) {
        generateAppointmentReminders(appointments);
    }
}

// Get Upcoming Appointments
function getUpcomingAppointments() {
    // This would integrate with the appointments module
    // For now, return mock data or empty array
    return [];
}

// Generate Appointment Reminders
function generateAppointmentReminders(appointments) {
    const reminderCampaigns = [];

    appointments.forEach(appointment => {
        // Create reminder campaign for each appointment
        const campaign = {
            id: generateId(),
            name: `Lembrete - ${appointment.patient_name} - ${appointment.date}`,
            type: 'reminder',
            status: 'scheduled',
            template_id: getReminderTemplateId(),
            contact_list_id: createAppointmentContactList(appointment),
            scheduled_at: calculateReminderTime(appointment.date, appointment.time),
            timezone: 'America/Sao_Paulo',
            daily_limit: 100,
            current_day_count: 0,
            interval_min: 5,
            interval_max: 15,
            total_sent: 0,
            total_delivered: 0,
            total_read: 0,
            total_failed: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            started_at: null,
            completed_at: null
        };

        reminderCampaigns.push(campaign);
    });

    if (reminderCampaigns.length > 0) {
        CampaignsState.campaigns = CampaignsState.campaigns.concat(reminderCampaigns);
        saveCampaignsData();
        showNotification(`${reminderCampaigns.length} campanhas de lembrete criadas`, 'success');
    }
}

// Get Reminder Template ID
function getReminderTemplateId() {
    const reminderTemplate = CampaignsState.templates.find(t => t.category === 'reminder');
    return reminderTemplate ? reminderTemplate.id : null;
}

// Create Appointment Contact List
function createAppointmentContactList(appointment) {
    const contactList = {
        id: generateId(),
        name: `Lembrete - ${appointment.patient_name}`,
        description: `Contato para lembrete de consulta de ${appointment.patient_name}`,
        total_contacts: 1,
        valid_contacts: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const contact = {
        id: generateId(),
        contact_list_id: contactList.id,
        name: appointment.patient_name,
        phone: appointment.patient_phone,
        email: '',
        status: 'valid',
        variables: {
            data_consulta: appointment.appointment_date,
            horario: appointment.appointment_time,
            procedimento: appointment.procedure
        },
        is_blacklisted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    CampaignsState.contactLists.push(contactList);
    CampaignsState.contacts.push(contact);
    return contactList.id;
}

// Calculate Reminder Time
function calculateReminderTime(date, time) {
    // Calculate reminder time (e.g., 1 day before appointment)
    const appointmentDateTime = new Date(`${date}T${time}`);
    const reminderTime = new Date(appointmentDateTime.getTime() - (24 * 60 * 60 * 1000)); // 1 day before
    return reminderTime.toISOString();
}

// Create Red Folder Campaigns
function createRedFolderCampaigns(leads) {
    const redFolderLeads = leads.filter(lead => lead.status === 'red_folder' || lead.stage === 'pasta_vermelha');

    if (redFolderLeads.length > 0) {
        const campaign = {
            id: generateId(),
            name: `Pasta Vermelha - ${new Date().toLocaleDateString('pt-BR')}`,
            type: 'red_folder',
            status: 'draft',
            template_id: getRedFolderTemplateId(),
            contact_list_id: createRedFolderContactList(redFolderLeads),
            scheduled_at: null,
            timezone: 'America/Sao_Paulo',
            daily_limit: 200,
            current_day_count: 0,
            interval_min: 5,
            interval_max: 10,
            total_sent: 0,
            total_delivered: 0,
            total_read: 0,
            total_failed: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            started_at: null,
            completed_at: null
        };

        CampaignsState.campaigns.push(campaign);
        saveCampaignsData();
        showNotification(`Campanha de Pasta Vermelha criada com ${redFolderLeads.length} leads`, 'success');
    }
}

// Get Red Folder Template ID
function getRedFolderTemplateId() {
    const redFolderTemplate = CampaignsState.templates.find(t => t.category === 'red_folder');
    return redFolderTemplate ? redFolderTemplate.id : null;
}

// Create Red Folder Contact List
function createRedFolderContactList(leads) {
    const contactList = {
        id: generateId(),
        name: `Pasta Vermelha - ${new Date().toLocaleDateString('pt-BR')}`,
        description: `${leads.length} leads da pasta vermelha`,
        total_contacts: leads.length,
        valid_contacts: leads.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const contacts = leads.map(lead => ({
        id: generateId(),
        contact_list_id: contactList.id,
        name: lead.name || lead.nome || 'Lead',
        phone: lead.phone || lead.telefone || '',
        email: lead.email || '',
        status: 'valid',
        variables: {
            motivo: lead.reason || lead.motivo || 'Sem motivo definido',
            data_ultimo_contato: lead.last_contact || lead.data_ultimo_contato || '',
            proxima_acao: lead.next_action || lead.proxima_acao || ''
        },
        is_blacklisted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));

    CampaignsState.contactLists.push(contactList);
    CampaignsState.contacts = CampaignsState.contacts.concat(contacts);
    return contactList.id;
}

// Sync Data to Reports Module
function syncDataToReports() {
    if (!ModuleIntegrationState.integrations.reports.enabled) return;

    const campaignData = {
        campaigns: CampaignsState.campaigns,
        templates: CampaignsState.templates,
        contactLists: CampaignsState.contactLists,
        contacts: CampaignsState.contacts,
        syncTime: new Date().toISOString()
    };

    // Dispatch event to reports module
    document.dispatchEvent(new CustomEvent('campaignsDataUpdated', {
        detail: campaignData
    }));
}

// Update Integration Settings
function updateIntegrationSettings(settings) {
    Object.assign(ModuleIntegrationState.integrations, settings);
    saveIntegrationSettings();
    setupCrossModuleSync();
    showNotification('Configurações de integração atualizadas', 'success');
}

// Show Integration Settings
function showIntegrationSettings() {
    const integrations = ModuleIntegrationState.integrations;

    const formHTML = `
        <div class="integration-settings">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Integração entre Módulos</h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-bottom: 2rem;">
                <!-- Leads Integration -->
                <div style="border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 2rem;">💬</span>
                        <h4 style="margin: 0; font-size: 1.125rem; color: var(--gray-900);">Leads</h4>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="leadsEnabled" ${integrations.leads.enabled ? 'checked' : ''}>
                            <span>Habilitar Integração</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="leadsSyncContacts" ${integrations.leads.syncContacts ? 'checked' : ''}>
                            <span>Sincronizar Contatos</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="leadsCreateCampaigns" ${integrations.leads.createCampaigns ? 'checked' : ''}>
                            <span>Criar Campanhas Automáticas</span>
                        </label>
                    </div>
                </div>

                <!-- Patients Integration -->
                <div style="border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 2rem;">👥</span>
                        <h4 style="margin: 0; font-size: 1.125rem; color: var(--gray-900);">Pacientes</h4>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="patientsEnabled" ${integrations.patients.enabled ? 'checked' : ''}>
                            <span>Habilitar Integração</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="patientsSyncData" ${integrations.patients.syncData ? 'checked' : ''}>
                            <span>Sincronizar Dados</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="patientsCreateCampaigns" ${integrations.patients.createCampaigns ? 'checked' : ''}>
                            <span>Criar Campanhas de Fidelização</span>
                        </label>
                    </div>
                </div>

                <!-- Appointments Integration -->
                <div style="border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 2rem;">📅</span>
                        <h4 style="margin: 0; font-size: 1.125rem; color: var(--gray-900);">Agendamentos</h4>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="appointmentsEnabled" ${integrations.appointments.enabled ? 'checked' : ''}>
                            <span>Habilitar Integração</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="appointmentsSyncReminders" ${integrations.appointments.syncReminders ? 'checked' : ''}>
                            <span>Sincronizar Lembretes</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="appointmentsCreateCampaigns" ${integrations.appointments.createCampaigns ? 'checked' : ''}>
                            <span>Criar Campanhas de Lembrete</span>
                        </label>
                    </div>
                </div>

                <!-- Red Folder Integration -->
                <div style="border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 2rem;">🚩</span>
                        <h4 style="margin: 0; font-size: 1.125rem; color: var(--gray-900);">Pasta Vermelha</h4>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="redFolderEnabled" ${integrations.redFolder.enabled ? 'checked' : ''}>
                            <span>Habilitar Integração</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="redFolderSyncLeads" ${integrations.redFolder.syncLeads ? 'checked' : ''}>
                            <span>Sincronizar Leads</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="redFolderCreateCampaigns" ${integrations.redFolder.createCampaigns ? 'checked' : ''}>
                            <span>Criar Campanhas de Recuperação</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary" onclick="saveIntegrationSettings()">💾 Salvar Configurações</button>
                    <button class="btn btn-secondary" onclick="resetIntegrationSettings()">🔄 Resetar</button>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    openModal('Integração entre Módulos', formHTML, []);

    // Setup event listeners for the modal
    setupIntegrationModalListeners();
}

// Setup Integration Modal Listeners
function setupIntegrationModalListeners() {
    const checkboxes = document.querySelectorAll('#integration-settings-modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateIntegrationFromModal);
    });
}

// Update Integration from Modal
function updateIntegrationFromModal() {
    const settings = {
        leads: {
            enabled: document.getElementById('leadsEnabled').checked,
            syncContacts: document.getElementById('leadsSyncContacts').checked,
            createCampaigns: document.getElementById('leadsCreateCampaigns').checked
        },
        patients: {
            enabled: document.getElementById('patientsEnabled').checked,
            syncData: document.getElementById('patientsSyncData').checked,
            createCampaigns: document.getElementById('patientsCreateCampaigns').checked
        },
        appointments: {
            enabled: document.getElementById('appointmentsEnabled').checked,
            syncReminders: document.getElementById('appointmentsSyncReminders').checked,
            createCampaigns: document.getElementById('appointmentsCreateCampaigns').checked
        },
        redFolder: {
            enabled: document.getElementById('redFolderEnabled').checked,
            syncLeads: document.getElementById('redFolderSyncLeads').checked,
            createCampaigns: document.getElementById('redFolderCreateCampaigns').checked
        }
    };

    updateIntegrationSettings(settings);
}

// Save Integration Settings (from modal)
function saveIntegrationSettings() {
    updateIntegrationFromModal();
    closeModal();
    showNotification('Configurações salvas com sucesso!', 'success');
}

// Reset Integration Settings
function resetIntegrationSettings() {
    const defaultSettings = {
        leads: { enabled: true, syncContacts: true, createCampaigns: true },
        patients: { enabled: true, syncData: true, createCampaigns: true },
        appointments: { enabled: true, syncReminders: true, createCampaigns: true },
        redFolder: { enabled: true, syncLeads: true, createCampaigns: true }
    };

    updateIntegrationSettings(defaultSettings);
    showNotification('Configurações resetadas para o padrão', 'info');
}

// Export functions
window.initModuleIntegration = initModuleIntegration;
window.loadIntegrationSettings = loadIntegrationSettings;
window.saveIntegrationSettings = saveIntegrationSettings;
window.updateIntegrationSettings = updateIntegrationSettings;
window.showIntegrationSettings = showIntegrationSettings;
window.setupModuleEventListeners = setupModuleEventListeners;
window.setupCrossModuleSync = setupCrossModuleSync;
window.syncLeadsToContacts = syncLeadsToContacts;
window.syncPatientsToContacts = syncPatientsToContacts;
window.setupAppointmentReminders = setupAppointmentReminders;
window.generateAppointmentReminders = generateAppointmentReminders;
window.createRedFolderCampaigns = createRedFolderCampaigns;
window.syncDataToReports = syncDataToReports;
window.getUpcomingAppointments = getUpcomingAppointments;
window.getReminderTemplateId = getReminderTemplateId;
window.createAppointmentContactList = createAppointmentContactList;
window.calculateReminderTime = calculateReminderTime;
window.getRedFolderTemplateId = getRedFolderTemplateId;
window.createRedFolderContactList = createRedFolderContactList;
window.handleLeadsDataUpdate = handleLeadsDataUpdate;
window.handlePatientsDataUpdate = handlePatientsDataUpdate;
window.handleAppointmentsDataUpdate = handleAppointmentsDataUpdate;
window.handleRedFolderDataUpdate = handleRedFolderDataUpdate;
window.setupIntegrationModalListeners = setupIntegrationModalListeners;
window.updateIntegrationFromModal = updateIntegrationFromModal;
window.saveIntegrationSettings = saveIntegrationSettings;
window.resetIntegrationSettings = resetIntegrationSettings;