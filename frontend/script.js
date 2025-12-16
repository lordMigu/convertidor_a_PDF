const API_URL = "http://localhost:8000";

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    requireAuth();
    
    // Cargar información del usuario
    loadUserInfo();
    
    // Elementos del DOM
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const dropArea = document.getElementById('dropArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDate = document.getElementById('fileDate');
    const convertBtn = document.getElementById('convertBtn');
    const resetBtn = document.getElementById('resetBtn');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const downloadLink = document.getElementById('downloadLink');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Variables de estado
    let currentFile = null;
    
    // Evento de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    /**
     * Cargar información del usuario autenticado
     */
    function loadUserInfo() {
        const userData = getUserData();
        if (userData) {
            const userInfo = formatUserInfo(userData);
            
            // Actualizar avatar
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                userAvatar.textContent = userInfo.initials;
            }
            
            // Actualizar nombre
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = userData.email;
            }
            
            // Actualizar rol
            const userRole = document.getElementById('userRole');
            if (userRole) {
                const roleText = userData.role === 'admin' ? 'Administrador' : 'Estudiante';
                userRole.textContent = roleText;
            }
        }
    }
    
    // Inicializar checkboxes de navegación
    initializeNavigationCheckboxes();
    
    // Función para inicializar los checkboxes de navegación
    function initializeNavigationCheckboxes() {
        document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const navItem = this.closest('.nav-item');
                if (this.checked) {
                    navItem.classList.add('active');
                } else {
                    navItem.classList.remove('active');
                }
            });
        });
    }
    
    // Función para abrir el selector de archivos
    selectFileBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Manejar selección de archivo
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            const file = this.files[0];
            processFile(file);
        }
    });
    
    // Funcionalidad de arrastrar y soltar
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropArea.style.borderColor = "var(--itb-primary)";
        dropArea.style.backgroundColor = "rgba(0, 71, 171, 0.05)";
    });
    
    dropArea.addEventListener('dragleave', function() {
        dropArea.style.borderColor = "#ddd";
        dropArea.style.backgroundColor = "transparent";
    });
    
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        dropArea.style.borderColor = "#ddd";
        dropArea.style.backgroundColor = "transparent";
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            fileInput.files = e.dataTransfer.files;
            processFile(file);
        }
    });
    
    // Procesar archivo seleccionado
    function processFile(file) {
        // Validar que sea un archivo Word (.docx)
        if (!file.name.endsWith('.docx')) {
            showError(`Formato no permitido. La API solo soporta archivos .docx. Recibido: ${file.name.split('.').pop().toUpperCase()}`);
            return;
        }
        
        // Validar tamaño (50 MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            showError(`Archivo demasiado grande. Máximo: 50 MB, recibido: ${(file.size / (1024*1024)).toFixed(2)} MB`);
            return;
        }
        
        currentFile = file;
        updateFileInfo(file);
        hideMessages();
    }
    
    // Actualizar información del archivo en la interfaz
    function updateFileInfo(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        const date = new Date(file.lastModified);
        fileDate.textContent = date.toLocaleDateString("es-ES");
        
        fileInfo.style.display = "block";
    }
    
    // Formatear tamaño del archivo
    function formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes, k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    }
    
    // Eliminar archivo seleccionado
    removeFileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        currentFile = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        hideMessages();
    });
    
    // Botón de reset
    resetBtn.addEventListener('click', function() {
        currentFile = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        hideMessages();
    });
    
    // Convertir archivo a PDF
    convertBtn.addEventListener('click', async function() {
        if (!currentFile) {
            showError('Por favor, selecciona un archivo Word para convertir.');
            return;
        }
        
        await convertFile();
    });
    
    // Función principal para convertir el archivo
    async function convertFile() {
        const formData = new FormData();
        formData.append("file", currentFile);
        
        // Deshabilitar botón y mostrar estado de carga
        convertBtn.disabled = true;
        const originalText = convertBtn.innerHTML;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Convirtiendo...';
        
        hideMessages();
        
        try {
            console.log(`[INFO] Enviando archivo a ${API_URL}/convert`);
            
            // Obtener token de autenticación
            const token = getToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_URL}/convert`, {
                method: "POST",
                body: formData,
                headers: headers
            });
            
            console.log(`[INFO] Respuesta del servidor: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                // Intentar obtener mensaje de error del servidor
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // Si no es JSON, usar el mensaje por defecto
                }
                throw new Error(errorMessage);
            }
            
            // Obtener el blob del PDF
            const pdfBlob = await response.blob();
            console.log(`[INFO] PDF recibido: ${pdfBlob.size} bytes`);
            
            // Crear URL para descarga
            const url = window.URL.createObjectURL(pdfBlob);
            const pdfFilename = currentFile.name.replace(".docx", ".pdf");
            
            // Configurar el link de descarga
            downloadLink.href = url;
            downloadLink.download = pdfFilename;
            
            // Mostrar mensaje de éxito
            showSuccess();
            
        } catch (error) {
            console.error("[ERROR] Error en conversión:", error);
            showError(error.message || "Error al convertir el archivo. Intenta nuevamente.");
        } finally {
            // Restaurar botón
            convertBtn.disabled = false;
            convertBtn.innerHTML = originalText;
        }
    }
    
    // Mostrar mensaje de éxito
    function showSuccess() {
        successMessage.style.display = "flex";
        errorMessage.style.display = "none";
    }
    
    // Mostrar mensaje de error
    function showError(message) {
        const errorText = errorMessage.querySelector("div:last-child");
        errorText.textContent = message;
        errorMessage.style.display = "flex";
        successMessage.style.display = "none";
    }
    
    // Ocultar todos los mensajes
    function hideMessages() {
        successMessage.style.display = "none";
        errorMessage.style.display = "none";
    }
    
    // Descargar PDF al hacer click en "Descargar ahora"
    downloadLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!this.href) {
            console.warn("[WARN] No hay URL de descarga disponible");
            return;
        }
        
        // Crear un elemento <a> temporal para descargar
        const tempLink = document.createElement('a');
        tempLink.href = this.href;
        tempLink.download = this.download || 'documento.pdf';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    });
});