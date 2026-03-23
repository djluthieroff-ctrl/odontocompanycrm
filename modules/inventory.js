// Gestão de Estoque - CRM Odonto Company
// ==========================================

const InventoryState = {
    products: [],
    categories: [],
    lowStockAlerts: [],
    movements: []
};

// Inicializar Módulo de Estoque
function initInventoryModule() {
    InventoryState.products = AppState.products || [];
    InventoryState.categories = AppState.categories || [];
    InventoryState.movements = AppState.inventoryMovements || [];
    renderInventoryDashboard();
    setupInventoryEvents();
}

// Renderizar Dashboard de Estoque
function renderInventoryDashboard() {
    const container = document.getElementById('inventoryContent');
    if (!container) return;

    const stats = calculateInventoryStats();

    container.innerHTML = `
        <style>
            .inventory-header {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--gray-200);
                margin-bottom: 2rem;
            }

            .inventory-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .inventory-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .inventory-stat-card {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
            }

            .inventory-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .inventory-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .inventory-tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .tab-btn-inventory {
                padding: 0.75rem 1.5rem;
                border: 1px solid var(--gray-300);
                border-radius: 12px;
                background: white;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .tab-btn-inventory.active {
                background: #dcfce7;
                border-color: #10b981;
                color: #065f46;
            }

            .inventory-content {
                display: none;
            }

            .inventory-content.active {
                display: block;
            }

            .product-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .product-card.low-stock {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .product-card.out-of-stock {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .product-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .product-title {
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--gray-900);
                margin: 0;
            }

            .product-category {
                font-size: 0.8rem;
                color: var(--gray-500);
                background: var(--gray-100);
                padding: 2px 8px;
                border-radius: 999px;
            }

            .product-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .info-item {
                background: var(--gray-50);
                padding: 1rem;
                border-radius: 12px;
                text-align: center;
            }

            .info-value {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
            }

            .info-label {
                font-size: 0.75rem;
                color: var(--gray-600);
                margin-top: 0.25rem;
            }

            .product-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .btn-inventory {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-inventory:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-inventory {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-primary-inventory:hover {
                background: #2563eb;
            }

            .btn-warning-inventory {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-inventory:hover {
                background: #d97706;
            }

            .btn-danger-inventory {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-inventory:hover {
                background: #dc2626;
            }

            .movement-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem;
                border-bottom: 1px solid var(--gray-100);
                transition: all 0.2s;
            }

            .movement-item:hover {
                background: var(--gray-50);
            }

            .movement-type {
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 0.7rem;
            }

            .type-entry { background: #dcfce7; color: #166534; }
            .type-exit { background: #fee2e2; color: #991b1b; }
            .type-adjustment { background: #e0e7ff; color: #3730a3; }

            .alert-badge {
                background: #fee2e2;
                color: #991b1b;
                padding: 4px 8px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
            }
        </style>

        <!-- Header com Controles -->
        <div class="inventory-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: var(--gray-900);">📦 Gestão de Estoque</h2>
                    <p style="margin: 0; color: var(--gray-600);">Controle de materiais e produtos da clínica</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-inventory" onclick="showNewProductForm()">➕ Novo Produto</button>
                    <button class="btn-warning-inventory" onclick="showInventoryAdjustmentForm()">🔧 Ajuste de Estoque</button>
                    <button class="btn-danger-inventory" onclick="showLowStockReport()">⚠️ Alertas</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="inventory-stats-grid">
            <div class="inventory-stat-card">
                <div class="inventory-stat-value">${stats.totalProducts}</div>
                <div class="inventory-stat-label">Produtos Cadastrados</div>
            </div>

            <div class="inventory-stat-card">
                <div class="inventory-stat-value" style="color: #10b981;">${stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div class="inventory-stat-label">Valor Total em Estoque</div>
            </div>

            <div class="inventory-stat-card">
                <div class="inventory-stat-value" style="color: #f59e0b;">${stats.lowStockCount}</div>
                <div class="inventory-stat-label">Produtos em Falta</div>
            </div>

            <div class="inventory-stat-card">
                <div class="inventory-stat-value" style="color: #ef4444;">${stats.outOfStockCount}</div>
                <div class="inventory-stat-label">Sem Estoque</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="inventory-tabs">
            <button class="tab-btn-inventory active" onclick="switchInventoryTab('products')" id="tab-products">
                📦 Produtos
            </button>
            <button class="tab-btn-inventory" onclick="switchInventoryTab('movements')" id="tab-movements">
                📊 Movimentações
            </button>
            <button class="tab-btn-inventory" onclick="switchInventoryTab('categories')" id="tab-categories">
                🏷️ Categorias
            </button>
            <button class="tab-btn-inventory" onclick="switchInventoryTab('reports')" id="tab-reports">
                📈 Relatórios
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="inventory-products" class="inventory-content active">
            ${renderProductsTab()}
        </div>

        <div id="inventory-movements" class="inventory-content">
            ${renderMovementsTab()}
        </div>

        <div id="inventory-categories" class="inventory-content">
            ${renderCategoriesTab()}
        </div>

        <div id="inventory-reports" class="inventory-content">
            ${renderReportsTab()}
        </div>
    `;
}

// Renderizar Aba de Produtos
function renderProductsTab() {
    return `
        <div class="product-card">
            <div class="product-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📦 Lista de Produtos</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" class="form-input" id="productSearch" placeholder="Buscar produto..." oninput="filterProducts(this.value)">
                    <select class="form-select" id="categoryFilter" onchange="filterProductsByCategory(this.value)">
                        <option value="all">Todas as Categorias</option>
                        ${InventoryState.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div id="productsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                ${InventoryState.products.map(renderProductCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Movimentações
function renderMovementsTab() {
    return `
        <div class="product-card">
            <div class="product-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Histórico de Movimentações</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-inventory" onclick="showNewMovementForm()">➕ Nova Movimentação</button>
                    <button class="btn-inventory" onclick="exportMovements()">📤 Exportar</button>
                </div>
            </div>
            
            <div style="max-height: 500px; overflow-y: auto;">
                ${InventoryState.movements.length > 0 ? InventoryState.movements.slice(-50).reverse().map(renderMovementItem).join('') : `
                    <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📊</div>
                        <p>Nenhuma movimentação registrada</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Renderizar Aba de Categorias
function renderCategoriesTab() {
    return `
        <div class="product-card">
            <div class="product-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🏷️ Categorias de Produtos</h3>
                <button class="btn-primary-inventory" onclick="showNewCategoryForm()">➕ Nova Categoria</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                ${InventoryState.categories.map(renderCategoryCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Relatórios
function renderReportsTab() {
    const lowStockProducts = InventoryState.products.filter(p => p.quantity <= p.minStock);
    const outOfStockProducts = InventoryState.products.filter(p => p.quantity === 0);

    return `
        <div class="product-card">
            <div class="product-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Relatórios de Estoque</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-inventory" onclick="generateStockReport()">📊 Relatório de Estoque</button>
                    <button class="btn-inventory" onclick="generateMovementReport()">📋 Relatório de Movimentações</button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 12px; padding: 1rem;">
                    <h4 style="margin: 0 0 1rem 0; color: #991b1b;">⚠️ Produtos em Falta</h4>
                    ${lowStockProducts.length > 0 ? lowStockProducts.map(p => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #fecaca;">
                            <span>${p.name}</span>
                            <span style="font-weight: 700; color: #991b1b;">${p.quantity} unidades</span>
                        </div>
                    `).join('') : '<p style="color: #991b1b; text-align: center;">Nenhum produto em falta</p>'}
                </div>
                
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1rem;">
                    <h4 style="margin: 0 0 1rem 0; color: #ef4444;">🚨 Sem Estoque</h4>
                    ${outOfStockProducts.length > 0 ? outOfStockProducts.map(p => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #fecaca;">
                            <span>${p.name}</span>
                            <span style="font-weight: 700; color: #ef4444;">0 unidades</span>
                        </div>
                    `).join('') : '<p style="color: #ef4444; text-align: center;">Nenhum produto sem estoque</p>'}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${InventoryState.products.length}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Total de Produtos</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${InventoryState.movements.filter(m => m.type === 'entry').length}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Entradas</div>
                </div>
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #ef4444;">${InventoryState.movements.filter(m => m.type === 'exit').length}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">Saídas</div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Produto
function renderProductCard(product) {
    const category = InventoryState.categories.find(c => c.id === product.categoryId);
    const isLowStock = product.quantity <= product.minStock;
    const isOutOfStock = product.quantity === 0;
    const cssClass = isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : '';

    return `
        <div class="product-card ${cssClass}" data-product-id="${product.id}">
            <div class="product-header">
                <div>
                    <h4 class="product-title">${escapeHTML(product.name)}</h4>
                    <span class="product-category">${category ? category.name : 'Sem Categoria'}</span>
                    ${isLowStock || isOutOfStock ? '<span class="alert-badge">⚠️ BAIXO</span>' : ''}
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Código</div>
                    <div style="font-weight: 600; color: var(--gray-700);">${product.code}</div>
                </div>
            </div>

            <div class="product-info">
                <div class="info-item">
                    <div class="info-value">${product.quantity}</div>
                    <div class="info-label">Quantidade</div>
                </div>
                <div class="info-item">
                    <div class="info-value">R$ ${product.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="info-label">Preço de Custo</div>
                </div>
                <div class="info-item">
                    <div class="info-value">R$ ${product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div class="info-label">Preço de Venda</div>
                </div>
                <div class="info-item">
                    <div class="info-value">${product.minStock}</div>
                    <div class="info-label">Estoque Mínimo</div>
                </div>
            </div>

            <div class="product-actions">
                <button class="btn-inventory btn-primary-inventory" onclick="showEditProductForm('${product.id}')">✏️ Editar</button>
                <button class="btn-inventory btn-warning-inventory" onclick="showAdjustmentForm('${product.id}')">🔧 Ajustar</button>
                <button class="btn-inventory btn-danger-inventory" onclick="deleteProduct('${product.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Categoria
function renderCategoryCard(category) {
    const productCount = InventoryState.products.filter(p => p.categoryId === category.id).length;

    return `
        <div class="product-card">
            <div class="product-header">
                <div>
                    <h4 class="product-title">${escapeHTML(category.name)}</h4>
                    <span class="product-category">${category.description || 'Sem descrição'}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.8rem; color: var(--gray-500);">Produtos</div>
                    <div style="font-weight: 600; color: var(--gray-700);">${productCount}</div>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button class="btn-inventory" onclick="showEditCategoryForm('${category.id}')">✏️ Editar</button>
                <button class="btn-inventory" style="background: #fee2e2; color: #991b1b;" onclick="deleteCategory('${category.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Item de Movimentação
function renderMovementItem(movement) {
    const product = InventoryState.products.find(p => p.id === movement.productId);
    const typeClass = movement.type === 'entry' ? 'type-entry' : movement.type === 'exit' ? 'type-exit' : 'type-adjustment';

    return `
        <div class="movement-item">
            <div>
                <div style="font-weight: 600; color: var(--gray-900);">${escapeHTML(product?.name || 'Produto Desconhecido')}</div>
                <div style="font-size: 0.8rem; color: var(--gray-500);">${new Date(movement.date).toLocaleString('pt-BR')}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="movement-type ${typeClass}">${movement.type === 'entry' ? 'ENTRADA' : movement.type === 'exit' ? 'SAÍDA' : 'AJUSTE'}</span>
                <span style="font-weight: 700; color: ${movement.type === 'entry' ? '#166534' : '#991b1b'};">
                    ${movement.type === 'entry' ? '+' : ''}${movement.quantity}
                </span>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchInventoryTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.tab-btn-inventory').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.inventory-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`inventory-${tabName}`).classList.add('active');
}

// Funções de Produtos
function showNewProductForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">➕ Novo Produto</h4>
            <form id="newProductForm" onsubmit="saveProduct(event)">
                <div class="form-group">
                    <label class="form-label">Nome *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Código</label>
                        <input type="text" class="form-input" name="code" placeholder="Ex: PROD-001">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <select class="form-select" name="categoryId">
                            <option value="">Selecione</option>
                            ${InventoryState.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Preço de Custo</label>
                        <input type="number" class="form-input" name="costPrice" step="0.01" min="0">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Preço de Venda</label>
                        <input type="number" class="form-input" name="salePrice" step="0.01" min="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Quantidade Inicial</label>
                        <input type="number" class="form-input" name="quantity" min="0" value="0">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Estoque Mínimo</label>
                        <input type="number" class="form-input" name="minStock" min="0" value="5">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3"></textarea>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Produto', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Produto', class: 'btn-primary', onclick: "document.getElementById('newProductForm').requestSubmit()" }
    ]);
}

function saveProduct(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const product = {
        id: generateId(),
        name: formData.get('name'),
        code: formData.get('code') || generateProductCode(),
        categoryId: formData.get('categoryId') || null,
        costPrice: parseFloat(formData.get('costPrice')) || 0,
        salePrice: parseFloat(formData.get('salePrice')) || 0,
        quantity: parseInt(formData.get('quantity')) || 0,
        minStock: parseInt(formData.get('minStock')) || 5,
        description: formData.get('description') || '',
        createdAt: new Date().toISOString()
    };

    InventoryState.products.push(product);
    AppState.products = InventoryState.products;
    saveToStorage(STORAGE_KEYS.PRODUCTS, AppState.products);

    // Registrar movimentação de entrada inicial
    if (product.quantity > 0) {
        const movement = {
            id: generateId(),
            productId: product.id,
            type: 'entry',
            quantity: product.quantity,
            reason: 'Entrada inicial',
            date: new Date().toISOString(),
            userId: AppState.currentUser?.id || 'system'
        };
        InventoryState.movements.push(movement);
        AppState.inventoryMovements = InventoryState.movements;
        saveToStorage(STORAGE_KEYS.INVENTORY_MOVEMENTS, AppState.inventoryMovements);
    }

    closeModal();
    renderInventoryDashboard();
    showNotification(`Produto "${product.name}" cadastrado com sucesso!`, 'success');
}

function showEditProductForm(productId) {
    const product = InventoryState.products.find(p => p.id === productId);
    if (!product) return;

    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">✏️ Editar Produto</h4>
            <form id="editProductForm" onsubmit="updateProduct(event, '${productId}')">
                <div class="form-group">
                    <label class="form-label">Nome *</label>
                    <input type="text" class="form-input" name="name" value="${escapeHTML(product.name)}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Código</label>
                        <input type="text" class="form-input" name="code" value="${product.code}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <select class="form-select" name="categoryId">
                            <option value="">Selecione</option>
                            ${InventoryState.categories.map(c => `<option value="${c.id}" ${c.id === product.categoryId ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Preço de Custo</label>
                        <input type="number" class="form-input" name="costPrice" step="0.01" min="0" value="${product.costPrice}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Preço de Venda</label>
                        <input type="number" class="form-input" name="salePrice" step="0.01" min="0" value="${product.salePrice}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Quantidade</label>
                        <input type="number" class="form-input" name="quantity" min="0" value="${product.quantity}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Estoque Mínimo</label>
                        <input type="number" class="form-input" name="minStock" min="0" value="${product.minStock}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3">${escapeHTML(product.description || '')}</textarea>
                </div>
            </form>
        </div>
    `;

    openModal('Editar Produto', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Atualizar Produto', class: 'btn-primary', onclick: "document.getElementById('editProductForm').requestSubmit()" }
    ]);
}

function updateProduct(event, productId) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const product = InventoryState.products.find(p => p.id === productId);

    if (product) {
        product.name = formData.get('name');
        product.code = formData.get('code') || product.code;
        product.categoryId = formData.get('categoryId') || product.categoryId;
        product.costPrice = parseFloat(formData.get('costPrice')) || product.costPrice;
        product.salePrice = parseFloat(formData.get('salePrice')) || product.salePrice;
        product.quantity = parseInt(formData.get('quantity')) || product.quantity;
        product.minStock = parseInt(formData.get('minStock')) || product.minStock;
        product.description = formData.get('description') || product.description;
        product.updatedAt = new Date().toISOString();

        AppState.products = InventoryState.products;
        saveToStorage(STORAGE_KEYS.PRODUCTS, AppState.products);

        closeModal();
        renderInventoryDashboard();
        showNotification('Produto atualizado com sucesso!', 'success');
    }
}

function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const product = InventoryState.products.find(p => p.id === productId);
    if (!product) return;

    // Remover o produto
    InventoryState.products = InventoryState.products.filter(p => p.id !== productId);

    // Remover movimentações relacionadas
    InventoryState.movements = InventoryState.movements.filter(m => m.productId !== productId);

    AppState.products = InventoryState.products;
    AppState.inventoryMovements = InventoryState.movements;
    saveToStorage(STORAGE_KEYS.PRODUCTS, AppState.products);
    saveToStorage(STORAGE_KEYS.INVENTORY_MOVEMENTS, AppState.inventoryMovements);

    renderInventoryDashboard();
    showNotification('Produto excluído com sucesso!', 'success');
}

// Funções de Movimentações
function showNewMovementForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">➕ Nova Movimentação</h4>
            <form id="newMovementForm" onsubmit="saveMovement(event)">
                <div class="form-group">
                    <label class="form-label">Produto *</label>
                    <select class="form-select" name="productId" required>
                        <option value="">Selecione um produto</option>
                        ${InventoryState.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tipo de Movimentação *</label>
                    <select class="form-select" name="type" required>
                        <option value="entry">Entrada</option>
                        <option value="exit">Saída</option>
                        <option value="adjustment">Ajuste</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Quantidade *</label>
                    <input type="number" class="form-input" name="quantity" min="1" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Motivo</label>
                    <textarea class="form-textarea" name="reason" rows="3" placeholder="Descreva o motivo da movimentação..."></textarea>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Movimentação', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Registrar Movimentação', class: 'btn-primary', onclick: "document.getElementById('newMovementForm').requestSubmit()" }
    ]);
}

function saveMovement(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productId = formData.get('productId');
    const type = formData.get('type');
    const quantity = parseInt(formData.get('quantity'));
    const reason = formData.get('reason') || 'Movimentação registrada';

    const product = InventoryState.products.find(p => p.id === productId);
    if (!product) {
        showNotification('Produto não encontrado', 'error');
        return;
    }

    const movement = {
        id: generateId(),
        productId: productId,
        type: type,
        quantity: quantity,
        reason: reason,
        date: new Date().toISOString(),
        userId: AppState.currentUser?.id || 'system'
    };

    // Atualizar estoque
    if (type === 'entry') {
        product.quantity += quantity;
    } else if (type === 'exit') {
        if (product.quantity < quantity) {
            showNotification('Quantidade insuficiente em estoque', 'error');
            return;
        }
        product.quantity -= quantity;
    } else if (type === 'adjustment') {
        product.quantity = quantity;
    }

    InventoryState.movements.push(movement);
    AppState.products = InventoryState.products;
    AppState.inventoryMovements = InventoryState.movements;

    saveToStorage(STORAGE_KEYS.PRODUCTS, AppState.products);
    saveToStorage(STORAGE_KEYS.INVENTORY_MOVEMENTS, AppState.inventoryMovements);

    closeModal();
    renderInventoryDashboard();
    showNotification('Movimentação registrada com sucesso!', 'success');
}

// Funções de Categorias
function showNewCategoryForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">➕ Nova Categoria</h4>
            <form id="newCategoryForm" onsubmit="saveCategory(event)">
                <div class="form-group">
                    <label class="form-label">Nome *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3"></textarea>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Categoria', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Salvar Categoria', class: 'btn-primary', onclick: "document.getElementById('newCategoryForm').requestSubmit()" }
    ]);
}

function saveCategory(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const category = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        createdAt: new Date().toISOString()
    };

    InventoryState.categories.push(category);
    AppState.categories = InventoryState.categories;
    saveToStorage(STORAGE_KEYS.CATEGORIES, AppState.categories);

    closeModal();
    renderInventoryDashboard();
    showNotification(`Categoria "${category.name}" criada com sucesso!`, 'success');
}

function deleteCategory(categoryId) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    const category = InventoryState.categories.find(c => c.id === categoryId);
    if (!category) return;

    // Verificar se há produtos na categoria
    const productsInCategory = InventoryState.products.filter(p => p.categoryId === categoryId);
    if (productsInCategory.length > 0) {
        if (!confirm(`Existem ${productsInCategory.length} produtos nesta categoria. Eles ficarão sem categoria. Deseja continuar?`)) {
            return;
        }

        // Remover categoria dos produtos
        productsInCategory.forEach(p => p.categoryId = null);
    }

    // Remover a categoria
    InventoryState.categories = InventoryState.categories.filter(c => c.id !== categoryId);

    AppState.categories = InventoryState.categories;
    AppState.products = InventoryState.products;
    saveToStorage(STORAGE_KEYS.CATEGORIES, AppState.categories);
    saveToStorage(STORAGE_KEYS.PRODUCTS, AppState.products);

    renderInventoryDashboard();
    showNotification('Categoria excluída com sucesso!', 'success');
}

// Funções Auxiliares
function calculateInventoryStats() {
    const totalProducts = InventoryState.products.length;
    const totalValue = InventoryState.products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const lowStockCount = InventoryState.products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
    const outOfStockCount = InventoryState.products.filter(p => p.quantity === 0).length;

    return {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount
    };
}

function generateProductCode() {
    return 'PROD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function filterProducts(searchTerm) {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const filteredProducts = InventoryState.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const productsList = document.getElementById('productsList');
    productsList.innerHTML = filteredProducts.map(renderProductCard).join('');
}

function filterProductsByCategory(categoryId) {
    const searchTerm = document.getElementById('productSearch').value;
    filterProducts(searchTerm);
}

function showLowStockReport() {
    const lowStockProducts = InventoryState.products.filter(p => p.quantity <= p.minStock);

    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">⚠️ Produtos em Falta</h4>
            ${lowStockProducts.length > 0 ? `
                <div style="max-height: 400px; overflow-y: auto;">
                    ${lowStockProducts.map(p => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--gray-200);">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-900);">${p.name}</div>
                                <div style="font-size: 0.8rem; color: var(--gray-500);">Código: ${p.code}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 700; color: #f59e0b;">${p.quantity} unidades</div>
                                <div style="font-size: 0.8rem; color: var(--gray-500);">Mínimo: ${p.minStock}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1rem; text-align: right;">
                    <button class="btn-primary-inventory" onclick="generateReorderList()">📋 Gerar Lista de Compras</button>
                </div>
            ` : `
                <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">✅</div>
                    <p>Nenhum produto em falta no momento</p>
                </div>
            `}
        </div>
    `;

    openModal('Alertas de Estoque', modalContent, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);
}

function generateReorderList() {
    const lowStockProducts = InventoryState.products.filter(p => p.quantity <= p.minStock);

    const reorderList = lowStockProducts.map(p => ({
        name: p.name,
        current: p.quantity,
        minimum: p.minStock,
        reorder: p.minStock - p.quantity + 10 // Comprar 10 a mais que o mínimo
    }));

    const csvContent = [
        ['Produto', 'Estoque Atual', 'Estoque Mínimo', 'Recomendado'],
        ...reorderList.map(r => [r.name, r.current, r.minimum, r.reorder])
    ].map(row => row.join(',')).join('\n');

    downloadFile('lista-de-compras.csv', csvContent, 'text/csv');
    showNotification('Lista de compras gerada e baixada!', 'success');
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Configurar Eventos
function setupInventoryEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('inventoryUpdated', () => {
        InventoryState.products = AppState.products;
        InventoryState.categories = AppState.categories;
        InventoryState.movements = AppState.inventoryMovements;
        renderInventoryDashboard();
    });
}

// Exportar funções globais
window.initInventoryModule = initInventoryModule;
window.renderInventoryDashboard = renderInventoryDashboard;
window.setupInventoryEvents = setupInventoryEvents;
window.switchInventoryTab = switchInventoryTab;
window.showNewProductForm = showNewProductForm;
window.saveProduct = saveProduct;
window.showEditProductForm = showEditProductForm;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.showNewMovementForm = showNewMovementForm;
window.saveMovement = saveMovement;
window.showNewCategoryForm = showNewCategoryForm;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;
window.calculateInventoryStats = calculateInventoryStats;
window.generateProductCode = generateProductCode;
window.filterProducts = filterProducts;
window.filterProductsByCategory = filterProductsByCategory;
window.showLowStockReport = showLowStockReport;
window.generateReorderList = generateReorderList;
window.downloadFile = downloadFile;