// CRM Odonto Company - Módulo de Estoque e Prótese
// ===============================================

function initEstoqueModule() {
    renderEstoqueView();
    attachEstoqueEventListeners();
}

function renderEstoqueView() {
    const container = document.getElementById('estoqueContent');
    if (!container) return;

    container.innerHTML = `
        <div class="estoque-tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--gray-200); padding-bottom: 0.5rem;">
            <button class="tab-btn active" onclick="switchEstoqueTab('materiais')">📦 Materiais</button>
            <button class="tab-btn" onclick="switchEstoqueTab('proteses')">🦷 Próteses</button>
        </div>

        <div id="materiais-tab" class="estoque-tab-content">
            <div class="search-bar" style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                <input type="text" id="searchInventory" class="form-input" placeholder="Buscar material..." oninput="filterInventory()">
                <select id="filterCategory" class="form-input" style="width: auto;" onchange="filterInventory()">
                    <option value="">Todas as Categorias</option>
                    <option value="Material">Material</option>
                    <option value="Descartável">Descartável</option>
                    <option value="Instrumental">Instrumental</option>
                    <option value="Outros">Outros</option>
                </select>
            </div>
            <div id="inventoryTableContainer"></div>
        </div>

        <div id="proteses-tab" class="estoque-tab-content" style="display: none;">
            <div class="search-bar" style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                <input type="text" id="searchProsthetic" class="form-input" placeholder="Buscar paciente ou serviço..." oninput="filterProsthetic()">
                <select id="filterStatus" class="form-input" style="width: auto;" onchange="filterProsthetic()">
                    <option value="">Todos os Status</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Recebido">Recebido</option>
                    <option value="Ajuste">Ajuste</option>
                    <option value="Finalizado">Finalizado</option>
                </select>
            </div>
            <div id="prostheticTableContainer"></div>
        </div>
    `;

    renderInventoryTable();
    renderProstheticTable();
}

function switchEstoqueTab(tab) {
    const materiaisTab = document.getElementById('materiais-tab');
    const protesesTab = document.getElementById('proteses-tab');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'materiais') {
        materiaisTab.style.display = 'block';
        protesesTab.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        materiaisTab.style.display = 'none';
        protesesTab.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

function renderInventoryTable() {
    const container = document.getElementById('inventoryTableContainer');
    if (!container) return;

    const items = AppState.inventoryItems || [];
    const search = document.getElementById('searchInventory')?.value.toLowerCase() || '';
    const category = document.getElementById('filterCategory')?.value || '';

    const filtered = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search);
        const matchesCategory = category === '' || item.category === category;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum item encontrado.</div>';
        return;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Qtd. Atual</th>
                    <th>Qtd. Mínima</th>
                    <th>Unidade</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach(item => {
        const isLow = parseFloat(item.quantity) <= parseFloat(item.minQuantity);
        const statusClass = isLow ? 'badge-danger' : 'badge-success';
        const statusText = isLow ? 'Estoque Baixo' : 'Ok';

        html += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.minQuantity}</td>
                <td>${item.unit || 'un'}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-icon" onclick="editInventoryItem('${item.id}')" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="adjustQuantity('${item.id}')" title="Ajustar Qtd">➕</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderProstheticTable() {
    const container = document.getElementById('prostheticTableContainer');
    if (!container) return;

    const services = AppState.prostheticServices || [];
    const search = document.getElementById('searchProsthetic')?.value.toLowerCase() || '';
    const status = document.getElementById('filterStatus')?.value || '';

    const filtered = services.filter(s => {
        const pName = (s.patientName || '').toLowerCase();
        const sName = (s.serviceName || '').toLowerCase();
        const matchesSearch = pName.includes(search) || sName.includes(search);
        const matchesStatus = status === '' || s.status === status;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma prótese encontrada.</div>';
        return;
    }

    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Paciente</th>
                    <th>Serviço</th>
                    <th>Laboratório</th>
                    <th>Custo</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach(s => {
        html += `
            <tr>
                <td><strong>${s.patientName}</strong></td>
                <td>${s.serviceName}</td>
                <td>${s.labName || '-'}</td>
                <td>${formatCurrency(s.cost)}</td>
                <td>${formatDate(s.dueDate)}</td>
                <td><span class="badge badge-info">${s.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editProstheticService('${s.id}')" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="changeProstheticStatus('${s.id}')" title="Mudar Status">🔄</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function filterInventory() { renderInventoryTable(); }
function filterProsthetic() { renderProstheticTable(); }

function attachEstoqueEventListeners() {
    const newItemBtn = document.getElementById('newItemBtn');
    if (newItemBtn) {
        newItemBtn.onclick = () => {
             const tab = document.querySelector('.tab-btn.active').textContent.includes('Materiais') ? 'materiais' : 'proteses';
             if (tab === 'materiais') openInventoryModal();
             else openProstheticModal();
        };
    }

    const openProstheticBtn = document.getElementById('openProstheticBtn');
    if (openProstheticBtn) {
        openProstheticBtn.onclick = () => switchEstoqueTab('proteses');
    }
}

function openInventoryModal(itemId = null) {
    const item = itemId ? AppState.inventoryItems.find(i => i.id === itemId) : null;
    
    const form = `
        <form id="inventoryForm" onsubmit="saveInventoryItem(event)">
            <input type="hidden" name="id" value="${item?.id || ''}">
            <div class="form-group">
                <label>Nome do Item *</label>
                <input type="text" name="name" class="form-input" value="${item?.name || ''}" required>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Categoria</label>
                    <select name="category" class="form-select">
                        <option value="Material" ${item?.category === 'Material' ? 'selected' : ''}>Material</option>
                        <option value="Descartável" ${item?.category === 'Descartável' ? 'selected' : ''}>Descartável</option>
                        <option value="Instrumental" ${item?.category === 'Instrumental' ? 'selected' : ''}>Instrumental</option>
                        <option value="Outros" ${item?.category === 'Outros' ? 'selected' : ''}>Outros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Unidade</label>
                    <input type="text" name="unit" class="form-input" value="${item?.unit || ''}" placeholder="un, pct, kg...">
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Quantidade Atual</label>
                    <input type="number" name="quantity" class="form-input" value="${item?.quantity || 0}" step="0.1">
                </div>
                <div class="form-group">
                    <label>Estoque Mínimo</label>
                    <input type="number" name="minQuantity" class="form-input" value="${item?.minQuantity || 0}" step="0.1">
                </div>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea name="notes" class="form-textarea" rows="3">${item?.notes || ''}</textarea>
            </div>
        </form>
    `;

    openModal(item ? 'Editar Item' : 'Novo Item', form, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: "document.getElementById('inventoryForm').requestSubmit()" }
    ]);
}

window.saveInventoryItem = async function(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const id = data.get('id');
    
    const newItem = {
        id: id || generateId(),
        name: data.get('name'),
        category: data.get('category'),
        quantity: parseFloat(data.get('quantity')) || 0,
        minQuantity: parseFloat(data.get('minQuantity')) || 0,
        unit: data.get('unit'),
        notes: data.get('notes'),
        updatedAt: new Date().toISOString()
    };

    if (id) {
        const index = AppState.inventoryItems.findIndex(i => i.id === id);
        if (index !== -1) AppState.inventoryItems[index] = newItem;
        if (typeof updateRecord === 'function') await updateRecord('inventory_items', newItem);
    } else {
        newItem.createdAt = new Date().toISOString();
        AppState.inventoryItems.push(newItem);
        if (typeof insertRecord === 'function') await insertRecord('inventory_items', newItem);
    }

    saveToStorage(STORAGE_KEYS.INVENTORY_ITEMS, AppState.inventoryItems);
    closeModal();
    renderInventoryTable();
    showNotification('Item salvo com sucesso!', 'success');
};

function openProstheticModal(serviceId = null) {
    const service = serviceId ? AppState.prostheticServices.find(s => s.id === serviceId) : null;

    const form = `
        <form id="prostheticForm" onsubmit="saveProstheticService(event)">
            <input type="hidden" name="id" value="${service?.id || ''}">
            <div class="form-group">
                <label>Paciente *</label>
                <input type="text" name="patientName" class="form-input" value="${service?.patientName || ''}" required>
            </div>
            <div class="form-group">
                <label>Serviço *</label>
                <input type="text" name="serviceName" class="form-input" value="${service?.serviceName || ''}" required placeholder="ex: Coroa, Prótese Total...">
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Laboratório</label>
                    <input type="text" name="labName" class="form-input" value="${service?.labName || ''}">
                </div>
                <div class="form-group">
                    <label>Custo (R$)</label>
                    <input type="number" name="cost" class="form-input" value="${service?.cost || 0}" step="0.01">
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Prazo</label>
                    <input type="date" name="dueDate" class="form-input" value="${service?.dueDate || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" class="form-select">
                        <option value="Enviado" ${service?.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="Recebido" ${service?.status === 'Recebido' ? 'selected' : ''}>Recebido</option>
                        <option value="Ajuste" ${service?.status === 'Ajuste' ? 'selected' : ''}>Ajuste</option>
                        <option value="Finalizado" ${service?.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                    </select>
                </div>
            </div>
        </form>
    `;

    openModal(service ? 'Editar Prótese' : 'Nova Prótese', form, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar', class: 'btn-primary', onclick: "document.getElementById('prostheticForm').requestSubmit()" }
    ]);
}

window.saveProstheticService = async function(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const id = data.get('id');

    const newService = {
        id: id || generateId(),
        patientName: data.get('patientName'),
        serviceName: data.get('serviceName'),
        labName: data.get('labName'),
        cost: parseFloat(data.get('cost')) || 0,
        dueDate: data.get('dueDate'),
        status: data.get('status'),
        updatedAt: new Date().toISOString()
    };

    if (id) {
        const index = AppState.prostheticServices.findIndex(s => s.id === id);
        if (index !== -1) AppState.prostheticServices[index] = newService;
        if (typeof updateRecord === 'function') await updateRecord('prosthetic_services', newService);
    } else {
        newService.createdAt = new Date().toISOString();
        AppState.prostheticServices.push(newService);
        if (typeof insertRecord === 'function') await insertRecord('prosthetic_services', newService);
    }

    saveToStorage(STORAGE_KEYS.PROSTHETIC_SERVICES, AppState.prostheticServices);
    closeModal();
    renderProstheticTable();
    showNotification('Serviço de prótese salvo!', 'success');
};

function adjustQuantity(id) {
    const item = AppState.inventoryItems.find(i => i.id === id);
    if (!item) return;

    const val = prompt(`Ajustar quantidade de ${item.name} (${item.quantity} atual). Digite o NOVO valor total:`, item.quantity);
    if (val !== null) {
        item.quantity = parseFloat(val) || 0;
        item.updatedAt = new Date().toISOString();
        saveToStorage(STORAGE_KEYS.INVENTORY_ITEMS, AppState.inventoryItems);
        if (typeof updateRecord === 'function') updateRecord('inventory_items', item);
        renderInventoryTable();
        showNotification('Quantidade ajustada!', 'success');
    }
}

function changeProstheticStatus(id) {
    const service = AppState.prostheticServices.find(s => s.id === id);
    if (!service) return;

    const statuses = ['Enviado', 'Recebido', 'Ajuste', 'Finalizado'];
    const currentIdx = statuses.indexOf(service.status);
    const nextIdx = (currentIdx + 1) % statuses.length;
    
    service.status = statuses[nextIdx];
    service.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.PROSTHETIC_SERVICES, AppState.prostheticServices);
    if (typeof updateRecord === 'function') updateRecord('prosthetic_services', service);
    renderProstheticTable();
    showNotification(`Status alterado para ${service.status}`, 'info');
}

// Expor helpers
window.adjustQuantity = adjustQuantity;
window.changeProstheticStatus = changeProstheticStatus;
window.editInventoryItem = openInventoryModal;
window.editProstheticService = openProstheticModal;
window.switchEstoqueTab = switchEstoqueTab;
window.filterInventory = filterInventory;
window.filterProsthetic = filterProsthetic;
