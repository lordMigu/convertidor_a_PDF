/**
<<<<<<< HEAD
 * Utilidades de autenticación - MODO SIMULACIÓN
 */

const AUTH_CONFIG = {
    API_URL: window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:8000',
    TOKEN_KEY: 'eva-access-token',
    USER_KEY: 'eva-user-data',
    USE_SIMULATION: false
};

// Guardar token JWT en localStorage
=======
 * Utilidades de autenticación compartidas
 * Maneja tokens JWT, almacenamiento y validación
 */

const AUTH_CONFIG = {
    API_URL: 'http://localhost:8000',
    TOKEN_KEY: 'eva-access-token',
    USER_KEY: 'eva-user-data'
};

/**
 * Guardar token JWT en localStorage
 */
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
function saveToken(token) {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
}

<<<<<<< HEAD
// Obtener token JWT del localStorage
=======
/**
 * Obtener token JWT del localStorage
 */
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
function getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

<<<<<<< HEAD
// Guardar datos del usuario
=======
/**
 * Guardar datos del usuario
 */
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
function saveUserData(userData) {
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
}

<<<<<<< HEAD
// Obtener datos del usuario
=======
/**
 * Obtener datos del usuario
 */
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
function getUserData() {
    const data = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return data ? JSON.parse(data) : null;
}

<<<<<<< HEAD
// Verificar si el usuario está autenticado (modo simulación)
function isAuthenticated() {
    if (AUTH_CONFIG.USE_SIMULATION) {
        const token = getToken();
        return token !== null && token !== '';
    }
=======
/**
 * Verificar si el usuario está autenticado
 */
function isAuthenticated() {
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
    const token = getToken();
    return token !== null && token !== '';
}

<<<<<<< HEAD
// Limpiar datos de autenticación (logout)
=======
/**
 * Limpiar datos de autenticación (logout)
 */
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
function clearAuth() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
}

<<<<<<< HEAD
// Redirigir a login si no está autenticado
=======
/**
 * Hacer una petición autenticada a la API
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${AUTH_CONFIG.API_URL}${endpoint}`;
    const token = getToken();
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error en la solicitud');
    }
    
    return response.json();
}

/**
 * Redirigir a login si no está autenticado
 */
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

<<<<<<< HEAD
// Redirigir a inicio si ya está autenticado
=======
/**
 * Redirigir a inicio si ya está autenticado
 */
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

<<<<<<< HEAD
// Formatear información del usuario para mostrar
function formatUserInfo(userData) {
    if (!userData) return { initials: 'US', role: 'Estudiante' };

    return {
        email: userData.email || 'usuario@itb.edu.ec',
        role: userData.role || 'Estudiante',
        initials: userData.email ?
            userData.email.split('@')[0].substring(0, 2).toUpperCase() :
            'US'
    };
}

// Cerrar sesión - Redirige a la página de logout
function logout() {
    window.location.href = 'logout.html';
}

// Función para limpiar datos de autenticación
function clearAuthData() {
    // Limpiar localStorage
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSession');

    // Limpiar sessionStorage
    sessionStorage.clear();

    // Limpiar cookies relacionadas con la sesión
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('✅ Datos de autenticación limpiados');

    // Limpiar todos los datos específicos de la aplicación
    const appKeys = ['conversionHistory', 'recentFiles', 'userPreferences', 'uploadedFiles'];
    appKeys.forEach(key => localStorage.removeItem(key));
}

// Validar email del ITB (para simulación)
function isValidITBEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@itb\.edu\.ec$/;
    return emailRegex.test(email);
}

// Inicializar funcionalidades comunes
function initializeAuth() {
    // Verificar autenticación
    if (window.location.pathname.includes('login.html') ||
        window.location.pathname.includes('register.html')) {
        redirectIfAuthenticated();
    } else if (window.location.pathname.includes('index.html')) {
        requireAuth();
    }
}

// Real Login
async function loginUser(email, password) {
    try {
        const response = await fetch(`${AUTH_CONFIG.API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al iniciar sesión');
        }

        const data = await response.json();
        saveToken(data.access_token);

        // Obtener datos reales del usuario
        try {
            const userResponse = await fetch(`${AUTH_CONFIG.API_URL}/api/v1/auth/me`, {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                saveUserData(userData);
            } else {
                saveUserData({ email, role: 'user' });
            }
        } catch (e) {
            saveUserData({ email, role: 'user' });
        }
        return true;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Real Register
async function registerUser(email, password, role = 'user') {
    try {
        const response = await fetch(`${AUTH_CONFIG.API_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error en el registro');
        }

        return await response.json();
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
}

// Actualizar información del usuario en la interfaz
function updateUserUI() {
    const userData = getUserData();
    const userInfo = formatUserInfo(userData);

    // Actualizar avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.textContent = userInfo.initials;
        userAvatar.style.background = 'linear-gradient(135deg, var(--itb-secondary), var(--itb-accent))';
    }

    // Actualizar nombre
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = userData ? (userData.name || userData.email) : 'Roberto Negrete';
    }

    // Actualizar rol
    const userRole = document.getElementById('userRole');
    if (userRole) {
        userRole.textContent = userInfo.role;
    }
}

// Inicializar al cargar la página
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        initializeAuth();
        updateUserUI();
    });
}

// Hacer funciones accesibles globalmente
if (typeof window !== 'undefined') {
    window.clearAuthData = clearAuthData;
    window.getUserData = getUserData;
    window.isAuthenticated = isAuthenticated;
    window.logout = logout;
    window.requireAuth = requireAuth;
}
=======
/**
 * Formatear información del usuario para mostrar
 */
function formatUserInfo(userData) {
    return {
        email: userData.email,
        role: userData.role,
        initials: userData.email.split('@')[0].substring(0, 2).toUpperCase()
    };
}

/**
 * Cerrar sesión
 */
function logout() {
    clearAuth();
    window.location.href = 'login.html';
}
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
