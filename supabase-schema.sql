-- =====================================================
-- CRM Odonto Company - Supabase Database Setup
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New query
-- =====================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    legacy_id TEXT,
    name TEXT NOT NULL,
    phone TEXT, -- Nullable: leads podem ser cadastrados sem telefone
    email TEXT,
    channel TEXT DEFAULT 'WhatsApp',
    source TEXT DEFAULT 'WhatsApp',
    interest TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new','in-contact','scheduled','visit','converted','not-converted')),
    sale_status TEXT CHECK (sale_status IN ('sold','lost') OR sale_status IS NULL),
    sale_value NUMERIC DEFAULT 0,
    interactions JSONB DEFAULT '[]',
    visit_date TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    contacted_at TIMESTAMPTZ,
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. PATIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    legacy_id TEXT,
    name TEXT NOT NULL,
    cpf TEXT,
    birth_date DATE,
    phone TEXT,
    email TEXT,
    address TEXT,
    main_complaint TEXT,
    medical_history TEXT,
    medications TEXT,
    allergies TEXT,
    dental_conditions TEXT,
    previous_treatments TEXT,
    notes TEXT,
    odontogram JSONB DEFAULT '{}',
    history JSONB DEFAULT '[]',
    converted_from UUID REFERENCES leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    legacy_id TEXT,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name TEXT,
    date TIMESTAMPTZ NOT NULL,
    procedure TEXT,
    duration INTEGER DEFAULT 60,
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','completed','cancelled','no-show')),
    attended BOOLEAN DEFAULT FALSE,
    sale_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crc_name TEXT DEFAULT '',
    daily_goal INTEGER DEFAULT 5,
    commission_value NUMERIC DEFAULT 50,
    weekly_appointments_goal INTEGER DEFAULT 80,
    weekly_visits_goal INTEGER DEFAULT 40,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. OLD PATIENTS TABLE (Pacientes Antigos)
-- =====================================================
CREATE TABLE IF NOT EXISTS old_patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    last_consultation DATE,
    interest TEXT,
    contacted BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'not-interested', 'recovered', 'lost')),
    recovered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. FINANCE TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS received_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name TEXT DEFAULT '',
    origin TEXT,
    category TEXT DEFAULT 'outros' CHECK (category IN ('inicio','recorrente','ortodontia','outros')),
    amount NUMERIC DEFAULT 0,
    method TEXT,
    notes TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS device_maintenances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device TEXT NOT NULL,
    provider TEXT,
    cost NUMERIC DEFAULT 0,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','scheduled','negotiating','paid')),
    notes TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS debtor_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp','sms','email')),
    amount NUMERIC DEFAULT 0,
    overdue_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'overdue' CHECK (status IN ('overdue','negotiating')),
    notes TEXT,
    last_contacted TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. UNISOFT SYNC TABLE (for n8n Firebird integration)
-- =====================================================
CREATE TABLE IF NOT EXISTS unisoft_sync (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_table TEXT NOT NULL,
    source_id TEXT NOT NULL,
    data JSONB NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    UNIQUE(source_table, source_id)
);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Users can only see/edit their own data

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE old_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE received_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE debtor_notifications ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON leads
    FOR DELETE USING (auth.uid() = user_id);

-- Patients policies
CREATE POLICY "Users can view own patients" ON patients
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patients" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own patients" ON patients
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own patients" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Old Patients policies
CREATE POLICY "Users can view own old patients" ON old_patients
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own old patients" ON old_patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own old patients" ON old_patients
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own old patients" ON old_patients
    FOR DELETE USING (auth.uid() = user_id);

-- Received payments policies
CREATE POLICY "Users can view own received payments" ON received_payments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own received payments" ON received_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own received payments" ON received_payments
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own received payments" ON received_payments
    FOR DELETE USING (auth.uid() = user_id);

-- Maintenance policies
CREATE POLICY "Users can view own maintenances" ON device_maintenances
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own maintenances" ON device_maintenances
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own maintenances" ON device_maintenances
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own maintenances" ON device_maintenances
    FOR DELETE USING (auth.uid() = user_id);

-- Debtor notifications policies
CREATE POLICY "Users can view own debtors" ON debtor_notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own debtors" ON debtor_notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own debtors" ON debtor_notifications
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own debtors" ON debtor_notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Unisoft Sync: Allow n8n service role access (no RLS - managed by service key)
-- The anon key cannot access this table, only the service_role key from n8n
ALTER TABLE unisoft_sync ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. INDEXES (for performance)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_old_patients_user_id ON old_patients(user_id);
CREATE INDEX IF NOT EXISTS idx_old_patients_status ON old_patients(status);
CREATE INDEX IF NOT EXISTS idx_unisoft_sync_processed ON unisoft_sync(processed);
CREATE INDEX IF NOT EXISTS idx_received_payments_user_id ON received_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_device_maintenances_user_id ON device_maintenances(user_id);
CREATE INDEX IF NOT EXISTS idx_debtor_notifications_user_id ON debtor_notifications(user_id);

-- =====================================================
-- 8. AUTO-UPDATE updated_at TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_old_patients_updated_at
    BEFORE UPDATE ON old_patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_received_payments_updated_at
    BEFORE UPDATE ON received_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_maintenances_updated_at
    BEFORE UPDATE ON device_maintenances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debtor_notifications_updated_at
    BEFORE UPDATE ON debtor_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ✅ DONE! Your database is ready.
-- Next: Go to Settings > API and copy:
--   - Project URL
--   - anon/public key
-- Paste them in supabase.js (lines 10-11)
-- =====================================================
