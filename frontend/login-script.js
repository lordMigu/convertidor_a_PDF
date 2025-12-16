/**
 * Script para la página de login
 * Valida formularios y maneja la autenticación
 */

document.addEventListener('DOMContentLoaded', function() {
    // Redirigir a inicio si ya está autenticado
    redirectIfAuthenticated();
    
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const rememberCheckbox = document.getElementById('remember');
    const loginBtn = loginForm.querySelector('.login-btn');
    const loginError = document.getElementById('loginError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    // Cargar datos guardados si existen
    loadSavedCredentials();
    
    // Toggle mostrar/ocultar contraseña
    togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambiar icono
        const icon = this.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    
    // Validación en tiempo real
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    
    // Limpiar errores al escribir
    emailInput.addEventListener('input', function() {
        if (emailError.textContent) {
            emailError.textContent = '';
            emailInput.style.borderColor = 'var(--itb-border)';
        }
    });
    
    passwordInput.addEventListener('input', function() {
        if (passwordError.textContent) {
            passwordError.textContent = '';
            passwordInput.style.borderColor = 'var(--itb-border)';
        }
    });
    
    // Manejar envío del formulario
    loginForm.addEventListener('submit', handleLogin);
    
    /**
     * Validar formato de email
     */
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            emailError.textContent = 'El correo electrónico es requerido';
            emailInput.style.borderColor = 'var(--itb-accent)';
            return false;
        }
        
        if (!emailRegex.test(email)) {
            emailError.textContent = 'Ingresa un correo electrónico válido';
            emailInput.style.borderColor = 'var(--itb-accent)';
            return false;
        }
        
        emailError.textContent = '';
        emailInput.style.borderColor = 'var(--itb-border)';
        return true;
    }
    
    /**
     * Validar contraseña
     */
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            passwordError.textContent = 'La contraseña es requerida';
            passwordInput.style.borderColor = 'var(--itb-accent)';
            return false;
        }
        
        if (password.length < 6) {
            passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
            passwordInput.style.borderColor = 'var(--itb-accent)';
            return false;
        }
        
        passwordError.textContent = '';
        passwordInput.style.borderColor = 'var(--itb-border)';
        return true;
    }
    
    /**
     * Manejar login
     */
    async function handleLogin(e) {
        e.preventDefault();
        
        // Limpiar error anterior
        loginError.style.display = 'none';
        
        // Validar campos
        const emailValid = validateEmail();
        const passwordValid = validatePassword();
        
        if (!emailValid || !passwordValid) {
            return;
        }
        
        // Deshabilitar botón y mostrar loading
        loginBtn.disabled = true;
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        
        try {
            // Llamar a la API de login
            const response = await apiRequest('/api/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });
            
            // Guardar token
            saveToken(response.access_token);
            
            // Guardar datos del usuario si están disponibles
            if (response.user) {
                saveUserData(response.user);
            }
            
            // Guardar credenciales si está marcado "Recuérdame"
            if (rememberCheckbox.checked) {
                saveCredentials(emailInput.value, passwordInput.value);
            } else {
                clearSavedCredentials();
            }
            
            // Mostrar mensaje de éxito y redirigir
            showSuccessMessage();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            showLoginError(error.message);
        } finally {
            // Restaurar botón
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalText;
        }
    }
    
    /**
     * Mostrar mensaje de error
     */
    function showLoginError(message) {
        const errorText = loginError.querySelector('#errorText');
        errorText.textContent = message;
        loginError.style.display = 'flex';
        loginError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Mostrar mensaje de éxito
     */
    function showSuccessMessage() {
        // Reemplazar formulario con mensaje de éxito
        const successHTML = `
            <div style="text-align: center; padding: 30px;">
                <i class="fas fa-check-circle" style="font-size: 60px; color: var(--itb-success); margin-bottom: 20px;"></i>
                <h3 style="color: var(--itb-primary); margin-bottom: 10px;">¡Bienvenido!</h3>
                <p style="color: var(--itb-gray); margin-bottom: 20px;">Tu sesión ha sido iniciada correctamente</p>
                <p style="font-size: 0.9rem; color: var(--itb-gray);">Redirigiendo...</p>
            </div>
        `;
        loginForm.innerHTML = successHTML;
        document.querySelector('.login-footer').style.display = 'none';
    }
    
    /**
     * Guardar credenciales en localStorage
     */
    function saveCredentials(email, password) {
        const credentials = {
            email: email,
            password: btoa(password) // Codificar (no es seguro para producción)
        };
        localStorage.setItem('eva-credentials', JSON.stringify(credentials));
    }
    
    /**
     * Cargar credenciales guardadas
     */
    function loadSavedCredentials() {
        const saved = localStorage.getItem('eva-credentials');
        if (saved) {
            try {
                const credentials = JSON.parse(saved);
                emailInput.value = credentials.email;
                passwordInput.value = atob(credentials.password);
                rememberCheckbox.checked = true;
            } catch (e) {
                console.error('Error cargando credenciales guardadas:', e);
                clearSavedCredentials();
            }
        }
    }
    
    /**
     * Limpiar credenciales guardadas
     */
    function clearSavedCredentials() {
        localStorage.removeItem('eva-credentials');
    }
    
    // Permitir Enter para enviar formulario
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});
