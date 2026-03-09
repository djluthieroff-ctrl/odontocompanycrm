// Authentication Module - CRM Odonto Company
// =============================================
// Handles login/signup UI when Supabase is configured.
// In local mode (no Supabase), the CRM loads directly without auth.

// ─── Auth UI ────────────────────────────────────────────────────────────

function initAuth() {
    // If Supabase is not configured, skip auth entirely
    if (!isSupabaseReady || typeof isSupabaseReady === 'function' && !isSupabaseReady()) {
        console.log('ℹ️ Auth skipped — running in local mode');
        showApp();
        return;
    }

    // Check for existing session
    checkExistingSession();
}

async function checkExistingSession() {
    try {
        const user = await supabaseGetUser();
        if (user) {
            console.log('✅ Existing session found:', user.email);
            await onLoginSuccess(user);
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Session check failed:', error);
        showLoginScreen();
    }
}

function showLoginScreen() {
    // Hide main app
    const appContent = document.querySelector('.app-container');
    if (appContent) appContent.style.display = 'none';

    // Create or show login screen
    let loginScreen = document.getElementById('authScreen');
    if (loginScreen) {
        loginScreen.style.display = 'flex';
        return;
    }

    loginScreen = document.createElement('div');
    loginScreen.id = 'authScreen';
    loginScreen.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-logo">🦷</div>
                    <h1 class="auth-title">Odonto Company</h1>
                    <p class="auth-subtitle">CRM de Gestão</p>
                </div>

                <div id="authError" class="auth-error" style="display: none;"></div>

                <form id="loginForm" class="auth-form" onsubmit="handleLogin(event)">
                    <div class="auth-field">
                        <label for="authEmail">E-mail</label>
                        <input type="email" id="authEmail" placeholder="seu@email.com" required autocomplete="email">
                    </div>
                    <div class="auth-field">
                        <label for="authPassword">Senha</label>
                        <input type="password" id="authPassword" placeholder="••••••••" required minlength="6" autocomplete="current-password">
                    </div>
                    <button type="submit" class="auth-btn auth-btn-primary" id="authSubmitBtn">
                        <span id="authBtnText">Entrar</span>
                        <span id="authBtnSpinner" class="auth-spinner" style="display: none;"></span>
                    </button>
                </form>

                <div class="auth-footer">
                    <span id="authToggleText">Não tem conta?</span>
                    <button type="button" class="auth-link" id="authToggleBtn" onclick="toggleAuthMode()">Criar conta</button>
                </div>

                <div class="auth-divider">
                    <span>ou</span>
                </div>

                <button type="button" class="auth-btn auth-btn-secondary" onclick="skipAuth()">
                    💾 Continuar sem conta (local)
                </button>
            </div>
        </div>
    `;

    document.body.prepend(loginScreen);
}

// ─── Auth State ─────────────────────────────────────────────────────────
let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const btnText = document.getElementById('authBtnText');
    const toggleText = document.getElementById('authToggleText');
    const toggleBtn = document.getElementById('authToggleBtn');

    if (isSignUpMode) {
        btnText.textContent = 'Criar conta';
        toggleText.textContent = 'Já tem conta?';
        toggleBtn.textContent = 'Fazer login';
    } else {
        btnText.textContent = 'Entrar';
        toggleText.textContent = 'Não tem conta?';
        toggleBtn.textContent = 'Criar conta';
    }

    // Clear error
    const errorEl = document.getElementById('authError');
    if (errorEl) errorEl.style.display = 'none';
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const submitBtn = document.getElementById('authSubmitBtn');
    const btnText = document.getElementById('authBtnText');
    const spinner = document.getElementById('authBtnSpinner');
    const errorEl = document.getElementById('authError');

    // Show loading
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    errorEl.style.display = 'none';

    try {
        let result;
        if (isSignUpMode) {
            result = await supabaseSignUp(email, password);
            if (!result.error) {
                showAuthError('✅ Conta criada! Verifique seu e-mail para confirmar.', 'success');
                isSignUpMode = false;
                toggleAuthMode();
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                return;
            }
        } else {
            result = await supabaseSignIn(email, password);
        }

        if (result.error) {
            const errorMessages = {
                'Invalid login credentials': 'E-mail ou senha incorretos',
                'Email not confirmed': 'Confirme seu e-mail antes de entrar',
                'User already registered': 'Este e-mail já está cadastrado'
            };
            showAuthError(errorMessages[result.error.message] || result.error.message);
        } else {
            await onLoginSuccess(result.data.user);
        }
    } catch (error) {
        showAuthError('Erro de conexão. Tente novamente.');
    }

    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
}

function showAuthError(message, type = 'error') {
    const errorEl = document.getElementById('authError');
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.className = `auth-error ${type}`;
    errorEl.style.display = 'block';
}

async function onLoginSuccess(user) {
    console.log('🎉 Login successful:', user.email);

    // Hide login screen
    const loginScreen = document.getElementById('authScreen');
    if (loginScreen) loginScreen.style.display = 'none';

    // Show app
    showApp();

    // Load localStorage data immediately so UI is not empty
    if (typeof loadDataFromStorage === 'function') {
        loadDataFromStorage();
    }

    // Initialize the app UI (navigation, search, dashboard)
    if (typeof initializeAppUI === 'function') {
        initializeAppUI();
    }

    // Try to migrate local data if first login
    const migrated = await migrateLocalStorageToSupabase();

    // Load fresh data from Supabase (will overwrite localStorage cache)
    const loaded = await loadDataFromSupabase();
    if (loaded) {
        updateDashboard();
        // Re-render current module if applicable
        if (typeof renderLeadsList === 'function' && AppState.currentModule === 'leads') {
            renderLeadsList();
        }
    }

    showNotification(`Bem-vindo(a), ${user.email}!`, 'success');

    // Update connection indicator
    updateConnectionIndicator();
}

function skipAuth() {
    console.log('ℹ️ Skipping auth — local mode');
    const loginScreen = document.getElementById('authScreen');
    if (loginScreen) loginScreen.style.display = 'none';
    showApp();
}

function showApp() {
    const appContent = document.querySelector('.app-container');
    if (appContent) appContent.style.display = '';
}

// ─── Connection Indicator ───────────────────────────────────────────────
function updateConnectionIndicator() {
    let indicator = document.getElementById('connectionIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'connectionIndicator';
        indicator.className = 'connection-indicator';
        // Insert into header
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(indicator);
        }
    }

    const status = getConnectionStatus();
    indicator.innerHTML = `
        <span class="connection-dot" style="background: ${status.color};"></span>
        <span class="connection-label">${status.label}</span>
        ${status.status === 'cloud' ? `
            <button class="connection-logout" onclick="handleLogout()" title="Sair">↪</button>
        ` : ''}
    `;
}

async function handleLogout() {
    if (confirm('Deseja sair? Os dados locais serão preservados.')) {
        await supabaseSignOut();
        showNotification('Desconectado da nuvem', 'info');
        updateConnectionIndicator();
    }
}

// ─── Export ─────────────────────────────────────────────────────────────
window.initAuth = initAuth;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.toggleAuthMode = toggleAuthMode;
window.skipAuth = skipAuth;
window.updateConnectionIndicator = updateConnectionIndicator;
