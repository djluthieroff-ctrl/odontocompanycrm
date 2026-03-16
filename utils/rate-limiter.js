// Rate Limiter Utility - Campaigns Module
// ===========================================

// Global state for rate limiting
const RateLimiterState = {
    // WhatsApp limits (conservative approach)
    limits: {
        messagesPerMinute: 20,    // Conservative limit to avoid bans
        messagesPerHour: 200,     // Hourly limit
        messagesPerDay: 1000,     // Daily limit
        intervalMin: 3000,        // Minimum interval between messages (3 seconds)
        intervalMax: 8000         // Maximum interval (8 seconds)
    },

    // Current session tracking
    session: {
        minuteCount: 0,
        hourCount: 0,
        dayCount: 0,
        lastResetMinute: null,
        lastResetHour: null,
        lastResetDay: null,
        lastMessageTime: 0,
        isPaused: false,
        pauseUntil: null
    },

    // Queue management
    messageQueue: [],
    processingQueue: false,
    queueTimer: null
};

// Initialize Rate Limiter
function initRateLimiter() {
    console.log('⏱️ Rate Limiter initialized');
    loadRateLimiterState();
    setupRateLimiterIntervals();
}

// Load Rate Limiter State from Storage
function loadRateLimiterState() {
    try {
        const savedState = localStorage.getItem('rateLimiterState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            RateLimiterState.session = { ...RateLimiterState.session, ...parsed };
        }
    } catch (error) {
        console.error('❌ Error loading rate limiter state:', error);
    }
}

// Save Rate Limiter State to Storage
function saveRateLimiterState() {
    try {
        localStorage.setItem('rateLimiterState', JSON.stringify(RateLimiterState.session));
    } catch (error) {
        console.error('❌ Error saving rate limiter state:', error);
    }
}

// Setup Rate Limiter Intervals
function setupRateLimiterIntervals() {
    // Reset counters periodically
    setInterval(() => {
        const now = Date.now();
        const minuteAgo = now - 60000;
        const hourAgo = now - 3600000;
        const dayAgo = now - 86400000;

        // Reset minute counter
        if (RateLimiterState.session.lastResetMinute < minuteAgo) {
            RateLimiterState.session.minuteCount = 0;
            RateLimiterState.session.lastResetMinute = now;
        }

        // Reset hour counter
        if (RateLimiterState.session.lastResetHour < hourAgo) {
            RateLimiterState.session.hourCount = 0;
            RateLimiterState.session.lastResetHour = now;
        }

        // Reset day counter
        if (RateLimiterState.session.lastResetDay < dayAgo) {
            RateLimiterState.session.dayCount = 0;
            RateLimiterState.session.lastResetDay = now;
        }

        saveRateLimiterState();
    }, 10000); // Check every 10 seconds
}

// Check if message can be sent
function canSendMessage() {
    const now = Date.now();

    // Check if paused
    if (RateLimiterState.session.isPaused && RateLimiterState.session.pauseUntil > now) {
        return { allowed: false, reason: 'paused', until: RateLimiterState.session.pauseUntil };
    }

    // Check minute limit
    if (RateLimiterState.session.minuteCount >= RateLimiterState.limits.messagesPerMinute) {
        return { allowed: false, reason: 'minute_limit' };
    }

    // Check hour limit
    if (RateLimiterState.session.hourCount >= RateLimiterState.limits.messagesPerHour) {
        return { allowed: false, reason: 'hour_limit' };
    }

    // Check day limit
    if (RateLimiterState.session.dayCount >= RateLimiterState.limits.messagesPerDay) {
        return { allowed: false, reason: 'day_limit' };
    }

    // Check minimum interval
    const timeSinceLast = now - RateLimiterState.session.lastMessageTime;
    if (timeSinceLast < RateLimiterState.limits.intervalMin) {
        return { allowed: false, reason: 'interval_too_short', remaining: RateLimiterState.limits.intervalMin - timeSinceLast };
    }

    return { allowed: true };
}

// Send message with rate limiting
async function sendMessageWithRateLimit(messageData) {
    // Check if allowed
    const canSend = canSendMessage();
    if (!canSend.allowed) {
        return handleRateLimitExceeded(canSend, messageData);
    }

    try {
        // Send the message
        const result = await sendWhatsAppMessage(messageData);

        // Update counters if successful
        if (result.success) {
            updateCounters();
            RateLimiterState.session.lastMessageTime = Date.now();
            saveRateLimiterState();
        }

        return result;
    } catch (error) {
        console.error('❌ Error sending message:', error);
        return { success: false, error: error.message };
    }
}

// Update counters after successful message
function updateCounters() {
    const now = Date.now();
    RateLimiterState.session.minuteCount++;
    RateLimiterState.session.hourCount++;
    RateLimiterState.session.dayCount++;
    RateLimiterState.session.lastMessageTime = now;
}

// Handle rate limit exceeded
function handleRateLimitExceeded(canSend, messageData) {
    switch (canSend.reason) {
        case 'paused':
            return { success: false, reason: 'rate_limiter_paused', until: canSend.until };

        case 'minute_limit':
            const waitTime = 60000 - (Date.now() - RateLimiterState.session.lastResetMinute);
            return { success: false, reason: 'minute_limit_exceeded', waitTime };

        case 'hour_limit':
            const hourWaitTime = 3600000 - (Date.now() - RateLimiterState.session.lastResetHour);
            return { success: false, reason: 'hour_limit_exceeded', waitTime: hourWaitTime };

        case 'day_limit':
            const dayWaitTime = 86400000 - (Date.now() - RateLimiterState.session.lastResetDay);
            return { success: false, reason: 'day_limit_exceeded', waitTime: dayWaitTime };

        case 'interval_too_short':
            return { success: false, reason: 'interval_too_short', waitTime: canSend.remaining };

        default:
            return { success: false, reason: 'unknown_limit' };
    }
}

// Pause rate limiter
function pauseRateLimiter(duration = 300000) { // Default 5 minutes
    RateLimiterState.session.isPaused = true;
    RateLimiterState.session.pauseUntil = Date.now() + duration;
    saveRateLimiterState();
    showNotification(`Rate limiter pausado por ${Math.round(duration / 60000)} minutos`, 'warning');
}

// Resume rate limiter
function resumeRateLimiter() {
    RateLimiterState.session.isPaused = false;
    RateLimiterState.session.pauseUntil = null;
    saveRateLimiterState();
    showNotification('Rate limiter retomado', 'success');
}

// Reset counters manually
function resetRateLimiterCounters() {
    RateLimiterState.session.minuteCount = 0;
    RateLimiterState.session.hourCount = 0;
    RateLimiterState.session.dayCount = 0;
    RateLimiterState.session.lastResetMinute = Date.now();
    RateLimiterState.session.lastResetHour = Date.now();
    RateLimiterState.session.lastResetDay = Date.now();
    saveRateLimiterState();
    showNotification('Contadores do rate limiter resetados', 'success');
}

// Get current status
function getRateLimiterStatus() {
    const now = Date.now();
    const timeUntilMinuteReset = Math.max(0, 60000 - (now - RateLimiterState.session.lastResetMinute));
    const timeUntilHourReset = Math.max(0, 3600000 - (now - RateLimiterState.session.lastResetHour));
    const timeUntilDayReset = Math.max(0, 86400000 - (now - RateLimiterState.session.lastResetDay));

    return {
        current: {
            minuteCount: RateLimiterState.session.minuteCount,
            hourCount: RateLimiterState.session.hourCount,
            dayCount: RateLimiterState.session.dayCount
        },
        limits: RateLimiterState.limits,
        remaining: {
            minute: Math.max(0, RateLimiterState.limits.messagesPerMinute - RateLimiterState.session.minuteCount),
            hour: Math.max(0, RateLimiterState.limits.messagesPerHour - RateLimiterState.session.hourCount),
            day: Math.max(0, RateLimiterState.limits.messagesPerDay - RateLimiterState.session.dayCount)
        },
        resets: {
            minute: timeUntilMinuteReset,
            hour: timeUntilHourReset,
            day: timeUntilDayReset
        },
        isPaused: RateLimiterState.session.isPaused,
        pauseUntil: RateLimiterState.session.pauseUntil
    };
}

// Queue message for sending
function queueMessage(messageData) {
    RateLimiterState.messageQueue.push({
        ...messageData,
        id: generateId(),
        queuedAt: Date.now(),
        attempts: 0
    });

    if (!RateLimiterState.processingQueue) {
        processQueue();
    }
}

// Process message queue
async function processQueue() {
    if (RateLimiterState.processingQueue || RateLimiterState.messageQueue.length === 0) {
        return;
    }

    RateLimiterState.processingQueue = true;

    while (RateLimiterState.messageQueue.length > 0) {
        const message = RateLimiterState.messageQueue[0];
        const canSend = canSendMessage();

        if (canSend.allowed) {
            // Remove from queue
            RateLimiterState.messageQueue.shift();

            // Send message
            const result = await sendMessageWithRateLimit(message);

            // Handle result
            if (result.success) {
                // Message sent successfully
                updateCampaignStats(message.campaignId, 'sent', result.status);
            } else {
                // Handle failure
                message.attempts++;
                if (message.attempts >= 3) {
                    // Move to failed queue or handle permanently failed
                    RateLimiterState.messageQueue.shift();
                    handleFailedMessage(message, result);
                }
            }

            // Wait for next interval
            const interval = Math.floor(Math.random() *
                (RateLimiterState.limits.intervalMax - RateLimiterState.limits.intervalMin + 1)) +
                RateLimiterState.limits.intervalMin;

            await new Promise(resolve => setTimeout(resolve, interval));
        } else {
            // Rate limit exceeded, wait and retry
            let waitTime = 1000; // Default wait

            switch (canSend.reason) {
                case 'minute_limit':
                    waitTime = canSend.waitTime || 60000;
                    break;
                case 'hour_limit':
                    waitTime = canSend.waitTime || 3600000;
                    break;
                case 'day_limit':
                    waitTime = canSend.waitTime || 86400000;
                    break;
                case 'interval_too_short':
                    waitTime = canSend.waitTime || 1000;
                    break;
                default:
                    waitTime = 5000;
            }

            // Pause processing and wait
            RateLimiterState.processingQueue = false;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            RateLimiterState.processingQueue = true;
        }
    }

    RateLimiterState.processingQueue = false;
}

// Handle failed message
function handleFailedMessage(message, result) {
    console.error('❌ Failed to send message after 3 attempts:', message, result);
    showNotification(`Falha ao enviar mensagem para ${message.phone}: ${result.error}`, 'error');
}

// Update campaign stats
function updateCampaignStats(campaignId, status, whatsappStatus) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    switch (status) {
        case 'sent':
            campaign.total_sent++;
            if (whatsappStatus === 'delivered') {
                campaign.total_delivered++;
            } else if (whatsappStatus === 'read') {
                campaign.total_delivered++;
                campaign.total_read++;
            } else if (whatsappStatus === 'failed') {
                campaign.total_failed++;
            }
            break;
    }

    saveCampaignsData();
}

// Send WhatsApp message (placeholder - integrate with actual WhatsApp API)
async function sendWhatsAppMessage(messageData) {
    // This would integrate with the actual WhatsApp API
    // For now, simulate the response

    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate different response types
            const random = Math.random();
            let status = 'sent';

            if (random > 0.95) {
                status = 'failed'; // 5% failure rate
            } else if (random > 0.7) {
                status = 'delivered'; // 25% delivered
            } else if (random > 0.5) {
                status = 'read'; // 20% read
            }

            resolve({
                success: status !== 'failed',
                status: status,
                messageId: generateId(),
                timestamp: Date.now()
            });
        }, 1000); // Simulate API delay
    });
}

// Get rate limiter dashboard data
function getRateLimiterDashboard() {
    const status = getRateLimiterStatus();
    const now = Date.now();

    return {
        currentUsage: {
            minute: `${status.current.minuteCount}/${status.limits.messagesPerMinute}`,
            hour: `${status.current.hourCount}/${status.limits.messagesPerHour}`,
            day: `${status.current.dayCount}/${status.limits.messagesPerDay}`
        },
        remaining: {
            minute: status.remaining.minute,
            hour: status.remaining.hour,
            day: status.remaining.day
        },
        nextResets: {
            minute: formatTimeUntil(status.resets.minute),
            hour: formatTimeUntil(status.resets.hour),
            day: formatTimeUntil(status.resets.day)
        },
        queue: {
            pending: RateLimiterState.messageQueue.length,
            processing: RateLimiterState.processingQueue
        },
        status: {
            isPaused: status.isPaused,
            canSend: canSendMessage().allowed
        }
    };
}

// Format time until reset
function formatTimeUntil(milliseconds) {
    if (milliseconds <= 0) return 'Agora';

    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Show rate limiter dashboard
function showRateLimiterDashboard() {
    const data = getRateLimiterDashboard();
    const status = getRateLimiterStatus();

    const formHTML = `
        <div class="rate-limiter-dashboard">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Controle de Taxa de Envio</h3>
            
            <!-- Current Usage -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${data.currentUsage.minute}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Por Minuto</div>
                    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--gray-500);">Próximo reset: ${data.nextResets.minute}</div>
                </div>
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🕐</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${data.currentUsage.hour}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Por Hora</div>
                    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--gray-500);">Próximo reset: ${data.nextResets.hour}</div>
                </div>
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${data.currentUsage.day}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Por Dia</div>
                    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--gray-500);">Próximo reset: ${data.nextResets.day}</div>
                </div>
            </div>

            <!-- Queue Status -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Fila de Mensagens</h4>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-600);">${data.queue.pending}</div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">Pendentes</div>
                    </div>
                    <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${data.queue.processing ? 'var(--success-600)' : 'var(--gray-600)'};">
                            ${data.queue.processing ? '🔄' : '⏸️'}
                        </div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">
                            ${data.queue.processing ? 'Processando' : 'Parado'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem;">
                    <button class="btn ${status.isPaused ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="${status.isPaused ? 'resumeRateLimiter()' : 'pauseRateLimiter()'}">
                        ${status.isPaused ? '▶️ Retomar' : '⏸️ Pausar'}
                    </button>
                    <button class="btn btn-warning" onclick="resetRateLimiterCounters()">🔄 Resetar Contadores</button>
                    <button class="btn btn-secondary" onclick="clearMessageQueue()">🗑️ Limpar Fila</button>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    openModal('Rate Limiter - Status', formHTML, []);
}

// Clear message queue
function clearMessageQueue() {
    RateLimiterState.messageQueue = [];
    RateLimiterState.processingQueue = false;
    if (RateLimiterState.queueTimer) {
        clearInterval(RateLimiterState.queueTimer);
        RateLimiterState.queueTimer = null;
    }
    showNotification('Fila de mensagens limpa', 'success');
}

// Export functions
window.initRateLimiter = initRateLimiter;
window.canSendMessage = canSendMessage;
window.sendMessageWithRateLimit = sendMessageWithRateLimit;
window.queueMessage = queueMessage;
window.pauseRateLimiter = pauseRateLimiter;
window.resumeRateLimiter = resumeRateLimiter;
window.resetRateLimiterCounters = resetRateLimiterCounters;
window.getRateLimiterStatus = getRateLimiterStatus;
window.getRateLimiterDashboard = getRateLimiterDashboard;
window.showRateLimiterDashboard = showRateLimiterDashboard;
window.clearMessageQueue = clearMessageQueue;
window.handleFailedMessage = handleFailedMessage;
window.updateCampaignStats = updateCampaignStats;
window.formatTimeUntil = formatTimeUntil;
window.processQueue = processQueue;
window.handleRateLimitExceeded = handleRateLimitExceeded;
window.updateCounters = updateCounters;
window.sendWhatsAppMessage = sendWhatsAppMessage;