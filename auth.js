// Authentication Module - CRM Odonto Company
// =============================================
// Handles login/signup UI and Supabase integration.

function initAuth() {
    if (!isSupabaseReady || (typeof isSupabaseReady === 'function' && !isSupabaseReady())) {
        console.error('❌ Supabase não configurado. O sistema requer nuvem para funcionar.');
        showApp(); // Fallback for dev, but show error in production
        return;
    }
    checkExistingSession();
}

async function checkExistingSession() {
    try {
        const user = await supabaseGetUser();
        if (user) {
            await onLoginSuccess(user);
        } else {
            showLoginScreen();
        }
    } catch (error) {
        showLoginScreen();
    }
}

function showLoginScreen() {
    const appContent = document.querySelector('.app-container');
    if (appContent) appContent.style.display = 'none';

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
                    <p class="auth-subtitle">Sistema de Gestão CRM</p>
                </div>

                <div id="authAlert" class="auth-alert" style="display: none;"></div>

                <form id="loginForm" class="auth-form" onsubmit="handleLogin(event)">
                    <div class="auth-field">
                        <label for="authEmail">E-mail Corporativo</label>
                        <input type="email" id="authEmail" placeholder="seu@email.com" required autocomplete="email">
                    </div>
                    <div class="auth-field">
                        <label for="authPassword">Senha de Acesso</label>
                        <input type="password" id="authPassword" placeholder="••••••••" required minlength="6" autocomplete="current-password">
                    </div>
                    <button type="submit" class="auth-btn" id="authSubmitBtn">
                        <span id="authBtnText">Entrar no Sistema</span>
                        <span id="authBtnSpinner" class="auth-spinner" style="display: none;"></span>
                    </button>
                </form>

                <div class="auth-footer">
                    <span id="authToggleLabel">Novo por aqui?</span>
                    <button type="button" class="auth-link" id="authToggleBtn" onclick="toggleAuthMode()">Criar conta agora</button>
                </div>
            </div>
        </div>
    `;

    document.body.prepend(loginScreen);
}

let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const btnText = document.getElementById('authBtnText');
    const toggleLabel = document.getElementById('authToggleLabel');
    const toggleBtn = document.getElementById('authToggleBtn');
    const alertEl = document.getElementById('authAlert');

    alertEl.style.display = 'none';

    if (isSignUpMode) {
        btnText.textContent = 'Criar minha conta';
        toggleLabel.textContent = 'Já possui acesso?';
        toggleBtn.textContent = 'Fazer login';
    } else {
        btnText.textContent = 'Entrar no Sistema';
        toggleLabel.textContent = 'Novo por aqui?';
        toggleBtn.textContent = 'Criar conta agora';
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const submitBtn = document.getElementById('authSubmitBtn');
    const btnText = document.getElementById('authBtnText');
    const spinner = document.getElementById('authBtnSpinner');

    submitBtn.disabled = true;
    btnText.style.visibility = 'hidden';
    spinner.style.display = 'inline-block';
    hideAuthAlert();

    try {
        let result;
        if (isSignUpMode) {
            result = await supabaseSignUp(email, password);
            if (!result.error) {
                showAuthAlert('✅ Conta criada com sucesso! Verifique seu e-mail para confirmar o acesso.', 'success');
                isSignUpMode = false;
                toggleAuthMode();
                submitBtn.disabled = false;
                btnText.style.visibility = 'visible';
                spinner.style.display = 'none';
                return;
            }
        } else {
            result = await supabaseSignIn(email, password);
        }

        if (result.error) {
            const msg = translateAuthError(result.error.message);
            showAuthAlert(`❌ ${msg}`, 'error');
        } else {
            showAuthAlert('🚀 Acesso autorizado! Carregando...', 'success');
            setTimeout(() => onLoginSuccess(result.data.user), 800);
        }
    } catch (error) {
        showAuthAlert('❌ Erro de conexão com o servidor. Verifique sua internet.', 'error');
    }

    submitBtn.disabled = false;
    btnText.style.visibility = 'visible';
    spinner.style.display = 'none';
}

function translateAuthError(msg) {
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
    if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado no sistema.';
    if (msg.includes('Rate limit exceeded')) return 'Muitas tentativas. Aguarde um momento.';
    return msg;
}

function showAuthAlert(message, type) {
    const alertEl = document.getElementById('authAlert');
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = `auth-alert auth-alert-${type}`;
    alertEl.style.display = 'flex';
}

function hideAuthAlert() {
    const alertEl = document.getElementById('authAlert');
    if (alertEl) alertEl.style.display = 'none';
}

async function onLoginSuccess(user) {
    const loginScreen = document.getElementById('authScreen');
    if (loginScreen) loginScreen.style.display = 'none';

    showApp();
    if (typeof loadDataFromStorage === 'function') loadDataFromStorage();
    if (typeof initializeAppUI === 'function') initializeAppUI();

    await migrateLocalStorageToSupabase();
    const loaded = await loadDataFromSupabase();
    if (loaded) updateDashboard();

    if (typeof showNotification === 'function') {
        showNotification(`Bem-vindo(a), ${user.email}!`, 'success');
    }
}

function showApp() {
    const appContent = document.querySelector('.app-container');
    if (appContent) appContent.style.display = '';
}

window.initAuth = initAuth;
window.handleLogin = handleLogin;
window.toggleAuthMode = toggleAuthMode;
