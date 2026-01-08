<<<<<<< HEAD
/**
 * Script principal para el conversor - VERSIÓN MEJORADA
 * Ahora soporta Word, PowerPoint y Excel - SIN VISTA PREVIA
 */

const API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || "http://localhost:8000";

document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ Conversor de Archivos a PDF - Multi-formato');

=======
const API_URL = "http://localhost:8000";

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    requireAuth();
    
    // Cargar información del usuario
    loadUserInfo();
    
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
    // Elementos del DOM
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const dropArea = document.getElementById('dropArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDate = document.getElementById('fileDate');
<<<<<<< HEAD
    const fileType = document.getElementById('fileType');
    const fileIcon = document.getElementById('fileIcon');
=======
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
    const convertBtn = document.getElementById('convertBtn');
    const resetBtn = document.getElementById('resetBtn');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const downloadLink = document.getElementById('downloadLink');
<<<<<<< HEAD
    const uploadBtn = document.getElementById('uploadBtn');
    const historyBtn = document.getElementById('historyBtn');
    const uploadSection = document.getElementById('uploadSection');
    const historySection = document.getElementById('historySection');
    const historyFiles = document.getElementById('historyFiles');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const conversionOptions = document.getElementById('conversionOptions');
    const formatInfo = document.getElementById('formatInfo');

    // Variables de estado
    let currentFile = null;
    let currentParentId = null; // Para control de versiones
    let conversionHistory = [];
    let uploadedFiles = []; // Array para almacenar archivos subidos

    // Cargar historiales desde localStorage
    loadFromLocalStorage();

    // Inicializar checkboxes de navegación si existen
    initializeNavigationCheckboxes();

    // Función para inicializar los checkboxes de navegación
    function initializeNavigationCheckboxes() {
        document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
=======
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
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
                const navItem = this.closest('.nav-item');
                if (this.checked) {
                    navItem.classList.add('active');
                } else {
                    navItem.classList.remove('active');
                }
            });
        });
    }
<<<<<<< HEAD

    // Navegación entre pestañas
    if (uploadBtn && historyBtn) {
        uploadBtn.addEventListener('click', function () {
            showUploadSection();
        });

        historyBtn.addEventListener('click', function () {
            showHistorySection();
        });
    }

    // Mostrar sección de subir archivo
    function showUploadSection() {
        uploadSection.style.display = 'block';
        historySection.style.display = 'none';
        if (conversionOptions) conversionOptions.style.display = 'block';
        uploadBtn.classList.add('active');
        historyBtn.classList.remove('active');
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
        hideMessages();
    }

    // Mostrar sección de historial
    function showHistorySection() {
        uploadSection.style.display = 'none';
        historySection.style.display = 'block';
        if (conversionOptions) conversionOptions.style.display = 'none';
        uploadBtn.classList.remove('active');
        historyBtn.classList.add('active');
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'block';
        loadHistory();
    }

    // Cargar datos desde localStorage
    function loadFromLocalStorage() {
        try {
            const savedHistory = localStorage.getItem('conversionHistory');
            const savedUploads = localStorage.getItem('uploadedFiles');

            if (savedHistory) {
                conversionHistory = JSON.parse(savedHistory);
            }

            if (savedUploads) {
                uploadedFiles = JSON.parse(savedUploads);
                console.log(`📂 Archivos cargados desde localStorage: ${uploadedFiles.length}`);
            }
        } catch (error) {
            console.error('Error al cargar datos de localStorage:', error);
            conversionHistory = [];
            uploadedFiles = [];
        }
    }

    // Guardar datos en localStorage
    function saveToLocalStorage() {
        try {
            localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
            localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
            console.log(`💾 Datos guardados: ${conversionHistory.length} conversiones, ${uploadedFiles.length} archivos`);
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    // Cargar historial (Real + Local)
    async function loadHistory() {
        if (!historyFiles) return;

        let historyHTML = '';
        let backendDocs = [];

        if (isAuthenticated()) {
            try {
                const response = await fetch(`${API_URL}/api/v1/files/my-documents`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (response.ok) {
                    backendDocs = await response.json();
                }
            } catch (error) {
                console.error('Error cargando documentos del backend:', error);
            }
        }

        // Filtrar conversiones locales si ya están en el backend
        let localHistoryToShow = conversionHistory;
        if (isAuthenticated() && backendDocs.length > 0) {
            localHistoryToShow = conversionHistory.filter(item =>
                !backendDocs.some(doc => doc.name === item.originalName)
            );
        }

        if (conversionHistory.length === 0 && uploadedFiles.length === 0 && backendDocs.length === 0) {
            historyFiles.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history fa-3x" style="color: var(--itb-gray); margin-bottom: 20px;"></i>
                    <p>No hay conversiones en el historial</p>
                    <p style="font-size: 0.9rem; color: var(--itb-gray);">Los archivos que conviertas aparecerán aquí</p>
                </div>
            `;
            return;
        }

        // Mostrar documentos del Backend (Dashboard)
        if (backendDocs.length > 0) {
            historyHTML += `<h3 style="margin: 20px 0 10px; color: var(--itb-primary);">Mis Documentos</h3>`;
            backendDocs.forEach(doc => {
                const v = doc.latest_version;
                const fileExt = doc.name.split('.').pop();
                const iconClass = getFileIconClass(fileExt);
                const date = new Date(doc.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });

                historyHTML += `
                    <div class="history-item">
                        <div class="history-file-info">
                            <i class="fas ${iconClass} history-file-icon" style="color: ${getFileIconColor(fileExt)}"></i>
                            <div class="history-file-details">
                                <h4>${doc.name} <span class="badge" style="background: var(--itb-secondary); font-size: 0.7rem; padding: 2px 5px; border-radius: 4px; color: white;">${v ? v.version_number : 'v1.0'}</span></h4>
                                <div class="history-file-meta">
                                    <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                                    <span><i class="fas fa-weight-hanging"></i> ${v ? formatFileSize(v.file_size) : '-'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="history-file-actions">
                            <button class="btn download-cloud-btn" data-id="${v ? v.id : ''}" title="Descargar">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-secondary upload-version-btn" data-id="${doc.id}" title="Nueva Versión">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn-secondary delete-cloud-btn" data-id="${doc.id}" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // Mostrar conversiones recientes locales
        if (localHistoryToShow.length > 0) {
            historyHTML += `<h3 style="margin: 30px 0 10px; color: var(--itb-primary);">Conversiones recientes (Local)</h3>`;

            localHistoryToShow.forEach((item, index) => {
                // El index original en conversionHistory es importante para delete/download
                const actualIndex = conversionHistory.findIndex(h => h.id === item.id);

                const iconClass = getFileIconClass(item.originalType);
                const date = new Date(item.date).toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });

                historyHTML += `
                    <div class="history-item">
                        <div class="history-file-info">
                            <i class="fas ${iconClass} history-file-icon" style="color: ${getFileIconColor(item.originalType)}"></i>
                            <div class="history-file-details">
                                <h4>${item.originalName} → PDF</h4>
                                <div class="history-file-meta">
                                    <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                                    <span><i class="fas fa-weight-hanging"></i> ${item.originalSize}</span>
                                </div>
                            </div>
                        </div>
                        <div class="history-file-actions">
                            <button class="btn download-pdf-btn" data-index="${actualIndex}">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-secondary delete-history-btn" data-index="${actualIndex}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        historyFiles.innerHTML = historyHTML;

        // Eventos para Cloud Download
        document.querySelectorAll('.download-cloud-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const versionId = this.getAttribute('data-id');
                if (versionId) await downloadCloudFile(versionId);
            });
        });

        // Evento para Nueva Versión
        document.querySelectorAll('.upload-version-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const docId = this.getAttribute('data-id');
                currentParentId = docId; // Set parent for next upload
                showUploadSection();
                showSuccess(`Preparado para subir nueva versión del documento #${docId}`);
            });
        });

        document.querySelectorAll('.delete-cloud-btn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const docId = this.getAttribute('data-id');
                if (confirm('¿Estás seguro de que deseas eliminar este documento y todas sus versiones?')) {
                    await deleteCloudDocument(docId);
                }
            });
        });

        // Agregar eventos a los botones del historial
        document.querySelectorAll('.download-pdf-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                downloadFromHistory(index);
            });
        });

        document.querySelectorAll('.use-file-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                useFileFromHistory(index);
            });
        });

        document.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const type = this.getAttribute('data-type') || 'conversion';
                const index = parseInt(this.getAttribute('data-index'));
                deleteFromHistory(type, index);
            });
        });
    }

    // Usar archivo del historial
    function useFileFromHistory(index) {
        if (index >= 0 && index < uploadedFiles.length) {
            const fileData = uploadedFiles[index];

            // Crear un objeto File simulado a partir de los datos
            const file = new File([], fileData.name, {
                type: fileData.mimeType,
                lastModified: new Date(fileData.date).getTime()
            });

            // Simular el procesamiento del archivo
            currentFile = {
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                mimeType: fileData.mimeType,
                lastModified: new Date(fileData.date).getTime()
            };

            updateFileInfo(currentFile);
            showUploadSection();
            showSuccess('Archivo cargado desde el historial');
        }
    }

    // Función para obtener clase de íconos según tipo de archivo
    function getFileIconClass(fileType) {
        const type = fileType.toLowerCase();

        if (type.includes('word') || type.includes('doc')) {
            return 'fa-file-word';
        } else if (type.includes('excel') || type.includes('xls')) {
            return 'fa-file-excel';
        } else if (type.includes('powerpoint') || type.includes('ppt')) {
            return 'fa-file-powerpoint';
        } else if (type.includes('pdf')) {
            return 'fa-file-pdf';
        } else if (type.includes('text') || type.includes('txt')) {
            return 'fa-file-alt';
        } else if (type.includes('rtf')) {
            return 'fa-file-alt';
        } else {
            return 'fa-file';
        }
    }

    // Función para obtener color del ícono según tipo de archivo
    function getFileIconColor(fileType) {
        const type = fileType.toLowerCase();

        if (type.includes('word') || type.includes('doc')) {
            return '#2B579A'; // Azul Office
        } else if (type.includes('excel') || type.includes('xls')) {
            return '#217346'; // Verde Excel
        } else if (type.includes('powerpoint') || type.includes('ppt')) {
            return '#D24726'; // Naranja PowerPoint
        } else if (type.includes('pdf')) {
            return '#F40F02'; // Rojo PDF
        } else {
            return '#666666'; // Gris para otros
        }
    }

    // Función para obtener nombre del tipo de archivo
    function getFileTypeName(fileType) {
        const type = fileType.toLowerCase();

        if (type.includes('word') || type.includes('doc')) {
            return 'Documento Word';
        } else if (type.includes('excel') || type.includes('xls')) {
            return 'Hoja de cálculo Excel';
        } else if (type.includes('powerpoint') || type.includes('ppt')) {
            return 'Presentación PowerPoint';
        } else if (type.includes('pdf')) {
            return 'Documento PDF';
        } else if (type.includes('txt')) {
            return 'Documento de Texto';
        } else if (type.includes('rtf')) {
            return 'Documento RTF';
        } else {
            return 'Documento';
        }
    }

    // Actualizar información de formatos soportados
    function updateFormatInfo() {
        if (formatInfo) {
            formatInfo.innerHTML = `
                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px;">
                    <span style="display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fas fa-file-word" style="color: #2B579A;"></i> Word (.docx, .doc)
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fas fa-file-excel" style="color: #217346;"></i> Excel (.xlsx, .xls)
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fas fa-file-powerpoint" style="color: #D24726;"></i> PowerPoint (.pptx, .ppt)
                    </span>
                </div>
            `;
        }
    }

    // Limpiar historial
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function () {
            if ((conversionHistory.length > 0 || uploadedFiles.length > 0) &&
                confirm('¿Estás seguro de que deseas eliminar todo el historial?')) {

                // Liberar todas las URLs de PDF
                conversionHistory.forEach(item => {
                    if (item.pdfUrl) {
                        URL.revokeObjectURL(item.pdfUrl);
                    }
                });

                conversionHistory = [];
                uploadedFiles = [];
                saveToLocalStorage();
                loadHistory();
                showSuccess('Historial eliminado correctamente');
            }
        });
    }

    // Función para abrir selector de archivos
    selectFileBtn.addEventListener('click', function () {
        fileInput.click();
    });

    // Manejar selección de archivo
    fileInput.addEventListener('change', function (e) {
        if (this.files.length > 0) {
            const file = this.files[0];
            console.log('📄 Archivo seleccionado:', file.name, 'Tipo:', file.type);
            processFile(file);
        }
    });

    // Funcionalidad de arrastrar y soltar
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.style.borderColor = "var(--itb-primary)";
        this.style.backgroundColor = "rgba(52, 152, 219, 0.1)";
    });

    dropArea.addEventListener('dragleave', function () {
        this.style.borderColor = "";
        this.style.backgroundColor = "";
    });

    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.borderColor = "";
        this.style.backgroundColor = "";

        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            fileInput.files = e.dataTransfer.files;
            console.log('📄 Archivo arrastrado:', file.name);
            processFile(file);
        }
    });

    // Procesar archivo seleccionado
    function processFile(file) {
        // Validar extensión - ahora incluye PowerPoint y Excel
        const validExtensions = ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt', '.rtf'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            showError(`Formato no soportado. Formatos permitidos: Word (.docx, .doc), Excel (.xlsx, .xls), PowerPoint (.pptx, .ppt), Texto (.txt, .rtf)`);
            return;
        }

        // Validar tamaño (50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            showError(`Archivo muy grande. Máximo: 50MB`);
            return;
        }

        currentFile = file;
        updateFileInfo(file);
        hideMessages();

        // Guardar archivo en el historial de subidas
        saveFileToHistory(file);

        // Actualizar información de formatos
        updateFormatInfo();
    }

    // Guardar archivo en el historial de subidas (Real API)
    async function saveFileToHistory(file) {
        if (!isAuthenticated()) {
            console.log('👤 Usuario no autenticado, guardando localmente');
            const fileData = {
                id: Date.now(),
                name: file.name,
                size: file.size,
                type: file.type || getFileTypeFromExtension(file.name),
                mimeType: file.type,
                date: new Date().toISOString()
            };
            uploadedFiles.unshift(fileData);
            saveToLocalStorage();
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            let uploadUrl = `${API_URL}/api/v1/files/upload`;
            if (typeof currentParentId !== 'undefined' && currentParentId) {
                uploadUrl += `?parent_id=${currentParentId}`;
            }

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: formData
            });

            if (response.ok) {
                console.log('✅ Archivo subido y registrado en DB');
                loadHistory(); // Recargar para mostrar el nuevo archivo
            }
        } catch (error) {
            console.error('Error al subir archivo:', error);
        }
    }

    // Obtener tipo de archivo desde extensión
    function getFileTypeFromExtension(filename) {
        const ext = filename.split('.').pop().toLowerCase();

        if (['docx', 'doc'].includes(ext)) return 'word';
        if (['xlsx', 'xls'].includes(ext)) return 'excel';
        if (['pptx', 'ppt'].includes(ext)) return 'powerpoint';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['txt'].includes(ext)) return 'text';
        if (['rtf'].includes(ext)) return 'rtf';

        return 'unknown';
    }

    // Actualizar información del archivo
    function updateFileInfo(file) {
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        const typeName = getFileTypeName(fileExt);
        const iconClass = getFileIconClass(fileExt);

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        if (fileType) fileType.textContent = typeName;
        if (fileIcon) {
            fileIcon.className = `fas ${iconClass}`;
            fileIcon.style.color = getFileIconColor(fileExt);
        }

        const date = new Date(file.lastModified);
        if (fileDate) {
            fileDate.textContent = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

        if (fileInfo) {
            fileInfo.style.display = 'block';
        }
    }

    // Formatear tamaño del archivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Eliminar archivo
    removeFileBtn.addEventListener('click', function () {
        currentFile = null;
        fileInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';
        hideMessages();
    });

    // Botón de reset
    resetBtn.addEventListener('click', function () {
        currentFile = null;
        fileInput.value = '';
        if (fileInfo) fileInfo.style.display = 'none';
        hideMessages();
    });

    // Convertir archivo a PDF
    convertBtn.addEventListener('click', async function () {
        if (!currentFile) {
            showError('Por favor, seleccione un archivo');
            return;
        }

        await convertWithAPI();

        currentParentId = null; // Reset tras guardado
    });

    // Convertir usando API backend - VERSIÓN MEJORADA
    async function convertWithAPI() {
        const formData = new FormData();
        formData.append("file", currentFile);

        // Mostrar loading
        convertBtn.disabled = true;
        const originalText = convertBtn.innerHTML;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando a servidor...';

        hideMessages();

        try {
            console.log(`[API] Enviando archivo a ${API_URL}/convert`);
            console.log(`[API] Archivo: ${currentFile.name} (${formatFileSize(currentFile.size)})`);

            // Configurar timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

            const response = await fetch(`${API_URL}/convert`, {
                method: "POST",
                body: formData,
                signal: controller.signal
            }).catch(error => {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Tiempo de espera agotado. El servidor no respondió.');
                }
                throw error;
            });

            clearTimeout(timeoutId);

            console.log(`[API] Respuesta: ${response.status} ${response.statusText}`);

            if (!response.ok) {
=======
    
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
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
<<<<<<< HEAD
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    // Si no es JSON, intentar leer como texto
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText.substring(0, 200);
                    }
                }
                throw new Error(errorMessage);
            }

            // Verificar que sea un PDF
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                console.warn('⚠️ La respuesta no es un PDF, content-type:', contentType);
                throw new Error('El servidor no devolvió un PDF válido');
            }

            // Obtener el blob del PDF
            const pdfBlob = await response.blob();
            console.log(`[API] PDF recibido: ${formatFileSize(pdfBlob.size)}`);

            if (pdfBlob.size === 0) {
                throw new Error('El PDF recibido está vacío');
            }

            // Procesar el PDF recibido
            await processConvertedPDF(pdfBlob);

        } catch (error) {
            console.error('[ERROR] Error en conversión API:', error);

            if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
                showError(`No se puede conectar al servidor en ${API_URL}. Verifica que el servidor esté corriendo.`);
            } else if (error.message.includes('Tiempo de espera')) {
                showError('El servidor tardó demasiado en responder. Intenta nuevamente.');
            } else {
                showError(error.message || 'Error al convertir el archivo. Intente nuevamente.');
            }

            // NO intentar conversión local como fallback - mejor mostrar error claro
=======
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
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
        } finally {
            // Restaurar botón
            convertBtn.disabled = false;
            convertBtn.innerHTML = originalText;
        }
    }
<<<<<<< HEAD

    // Procesar PDF convertido - SIN VISTA PREVIA
    async function processConvertedPDF(pdfBlob) {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfFilename = currentFile.name.replace(/\.[^/.]+$/, "") + ".pdf";

        console.log(`[PDF] Generado: ${formatFileSize(pdfBlob.size)}`);

        // Guardar en historial de conversiones solo si NO está autenticado
        // Evitamos duplicados porque los autenticados ya lo guardan en la nube
        if (!isAuthenticated()) {
            const conversionRecord = {
                id: Date.now(),
                originalName: currentFile.name,
                originalType: currentFile.name.split('.').pop().toLowerCase(),
                originalSize: formatFileSize(currentFile.size),
                pdfName: pdfFilename,
                pdfSize: formatFileSize(pdfBlob.size),
                pdfUrl: pdfUrl,
                date: new Date().toISOString(),
                convertedWith: 'api'
            };

            // Agregar al principio del array
            conversionHistory.unshift(conversionRecord);

            // Mantener solo los últimos 30 archivos
            if (conversionHistory.length > 30) {
                // Liberar URL del archivo más antiguo
                if (conversionHistory[30].pdfUrl) {
                    URL.revokeObjectURL(conversionHistory[30].pdfUrl);
                }
                conversionHistory = conversionHistory.slice(0, 30);
            }

            saveToLocalStorage();
        }

        // Configurar enlace de descarga
        if (downloadLink) {
            downloadLink.href = pdfUrl;
            downloadLink.download = pdfFilename;

            // Crear un enlace de descarga automática
            setTimeout(() => {
                downloadPDF(pdfUrl, pdfFilename);
            }, 500); // Pequeña pausa antes de descargar
        }

        // Mostrar éxito con información del PDF
        showSuccess(`✅ ${currentFile.name} convertido exitosamente a PDF<br>
                    <small>Tamaño: ${formatFileSize(pdfBlob.size)} • Listo para descargar</small>`);

        // Limpiar URL después de 1 hora para liberar memoria
        setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
            console.log('🧹 URL del PDF liberada de memoria');
        }, 60 * 60 * 1000);
    }

    // ========== FUNCIONES MEJORADAS PARA EXTRACCIÓN DE CONTENIDO ==========

    // Función para extraer texto de archivos (como fallback)
    async function extractFileContent(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = function (event) {
                try {
                    const fileExt = file.name.split('.').pop().toLowerCase();

                    if (fileExt === 'txt' || fileExt === 'rtf') {
                        // Archivos de texto - leer directamente
                        resolve(event.target.result);
                    } else if (fileExt === 'docx') {
                        // Para DOCX, usar una aproximación básica
                        resolve(extractBasicTextFromDOCX(event.target.result, file.name));
                    } else {
                        // Para otros formatos
                        resolve(`Contenido de ${file.name}\n\nFormato: ${fileExt}\nTamaño: ${formatFileSize(file.size)}\n\nPara una conversión completa, use el servidor en ${API_URL}`);
                    }
                } catch (error) {
                    resolve(`Error al leer ${file.name}: ${error.message}`);
                }
            };

            reader.onerror = function () {
                resolve(`No se pudo leer el archivo: ${file.name}`);
            };

            if (file.name.endsWith('.txt') || file.name.endsWith('.rtf')) {
                reader.readAsText(file, 'UTF-8');
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    // Función básica para extraer texto de DOCX
    function extractBasicTextFromDOCX(arrayBuffer, filename) {
        try {
            // Los archivos DOCX son ZIP que contienen XML
            // Esta es una aproximación muy básica
            const decoder = new TextDecoder('utf-8');
            const view = new DataView(arrayBuffer);

            // Intentar encontrar texto en el buffer
            let text = '';
            const chunkSize = 1024;

            for (let i = 0; i < Math.min(arrayBuffer.byteLength, 10000); i += chunkSize) {
                const chunk = new Uint8Array(arrayBuffer, i, Math.min(chunkSize, arrayBuffer.byteLength - i));
                const chunkText = decoder.decode(chunk);

                // Filtrar caracteres no imprimibles y mantener solo texto legible
                const cleanText = chunkText.replace(/[^\x20-\x7E\n\r\táéíóúÁÉÍÓÚñÑ¿¡]/g, ' ');
                if (cleanText.trim().length > 10) {
                    text += cleanText + '\n';
                }
            }

            if (text.length > 500) {
                return `Contenido extraído de ${filename}:\n\n${text.substring(0, 1000)}...\n\n[Contenido truncado - Use el servidor para conversión completa]`;
            } else if (text.length > 0) {
                return `Contenido extraído de ${filename}:\n\n${text}`;
            } else {
                return `Archivo: ${filename}\n\nNo se pudo extraer texto legible. Use el servidor para conversión completa.`;
            }
        } catch (error) {
            return `Archivo: ${filename}\n\nError al extraer contenido: ${error.message}`;
        }
    }

    // ========== FUNCIONES PARA HISTORIAL ==========

    // Descargar desde historial
    function downloadFromHistory(index) {
        const item = conversionHistory[index];
        if (item && item.pdfUrl) {
            downloadPDF(item.pdfUrl, item.pdfName);
            showSuccess(`PDF descargado: ${item.pdfName}`);
        } else {
            showError('El PDF no está disponible para descarga.');
        }
    }

    // Eliminar del historial
    function deleteFromHistory(type, index) {
        if (confirm('¿Estás seguro de que deseas eliminar este archivo del historial?')) {
            if (type === 'conversion') {
                // Liberar URL del objeto
                if (conversionHistory[index] && conversionHistory[index].pdfUrl) {
                    URL.revokeObjectURL(conversionHistory[index].pdfUrl);
                }
                conversionHistory.splice(index, 1);
            } else if (type === 'uploaded') {
                uploadedFiles.splice(index, 1);
            }

            saveToLocalStorage();
            loadHistory();
            showSuccess('Elemento eliminado del historial');
        }
    }

    // Descargar archivo desde el servidor (Cloud)
    async function downloadCloudFile(versionId) {
        try {
            const response = await fetch(`${API_URL}/api/v1/files/download/${versionId}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (!response.ok) throw new Error('No se pudo descargar el archivo');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Extraer nombre del header si es posible
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'documento.pdf';
            if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
                filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }

            downloadPDF(url, filename);
            showSuccess('Descargando archivo desde el servidor...');

            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        } catch (error) {
            showError(error.message);
        }
    }

    // Eliminar documento de la nube
    async function deleteCloudDocument(docId) {
        try {
            const response = await fetch(`${API_URL}/api/v1/files/${docId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (!response.ok) throw new Error('No se pudo eliminar el documento');

            showSuccess('Documento eliminado correctamente');
            await loadHistory();
        } catch (error) {
            showError(error.message);
        }
    }

    // Descargar PDF
    function downloadPDF(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Mostrar mensaje de éxito
    function showSuccess(message = '¡Operación completada!') {
        if (successMessage) {
            const successText = successMessage.querySelector('div:last-child div:first-child');
            if (successText) {
                successText.innerHTML = message;
            }
            successMessage.style.display = 'flex';
            successMessage.classList.add('show');

            // Ocultar después de 5 segundos
            setTimeout(() => {
                successMessage.classList.remove('show');
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 300);
            }, 5000);
        }
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    // Mostrar mensaje de error
    function showError(message) {
        if (errorMessage) {
            const errorText = errorMessage.querySelector('div:last-child div:last-child');
            if (errorText) {
                errorText.textContent = message;
            }
            errorMessage.style.display = 'flex';
            errorMessage.classList.add('show');
        }
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    }

    // Ocultar todos los mensajes
    function hideMessages() {
        if (successMessage) {
            successMessage.classList.remove('show');
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 300);
        }
        if (errorMessage) {
            errorMessage.classList.remove('show');
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 300);
        }
    }

    // Inicializar la aplicación
    showUploadSection();
    updateFormatInfo();
    console.log('✅ Conversor multi-formato listo - Soporta Word, Excel, PowerPoint');
    console.log('📡 API Backend configurada en:', API_URL);

    // Verificar conexión con el servidor
    checkServerConnection();

    // Función para verificar conexión con el servidor
    async function checkServerConnection() {
        try {
            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                console.log('✅ Servidor conectado correctamente');
            } else {
                console.warn('⚠️  Servidor responde pero con error');
            }
        } catch (error) {
            console.warn('⚠️  No se puede conectar al servidor:', error.message);
        }
    }
=======
    
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
>>>>>>> c6414dd4839300d53c1dad022bf632049abe4100
});