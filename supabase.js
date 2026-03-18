// Supabase Data Layer - CRM Odonto Company
// ==========================================
// Replaces localStorage with Supabase (PostgreSQL) as the data source.
// Falls back to localStorage if Supabase is unavailable (offline mode).

// ─── Configuration ──────────────────────────────────────────────────────
// Fill credentials in config.js (window.__APP_CONFIG__)
// Supabase dashboard: Settings > API
const appConfig = window.__APP_CONFIG__ || {};
const SUPABASE_URL = (appConfig.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (appConfig.SUPABASE_ANON_KEY || '').trim();

// ─── State ──────────────────────────────────────────────────────────────
let supabaseClient = null;
let isSupabaseReady = false;
let currentUser = null;

// ─── Initialize ─────────────────────────────────────────────────────────
function initSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase not configured. Running in LocalStorage mode.');
        isSupabaseReady = false;
        return false;
    }

    try {
        // Use the global supabase client from CDN
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isSupabaseReady = true;
        console.log('✅ Supabase client initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        isSupabaseReady = false;
        return false;
    }
}

// ─── Auth Helpers ───────────────────────────────────────────────────────
async function supabaseSignIn(email, password) {
    if (!isSupabaseReady) return { error: { message: 'Supabase not configured' } };

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (!error) {
        currentUser = data.user;
        console.log('✅ Signed in as:', currentUser.email);
    }
    return { data, error };
}

async function supabaseSignUp(email, password) {
    if (!isSupabaseReady) return { error: { message: 'Supabase not configured' } };

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    return { data, error };
}

async function supabaseSignOut() {
    if (!isSupabaseReady) return;
    await supabaseClient.auth.signOut();
    currentUser = null;
}

async function supabaseGetUser() {
    if (!isSupabaseReady) return null;

    const { data: { user } } = await supabaseClient.auth.getUser();
    currentUser = user;
    return user;
}

function onAuthStateChange(callback) {
    if (!isSupabaseReady) return;

    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        callback(event, session);
    });
}

// ─── Field Name Mapping (camelCase ↔ snake_case) ────────────────────────
// DEFINITIVE LIST OF DB COLUMNS TO PREVENT 400 ERRORS
const DB_COLUMNS = {
    leads: [
        'id', 'legacy_id', 'user_id', 'name', 'phone', 'email', 'channel', 'source',
        'interest', 'message', 'status', 'sale_status', 'sale_value', 'interactions',
        'visit_date', 'scheduled_at', 'contacted_at', 'attended', 'created_at', 'updated_at'
    ],
    patients: [
        'id', 'legacy_id', 'user_id', 'name', 'cpf', 'birth_date', 'phone', 'email',
        'address', 'main_complaint', 'medical_history', 'medications', 'allergies',
        'dental_conditions', 'previous_treatments', 'notes', 'odontogram', 'history',
        'converted_from', 'created_at', 'updated_at'
    ],
    appointments: [
        'id', 'legacy_id', 'user_id', 'patient_id', 'patient_name', 'date', 'procedure',
        'duration', 'notes', 'status', 'attended', 'sale_date', 'created_at', 'updated_at'
    ],
    settings: [
        'id', 'user_id', 'crc_name', 'daily_goal', 'commission_value',
        'weekly_appointments_goal', 'weekly_visits_goal', 'updated_at',
        'zapi_instance', 'zapi_token', 'zapi_client_token',
        'chatwoot_account_id', 'n8n_webhook_leads', 'n8n_webhook_appointments'
    ],
    old_patients: [
        'id', 'user_id', 'name', 'phone', 'last_consultation', 'interest',
        'status', 'notes', 'recovered_at', 'created_at', 'updated_at'
    ],
    received_payments: [
        'id', 'legacy_id', 'user_id', 'patient_name', 'origin', 'category',
        'amount', 'method', 'notes', 'payment_date', 'receipt_url', 'created_at', 'updated_at'
    ],
    device_maintenances: [
        'id', 'legacy_id', 'user_id', 'device', 'provider', 'cost', 'due_date',
        'status', 'notes', 'paid_at', 'created_at', 'updated_at'
    ],
    debtor_notifications: [
        'id', 'legacy_id', 'user_id', 'name', 'phone', 'channel', 'amount',
        'overdue_days', 'status', 'notes', 'last_contacted', 'created_at', 'updated_at'
    ],
    inventory_items: [
        'id', 'user_id', 'name', 'category', 'quantity', 'min_quantity', 'unit', 'notes', 'created_at', 'updated_at'
    ],
    prosthetic_services: [
        'id', 'user_id', 'patient_name', 'service_name', 'lab_name', 'cost', 'status', 'due_date', 'created_at', 'updated_at'
    ],
    campaign_templates: [
        'id', 'legacy_id', 'user_id', 'name', 'content', 'variables', 'type', 'is_active', 'created_at', 'updated_at'
    ],
    contact_lists: [
        'id', 'legacy_id', 'user_id', 'name', 'description', 'total_contacts', 'valid_contacts', 'created_at', 'updated_at'
    ],
    contacts: [
        'id', 'legacy_id', 'user_id', 'contact_list_id', 'name', 'phone', 'email', 'status', 'variables', 'is_blacklisted', 'created_at', 'updated_at'
    ],
    campaigns: [
        'id', 'legacy_id', 'user_id', 'name', 'type', 'status', 'template_id', 'contact_list_id', 'scheduled_at', 'timezone', 'daily_limit', 'current_day_count', 'interval_min', 'interval_max', 'total_sent', 'total_delivered', 'total_read', 'total_failed', 'created_at', 'updated_at', 'started_at', 'completed_at'
    ],
    campaign_history: [
        'id', 'legacy_id', 'user_id', 'campaign_id', 'contact_id', 'status', 'sent_at', 'delivered_at', 'read_at', 'failed_at', 'error_message', 'message_id', 'created_at', 'updated_at'
    ],
    blacklist: [
        'id', 'user_id', 'phone', 'name', 'reason', 'added_at', 'added_by'
    ]
};

const FIELD_MAP = {
    leads: {
        toDb: {
            saleStatus: 'sale_status',
            saleValue: 'sale_value',
            visitDate: 'visit_date',
            scheduledAt: 'scheduled_at',
            contactedAt: 'contacted_at',
            attended: 'attended',
            interactions: 'interactions',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            sale_status: 'saleStatus',
            sale_value: 'saleValue',
            visit_date: 'visitDate',
            scheduled_at: 'scheduledAt',
            contacted_at: 'contactedAt',
            attended: 'attended',
            interactions: 'interactions',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    patients: {
        toDb: {
            birthDate: 'birth_date',
            birthdate: 'birth_date',
            mainComplaint: 'main_complaint',
            medicalHistory: 'medical_history',
            dentalConditions: 'dental_conditions',
            previousTreatments: 'previous_treatments',
            convertedFrom: 'converted_from',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            birth_date: 'birthDate',
            birthdate: 'birthDate',
            main_complaint: 'mainComplaint',
            medical_history: 'medicalHistory',
            dental_conditions: 'dentalConditions',
            previous_treatments: 'previousTreatments',
            converted_from: 'convertedFrom',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    appointments: {
        toDb: {
            patientId: 'patient_id',
            patientName: 'patient_name',
            saleDate: 'sale_date',
            saledate: 'sale_date',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            patient_id: 'patientId',
            patient_name: 'patientName',
            sale_date: 'saleDate',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    settings: {
        toDb: {
            crcName: 'crc_name',
            dailyGoal: 'daily_goal',
            commissionValue: 'commission_value',
            weeklyAppointmentsGoal: 'weekly_appointments_goal',
            weeklyVisitsGoal: 'weekly_visits_goal',
            updatedAt: 'updated_at',
            zapiInstance: 'zapi_instance',
            zapiToken: 'zapi_token',
            zapiClientToken: 'zapi_client_token',
            n8nWebhookLeads: 'n8n_webhook_leads',
            n8nWebhookAppointments: 'n8n_webhook_appointments',
            chatwootAccountId: 'chatwoot_account_id'
        },
        toApp: {
            crc_name: 'crcName',
            daily_goal: 'dailyGoal',
            commission_value: 'commissionValue',
            weekly_appointments_goal: 'weeklyAppointmentsGoal',
            weekly_visits_goal: 'weeklyVisitsGoal',
            updated_at: 'updatedAt',
            zapi_instance: 'zapiInstance',
            zapi_token: 'zapiToken',
            zapi_client_token: 'zapiClientToken',
            n8n_webhook_leads: 'n8nWebhookLeads',
            n8n_webhook_appointments: 'n8nWebhookAppointments',
            chatwoot_account_id: 'chatwootAccountId'
        }
    },
    old_patients: {
        toDb: {
            lastConsultation: 'last_consultation',
            recoveredAt: 'recovered_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            last_consultation: 'lastConsultation',
            recovered_at: 'recoveredAt',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    received_payments: {
        toDb: {
            patientName: 'patient_name',
            paymentDate: 'payment_date',
            receiptUrl: 'receipt_url',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            patient_name: 'patientName',
            payment_date: 'paymentDate',
            receipt_url: 'receiptUrl',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    device_maintenances: {
        toDb: {
            dueDate: 'due_date',
            paidAt: 'paid_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            due_date: 'dueDate',
            paid_at: 'paidAt',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    debtor_notifications: {
        toDb: {
            overdueDays: 'overdue_days',
            lastContacted: 'last_contacted',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            overdue_days: 'overdueDays',
            last_contacted: 'lastContacted',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    inventory_items: {
        toDb: {
            minQuantity: 'min_quantity',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            min_quantity: 'minQuantity',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    prosthetic_services: {
        toDb: {
            patientName: 'patient_name',
            serviceName: 'service_name',
            labName: 'lab_name',
            dueDate: 'due_date',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            patient_name: 'patientName',
            service_name: 'serviceName',
            lab_name: 'labName',
            due_date: 'dueDate',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    },
    blacklist: {
        toDb: { addedAt: 'added_at', addedBy: 'added_by' },
        toApp: { added_at: 'addedAt', added_by: 'addedBy' }
    }
};

// ─── Conflict Resolution Strategy ──────────────────────────────────────
const CONFLICT_MAP = {
    contacts: 'contact_list_id,phone,user_id',
    blacklist: 'phone,user_id',
    settings: 'user_id'
};

function mapToDb(table, obj) {
    const map = FIELD_MAP[table]?.toDb || {};
    const allowedColumns = DB_COLUMNS[table] || [];
    const result = {};

    for (let [key, value] of Object.entries(obj)) {
        // Skip the old string id for Supabase (UUID is auto-generated)
        if (key === 'id' && typeof value === 'string' && !value.includes('-')) {
            result['legacy_id'] = value;
            continue;
        }

        const dbKey = map[key] || key;

        // 🔥 CRITICAL FIX: Convert empty strings to null (except mandatory fields)
        if (value === "" && !['name', 'patient_name', 'status', 'source', 'channel'].includes(dbKey)) {
            value = null;
        }

        // 🔥 FK VALIDATION: patient_id and converted_from must be valid UUIDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (['patient_id', 'converted_from'].includes(dbKey)) {
            if (!value || !uuidRegex.test(String(value))) {
                value = null;
            }
        }

        // 🔥 CAMPAIGN TYPE MAPPING: JS (PT) to DB (EN/Enum)
        if (dbKey === 'type' && ['campaign_templates', 'campaigns'].includes(table)) {
            const typeMap = {
                'cobranca': 'collection',
                'marketing': 'marketing',
                'reativacao_paciente': 'red_folder',
                'recuperacao_lead': 'promotion',
                'aniversario': 'birthday',
                'lembrete_consulta': 'reminder',
                'pos_consulta': 'reminder',
                'orcamento_pendente': 'promotion'
            };
            value = typeMap[value] || value;
        }

        // 🔥 STRICT FILTER: Only add if column exists in Supabase
        if (allowedColumns.includes(dbKey)) {
            result[dbKey] = value;
        }
    }

    // 🔥 ENSURE NOT NULL COLUMNS
    const criticalFields = ['name', 'patient_name', 'status', 'source', 'channel'];
    criticalFields.forEach(field => {
        if (allowedColumns.includes(field)) {
            if (result[field] === null || result[field] === undefined || result[field] === '') {
                result[field] = result[field] || '';
            }
        }
    });

    // Add user_id
    if (currentUser) {
        result['user_id'] = currentUser.id;
    }

    return result;
}

function mapToApp(table, obj) {
    const map = FIELD_MAP[table]?.toApp || {};
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === 'user_id' || key === 'legacy_id') continue; // Skip internal fields
        const appKey = map[key] || key;
        result[appKey] = value;
    }
    return result;
}

// ─── Data Operations ────────────────────────────────────────────────────

// Load ALL data from Supabase into AppState
async function loadDataFromSupabase() {
    if (!isSupabaseReady || !currentUser) {
        return false;
    }

    try {
        console.log('📡 Loading data from Supabase...');

        async function fetchTable(name) {
            try {
                let query = supabaseClient.from(name).select('*').eq('user_id', currentUser.id);
                if (name === 'settings') query = query.single();

                const res = await query;
                if (res.error) {
                    console.warn(`⚠️ Error fetching ${name}:`, res.error.message);
                    return { data: null, error: res.error };
                }
                return res;
            } catch (err) {
                console.warn(`⚠️ Exception fetching ${name}:`, err);
                return { data: null, error: err };
            }
        }

        const [leadsRes, patientsRes, appointmentsRes, settingsRes, oldPatientsRes, paymentsRes, maintenanceRes, debtorsRes, inventoryRes, prostheticRes, templatesRes, contactListsRes, contactsRes, campaignsRes, blacklistRes] = await Promise.all([
            fetchTable('leads'),
            fetchTable('patients'),
            fetchTable('appointments'),
            fetchTable('settings'),
            fetchTable('old_patients'),
            fetchTable('received_payments'),
            fetchTable('device_maintenances'),
            fetchTable('debtor_notifications'),
            fetchTable('inventory_items'),
            fetchTable('prosthetic_services'),
            fetchTable('campaign_templates'),
            fetchTable('contact_lists'),
            fetchTable('contacts'),
            fetchTable('campaigns'),
            fetchTable('blacklist')
        ]);

        if (leadsRes.data) AppState.leads = leadsRes.data.map(row => mapToApp('leads', row));
        if (patientsRes.data) AppState.patients = patientsRes.data.map(row => mapToApp('patients', row));
        if (appointmentsRes.data) AppState.appointments = appointmentsRes.data.map(row => mapToApp('appointments', row));
        if (settingsRes.data) AppState.settings = mapToApp('settings', settingsRes.data);
        if (oldPatientsRes.data) AppState.oldPatients = oldPatientsRes.data.map(row => mapToApp('old_patients', row));
        if (paymentsRes.data) AppState.finances.receivedPayments = paymentsRes.data.map(row => mapToApp('received_payments', row));
        if (maintenanceRes.data) AppState.finances.deviceMaintenances = maintenanceRes.data.map(row => mapToApp('device_maintenances', row));
        if (debtorsRes.data) AppState.finances.debtorQueue = debtorsRes.data.map(row => mapToApp('debtor_notifications', row));
        if (inventoryRes.data) AppState.inventoryItems = inventoryRes.data.map(row => mapToApp('inventory_items', row));
        if (prostheticRes.data) AppState.prostheticServices = prostheticRes.data.map(row => mapToApp('prosthetic_services', row));
        
        // Populate CampaignsState
        if (templatesRes.data && templatesRes.data.length > 0) {
            CampaignsState.templates = templatesRes.data.map(row => mapToApp('campaign_templates', row));
        }
        if (contactListsRes.data) CampaignsState.contactLists = contactListsRes.data.map(row => mapToApp('contact_lists', row));
        if (contactsRes.data) CampaignsState.contacts = contactsRes.data.map(row => mapToApp('contacts', row));
        if (campaignsRes.data) CampaignsState.campaigns = campaignsRes.data.map(row => mapToApp('campaigns', row));
        if (blacklistRes.data) CampaignsState.blacklist = blacklistRes.data.map(row => mapToApp('blacklist', row));

        if (!Array.isArray(AppState.oldPatients)) AppState.oldPatients = [];

        console.log('✅ Data loaded from Supabase:', {
            leads: AppState.leads.length,
            patients: AppState.patients.length,
            appointments: AppState.appointments.length
        });

        // Sync to localStorage as cache
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(AppState.leads));
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(AppState.patients));
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(AppState.appointments));
        if (AppState.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(AppState.settings));
        localStorage.setItem('odontocrm_old_patients', JSON.stringify(AppState.oldPatients));
        localStorage.setItem('odontocrm_finance_payments', JSON.stringify(AppState.finances.receivedPayments));
        localStorage.setItem('odontocrm_finance_maintenance', JSON.stringify(AppState.finances.deviceMaintenances));
        localStorage.setItem('odontocrm_finance_debtors', JSON.stringify(AppState.finances.debtorQueue));
        localStorage.setItem('odontocrm_inventory_items', JSON.stringify(AppState.inventoryItems));
        localStorage.setItem('odontocrm_prosthetic_services', JSON.stringify(AppState.prostheticServices));

        // Sync campaign data to localStorage as cache
        localStorage.setItem('campaignTemplates', JSON.stringify(CampaignsState.templates));
        localStorage.setItem('campaignContactLists', JSON.stringify(CampaignsState.contactLists));
        localStorage.setItem('campaignContacts', JSON.stringify(CampaignsState.contacts));
        localStorage.setItem('campaigns', JSON.stringify(CampaignsState.campaigns));
        localStorage.setItem('campaignBlacklist', JSON.stringify(CampaignsState.blacklist));

        return true;
    } catch (error) {
        console.error('❌ Error loading from Supabase:', error);
        return false;
    }
}

// Save data to Supabase
async function saveToSupabase(table, data) {
    if (!isSupabaseReady || !currentUser) {
        updateDashboard();
        return;
    }

    try {
        console.log(`📡 Sincronizando tabela ${table} (${Array.isArray(data) ? data.length : 1} registros)...`);

        if (table === 'settings') {
            const dbData = mapToDb('settings', data);
            dbData.updated_at = new Date().toISOString();
            const { error } = await supabaseClient
                .from('settings')
                .upsert(dbData, { onConflict: 'user_id' });
            if (error) throw error;
        } else {
            // Se não for array, transforma em array para processamento uniforme
            const dataArray = Array.isArray(data) ? data : [data];
            const dbRows = dataArray.map(item => mapToDb(table, item));

            // Garantir IDs únicos e remover duplicatas locais antes de enviar
            const uniqueRows = [];
            const conflictTarget = CONFLICT_MAP[table] || 'id';
            const keys = new Set();
            dbRows.forEach(row => {
                // Chave de unicidade baseada no alvo de conflito
                const uniqueKey = conflictTarget.split(',').map(k => row[k.trim()]).join('|');
                if (uniqueKey && !keys.has(uniqueKey)) {
                    keys.add(uniqueKey);
                    uniqueRows.push(row);
                }
            });

            if (uniqueRows.length > 0) {
                // Processar em lotes de 100 para evitar erros de payload grande ou timeout
                const BATCH_SIZE = 100;
                for (let i = 0; i < uniqueRows.length; i += BATCH_SIZE) {
                    const batch = uniqueRows.slice(i, i + BATCH_SIZE);
                    const { error } = await supabaseClient
                        .from(table)
                        .upsert(batch, { onConflict: conflictTarget });

                    if (error) {
                        console.error(`❌ Erro no lote ${i / BATCH_SIZE + 1} da tabela ${table}:`, error);
                        console.error('Dados do lote:', batch);
                        throw error;
                    }
                }
            }
        }
        console.log(`✅ Tabela ${table} sincronizada com sucesso`);
    } catch (error) {
        console.error(`❌ Falha crítica ao salvar ${table} no Supabase:`, error);

        let errorMsg = 'Erro ao sincronizar com a nuvem';
        if (error.message) errorMsg += `: ${error.message}`;

        // Se o erro for de Row Level Security ou permissão
        if (error.code === '42501') {
            errorMsg = 'Erro de permissão no Supabase. Verifique as políticas de RLS.';
        }

        showNotification(errorMsg, 'error');
        throw error; // Re-lança para ser capturado pelo importBackupJSON
    }

    updateDashboard();
}

// Insert a single record
async function insertRecord(table, record) {
    if (!isSupabaseReady || !currentUser) return record;

    try {
        const dbData = mapToDb(table, record);
        dbData.updated_at = new Date().toISOString();

        const { data, error } = await supabaseClient
            .from(table)
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;

        // Return the record with Supabase-generated UUID
        return mapToApp(table, data);
    } catch (error) {
        console.error(`❌ Error inserting into ${table}:`, error);
        return record; // Return original on failure
    }
}

// Update a single record
async function updateRecord(table, id, updates) {
    if (!isSupabaseReady || !currentUser) return;

    try {
        const dbData = mapToDb(table, updates);
        dbData.updated_at = new Date().toISOString();
        delete dbData.id; // Don't update the PK

        const { error } = await supabaseClient
            .from(table)
            .update(dbData)
            .eq('id', id)
            .eq('user_id', currentUser.id);

        if (error) throw error;
    } catch (error) {
        console.error(`❌ Error updating ${table}:`, error);
    }
}

// Delete a single record
async function deleteRecord(table, id) {
    if (!isSupabaseReady || !currentUser) return;

    try {
        const { error } = await supabaseClient
            .from(table)
            .delete()
            .eq('id', id)
            .eq('user_id', currentUser.id);

        if (error) throw error;
    } catch (error) {
        console.error(`❌ Error deleting from ${table}:`, error);
    }
}

// ─── Migration: LocalStorage → Supabase ─────────────────────────────────
async function migrateLocalStorageToSupabase() {
    if (!isSupabaseReady || !currentUser) {
        console.warn('Cannot migrate: Supabase not ready or not logged in');
        return false;
    }

    const migrationKey = 'odontocrm_migrated_to_supabase';
    if (localStorage.getItem(migrationKey)) {
        console.log('ℹ️ Data already migrated to Supabase');
        return true;
    }

    try {
        showLoading('Migrando dados para a nuvem...');

        // Load local data
        const localLeads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
        const localPatients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
        const localAppointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
        const localSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');

        const totalRecords = localLeads.length + localPatients.length + localAppointments.length;

        if (totalRecords === 0) {
            console.log('ℹ️ No local data to migrate');
            localStorage.setItem(migrationKey, new Date().toISOString());
            hideLoading();
            return true;
        }

        console.log(`📦 Migrating ${totalRecords} records to Supabase...`);

        let successCount = 0;
        let errorCount = 0;

        // Helper: clean object — remove undefined values and non-DB fields
        function cleanForDb(obj) {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== undefined) {
                    cleaned[key] = value;
                }
            }
            return cleaned;
        }

        // Migrate Leads
        if (localLeads.length > 0) {
            const dbLeads = localLeads.map(lead => {
                const mapped = {};
                mapped.name = lead.name || '';
                mapped.phone = lead.phone || '';
                mapped.email = lead.email || null;
                mapped.channel = lead.channel || 'WhatsApp';
                mapped.source = lead.source || 'WhatsApp';
                mapped.interest = lead.interest || null;
                mapped.message = lead.message || null;
                mapped.status = lead.status || 'new';
                mapped.sale_status = lead.saleStatus || null;
                mapped.sale_value = lead.saleValue || 0;
                mapped.visit_date = lead.visitDate || null;
                mapped.created_at = lead.createdAt || new Date().toISOString();
                mapped.updated_at = new Date().toISOString();
                mapped.legacy_id = lead.id || null;
                mapped.user_id = currentUser.id;
                return cleanForDb(mapped);
            });

            console.log('📤 Inserting leads:', JSON.stringify(dbLeads[0]));
            const { data, error } = await supabaseClient.from('leads').insert(dbLeads).select();
            if (error) {
                console.error('❌ Migration error (leads):', JSON.stringify(error));
                errorCount += localLeads.length;
            } else {
                console.log(`✅ Migrated ${data.length} leads`);
                successCount += data.length;
            }
        }

        // Migrate Patients
        if (localPatients.length > 0) {
            const dbPatients = localPatients.map(patient => {
                const mapped = {};
                mapped.name = patient.name || '';
                mapped.cpf = patient.cpf || null;
                mapped.birth_date = patient.birthDate || null;
                mapped.phone = patient.phone || null;
                mapped.email = patient.email || null;
                mapped.address = patient.address || null;
                mapped.main_complaint = patient.mainComplaint || null;
                mapped.medical_history = patient.medicalHistory || null;
                mapped.medications = patient.medications || null;
                mapped.allergies = patient.allergies || null;
                mapped.dental_conditions = patient.dentalConditions || null;
                mapped.previous_treatments = patient.previousTreatments || null;
                mapped.notes = patient.notes || null;
                mapped.odontogram = patient.odontogram || {};
                mapped.history = patient.history || [];
                mapped.created_at = patient.createdAt || new Date().toISOString();
                mapped.updated_at = new Date().toISOString();
                mapped.legacy_id = patient.id || null;
                mapped.user_id = currentUser.id;
                // Skip converted_from FK since old IDs aren't UUIDs
                return cleanForDb(mapped);
            });

            console.log('📤 Inserting patients:', JSON.stringify(dbPatients[0]));
            const { data, error } = await supabaseClient.from('patients').insert(dbPatients).select();
            if (error) {
                console.error('❌ Migration error (patients):', JSON.stringify(error));
                errorCount += localPatients.length;
            } else {
                console.log(`✅ Migrated ${data.length} patients`);
                successCount += data.length;
            }
        }

        // Migrate Appointments
        if (localAppointments.length > 0) {
            const dbAppointments = localAppointments.map(apt => {
                const mapped = {};
                mapped.patient_name = apt.patientName || '';
                mapped.date = apt.date || new Date().toISOString();
                mapped.procedure = apt.procedure || null;
                mapped.duration = apt.duration || 60;
                mapped.notes = apt.notes || null;
                mapped.status = apt.status || 'scheduled';
                mapped.attended = apt.attended || false;
                mapped.created_at = apt.createdAt || new Date().toISOString();
                mapped.updated_at = new Date().toISOString();
                mapped.legacy_id = apt.id || null;
                mapped.user_id = currentUser.id;
                // Skip patient_id FK since old IDs aren't UUIDs
                return cleanForDb(mapped);
            });

            console.log('📤 Inserting appointments:', JSON.stringify(dbAppointments[0]));
            const { data, error } = await supabaseClient.from('appointments').insert(dbAppointments).select();
            if (error) {
                console.error('❌ Migration error (appointments):', JSON.stringify(error));
                errorCount += localAppointments.length;
            } else {
                console.log(`✅ Migrated ${data.length} appointments`);
                successCount += data.length;
            }
        }

        // Migrate Settings
        if (Object.keys(localSettings).length > 0) {
            const dbSettings = {
                crc_name: localSettings.crcName || '',
                daily_goal: localSettings.dailyGoal || 5,
                commission_value: localSettings.commissionValue || 50,
                weekly_appointments_goal: localSettings.weeklyAppointmentsGoal || 80,
                weekly_visits_goal: localSettings.weeklyVisitsGoal || 40,
                user_id: currentUser.id,
                updated_at: new Date().toISOString()
            };
            const { error } = await supabaseClient
                .from('settings')
                .upsert(dbSettings, { onConflict: 'user_id' });
            if (error) {
                console.error('❌ Migration error (settings):', JSON.stringify(error));
            } else {
                console.log('✅ Migrated settings');
            }
        }

        // Migrate Old Patients
        const localOldPatients = JSON.parse(localStorage.getItem('odontocrm_old_patients') || '[]');
        if (localOldPatients.length > 0) {
            const dbOld = localOldPatients.map(p => {
                const mapped = {};
                mapped.name = p.name || '';
                mapped.phone = p.phone || null;
                mapped.last_consultation = p.lastConsultation || null;
                mapped.interest = p.interest || null;
                mapped.notes = p.notes || null;
                mapped.status = p.status || 'pending';
                mapped.created_at = p.createdAt || new Date().toISOString();
                mapped.updated_at = new Date().toISOString();
                mapped.user_id = currentUser.id;
                return cleanForDb(mapped);
            });

            console.log('📤 Inserting old patients:', JSON.stringify(dbOld[0]));
            const { data, error } = await supabaseClient.from('old_patients').insert(dbOld).select();
            if (error) {
                console.error('❌ Migration error (old_patients):', JSON.stringify(error));
                errorCount += localOldPatients.length;
            } else {
                console.log(`✅ Migrated ${data.length} old patients`);
                successCount += data.length;
            }
        }

        // Migrate Campaign Data
        const localTemplates = JSON.parse(localStorage.getItem('campaignTemplates') || '[]');
        const localContactLists = JSON.parse(localStorage.getItem('campaignContactLists') || '[]');
        const localContacts = JSON.parse(localStorage.getItem('campaignContacts') || '[]');
        const localCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        const localBlacklist = JSON.parse(localStorage.getItem('campaignBlacklist') || '[]');

        if (localTemplates.length > 0) {
            const dbTemplates = localTemplates.map(t => {
                const mapped = mapToDb('campaign_templates', t || {});
                delete mapped.id; 
                return mapped;
            });
            const { error } = await supabaseClient.from('campaign_templates').insert(dbTemplates);
            if (!error) successCount += localTemplates.length;
            else console.error('❌ Migration error (templates):', error);
        }

        if (localContactLists.length > 0) {
            const dbLists = localContactLists.map(l => {
                const mapped = mapToDb('contact_lists', l || {});
                delete mapped.id; 
                return mapped;
            });
            const { error } = await supabaseClient.from('contact_lists').insert(dbLists);
            if (!error) successCount += localContactLists.length;
            else console.error('❌ Migration error (contact_lists):', error);
        }

        if (localContacts.length > 0) {
            const dbContacts = localContacts.map(c => {
                const mapped = mapToDb('contacts', c || {});
                delete mapped.id; 
                return mapped;
            });
            const { error } = await supabaseClient.from('contacts').insert(dbContacts);
            if (!error) successCount += localContacts.length;
            else console.error('❌ Migration error (contacts):', error);
        }

        if (localCampaigns.length > 0) {
            const dbCampaigns = localCampaigns.map(c => {
                const mapped = mapToDb('campaigns', c || {});
                delete mapped.id; 
                return mapped;
            });
            const { error } = await supabaseClient.from('campaigns').insert(dbCampaigns);
            if (!error) successCount += localCampaigns.length;
            else console.error('❌ Migration error (campaigns):', error);
        }

        if (localBlacklist.length > 0) {
            const dbBlacklist = localBlacklist.map(b => {
                const mapped = mapToDb('blacklist', b || {});
                delete mapped.id; 
                return mapped;
            });
            const { error } = await supabaseClient.from('blacklist').insert(dbBlacklist);
            if (!error) successCount += localBlacklist.length;
            else console.error('❌ Migration error (blacklist):', error);
        }

        hideLoading();

        if (successCount > 0) {
            localStorage.setItem(migrationKey, new Date().toISOString());
            showNotification(`🎉 ${successCount} registros migrados para a nuvem!`, 'success');
            if (errorCount > 0) {
                showNotification(`⚠️ ${errorCount} registros tiveram erro na migração`, 'warning');
            }
            return true;
        } else if (errorCount > 0) {
            // Don't set migration flag so it can retry
            showNotification(`❌ Migração falhou. Tente novamente recarregando a página.`, 'error');
            return false;
        }

        localStorage.setItem(migrationKey, new Date().toISOString());
        return true;

    } catch (error) {
        console.error('❌ Migration failed:', error);
        hideLoading();
        showNotification('Erro na migração. Os dados locais foram preservados.', 'error');
        return false;
    }
}

// ─── Unisoft (Firebird) Sync Processor ──────────────────────────────────
// This processes data pushed to Supabase by n8n from the local Firebird DB

async function fetchUnprocessedUnisoftSync() {
    if (!isSupabaseReady) return [];

    try {
        const { data, error } = await supabaseClient
            .from('unisoft_sync')
            .select('*')
            .eq('processed', false)
            .order('synced_at', { ascending: true })
            .limit(20);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error fetching Unisoft sync records:', error);
        return [];
    }
}

async function markUnisoftSyncProcessed(syncId) {
    if (!isSupabaseReady) return;
    try {
        const { error } = await supabaseClient
            .from('unisoft_sync')
            .update({ processed: true, processed_at: new Date().toISOString() })
            .eq('id', syncId);
        if (error) throw error;
    } catch (error) {
        console.error('❌ Error marking record as processed:', error);
    }
}

async function processUnprocessedSyncRecords() {
    if (!isCloudConnected()) return;

    const records = await fetchUnprocessedUnisoftSync();
    if (records.length === 0) return;

    console.log(`🔄 Processing ${records.length} external sync records...`);
    let processedCount = 0;

    for (const record of records) {
        try {
            const { source_table, data } = record;

            if (source_table === 'PACIENTE') {
                // Check if patient already exists by name/phone
                const cleanPhone = data.CELULAR ? data.CELULAR.replace(/\D/g, '') : '';
                const existing = AppState.patients.find(p =>
                    p.name.toLowerCase() === data.NOME.toLowerCase() ||
                    (cleanPhone && p.phone && p.phone.replace(/\D/g, '') === cleanPhone)
                );

                if (!existing) {
                    // Create new patient (auto-converting from sync)
                    const newPatient = {
                        id: generateId(),
                        name: data.NOME,
                        phone: data.CELULAR || data.TELEFONE || '',
                        email: data.EMAIL || '',
                        birthDate: data.DATANASC || '',
                        address: data.ENDERECO || '',
                        createdAt: new Date().toISOString(),
                        notes: `Sincronizado do Unisoft (ID: ${record.source_id})`
                    };
                    AppState.patients.push(newPatient);

                    // Save locally and to Supabase
                    await saveToSupabase('patients', AppState.patients);
                } else {
                    console.log(`ℹ️ Patient ${data.NOME} already exists, skipping sync.`);
                }
            }

            // Mark this specific record as processed in Supabase
            await markUnisoftSyncProcessed(record.id);
            processedCount++;
        } catch (err) {
            console.error('❌ Failed to process sync record:', record.id, err);
        }
    }

    if (processedCount > 0) {
        showNotification(`${processedCount} novos registros sincronizados do Unisoft`, 'info');
        updateDashboard();
        if (AppState.currentModule === 'patients' && typeof renderPatientsList === 'function') renderPatientsList();
        if (AppState.currentModule === 'kanban' && typeof renderKanban === 'function') renderKanban();
    }
}

// ─── Chatwoot Sync Processor ──────────────────────────────────────────

async function fetchUnprocessedChatwootSync() {
    if (!isCloudConnected()) return [];

    try {
        const { data, error } = await supabaseClient
            .from('chatwoot_sync')
            .select('*')
            .eq('processed', false)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: true })
            .limit(20);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Error fetching Chatwoot sync records:', error);
        return [];
    }
}

async function markChatwootSyncProcessed(syncId) {
    if (!isCloudConnected()) return;
    try {
        const { error } = await supabaseClient
            .from('chatwoot_sync')
            .update({ processed: true, processed_at: new Date().toISOString() })
            .eq('id', syncId);
        if (error) throw error;
    } catch (error) {
        console.error('❌ Error marking Chatwoot record as processed:', error);
    }
}

async function processChatwootSyncRecords() {
    if (!isCloudConnected()) return;

    const records = await fetchUnprocessedChatwootSync();
    if (records.length === 0) return;

    console.log(`🔄 Processing ${records.length} Chatwoot sync records...`);
    let processedCount = 0;
    let leadsChanged = false;

    for (const record of records) {
        try {
            const { phone, name, label, interaction_text } = record;
            const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
            
            // Find lead or patient
            let lead = AppState.leads.find(l => 
                (cleanPhone && l.phone && l.phone.replace(/\D/g, '') === cleanPhone) ||
                (name && l.name && l.name.toLowerCase() === name.toLowerCase())
            );

            // If not found and it's a new lead label, create it
            if (!lead && label === 'leadnovo') {
                lead = {
                    id: generateId(),
                    name: name || 'Novo Lead Chatwoot',
                    phone: phone || '',
                    status: 'new',
                    source: 'Chatwoot',
                    channel: 'WhatsApp',
                    interactions: [],
                    createdAt: new Date().toISOString()
                };
                AppState.leads.push(lead);
                leadsChanged = true;
            }

            if (lead) {
                // Map labels to status
                const labelMap = {
                    'leadnovo': 'new',
                    'agendamentogustavo': 'scheduled',
                    'vendas_concluidas': 'converted'
                };

                if (labelMap[label]) {
                    lead.status = labelMap[label];
                    if (label === 'vendas_concluidas') {
                        lead.saleStatus = 'sold';
                    }
                    leadsChanged = true;
                }

                // Add interaction text if present
                if (interaction_text) {
                    if (!lead.interactions) lead.interactions = [];
                    lead.interactions.push({
                        date: new Date().toISOString(),
                        note: `💬 Chatwoot: ${interaction_text}`
                    });
                    leadsChanged = true;
                }

                lead.updatedAt = new Date().toISOString();
            }

            // Mark processed
            await markChatwootSyncProcessed(record.id);
            processedCount++;
        } catch (err) {
            console.error('❌ Failed to process Chatwoot record:', record.id, err);
        }
    }

    if (processedCount > 0) {
        if (leadsChanged) {
            await saveToSupabase('leads', AppState.leads);
            showNotification(`${processedCount} atualizações vindas do Chatwoot`, 'info');
            updateDashboard();
            if (AppState.currentModule === 'leads' && typeof renderLeadsList === 'function') renderLeadsList();
        }
    }
}

function isCloudConnected() {
    return isSupabaseReady && currentUser !== null;
}

function getConnectionStatus() {
    if (!SUPABASE_URL) return { status: 'local', label: '💾 Local', color: '#f59e0b' };
    if (!isSupabaseReady) return { status: 'error', label: '❌ Erro', color: '#ef4444' };
    if (!currentUser) return { status: 'auth', label: '🔒 Não logado', color: '#6b7280' };
    return { status: 'cloud', label: '☁️ Nuvem', color: '#10b981' };
}

// ─── Export to global scope ─────────────────────────────────────────────
window.initSupabase = initSupabase;
window.isSupabaseReady = () => isSupabaseReady;
window.isCloudConnected = isCloudConnected;
window.getConnectionStatus = getConnectionStatus;
window.supabaseSignIn = supabaseSignIn;
window.supabaseSignUp = supabaseSignUp;
window.supabaseSignOut = supabaseSignOut;
window.supabaseGetUser = supabaseGetUser;
window.onAuthStateChange = onAuthStateChange;
window.loadDataFromSupabase = loadDataFromSupabase;
window.saveToSupabase = saveToSupabase;
window.insertRecord = insertRecord;
window.updateRecord = updateRecord;
window.deleteRecord = deleteRecord;
window.migrateLocalStorageToSupabase = migrateLocalStorageToSupabase;
window.processUnprocessedSyncRecords = processUnprocessedSyncRecords;
