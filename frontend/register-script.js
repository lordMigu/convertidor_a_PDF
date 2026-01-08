<<<<<<< HEAD
/**
 * Script para registro - SOLO MODO SIMULACIÓN
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ Registro cargado en modo SIMULACIÓN');

    // Elementos del DOM
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

=======
document.addEventListener('DOMContentLoaded', function() {
    
    // POR ESTO (Usar 127.0.0.1 en ambos lados evita problemas):
    const API_URL = 'http://127.0.0.1:8000/api/v1/auth/register';

    // Referencias al DOM
    const registerForm = document.getElementById('registerForm');
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const registerBtn = registerForm.querySelector('.login-btn');
<<<<<<< HEAD
=======
    const registerError = document.getElementById('registerError');
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const strengthProgress = document.getElementById('strengthProgress');
    const strengthText = document.getElementById('strengthText');

<<<<<<< HEAD
    // Toggle mostrar/ocultar contraseña
    function setupPasswordToggle(input, button) {
        if (!button || !input) return;

        button.addEventListener('click', function () {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.querySelector('i').className = type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }

    setupPasswordToggle(passwordInput, togglePasswordBtn);
    setupPasswordToggle(confirmPasswordInput, toggleConfirmPasswordBtn);

    // Validar fortaleza de contraseña
    function updatePasswordStrength() {
        if (!passwordInput || !strengthProgress || !strengthText) return;

        const password = passwordInput.value;
        let strength = 0;

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        strengthProgress.style.width = strength + '%';

        if (strength < 50) {
            strengthProgress.style.backgroundColor = '#e74c3c';
            strengthText.textContent = 'Débil';
        } else if (strength < 75) {
            strengthProgress.style.backgroundColor = '#f39c12';
            strengthText.textContent = 'Media';
        } else {
            strengthProgress.style.backgroundColor = '#27ae60';
            strengthText.textContent = 'Fuerte';
        }
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }

    // Validar email ITB
    function validateEmail() {
        const email = emailInput.value.trim();

        if (!email) {
            emailError.textContent = 'El correo electrónico es requerido';
            return false;
        }

        if (!isValidITBEmail(email)) {
            emailError.textContent = 'Debes usar un correo institucional ITB (@itb.edu.ec)';
            return false;
        }

=======
    // --- LÓGICA DE UI (Mostrar/Ocultar Password) ---
    function toggleVisibility(input, btn) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = btn.querySelector('i');
        icon.className = type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
    }

    togglePasswordBtn.addEventListener('click', () => toggleVisibility(passwordInput, togglePasswordBtn));
    toggleConfirmPasswordBtn.addEventListener('click', () => toggleVisibility(confirmPasswordInput, toggleConfirmPasswordBtn));

    // --- VALIDACIONES ---
    function validateEmail() {
        const email = emailInput.value.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            emailError.textContent = 'Correo inválido';
            return false;
        }
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
        emailError.textContent = '';
        return true;
    }

<<<<<<< HEAD
    // Registro real
    async function realRegister() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!validateEmail()) return;

        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (!termsCheckbox.checked) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        registerBtn.disabled = true;
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

        try {
            await registerUser(email, password);

            registerForm.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <i class="fas fa-check-circle" style="font-size: 70px; color: var(--itb-success); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--itb-primary); margin-bottom: 15px;">¡Cuenta Creada Exitosamente!</h3>
                    <p style="font-size: 0.9rem; color: var(--itb-gray);">
                        <i class="fas fa-sync fa-spin"></i> Redirigiendo al login...
                    </p>
                </div>
            `;

=======
    function checkPasswordStrength() {
        const val = passwordInput.value;
        let strength = 0;
        if (val.length >= 8) strength += 25;
        if (/[A-Z]/.test(val)) strength += 25;
        if (/[0-9]/.test(val)) strength += 25;
        if (/[^A-Za-z0-9]/.test(val)) strength += 25;

        strengthProgress.style.width = strength + '%';
        
        if (strength < 50) {
            strengthProgress.style.backgroundColor = 'red';
            strengthText.textContent = 'Débil';
        } else if (strength < 75) {
            strengthProgress.style.backgroundColor = 'orange';
            strengthText.textContent = 'Normal';
        } else {
            strengthProgress.style.backgroundColor = 'green';
            strengthText.textContent = 'Fuerte';
        }
    }

    passwordInput.addEventListener('input', checkPasswordStrength);

    // --- MANEJO DEL REGISTRO (CONSUMO DE API) ---
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 1. Limpiar errores previos
        registerError.style.display = 'none';
        
        // 2. Validaciones básicas del frontend
        if (!validateEmail()) return;
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = 'Las contraseñas no coinciden';
            return;
        }
        if (!termsCheckbox.checked) {
            alert('Debes aceptar los términos');
            return;
        }

        // 3. Preparar UI para carga
        const originalBtnText = registerBtn.innerHTML;
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

        try {
            // 4. Consumo del Endpoint FastAPI
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Importante para FastAPI
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                    role: "user" // Enviamos el rol por defecto
                })
            });

            const data = await response.json();

            // 5. Manejo de respuesta
            if (!response.ok) {
                // Si FastAPI devuelve error (ej: 400 Email existe)
                // Usualmente el error viene en data.detail
                const msg = data.detail || 'Error desconocido en el registro';
                throw new Error(msg);
            }

            // 6. Éxito
            registerForm.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-check-circle" style="font-size: 50px; color: green;"></i>
                    <h3>¡Registro Exitoso!</h3>
                    <p>Usuario ${data.email} creado.</p>
                    <p>Redirigiendo al login...</p>
                </div>
            `;
            
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
<<<<<<< HEAD
            alert(error.message);
            registerBtn.disabled = false;
            registerBtn.innerHTML = originalText;
        }
    }

    // Manejar envío del formulario
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        realRegister();
=======
            console.error(error);
            const errorTextDiv = document.getElementById('errorText');
            errorTextDiv.textContent = error.message;
            registerError.style.display = 'flex';
        } finally {
            // Restaurar botón si hubo error
            if (registerBtn.innerHTML.includes('Registrando')) { // Solo si no fue éxito
                registerBtn.disabled = false;
                registerBtn.innerHTML = originalBtnText;
            }
        }
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
    });
});