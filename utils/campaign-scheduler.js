// Campaign Scheduler Utility - Campaigns Module
// ================================================

// Global state for campaign scheduling
const CampaignSchedulerState = {
    // Scheduled campaigns tracking
    scheduledCampaigns: new Map(),

    // Active timers
    timers: new Map(),

    // Daily limits tracking
    dailyLimits: new Map(),

    // Scheduler status
    isRunning: false,
    schedulerInterval: null
};

// Initialize Campaign Scheduler
function initCampaignScheduler() {
    console.log('⏰ Campaign Scheduler initialized');
    loadScheduledCampaigns();
    startScheduler();
}

// Load Scheduled Campaigns from CampaignsState (Supabase)
function loadScheduledCampaigns() {
    try {
        // Instead of a separate localStorage key, we now use the campaigns from CampaignsState
        // that have a 'scheduled' or 'running' status.
        if (CampaignsState.campaigns && CampaignsState.campaigns.length > 0) {
            CampaignsState.campaigns.forEach(campaign => {
                if (campaign.status === 'scheduled' || campaign.status === 'running') {
                    // Only add to Map if it's actually scheduled in the future or was running
                    const scheduledCampaign = {
                        id: campaign.id,
                        name: campaign.name,
                        scheduledTime: campaign.scheduled_at,
                        status: campaign.status,
                        createdAt: campaign.created_at
                    };
                    CampaignSchedulerState.scheduledCampaigns.set(campaign.id, scheduledCampaign);
                    
                    // Re-set timer if it's scheduled for future
                    if (campaign.status === 'scheduled' && campaign.scheduled_at) {
                        const timeUntilStart = new Date(campaign.scheduled_at) - Date.now();
                        if (timeUntilStart > 0) {
                            const timer = setTimeout(() => {
                                startScheduledCampaign(campaign.id);
                            }, timeUntilStart);
                            CampaignSchedulerState.timers.set(campaign.id, timer);
                        } else if (timeUntilStart <= 0) {
                            // If time passed while app was closed, start now
                            startScheduledCampaign(campaign.id);
                        }
                    }
                }
            });
            console.log(`⏰ Loaded ${CampaignSchedulerState.scheduledCampaigns.size} campaigns into scheduler`);
        }
    } catch (error) {
        console.error('❌ Error loading scheduled campaigns:', error);
    }
}

// Save Scheduled Campaigns (deprecated - handled by Supabase campaigns table)
function saveScheduledCampaigns() {
    // Logic moved to saveCampaignsData() which saves to Supabase
}

// Start Scheduler
function startScheduler() {
    if (CampaignSchedulerState.isRunning) return;

    CampaignSchedulerState.isRunning = true;
    console.log('⏰ Campaign Scheduler started');

    // Check for scheduled campaigns every minute
    CampaignSchedulerState.schedulerInterval = setInterval(() => {
        checkScheduledCampaigns();
        updateDailyLimits();
    }, 60000); // Every minute

    // Update daily limits at midnight
    scheduleDailyReset();
}

// Stop Scheduler
function stopScheduler() {
    if (!CampaignSchedulerState.isRunning) return;

    CampaignSchedulerState.isRunning = false;
    console.log('⏰ Campaign Scheduler stopped');

    if (CampaignSchedulerState.schedulerInterval) {
        clearInterval(CampaignSchedulerState.schedulerInterval);
        CampaignSchedulerState.schedulerInterval = null;
    }

    // Clear all timers
    CampaignSchedulerState.timers.forEach(timer => clearInterval(timer));
    CampaignSchedulerState.timers.clear();
}

// Schedule a campaign
function scheduleCampaign(campaignId, scheduledTime) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
        showNotification('Campanha não encontrada', 'error');
        return false;
    }

    const scheduledCampaign = {
        id: campaignId,
        name: campaign.name,
        scheduledTime: new Date(scheduledTime).toISOString(),
        timezone: campaign.timezone || 'America/Sao_Paulo',
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };

    CampaignSchedulerState.scheduledCampaigns.set(campaignId, scheduledCampaign);
    saveScheduledCampaigns();

    // Set timer for this campaign
    const timeUntilStart = new Date(scheduledTime) - Date.now();
    if (timeUntilStart > 0) {
        const timer = setTimeout(() => {
            startScheduledCampaign(campaignId);
        }, timeUntilStart);

        CampaignSchedulerState.timers.set(campaignId, timer);
    } else {
        // Campaign should start immediately
        startScheduledCampaign(campaignId);
    }

    showNotification(`Campanha agendada para ${formatDateTime(scheduledTime)}`, 'success');
    return true;
}

// Start a scheduled campaign
async function startScheduledCampaign(campaignId) {
    const scheduledCampaign = CampaignSchedulerState.scheduledCampaigns.get(campaignId);
    if (!scheduledCampaign) return;

    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    console.log(`⏰ Starting scheduled campaign: ${campaign.name}`);

    // Update campaign status
    campaign.status = 'running';
    campaign.started_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();

    // Update scheduled campaign status
    scheduledCampaign.status = 'running';
    scheduledCampaign.startedAt = new Date().toISOString();

    saveCampaignsData();
    saveScheduledCampaigns();

    // Start sending messages
    await startCampaignSending(campaign);

    showNotification(`Campanha iniciada: ${campaign.name}`, 'success');
}

// Start campaign sending process
async function startCampaignSending(campaign) {
    const contactList = CampaignsState.contactLists.find(cl => cl.id === campaign.contact_list_id);
    if (!contactList) return;

    const contacts = CampaignsState.contacts.filter(c => c.contact_list_id === contactList.id && !c.is_blacklisted);
    if (contacts.length === 0) {
        showNotification('Nenhum contato válido para enviar mensagens', 'warning');
        return;
    }

    // Check daily limits
    const today = new Date().toISOString().split('T')[0];
    const dailyLimit = campaign.daily_limit || 300;
    const sentToday = CampaignSchedulerState.dailyLimits.get(today) || 0;

    if (sentToday >= dailyLimit) {
        showNotification(`Limite diário atingido para a campanha ${campaign.name}`, 'warning');
        return;
    }

    // Calculate how many messages to send today
    const remainingDaily = dailyLimit - sentToday;
    const remainingCampaign = contactList.valid_contacts - campaign.total_sent;
    const messagesToSendToday = Math.min(remainingDaily, remainingCampaign, contacts.length);

    console.log(`📧 Sending ${messagesToSendToday} messages for campaign ${campaign.name}`);

    // Send messages with rate limiting
    for (let i = 0; i < messagesToSendToday; i++) {
        const contact = contacts[i];
        const messageData = prepareMessageData(campaign, contact);

        try {
            const result = await queueMessage(messageData);
            if (result.success) {
                // Update counters
                campaign.total_sent++;
                contact.last_sent_at = new Date().toISOString();
                contact.last_sent_campaign = campaign.id;

                // Update daily limits
                CampaignSchedulerState.dailyLimits.set(today, sentToday + i + 1);
                saveDailyLimits();

                // Save progress
                saveCampaignsData();
            }

            // Wait for rate limit interval
            await new Promise(resolve => setTimeout(resolve, campaign.interval_min * 1000));
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    }

    // Check if campaign is completed
    if (campaign.total_sent >= contactList.valid_contacts) {
        campaign.status = 'completed';
        campaign.completed_at = new Date().toISOString();
        campaign.updated_at = new Date().toISOString();

        // Remove from scheduled campaigns
        CampaignSchedulerState.scheduledCampaigns.delete(campaign.id);
        if (CampaignSchedulerState.timers.has(campaign.id)) {
            clearTimeout(CampaignSchedulerState.timers.get(campaign.id));
            CampaignSchedulerState.timers.delete(campaign.id);
        }

        saveCampaignsData();
        saveScheduledCampaigns();

        showNotification(`Campanha concluída: ${campaign.name}`, 'success');
    }
}

// Prepare message data for sending
function prepareMessageData(campaign, contact) {
    const template = CampaignsState.templates.find(t => t.id === campaign.template_id);
    if (!template) throw new Error('Template not found');

    // Replace variables in template
    let messageContent = template.content;
    const variables = template.variables;

    variables.forEach(variable => {
        let value = '';
        if (variable === 'nome') {
            value = contact.name || 'Cliente';
        } else if (variable === 'phone' || variable === 'telefone') {
            value = contact.phone;
        } else if (variable === 'email') {
            value = contact.email || '';
        } else {
            // Check custom variables
            value = contact.variables[variable] || '';
        }

        messageContent = messageContent.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return {
        campaignId: campaign.id,
        contactId: contact.id,
        phone: contact.phone,
        message: messageContent,
        templateId: template.id,
        scheduledAt: new Date().toISOString()
    };
}

// Check for scheduled campaigns that should start
function checkScheduledCampaigns() {
    const now = new Date();

    CampaignSchedulerState.scheduledCampaigns.forEach((scheduledCampaign, campaignId) => {
        if (scheduledCampaign.status !== 'scheduled') return;

        const scheduledTime = new Date(scheduledCampaign.scheduledTime);
        if (now >= scheduledTime) {
            startScheduledCampaign(campaignId);
        }
    });
}

// Update daily limits
function updateDailyLimits() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Remove yesterday's data if it exists
    if (CampaignSchedulerState.dailyLimits.has(yesterday)) {
        CampaignSchedulerState.dailyLimits.delete(yesterday);
    }

    // Ensure today's counter exists
    if (!CampaignSchedulerState.dailyLimits.has(today)) {
        CampaignSchedulerState.dailyLimits.set(today, 0);
    }
}

// Schedule daily reset
function scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
        // Reset daily limits
        CampaignSchedulerState.dailyLimits.clear();
        saveDailyLimits();

        // Schedule next reset
        scheduleDailyReset();

        console.log('⏰ Daily limits reset');
    }, timeUntilMidnight);
}

// Save daily limits to storage
function saveDailyLimits() {
    try {
        const limits = Object.fromEntries(CampaignSchedulerState.dailyLimits);
        localStorage.setItem('dailyLimits', JSON.stringify(limits));
    } catch (error) {
        console.error('❌ Error saving daily limits:', error);
    }
}

// Load daily limits from storage
function loadDailyLimits() {
    try {
        const saved = localStorage.getItem('dailyLimits');
        if (saved) {
            const limits = JSON.parse(saved);
            CampaignSchedulerState.dailyLimits = new Map(Object.entries(limits));
        }
    } catch (error) {
        console.error('❌ Error loading daily limits:', error);
    }
}

// Get scheduler status
function getSchedulerStatus() {
    return {
        isRunning: CampaignSchedulerState.isRunning,
        scheduledCampaigns: CampaignSchedulerState.scheduledCampaigns.size,
        activeTimers: CampaignSchedulerState.timers.size,
        dailyLimits: Object.fromEntries(CampaignSchedulerState.dailyLimits),
        nextChecks: Array.from(CampaignSchedulerState.scheduledCampaigns.values()).map(c => ({
            id: c.id,
            name: c.name,
            scheduledTime: c.scheduledTime,
            status: c.status
        }))
    };
}

// Cancel scheduled campaign
function cancelScheduledCampaign(campaignId) {
    const scheduledCampaign = CampaignSchedulerState.scheduledCampaigns.get(campaignId);
    if (!scheduledCampaign) return false;

    // Remove from scheduled campaigns
    CampaignSchedulerState.scheduledCampaigns.delete(campaignId);

    // Clear timer
    if (CampaignSchedulerState.timers.has(campaignId)) {
        clearTimeout(CampaignSchedulerState.timers.get(campaignId));
        CampaignSchedulerState.timers.delete(campaignId);
    }

    // Update campaign status if it hasn't started
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (campaign && campaign.status === 'scheduled') {
        campaign.status = 'cancelled';
        campaign.updated_at = new Date().toISOString();
        saveCampaignsData();
    }

    saveScheduledCampaigns();
    showNotification('Campanha agendada cancelada', 'info');
    return true;
}

// Reschedule campaign
function rescheduleCampaign(campaignId, newTime) {
    if (cancelScheduledCampaign(campaignId)) {
        return scheduleCampaign(campaignId, newTime);
    }
    return false;
}

// Get scheduled campaigns list
function getScheduledCampaigns() {
    return Array.from(CampaignSchedulerState.scheduledCampaigns.values())
        .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
}

// Show scheduler dashboard
function showSchedulerDashboard() {
    const status = getSchedulerStatus();
    const scheduledCampaigns = getScheduledCampaigns();

    const formHTML = `
        <div class="scheduler-dashboard">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Agendador de Campanhas</h3>
            
            <!-- Scheduler Status -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${status.isRunning ? '🟢' : '🔴'}</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                        ${status.isRunning ? 'Ativo' : 'Inativo'}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Scheduler</div>
                </div>
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${status.scheduledCampaigns}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Campanhas Agendadas</div>
                </div>
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${status.activeTimers}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Temporizadores Ativos</div>
                </div>
            </div>

            <!-- Scheduled Campaigns List -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Campanhas Agendadas</h4>
                ${scheduledCampaigns.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${scheduledCampaigns.map(campaign => `
                            <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; color: var(--gray-900);">${escapeHTML(campaign.name)}</div>
                                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                                        Agendada: ${formatDateTime(campaign.scheduledTime)}
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--gray-500);">Status: ${campaign.status}</div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-warning btn-small" onclick="rescheduleCampaign('${campaign.id}', prompt('Nova data e hora (YYYY-MM-DDTHH:mm)'))">🔄 Reagendar</button>
                                    <button class="btn btn-error btn-small" onclick="cancelScheduledCampaign('${campaign.id}')">❌ Cancelar</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        Nenhuma campanha agendada no momento
                    </div>
                `}
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem;">
                    <button class="btn ${status.isRunning ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="${status.isRunning ? 'stopScheduler()' : 'startScheduler()'}">
                        ${status.isRunning ? '⏸️ Parar' : '▶️ Iniciar'}
                    </button>
                    <button class="btn btn-warning" onclick="resetScheduler()">🔄 Resetar</button>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    openModal('Agendador de Campanhas', formHTML, []);
}

// Reset scheduler
function resetScheduler() {
    stopScheduler();
    CampaignSchedulerState.scheduledCampaigns.clear();
    CampaignSchedulerState.dailyLimits.clear();
    saveScheduledCampaigns();
    saveDailyLimits();
    startScheduler();
    showNotification('Scheduler resetado', 'success');
}

// Export functions
window.initCampaignScheduler = initCampaignScheduler;
window.startScheduler = startScheduler;
window.stopScheduler = stopScheduler;
window.scheduleCampaign = scheduleCampaign;
window.cancelScheduledCampaign = cancelScheduledCampaign;
window.rescheduleCampaign = rescheduleCampaign;
window.getScheduledCampaigns = getScheduledCampaigns;
window.getSchedulerStatus = getSchedulerStatus;
window.showSchedulerDashboard = showSchedulerDashboard;
window.resetScheduler = resetScheduler;
window.loadDailyLimits = loadDailyLimits;
window.saveDailyLimits = saveDailyLimits;
window.updateDailyLimits = updateDailyLimits;
window.checkScheduledCampaigns = checkScheduledCampaigns;
window.startScheduledCampaign = startScheduledCampaign;
window.startCampaignSending = startCampaignSending;
window.prepareMessageData = prepareMessageData;
window.scheduleDailyReset = scheduleDailyReset;