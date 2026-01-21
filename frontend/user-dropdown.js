/**
 * Manejo del menú desplegable del usuario
 */

document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const dropdownBtn = document.getElementById('userDropdownBtn');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownName = document.getElementById('dropdownName');
    const dropdownRole = document.getElementById('dropdownRole');
    const logoutLink = document.querySelector('a[href="logout.html"]');

    if (dropdownBtn && dropdownMenu) {
        // Cargar datos del usuario en el dropdown
        const userData = getUserData();
        if (userData) {
            if (dropdownName) {
                dropdownName.textContent = userData.name || userData.email;
            }

            if (dropdownRole) {
                dropdownRole.textContent = userData.carrera || 'Estudiante - Desarrollo de Software';
            }

            if (dropdownAvatar) {
                const initials = userData.email ?
                    userData.email.substring(0, 2).toUpperCase() :
                    'RN';
                dropdownAvatar.textContent = initials;
            }
        }

        // Alternar visibilidad del dropdown
        dropdownBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            dropdownBtn.classList.toggle('active');
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', function (e) {
            if (!dropdownMenu.contains(e.target) && !dropdownBtn.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                dropdownBtn.classList.remove('active');
            }
        });

        // Prevenir que el dropdown se cierre al hacer click dentro
        dropdownMenu.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        // Manejar tecla Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                dropdownMenu.classList.remove('show');
                dropdownBtn.classList.remove('active');
            }
        });

        // **AGREGAR: Manejar clic en el enlace de logout**
        if (logoutLink) {
            logoutLink.addEventListener('click', function (e) {
                e.preventDefault();

                console.log('👋 Iniciando proceso de logout...');

                // Paso 1: Limpiar inmediatamente los datos principales
                localStorage.removeItem('eva-access-token');
                localStorage.removeItem('eva-user-data');
                sessionStorage.clear();

                // Paso 2: Cerrar el dropdown
                dropdownMenu.classList.remove('show');
                dropdownBtn.classList.remove('active');

                // Paso 3: Redirigir DIRECTAMENTE sin mostrar mensajes
                // Usar replace para no dejar historial
                setTimeout(() => {
                    window.location.replace('logout.html');
                }, 100);
            });
        }
    }
});