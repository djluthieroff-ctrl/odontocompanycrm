-- ===============================================
-- SCHEMA: CAMPAIGNS - SUPABASE
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Campaign Types Enum
CREATE TYPE campaign_type AS ENUM (
    'marketing',
    'red_folder', 
    'collection',
    'birthday',
    'reminder',
    'promotion'
);

-- Campaign Status Enum
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'scheduled',
    'running',
    'completed',
    'cancelled',
    'paused'
);

-- Contact Status Enum
CREATE TYPE contact_status AS ENUM (
    'valid',
    'invalid',
    'duplicate',
    'blacklisted',
    'pending'
);

-- Message Status Enum
CREATE TYPE message_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'read',
    'failed'
);

-- Campaign Templates Table
CREATE TABLE campaign_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    type campaign_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Lists Table
CREATE TABLE contact_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_contacts INTEGER DEFAULT 0,
    valid_contacts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    contact_list_id UUID REFERENCES contact_lists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    status contact_status DEFAULT 'pending',
    variables JSONB DEFAULT '{}'::jsonb,
    is_blacklisted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contact_list_id, phone, user_id)
);

-- Campaigns Table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    type campaign_type NOT NULL,
    status campaign_status DEFAULT 'draft',
    template_id UUID REFERENCES campaign_templates(id),
    contact_list_id UUID REFERENCES contact_lists(id),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    daily_limit INTEGER DEFAULT 300,
    current_day_count INTEGER DEFAULT 0,
    interval_min INTEGER DEFAULT 5,
    interval_max INTEGER DEFAULT 15,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_read INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Campaign History Table
CREATE TABLE campaign_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    status message_status DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, contact_id)
);

-- Blacklist Table
CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255),
    reason VARCHAR(255),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by VARCHAR(255)
);

-- Campaign Analytics View
CREATE VIEW campaign_analytics AS
SELECT 
    c.id,
    c.name,
    c.type,
    c.status,
    c.scheduled_at,
    c.daily_limit,
    c.total_sent,
    c.total_delivered,
    c.total_read,
    c.total_failed,
    cl.name as contact_list_name,
    cl.total_contacts,
    ct.name as template_name,
    CASE 
        WHEN c.total_sent > 0 THEN ROUND((c.total_delivered::decimal / c.total_sent) * 100, 2)
        ELSE 0
    END as delivery_rate,
    CASE 
        WHEN c.total_delivered > 0 THEN ROUND((c.total_read::decimal / c.total_delivered) * 100, 2)
        ELSE 0
    END as read_rate,
    CASE 
        WHEN c.total_sent > 0 THEN ROUND((c.total_failed::decimal / c.total_sent) * 100, 2)
        ELSE 0
    END as failure_rate,
    c.created_at,
    c.updated_at
FROM campaigns c
LEFT JOIN contact_lists cl ON c.contact_list_id = cl.id
LEFT JOIN campaign_templates ct ON c.template_id = ct.id;

-- Indexes for Performance
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX idx_contacts_contact_list_id ON contacts(contact_list_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_campaign_history_campaign_id ON campaign_history(campaign_id);
CREATE INDEX idx_campaign_history_status ON campaign_history(status);
CREATE INDEX idx_blacklist_phone ON blacklist(phone);

-- Triggers for Updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_templates_updated_at 
    BEFORE UPDATE ON campaign_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_lists_updated_at 
    BEFORE UPDATE ON contact_lists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_history_updated_at 
    BEFORE UPDATE ON campaign_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Policies for Row Level Security (RLS)
-- Note: Adjust these based on your authentication setup

ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- Basic policies (you may need to adjust based on your auth system)
CREATE POLICY "Users can view own campaign templates" ON campaign_templates
    FOR ALL USING (true);

CREATE POLICY "Users can view own contact lists" ON contact_lists
    FOR ALL USING (true);

CREATE POLICY "Users can view own contacts" ON contacts
    FOR ALL USING (true);

CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR ALL USING (true);

CREATE POLICY "Users can view own campaign history" ON campaign_history
    FOR ALL USING (true);

CREATE POLICY "Users can view blacklist" ON blacklist
    FOR ALL USING (true);

-- Functions for campaign management

-- Function to get campaign statistics
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_contacts', cl.total_contacts,
        'valid_contacts', cl.valid_contacts,
        'sent', c.total_sent,
        'delivered', c.total_delivered,
        'read', c.total_read,
        'failed', c.total_failed,
        'delivery_rate', CASE WHEN c.total_sent > 0 THEN ROUND((c.total_delivered::decimal / c.total_sent) * 100, 2) ELSE 0 END,
        'read_rate', CASE WHEN c.total_delivered > 0 THEN ROUND((c.total_read::decimal / c.total_delivered) * 100, 2) ELSE 0 END,
        'failure_rate', CASE WHEN c.total_sent > 0 THEN ROUND((c.total_failed::decimal / c.total_sent) * 100, 2) ELSE 0 END
    ) INTO stats
    FROM campaigns c
    LEFT JOIN contact_lists cl ON c.contact_list_id = cl.id
    WHERE c.id = campaign_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to check daily limit
CREATE OR REPLACE FUNCTION check_daily_limit(campaign_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    today_count INTEGER;
    daily_limit INTEGER;
BEGIN
    SELECT c.daily_limit, COALESCE(c.current_day_count, 0) INTO daily_limit, today_count
    FROM campaigns c
    WHERE c.id = campaign_id;
    
    RETURN today_count < daily_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment daily count
CREATE OR REPLACE FUNCTION increment_daily_count(campaign_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE campaigns 
    SET current_day_count = current_day_count + 1,
        updated_at = NOW()
    WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily count (to be called daily via cron)
CREATE OR REPLACE FUNCTION reset_daily_counts()
RETURNS VOID AS $$
BEGIN
    UPDATE campaigns 
    SET current_day_count = 0,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert some default templates
INSERT INTO campaign_templates (name, content, variables, type) VALUES
('Template de Marketing', 'Olá {{nome}}! Temos uma promoção especial para você na {{unidade}}! Agende sua avaliação e ganhe 20% de desconto. Data da consulta: {{data_consulta}}', '["nome", "unidade", "data_consulta"]', 'marketing'),
('Template de Pasta Vermelha', 'Olá {{nome}}, sentimos falta de você aqui na {{unidade}}! Sabia que podemos transformar seu sorriso? Agende uma avaliação e receba um plano personalizado. Horário da consulta: {{horario}}', '["nome", "unidade", "horario"]', 'red_folder'),
('Template de Cobrança', 'Olá {{nome}}, temos uma pendência em aberto referente ao tratamento na {{unidade}}. Valor: R$ {{valor}}. Entre em contato para regularizar. Data de vencimento: {{data_vencimento}}', '["nome", "unidade", "valor", "data_vencimento"]', 'collection'),
('Template de Aniversário', 'Feliz aniversário {{nome}}! 🎉 Para comemorar, temos um presente especial para você na {{unidade}}: limpeza grátis! Agende sua visita. Data da consulta: {{data_consulta}}', '["nome", "unidade", "data_consulta"]', 'birthday'),
('Template de Lembrete', 'Olá {{nome}}, seu agendamento está marcado para amanhã na {{unidade}} às {{horario}}. Confirme sua presença respondendo SIM. Qualquer dúvida, estamos à disposição!', '["nome", "unidade", "horario"]', 'reminder'),
('Template de Promoção', '🔥 PROMOÇÃO RELÂMPAGO! Olá {{nome}}, na {{unidade}} temos condições especiais hoje! Clareamento por R$ {{valor}} ou implante por R$ {{valor_implante}}. Agende já! Data da consulta: {{data_consulta}}', '["nome", "unidade", "valor", "valor_implante", "data_consulta"]', 'promotion');

-- Insert some sample contact lists
INSERT INTO contact_lists (name, description, total_contacts, valid_contacts) VALUES
('Pacientes em Tratamento', 'Lista de pacientes com tratamentos em andamento', 0, 0),
('Pacientes Inativos', 'Pacientes que não comparecem há mais de 6 meses', 0, 0),
('Lead Marketing', 'Leads de campanhas de marketing', 0, 0),
('Aniversariantes do Mês', 'Pacientes que fazem aniversário este mês', 0, 0);

-- View for campaign dashboard
CREATE VIEW campaign_dashboard AS
SELECT 
    c.id,
    c.name,
    c.type,
    c.status,
    c.scheduled_at,
    c.daily_limit,
    c.current_day_count,
    c.total_sent,
    c.total_delivered,
    c.total_read,
    c.total_failed,
    cl.name as contact_list_name,
    cl.total_contacts,
    cl.valid_contacts,
    ct.name as template_name,
    CASE 
        WHEN c.total_sent > 0 THEN ROUND((c.total_delivered::decimal / c.total_sent) * 100, 2)
        ELSE 0
    END as delivery_rate,
    CASE 
        WHEN c.total_delivered > 0 THEN ROUND((c.total_read::decimal / c.total_delivered) * 100, 2)
        ELSE 0
    END as read_rate,
    CASE 
        WHEN c.total_sent > 0 THEN ROUND((c.total_failed::decimal / c.total_sent) * 100, 2)
        ELSE 0
    END as failure_rate,
    c.created_at,
    c.updated_at,
    c.started_at,
    c.completed_at
FROM campaigns c
LEFT JOIN contact_lists cl ON c.contact_list_id = cl.id
LEFT JOIN campaign_templates ct ON c.template_id = ct.id
ORDER BY c.created_at DESC;