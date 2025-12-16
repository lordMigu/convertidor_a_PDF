document.addEventListener('DOMContentLoaded', function() {
    
    // POR ESTO (Usar 127.0.0.1 en ambos lados evita problemas):
    const API_URL = 'http://127.0.0.1:8000/api/v1/auth/register';

    // Referencias al DOM
    const registerForm = document.getElementById('registerForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const registerBtn = registerForm.querySelector('.login-btn');
    const registerError = document.getElementById('registerError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const strengthProgress = document.getElementById('strengthProgress');
    const strengthText = document.getElementById('strengthText');

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
        emailError.textContent = '';
        return true;
    }

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
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
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
    });
});