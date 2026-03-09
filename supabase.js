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
            updatedAt: 'updated_at'
        },
        toApp: {
            crc_name: 'crcName',
            daily_goal: 'dailyGoal',
            commission_value: 'commissionValue',
            weekly_appointments_goal: 'weeklyAppointmentsGoal',
            weekly_visits_goal: 'weeklyVisitsGoal',
            updated_at: 'updatedAt'
        }
    },
    old_patients: {
        toDb: {
            lastConsultation: 'last_consultation',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toApp: {
            last_consultation: 'lastConsultation',
            created_at: 'createdAt',
            updated_at: 'updatedAt'
        }
    }
};

function mapToDb(table, obj) {
    const map = FIELD_MAP[table]?.toDb || {};
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        // Skip the old string id for Supabase (UUID is auto-generated)
        if (key === 'id' && typeof value === 'string' && !value.includes('-')) {
            result['legacy_id'] = value; // Preserve old ID for reference
            continue;
        }
        const dbKey = map[key] || key;
        result[dbKey] = value;
    }
    // Add user_id
    if (currentUser) {
        result['user_id'] = currentUser.id;
    }

    // Double check: remove common camelCase leftovers that aren't mapped
    const forbidden = ['birthDate', 'saleDate', 'saleValue', 'saleStatus', 'scheduledAt', 'contactedAt', 'visitDate', 'birthdate', 'saledate'];
    forbidden.forEach(key => {
        if (key in result && !(key in map)) {
            delete result[key];
        }
    });

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

        const [leadsRes, patientsRes, appointmentsRes, settingsRes, oldPatientsRes] = await Promise.all([
            fetchTable('leads'),
            fetchTable('patients'),
            fetchTable('appointments'),
            fetchTable('settings'),
            fetchTable('old_patients')
        ]);

        if (leadsRes.data) AppState.leads = leadsRes.data.map(row => mapToApp('leads', row));
        if (patientsRes.data) AppState.patients = patientsRes.data.map(row => mapToApp('patients', row));
        if (appointmentsRes.data) AppState.appointments = appointmentsRes.data.map(row => mapToApp('appointments', row));
        if (settingsRes.data) AppState.settings = mapToApp('settings', settingsRes.data);
        if (oldPatientsRes.data) AppState.oldPatients = oldPatientsRes.data.map(row => mapToApp('old_patients', row));

        // Validate
        if (!Array.isArray(AppState.leads)) AppState.leads = [];
        if (!Array.isArray(AppState.patients)) AppState.patients = [];
        if (!Array.isArray(AppState.appointments)) AppState.appointments = [];
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

            // Garantir IDs únicos e remover duplicatas
            const uniqueRows = [];
            const ids = new Set();
            dbRows.forEach(row => {
                if (row.id && !ids.has(row.id)) {
                    ids.add(row.id);
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
                        .upsert(batch, { onConflict: 'id' });

                    if (error) {
                        console.error(`❌ Erro no lote ${i / BATCH_SIZE + 1} da tabela ${table}:`, error);
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
