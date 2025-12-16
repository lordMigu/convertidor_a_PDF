/**
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
function saveToken(token) {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
}

/**
 * Obtener token JWT del localStorage
 */
function getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

/**
 * Guardar datos del usuario
 */
function saveUserData(userData) {
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
}

/**
 * Obtener datos del usuario
 */
function getUserData() {
    const data = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Verificar si el usuario está autenticado
 */
function isAuthenticated() {
    const token = getToken();
    return token !== null && token !== '';
}

/**
 * Limpiar datos de autenticación (logout)
 */
function clearAuth() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
}

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
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

/**
 * Redirigir a inicio si ya está autenticado
 */
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

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
