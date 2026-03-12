// Financeiro Module - CRM Odonto Company
// ========================================

const FINANCE_PAYMENT_CATEGORIES = {
    all: 'Todos os tipos',
    inicio: 'Início de Tratamento',
    recorrente: 'Pagamentos Recorrentes',
    ortodontia: 'Saldos de Ortodontia',
    outros: 'Outros recebimentos'
};

const FinanceViewState = {
    paymentCategory: 'all',
    maintenanceStatus: 'all',
    debtorChannel: 'all'
};

function initFinanceiroModule() {
    renderFinanceiroView();
}

function renderFinanceiroView() {
    const container = document.getElementById('financeiroContent');
    if (!container) return;

    container.innerHTML = `
        <div class="finance-layout">
            <div class="finance-section finance-section--wide" id="financePaymentsSection">
                <div class="finance-section-header">
                    <div>
                        <h3>Pagamentos recebidos</h3>
                        <p class="finance-subtitle">Separe o que é entrada inicial, o recorrente e os saldos de ortodontia.</p>
                    </div>
                    <div class="finance-actions">
                        <select id="financePaymentCategoryFilter" class="form-select">
                            ${Object.entries(FINANCE_PAYMENT_CATEGORIES).map(([key, label]) => `
                                <option value="${key}">${label}</option>
                            `).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="openNewFinancePaymentForm()">Registrar recebimento</button>
                    </div>
                </div>
                <div class="finance-summary-row" id="financeSummaryCards"></div>
                <div class="finance-table-wrapper">
                    <table class="finance-table">
                        <thead>
                            <tr>
                                <th>Paciente / origem</th>
                                <th>Categorias</th>
                                <th>Método</th>
                                <th>Valor</th>
                                <th>Data</th>
                                <th>Observações</th>
                            </tr>
                        </thead>
                        <tbody id="financeReceivedTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div class="finance-section" id="financeMaintenanceSection">
                <div class="finance-section-header">
                    <div>
                        <h3>Manutenções de aparelhos</h3>
                        <p class="finance-subtitle">Controle o que deve ser pago e marque como quitado.</p>
                    </div>
                    <button class="btn btn-secondary" onclick="openNewMaintenanceForm()">Cadastrar manutenção</button>
                </div>
                <div class="finance-maintenance-list" id="financeMaintenanceList"></div>
                <div class="finance-reminders" id="financeMaintenanceReminders"></div>
            </div>

            <div class="finance-section" id="financeDebtorSection">
                <div class="finance-section-header">
                    <div>
                        <h3>Disparos para devedores</h3>
                        <p class="finance-subtitle">Crie mensagens em massa e avise quem está com saldo.</p>
                    </div>
                    <button class="btn btn-secondary" onclick="openNewDebtorForm()">Adicionar devedor</button>
                </div>
                <div class="finance-debtor-filters">
                    <label>
                        Canal
                        <select id="financeDebtorChannelFilter" class="form-select">
                            <option value="all">Todos</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="sms">SMS</option>
                            <option value="email">E-mail</option>
                        </select>
                    </label>
                    <label>
                        Mensagem padrão
                        <textarea id="financeDebtorMessage" class="form-textarea" rows="3" placeholder="Olá {{nome}}, identificamos um saldo pendente..."></textarea>
                    </label>
                </div>
                <div class="finance-debtor-cta">
                    <button class="btn btn-success" onclick="sendDebtMessages()">Enviar para selecionados</button>
                    <button class="btn btn-secondary" onclick="copyDebtMessage()">Copiar mensagem</button>
                </div>
                <div class="finance-debtor-list" id="financeDebtorList"></div>
            </div>
        </div>
    `;

    const paymentFilter = document.getElementById('financePaymentCategoryFilter');
    if (paymentFilter) {
        paymentFilter.value = FinanceViewState.paymentCategory;
        paymentFilter.addEventListener('change', (e) => {
            FinanceViewState.paymentCategory = e.target.value;
            renderFinanceSummaryCards();
            renderReceivedPaymentsTable();
        });
    }

    const debtorFilter = document.getElementById('financeDebtorChannelFilter');
    if (debtorFilter) {
        debtorFilter.value = FinanceViewState.debtorChannel;
        debtorFilter.addEventListener('change', (e) => {
            FinanceViewState.debtorChannel = e.target.value;
            renderDebtorList();
        });
    }

    renderFinanceSummaryCards();
    renderReceivedPaymentsTable();
    renderMaintenanceList();
    renderMaintenanceReminders();
    renderDebtorList();
}

function renderFinanceSummaryCards() {
    const container = document.getElementById('financeSummaryCards');
    if (!container) return;

    const payments = AppState.finances?.receivedPayments || [];
    const totalsByCategory = {};
    Object.keys(FINANCE_PAYMENT_CATEGORIES).forEach(key => totalsByCategory[key] = 0);

    payments.forEach(payment => {
        const category = payment.category || 'outros';
        const amount = Number(payment.amount) || 0;
        totalsByCategory[category] = (totalsByCategory[category] || 0) + amount;
    });

    const visibleCategories = ['inicio', 'recorrente', 'ortodontia', 'outros'];

    container.innerHTML = visibleCategories.map(key => `
        <div class="finance-summary-card">
            <div>
                <p>${FINANCE_PAYMENT_CATEGORIES[key]}</p>
                <strong>${formatCurrency(totalsByCategory[key])}</strong>
            </div>
            <span class="badge badge-gray">${(totalsByCategory[key] > 0 ? 'Registrado' : 'Sem entradas')}</span>
        </div>
    `).join('');
}

function renderReceivedPaymentsTable() {
    const tbody = document.getElementById('financeReceivedTableBody');
    if (!tbody) return;

    const payments = AppState.finances?.receivedPayments || [];
    const filtered = FinanceViewState.paymentCategory === 'all'
        ? payments
        : payments.filter(payment => payment.category === FinanceViewState.paymentCategory);

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--gray-500);">Nenhum recebimento registrado para esse tipo.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.sort((a,b) => new Date(b.date) - new Date(a.date)).map(payment => `
        <tr>
            <td>
                <strong>${escapeHTML(payment.patientName || 'Paciente não informado')}</strong>
                <div class="finance-table-subtext">${escapeHTML(payment.origin || payment.source || 'Origem não definida')}</div>
            </td>
            <td><span class="badge badge-primary">${FINANCE_PAYMENT_CATEGORIES[payment.category] || 'Outros'}</span></td>
            <td>${escapeHTML(payment.method || 'PIX/Cartão')}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${escapeHTML(payment.notes || '—')}</td>
        </tr>
    `).join('');
}

function renderMaintenanceList() {
    const container = document.getElementById('financeMaintenanceList');
    if (!container) return;

    const maintenances = AppState.finances?.deviceMaintenances || [];
    if (maintenances.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem; text-align: left;">
                <strong>Nenhuma manutenção cadastrada</strong>
                <p style="margin-top: 0.5rem; color: var(--gray-500);">Comece registrando a manutenção do equipamento e associe o fornecedor.</p>
            </div>
        `;
        return;
    }

    const now = new Date();
    const rows = maintenances.map(item => {
        const dueDate = new Date(item.dueDate);
        const overdue = dueDate < now && item.status !== 'paid';
        const dueSoon = dueDate >= now && dueDate <= new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        const statusBadge = item.status === 'paid'
            ? '<span class="badge badge-success">Pago</span>'
            : overdue
                ? '<span class="badge badge-error">Vencido</span>'
                : dueSoon
                    ? '<span class="badge badge-warning">A vencer</span>'
                    : '<span class="badge badge-gray">Agendado</span>';

        return `
            <div class="finance-maintenance-item">
                <div>
                    <strong>${escapeHTML(item.device)}</strong>
                    <div class="finance-table-subtext">${escapeHTML(item.provider || 'Fornecedor não informado')}</div>
                </div>
                <div class="finance-maintenance-meta">
                    <div>${formatDate(item.dueDate)}</div>
                    <div>${formatCurrency(item.cost)}</div>
                    ${statusBadge}
                    <div class="finance-table-subtext">${escapeHTML(item.notes || 'Sem notas')}</div>
                </div>
                <div class="finance-maintenance-actions">
                    ${item.status === 'paid' ? '' : `<button class="btn btn-small" onclick="markMaintenanceAsPaid('${item.id}')">Marcar como pago</button>`}
                    <button class="btn btn-small btn-secondary" onclick="showReminderToast('${item.id}')">Lembrar</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = rows;
}

function renderMaintenanceReminders() {
    const container = document.getElementById('financeMaintenanceReminders');
    if (!container) return;

    const reminders = (AppState.finances?.deviceMaintenances || [])
        .filter(item => item.status !== 'paid')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    if (reminders.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="finance-reminder-card">
            <h4>Próximos lembretes</h4>
            <ul>
                ${reminders.map(item => `
                    <li><strong>${escapeHTML(item.device)}</strong> — vence em ${formatDate(item.dueDate)} (${formatCurrency(item.cost)})</li>
                `).join('')}
            </ul>
        </div>
    `;
}

function renderDebtorList() {
    const container = document.getElementById('financeDebtorList');
    if (!container) return;

    const debtors = AppState.finances?.debtorQueue || [];
    const filtered = FinanceViewState.debtorChannel === 'all'
        ? debtors
        : debtors.filter(debtor => debtor.channel === FinanceViewState.debtorChannel);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem; text-align:left;">
                <strong>Sem devedores cadastrados</strong>
                <p style="margin-top: 0.5rem; color: var(--gray-500);">Adicione pessoas com saldos pendentes para disparar lembretes automáticos.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0)).map(debtor => `
        <label class="finance-debtor-item">
            <input type="checkbox" data-finance-debtor-checkbox="${debtor.id}">
            <div>
                <strong>${escapeHTML(debtor.name)}</strong>
                <div class="finance-table-subtext">Saldo: ${formatCurrency(debtor.amount)} • ${debtor.overdueDays || 0} dias em atraso</div>
            </div>
            <div class="finance-debtor-meta">
                <span>${debtor.channel || 'WhatsApp'}</span>
                <span>${escapeHTML(debtor.phone || debtor.contact || 'Sem telefone')}</span>
                <span class="badge badge-${debtor.status === 'negotiating' ? 'warning' : 'primary'}">${debtor.status === 'negotiating' ? 'Negociação' : 'Atrasado'}</span>
            </div>
        </label>
    `).join('');
}

function openNewFinancePaymentForm() {
    const form = `
        <form id="financePaymentForm" onsubmit="saveFinancePayment(event)">
            <div class="form-group">
                <label>Paciente ou origem *</label>
                <input type="text" name="patientName" class="form-input" required>
            </div>
            <div class="form-grid">
                    <div class="form-group">
                    <label>Categorias *</label>
                    <select name="category" class="form-select" required>
                        ${renderOptions(Object.entries(FINANCE_PAYMENT_CATEGORIES).filter(([key]) => key !== 'all'))}
                    </select>
                </div>
                <div class="form-group">
                    <label>Valor (R$) *</label>
                    <input type="number" name="amount" class="form-input" step="0.01" min="0" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Data do pagamento</label>
                    <input type="date" name="date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label>Método</label>
                    <input type="text" name="method" class="form-input" placeholder="PIX, Cartão, Transferência...">
                </div>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea name="notes" class="form-textarea" rows="3"></textarea>
            </div>
        </form>
    `;

    openModal('Registrar recebimento', form, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: "document.getElementById('financePaymentForm').requestSubmit()" }
    ]);
}

function saveFinancePayment(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const payment = {
        id: generateId(),
        patientName: data.get('patientName'),
        category: data.get('category') || 'outros',
        amount: parseFloat(data.get('amount')) || 0,
        date: data.get('date') || new Date().toISOString(),
        method: data.get('method') || 'PIX',
        notes: data.get('notes') || '',
        origin: data.get('patientName')
    };

    AppState.finances.receivedPayments.push(payment);
    saveToStorage(STORAGE_KEYS.FINANCE_PAYMENTS, AppState.finances.receivedPayments);
    closeModal();
    renderFinanceiroView();
    showNotification('Recebimento registrado com sucesso!', 'success');
}

function openNewMaintenanceForm() {
    const form = `
        <form id="financeMaintenanceForm" onsubmit="saveFinanceMaintenance(event)">
            <div class="form-group">
                <label>Aparelho *</label>
                <input type="text" name="device" class="form-input" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Fornecedor</label>
                    <input type="text" name="provider" class="form-input">
                </div>
                <div class="form-group">
                    <label>Custo (R$)</label>
                    <input type="number" name="cost" class="form-input" step="0.01" min="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Data prevista *</label>
                    <input type="date" name="dueDate" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" class="form-select">
                        <option value="pending">Pendente</option>
                        <option value="scheduled">Agendado</option>
                        <option value="negotiating">Em negociação</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Notas</label>
                <textarea name="notes" class="form-textarea" rows="3"></textarea>
            </div>
        </form>
    `;

    openModal('Registrar manutenção', form, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: "document.getElementById('financeMaintenanceForm').requestSubmit()" }
    ]);
}

function saveFinanceMaintenance(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const maintenance = {
        id: generateId(),
        device: data.get('device'),
        provider: data.get('provider'),
        cost: parseFloat(data.get('cost')) || 0,
        dueDate: data.get('dueDate') || new Date().toISOString(),
        status: data.get('status') || 'pending',
        notes: data.get('notes') || ''
    };

    AppState.finances.deviceMaintenances.push(maintenance);
    saveToStorage(STORAGE_KEYS.FINANCE_MAINTENANCE, AppState.finances.deviceMaintenances);
    closeModal();
    renderFinanceiroView();
    showNotification('Manutenção adicionada ao financeiro', 'success');
}

function openNewDebtorForm() {
    const form = `
        <form id="financeDebtorForm" onsubmit="saveFinanceDebtor(event)">
            <div class="form-group">
                <label>Nome *</label>
                <input type="text" name="name" class="form-input" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Telefone *</label>
                    <input type="tel" name="phone" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Canal</label>
                    <select name="channel" class="form-select">
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                        <option value="email">E-mail</option>
                    </select>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Valor em atraso (R$)</label>
                    <input type="number" name="amount" class="form-input" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label>Dias em atraso</label>
                    <input type="number" name="overdueDays" class="form-input" min="0">
                </div>
            </div>
            <div class="form-group">
                <label>Nota interna</label>
                <textarea name="notes" class="form-textarea" rows="2"></textarea>
            </div>
        </form>
    `;

    openModal('Adicionar devedor', form, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: "document.getElementById('financeDebtorForm').requestSubmit()" }
    ]);
}

function saveFinanceDebtor(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const debtor = {
        id: generateId(),
        name: data.get('name'),
        phone: data.get('phone'),
        amount: parseFloat(data.get('amount')) || 0,
        overdueDays: parseInt(data.get('overdueDays'), 10) || 0,
        channel: data.get('channel') || 'whatsapp',
        status: 'overdue',
        notes: data.get('notes') || ''
    };

    AppState.finances.debtorQueue.push(debtor);
    saveToStorage(STORAGE_KEYS.FINANCE_DEBTORS, AppState.finances.debtorQueue);
    closeModal();
    renderFinanceiroView();
    showNotification('Devedor salvo no fluxo de cobrança', 'success');
}

function markMaintenanceAsPaid(id) {
    const item = AppState.finances.deviceMaintenances.find(m => m.id === id);
    if (!item) return;
    item.status = 'paid';
    item.paidAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.FINANCE_MAINTENANCE, AppState.finances.deviceMaintenances);
    renderFinanceiroView();
    showNotification('Manutenção marcada como paga', 'success');
}

function showReminderToast(id) {
    const item = AppState.finances.deviceMaintenances.find(m => m.id === id);
    if (!item) return;
    showNotification(`Lembrete definido para ${item.device} em ${formatDate(item.dueDate)}`, 'info');
}

function sendDebtMessages() {
    const messageInput = document.getElementById('financeDebtorMessage');
    const messageTemplate = messageInput ? messageInput.value.trim() : '';
    const selected = getSelectedDebtors();

    if (selected.length === 0) {
        showNotification('Selecione pelo menos um devedor para enviar mensagem', 'warning');
        return;
    }

    selected.forEach((debtor, index) => {
        const personalized = messageTemplate
            ? messageTemplate.replace('{{nome}}', debtor.name)
            : `Olá ${debtor.name}, identificamos um saldo pendente.`;
        setTimeout(() => openWhatsApp(debtor.phone, personalized), index * 200);
    });

    showNotification(`${selected.length} disparos preparados`, 'success');
}

function copyDebtMessage() {
    const messageInput = document.getElementById('financeDebtorMessage');
    if (!messageInput) return;
    messageInput.select();
    document.execCommand('copy');
    showNotification('Mensagem copiada para a área de transferência', 'success');
}

function getSelectedDebtors() {
    const checkboxes = document.querySelectorAll('[data-finance-debtor-checkbox]');
    const selected = [];
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const id = cb.getAttribute('data-finance-debtor-checkbox');
            const debtor = AppState.finances.debtorQueue.find(d => d.id === id);
            if (debtor) selected.push(debtor);
        }
    });
    return selected;
}

function renderOptions(entries) {
    return entries.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
}

function formatCurrency(value) {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

window.initFinanceiroModule = initFinanceiroModule;
window.renderFinanceiroView = renderFinanceiroView;
window.saveFinancePayment = saveFinancePayment;
window.saveFinanceMaintenance = saveFinanceMaintenance;
window.saveFinanceDebtor = saveFinanceDebtor;
window.markMaintenanceAsPaid = markMaintenanceAsPaid;
window.showReminderToast = showReminderToast;
window.sendDebtMessages = sendDebtMessages;
window.copyDebtMessage = copyDebtMessage;
window.openNewFinancePaymentForm = openNewFinancePaymentForm;
window.openNewMaintenanceForm = openNewMaintenanceForm;
window.openNewDebtorForm = openNewDebtorForm;
