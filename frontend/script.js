/**
 * Script principal para el conversor - VERSIÓN MEJORADA
 * Ahora soporta Word, PowerPoint y Excel - SIN VISTA PREVIA
 */

const API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || "http://localhost:8000";

document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ Conversor de Archivos a PDF - Multi-formato');

    // Elementos del DOM
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const dropArea = document.getElementById('dropArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDate = document.getElementById('fileDate');
    const fileType = document.getElementById('fileType');
    const fileIcon = document.getElementById('fileIcon');
    const convertBtn = document.getElementById('convertBtn');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const statusOverlay = document.getElementById('statusOverlay');
    const downloadLink = document.getElementById('downloadLink');
    const downloadLinkContainer = document.getElementById('downloadLinkContainer');
    const closeSuccess = document.getElementById('closeSuccess');
    const closeError = document.getElementById('closeError');
    const closeErrorBtn = document.getElementById('closeErrorBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const historyBtn = document.getElementById('historyBtn');
    const uploadSection = document.getElementById('uploadSection');
    const historySection = document.getElementById('historySection');
    const historyFiles = document.getElementById('historyFiles');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const clearSharedBtn = document.getElementById('clearSharedBtn');

    // Elementos para documentos compartidos (Nuevo)
    const sharedBtn = document.getElementById('sharedBtn');
    const sharedSection = document.getElementById('sharedSection');
    const sharedFiles = document.getElementById('sharedFiles');
    const validateBtn = document.getElementById('validateBtn');
    const validateSection = document.getElementById('validateSection');
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
                const navItem = this.closest('.nav-item');
                if (this.checked) {
                    navItem.classList.add('active');
                } else {
                    navItem.classList.remove('active');
                }
            });
        });
    }

    // Navegación entre pestañas
    if (uploadBtn && historyBtn) {
        uploadBtn.addEventListener('click', function () {
            showUploadSection();
        });

        historyBtn.addEventListener('click', function () {
            showHistorySection();
        });

        if (sharedBtn) {
            sharedBtn.addEventListener('click', function () {
                console.log('🔘 Click en botón Compartidos');
                showSharedSection();
            });
        }

        if (validateBtn) {
            validateBtn.addEventListener('click', function () {
                showValidateSection();
            });
        }
    }

    // ========== GESTIÓN DE MODO SIMULACIÓN (GLOBAL) ==========
    const globalSimToggle = document.getElementById('globalSimToggle');

    function updateSimulationUI() {
        const isSim = globalSimToggle.checked;

        // Elementos de Firma
        const signRealInputs = document.getElementById('signRealInputs');
        const signSimInputs = document.getElementById('signSimInputs');
        if (signRealInputs) signRealInputs.style.display = isSim ? 'none' : 'block';
        if (signSimInputs) signSimInputs.style.display = isSim ? 'block' : 'none';

        // Elementos de Validación
        const validateRealInput = document.getElementById('validateRealInput');
        const validateSimInput = document.getElementById('validateSimInput');
        if (validateRealInput) validateRealInput.style.display = isSim ? 'none' : 'block';
        if (validateSimInput) validateSimInput.style.display = isSim ? 'block' : 'none';

        console.log(`🚀 Modo Simulación: ${isSim ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }

    if (globalSimToggle) {
        globalSimToggle.addEventListener('change', updateSimulationUI);
        updateSimulationUI(); // Estado inicial
    }

    // Mostrar sección de subir archivo
    function showUploadSection() {
        uploadSection.style.display = 'block';
        historySection.style.display = 'none';
        if (conversionOptions) conversionOptions.style.display = 'block';
        uploadBtn.classList.add('active');
        historyBtn.classList.remove('active');
        if (convertBtn) convertBtn.style.display = 'block';
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
        if (clearSharedBtn) clearSharedBtn.style.display = 'none';

        // Ocultar otras secciones
        if (sharedSection) sharedSection.style.display = 'none';
        if (sharedBtn) sharedBtn.classList.remove('active');
        if (validateSection) validateSection.style.display = 'none';
        if (validateBtn) validateBtn.classList.remove('active');

        hideMessages();
    }

    // Mostrar sección de historial
    function showHistorySection() {
        uploadSection.style.display = 'none';
        historySection.style.display = 'block';
        if (conversionOptions) conversionOptions.style.display = 'none';
        uploadBtn.classList.remove('active');
        historyBtn.classList.add('active');
        if (convertBtn) convertBtn.style.display = 'none';
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'block';
        if (clearSharedBtn) clearSharedBtn.style.display = 'none';

        // Ocultar otras secciones
        if (sharedSection) sharedSection.style.display = 'none';
        if (sharedBtn) sharedBtn.classList.remove('active');
        if (validateSection) validateSection.style.display = 'none';
        if (validateBtn) validateBtn.classList.remove('active');

        loadHistory();
    }

    function showSharedSection() {
        console.log('📂 Mostrando sección de documentos compartidos...');
        uploadSection.style.setProperty('display', 'none', 'important');
        historySection.style.setProperty('display', 'none', 'important');
        if (validateSection) validateSection.style.setProperty('display', 'none', 'important');

        if (sharedSection) {
            sharedSection.style.setProperty('display', 'block', 'important');
            console.log('✅ sharedSection display set to block (forced)');
        } else {
            console.error('❌ ERROR: sharedSection element not found!');
        }

        if (conversionOptions) conversionOptions.style.display = 'none';

        uploadBtn.classList.remove('active');
        historyBtn.classList.remove('active');
        if (sharedBtn) sharedBtn.classList.add('active');
        if (validateBtn) validateBtn.classList.remove('active');

        if (convertBtn) convertBtn.style.display = 'none';
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
        if (clearSharedBtn) clearSharedBtn.style.display = 'block';

        hideMessages();
        loadDocuments(); // Cargar todos los documentos
    }

    // Mostrar sección de validación
    function showValidateSection() {
        uploadSection.style.display = 'none';
        historySection.style.display = 'none';
        if (sharedSection) sharedSection.style.display = 'none';
        if (validateSection) validateSection.style.display = 'block';

        if (conversionOptions) conversionOptions.style.display = 'none';

        uploadBtn.classList.remove('active');
        historyBtn.classList.remove('active');
        if (sharedBtn) sharedBtn.classList.remove('active');
        if (validateBtn) validateBtn.classList.add('active');

        if (convertBtn) convertBtn.style.display = 'none';
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
        if (clearSharedBtn) clearSharedBtn.style.display = 'none';

        hideMessages();
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

    // Cargar historial y documentos compartidos
    async function loadHistory() {
        await loadDocuments();
    }

    async function loadDocuments() {
        if (!historyFiles) return;

        let historyHTML = '';
        let sharedHTML = '';
        let backendDocs = [];

        console.log('🔄 Sincronizando documentos...');

        // Mostrar estado de carga solo si la sección relevante está activa
        const loadingSpinner = `
            <div style="text-align: center; padding: 30px;">
                <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--itb-secondary); margin-bottom: 15px;"></i>
                <p>Cargando lista...</p>
            </div>`;

        if (historySection && historySection.style.display !== 'none') historyFiles.innerHTML = loadingSpinner;
        if (sharedSection && sharedSection.style.display !== 'none' && sharedFiles) sharedFiles.innerHTML = loadingSpinner;

        if (isAuthenticated()) {
            try {
                const response = await fetch(`${API_URL}/api/v1/files/my-documents`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (response.status === 401) {
                    logout();
                    return;
                }
                if (response.ok) {
                    backendDocs = await response.json();
                }
            } catch (error) {
                console.error('❌ Error API:', error);
            }
        }

        // Filtrar historial local (archivos que aún no están en la nube)
        const localHistoryToShow = conversionHistory.filter(item =>
            !backendDocs.some(doc =>
                doc.name === item.originalName ||
                doc.name === item.pdfName ||
                doc.name === item.originalName.replace(/\.[^/.]+$/, "") + ".pdf"
            )
        );

        // --- RENDERIZAR HISTORIAL ---
        const ownedDocs = backendDocs.filter(d => d.is_owner);

        if (ownedDocs.length > 0) {
            historyHTML += `<h3 style="margin: 20px 0 10px; color: var(--itb-primary);">Mis Documentos</h3>`;
            ownedDocs.forEach(doc => historyHTML += generateDocumentHTML(doc));
        }

        if (localHistoryToShow.length > 0) {
            historyHTML += `<h3 style="margin: 30px 0 10px; color: var(--itb-primary);">Conversiones locales</h3>`;
            localHistoryToShow.forEach(item => {
                const actualIndex = conversionHistory.findIndex(h => h.id === item.id);
                const iconClass = getFileIconClass(item.originalType);
                historyHTML += `
                    <div class="history-item">
                        <div class="history-file-info">
                            <i class="fas ${iconClass} history-file-icon" style="color: ${getFileIconColor(item.originalType)}"></i>
                            <div class="history-file-details">
                                <h4>${item.originalName} → PDF</h4>
                            </div>
                        </div>
                        <div class="history-file-actions">
                            <button class="btn download-pdf-btn" data-index="${actualIndex}"><i class="fas fa-download"></i></button>
                            <button class="btn-secondary delete-history-btn" data-index="${actualIndex}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
            });
        }

        historyFiles.innerHTML = historyHTML || `
            <div class="no-history">
                <i class="fas fa-history fa-3x" style="color: var(--itb-gray); margin-bottom: 20px;"></i>
                <p>No hay archivos en tu historial</p>
                <p style="font-size: 0.9rem; color: var(--itb-gray);">Convierte archivos para verlos aquí</p>
            </div>`;


        // --- RENDERIZAR COMPARTIDOS ---
        const sharedDocs = backendDocs.filter(d => !d.is_owner);

        if (sharedDocs.length > 0) {
            sharedHTML += `<h3 style="margin: 20px 0 10px; color: var(--itb-primary);">Documentos Compartidos</h3>`;
            sharedDocs.forEach(doc => sharedHTML += generateDocumentHTML(doc));
        }

        if (sharedFiles) {
            sharedFiles.innerHTML = sharedHTML || `
                <div class="no-history">
                    <i class="fas fa-folder-open fa-3x" style="color: var(--itb-gray); margin-bottom: 20px;"></i>
                    <p>No tienes documentos compartidos</p>
                    <p style="font-size: 0.9rem; color: var(--itb-gray);">Los archivos que otros compartan contigo aparecerán aquí</p>
                </div>`;
        }

        attachSharedEvents();
    }



    function generateDocumentHTML(doc) {
        const v = doc.latest_version;
        const fileExt = doc.name.split('.').pop().toLowerCase();
        const iconClass = getFileIconClass(fileExt);
        const permission = doc.permission || (doc.is_owner ? 'owner' : 'viewer');
        const isOwner = permission === 'owner';
        const canUpdate = isOwner || permission === 'editor';
        const isShared = !isOwner || doc.shared_with_others;

        // Limpiar el número de versión - si ya empieza con "v", quitarlo
        let versionNumber = '1.0';
        if (v && v.version_number) {
            versionNumber = v.version_number.toString();
            // Si empieza con "v" o "V", quitarlo
            versionNumber = versionNumber.replace(/^[vV]/, '');
        }

        // Versión en badge azul claro (#3498db = azul ITB)
        const versionBadge = `<span class="badge" style="background: #3498db; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-right: 5px; font-weight: normal; display: inline-block; line-height: 1;">v${versionNumber}</span>`;

        // Badge "Compartido" con estilo naranja
        const sharedBadge = isShared ?
            '<span class="badge" style="background: #e67e22; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 5px; font-weight: normal; display: inline-block; line-height: 1;">Compartido</span>' : '';

        const roleLabel = isOwner ? 'Propietario' : (permission === 'editor' ? 'Editor' : 'Lector');

        // Obtener información del archivo
        const fileSize = v && v.file_size ? formatFileSize(v.file_size) : 'N/A';
        const uploadDate = v && v.created_at ? new Date(v.created_at).toLocaleDateString('es-ES') : 'N/A';

        return `
            <div class="history-item">
                <div class="history-file-info">
                    <i class="fas ${iconClass} history-file-icon" style="color: ${getFileIconColor(fileExt)}"></i>
                    <div class="history-file-details">
                        <h4 style="margin-bottom: 8px; display: flex; align-items: center; gap: 5px;">
                            ${doc.name} ${versionBadge} ${sharedBadge}
                        </h4>
                        <div class="history-file-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${uploadDate}</span>
                            <span><i class="fas fa-weight-hanging"></i> ${fileSize}</span>
                            <span><i class="fas fa-user-tag"></i> ${roleLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="history-file-actions">
                    <button class="btn download-cloud-btn" data-id="${v ? v.id : ''}" title="Descargar">
                        <i class="fas fa-download"></i>
                    </button>
                    ${fileExt.toLowerCase() === 'pdf' ?
                `<button class="btn-secondary sign-doc-btn" data-id="${doc.id}" data-name="${doc.name}" title="Firmar">
                            <i class="fas fa-pen-nib"></i>
                        </button>` : ''}
                    ${isOwner ?
                `<button class="btn-secondary share-doc-btn" data-id="${doc.id}" data-name="${doc.name}" title="Compartir">
                            <i class="fas fa-user-plus"></i>
                        </button>` : ''}
                    <button class="btn-secondary upload-version-btn" data-id="${doc.id}" title="Nueva Versión" 
                            style="${canUpdate ? '' : 'display: none;'}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn-secondary delete-cloud-btn" data-id="${doc.id}" title="Eliminar" 
                            ${!isOwner ? 'disabled style="opacity: 0.5;"' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>`;
    }





    function attachSharedEvents() {
        // Eventos para Cloud Download
        document.querySelectorAll('.download-cloud-btn').forEach(btn => {
            btn.onclick = async function () {
                const versionId = this.getAttribute('data-id');
                if (versionId) await downloadCloudFile(versionId);
            };
        });

        // Evento para Nueva Versión
        document.querySelectorAll('.upload-version-btn').forEach(btn => {
            btn.onclick = function () {
                const docId = this.getAttribute('data-id');
                currentParentId = docId;
                showUploadSection();
                showSuccess(`Preparado para subir nueva versión del documento #${docId}`);
            };
        });

        document.querySelectorAll('.delete-cloud-btn').forEach(btn => {
            btn.onclick = async function () {
                if (this.disabled) return;
                const docId = this.getAttribute('data-id');
                if (confirm('¿Estás seguro de que deseas eliminar este documento y todas sus versiones?')) {
                    await deleteCloudDocument(docId);
                }
            };
        });

        // Evento para Compartir
        document.querySelectorAll('.share-doc-btn').forEach(btn => {
            btn.onclick = function () {
                const docId = this.getAttribute('data-id');
                const docName = this.getAttribute('data-name');
                openShareModal(docId, docName);
            };
        });

        // Evento para Firmar
        document.querySelectorAll('.sign-doc-btn').forEach(btn => {
            btn.onclick = function () {
                const docId = this.getAttribute('data-id');
                const docName = this.getAttribute('data-name');
                openSignModal(docId, docName);
            };
        });
    }

    // ========== FUNCIONALIDAD DE FIRMA DIGITAL (Simulación Integrada) ==========

    // Elementos del DOM para el Modal de Firma
    const signModal = document.getElementById('signModal');
    const signForm = document.getElementById('signForm');
    const closeModalSign = document.querySelector('.close-modal-sign');
    const closeModalSignBtn = document.querySelector('.close-modal-sign-btn');
    let currentSignDocId = null;

    /**
     * Abre el modal de firma para un documento específico.
     * @param {number} docId - ID del documento en la base de datos.
     * @param {string} docName - Nombre del archivo PDF.
     */
    function openSignModal(docId, docName) {
        currentSignDocId = docId;
        const nameEl = document.getElementById('signFileName');
        if (nameEl) nameEl.textContent = docName;

        // Limpiar campos previos
        const p12Input = document.getElementById('p12File');
        if (p12Input) p12Input.value = '';

        const passInput = document.getElementById('p12Password');
        if (passInput) passInput.value = '';

        const errorEl = document.getElementById('signError');
        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
        }

        if (signModal) signModal.style.display = 'block';
    }

    /**
     * Cierra el modal de firma y resetea el archivo seleccionado.
     */
    function closeSignModal() {
        if (signModal) signModal.style.display = 'none';
        currentSignDocId = null;
    }

    if (closeModalSign) closeModalSign.addEventListener('click', closeSignModal);
    if (closeModalSignBtn) closeModalSignBtn.addEventListener('click', closeSignModal);

    // Manejar envío de formulario de firma
    if (signForm) {
        signForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const p12File = document.getElementById('p12File').files[0];
            const password = document.getElementById('p12Password').value;
            const errorEl = document.getElementById('signError');

            const isSimulation = globalSimToggle ? globalSimToggle.checked : true;

            // En simulación solo exigimos la contraseña para la demo
            if (isSimulation && !password) {
                if (errorEl) {
                    errorEl.textContent = 'Por favor ingresa la contraseña (actúa como disparador en la demo)';
                    errorEl.style.display = 'block';
                }
                return;
            }

            // En modo real exigimos ambos obligatoriamente
            if (!isSimulation && (!p12File || !password)) {
                if (errorEl) {
                    errorEl.textContent = 'Error: Se requiere subir el archivo .p12 y la contraseña en modo real';
                    errorEl.style.display = 'block';
                }
                return;
            }

            if (!currentSignDocId) return;

            const submitBtn = document.getElementById('confirmSignBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            try {
                // LLAMADA SIMULADA / REAL (Pasamos el flag de simulación)
                const result = await signDocumentAPI(currentSignDocId, p12File, password, isSimulation);
                closeSignModal();
                showSuccess(isSimulation ? `✅ Firma Simulada con éxito.<br><small>Certificado usado: ROBERTO ALEXIS NEGRETE</small>` : `✅ Documento firmado exitosamente.`);
                loadHistory();
            } catch (error) {
                console.error('Error al firmar:', error);
                if (errorEl) {
                    errorEl.textContent = error.message;
                    errorEl.style.display = 'block';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }


    /**
     * Realiza la llamada a la API para firmar o simula el proceso.
     * @param {number} docId - ID del documento.
     * @param {File} file - El archivo .p12 subido.
     * @param {string} password - Contraseña del certificado.
     */
    async function signDocumentAPI(docId, file, password, forceSimulation = null) {
        // Usar flag global o parámetro
        const IS_SIMULATION = forceSimulation !== null ? forceSimulation : (globalSimToggle ? globalSimToggle.checked : true);

        if (IS_SIMULATION) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (password.toLowerCase().includes('error')) {
                        reject(new Error('Contraseña del certificado incorrecta (Simulación 400 Bad Request)'));
                    } else {
                        resolve({ status: 'success', version: 'v1.1-signed' });
                    }
                }, 2000);
            });
        }

        // --- LÓGICA DE CONEXIÓN REAL ---
        const formData = new FormData();
        formData.append('document_id', docId);
        formData.append('p12_file', file);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/documents/sign`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: formData // El navegador asigna el Content-Type: multipart/form-data automáticamente
        });

        // Manejo específico de error 400 (Bad Request - Contraseña incorrecta)
        if (response.status === 400) {
            throw new Error('Certificado inválido o contraseña incorrecta (400)');
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Error al procesar la firma');
        }

        return await response.json();
    }

    // ========== FUNCIONALIDAD DE VALIDACIÓN (Subir PDF y ver JSON) ==========

    const validateInput = document.getElementById('validateInput');
    const selectValidateBtn = document.getElementById('selectValidateBtn');
    const validationResult = document.getElementById('validationResult');

    const simulateValidateBtn = document.getElementById('simulateValidateBtn');

    if (selectValidateBtn) {
        selectValidateBtn.onclick = () => validateInput.click();
    }

    if (simulateValidateBtn) {
        simulateValidateBtn.onclick = () => performValidation(null, true);
    }

    if (validateInput) {
        validateInput.onchange = async function () {
            if (this.files.length > 0) {
                await performValidation(this.files[0]);
            }
        };
    }

    /**
     * Maneja el proceso de validación de un archivo PDF seleccionado.
     * @param {File} file - El PDF a validar.
     */
    async function performValidation(file, forceSimulation = null) {
        if (!validationResult) return;

        const isSim = forceSimulation !== null ? forceSimulation : (globalSimToggle ? globalSimToggle.checked : (file === null));

        validationResult.style.display = 'block';
        validationResult.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--itb-secondary);"></i>
                <p style="margin-top: 10px;">Analizando firmas digitales del PDF...</p>
            </div>
        `;

        try {
            const IS_SIMULATION = isSim;
            let data;

            if (IS_SIMULATION) {
                // Simulación de validación
                data = await new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            is_valid: true,
                            signer_name: file ? "ESTUDIANTE ITB - FIRMA ELECTRÓNICA" : "ROBERTO ALEXIS NEGRETE (SIMULACIÓN)",
                            timestamp: new Date().toISOString(),
                            trusted: true,
                            integrity: file ? "Documento no modificado tras la firma" : "Documento íntegro (Simulado)"
                        });
                    }, 1500);
                });
            } else {
                // Llamada real al endpoint /validate
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(`${API_URL}/documents/validate`, {
                    method: 'POST',
                    body: formData
                });
                data = await response.json();
            }

            // Renderizar el resultado en pantalla (Formato JSON y Visual)
            validationResult.innerHTML = `
                <div style="border: 1px solid var(--itb-border); border-radius: 8px; padding: 20px; background: #fff;">
                    <h4 style="color: var(--itb-primary); margin-bottom: 20px; border-bottom: 2px solid var(--itb-light); padding-bottom: 10px;">
                        <i class="fas fa-clipboard-check"></i> Resultado de la Validación
                    </h4>
                    <div style="display: grid; gap: 12px; font-size: 0.95rem;">
                        <p><strong>Estado de Firma:</strong> ${data.is_valid ? '<span style="color: #27ae60; font-weight: bold;">✅ VÁLIDA</span>' : '<span style="color: #e74c3c; font-weight: bold;">❌ INVÁLIDA</span>'}</p>
                        <p><strong>Firmante detectado:</strong> ${data.signer_name || 'Desconocido'}</p>
                        <p><strong>Fecha y Hora:</strong> ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}</p>
                        <p><strong>Nivel de Seguridad:</strong> ${data.trusted ? 'Certificado de Integridad' : 'Firma no reconocida'}</p>
                    </div>
                    <div style="margin-top: 20px;">
                        <p style="font-size: 0.8rem; color: var(--itb-gray); margin-bottom: 5px;">Respuesta JSON del Servidor:</p>
                        <pre style="background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 6px; font-size: 0.85rem; overflow: auto; max-height: 200px;">${JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            `;
        } catch (error) {
            validationResult.innerHTML = `<div style="color: #e74c3c; padding: 20px; background: #fdf2f2; border-radius: 8px; border: 1px solid #f9d6d6;">
                <i class="fas fa-times-circle"></i> Error al conectar con el servicio de validación: ${error.message}
            </div>`;
        }
    }



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
            if (confirm('¿Estás seguro de que deseas eliminar todo el historial?')) {

                // Liberar todas las URLs de PDF locales
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

    // Limpiar documentos compartidos
    if (clearSharedBtn) {
        clearSharedBtn.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que deseas eliminar todos los documentos compartidos?')) {
                // Solo mostramos el mensaje ya que el backend no está disponible
                showSuccess('Documentos compartidos eliminados correctamente');
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

            if (response.status === 401) {
                console.error('🔒 Sesión expirada detectada al subir archivo');
                logout();
                return;
            }

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
            // Configurar timeout y abort controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

            // Si hay un token pero está expirado, avisar al usuario
            if (getToken() && isTokenExpired(getToken())) {
                console.warn('🕒 Sesión expirada detectada al intentar convertir');
                showError('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a entrar para guardar en tu historial.');
            }

            // MEJORA: Seleccionar el endpoint dinámicamente. 
            // Si el usuario está autenticado, usamos /upload para registrar permanentemente en historial/DB.
            const endpoint = isAuthenticated()
                ? `${API_URL}/api/v1/files/upload`
                : `${API_URL}/convert`;

            console.log(`📡 Usando endpoint: ${endpoint} (Autenticado: ${isAuthenticated()})`);

            const headers = {};
            if (isAuthenticated()) {
                console.log('🔐 Enviando Token de seguridad para guardar en historial');
                headers['Authorization'] = `Bearer ${getToken()}`;
            } else {
                console.warn('🔓 No hay sesión activa - El documento solo se convertirá pero NO se guardará en DB');
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: headers,
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
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
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

            // Recargar historial inmediatamente tras la conversión exitosa
            if (isAuthenticated() || getUserData()) {
                console.log('🔄 Sincronizando historial con la base de datos...');
                await loadHistory();
            }

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
        } finally {
            // Restaurar botón
            convertBtn.disabled = false;
            convertBtn.innerHTML = originalText;
        }
    }

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
        const successMsg = isAuthenticated()
            ? `✅ ${pdfFilename} guardado en tu historial y listo para descargar`
            : `✅ ${currentFile.name} convertido exitosamente a PDF<br>
               <small>Tamaño: ${formatFileSize(pdfBlob.size)} • Listo para descargar</small>`;

        showSuccess(successMsg);

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
            console.log('📥 Headers disponibles:', [...response.headers.entries()]);
            console.log('📥 Content-Disposition:', contentDisposition);

            let filename = 'documento.pdf'; // Default

            if (contentDisposition) {
                // Intentar diferentes formatos de filename
                // 1. filename*=UTF-8''filename.ext (Codificado)
                const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                // 2. filename="filename.ext" (Entre comillas)
                const filenameQuoteMatch = contentDisposition.match(/filename="([^"]+)"/i);
                // 3. filename=filename.ext (Sin comillas)
                const filenameSimpleMatch = contentDisposition.match(/filename=([^; ]+)/i);

                if (filenameStarMatch && filenameStarMatch[1]) {
                    filename = decodeURIComponent(filenameStarMatch[1]);
                } else if (filenameQuoteMatch && filenameQuoteMatch[1]) {
                    filename = filenameQuoteMatch[1];
                } else if (filenameSimpleMatch && filenameSimpleMatch[1]) {
                    filename = filenameSimpleMatch[1];
                }
            } else {
                console.warn('⚠️ No Content-Disposition header found, falling back to default name.');
                // Intentar derivar extensión del content-type
                const contentType = response.headers.get('content-type');
                if (contentType) {
                    if (contentType.includes('word')) filename = 'documento.docx';
                    else if (contentType.includes('sheet')) filename = 'documento.xlsx';
                    else if (contentType.includes('presentation')) filename = 'documento.pptx';
                }
            }

            console.log('📝 Nombre final del archivo a descargar:', filename);

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

    // Cerrar mensajes de estado
    function closeStatusModals() {
        if (statusOverlay) statusOverlay.style.display = 'none';
        if (successMessage) {
            successMessage.style.display = 'none';
            successMessage.classList.remove('show');
        }
        if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.classList.remove('show');
        }
    }

    if (closeSuccess) closeSuccess.addEventListener('click', closeStatusModals);
    if (closeError) closeError.addEventListener('click', closeStatusModals);
    if (closeErrorBtn) closeErrorBtn.addEventListener('click', closeStatusModals);
    if (statusOverlay) {
        statusOverlay.addEventListener('click', function (e) {
            if (e.target === statusOverlay) closeStatusModals();
        });
    }

    // Mostrar mensaje de éxito
    function showSuccess(message = '¡Operación completada!') {
        if (successMessage) {
            const successTitle = document.getElementById('successTitle');
            const successText = document.getElementById('successMessageText');

            // Lógica para el título según el tipo de mensaje
            if (message.includes('eliminado')) {
                if (successTitle) successTitle.innerHTML = message;
                if (successText) successText.innerHTML = '';
            } else if (message.includes('convertido')) {
                if (successTitle) successTitle.innerHTML = '¡Conversión completada!';
                if (successText) successText.innerHTML = message;
            } else {
                if (successTitle) successTitle.innerHTML = '¡Éxito!';
                if (successText) successText.innerHTML = message;
            }

            // Mostrar botón de descarga solo si es un mensaje de conversión (contiene "convertido")
            if (downloadLinkContainer) {
                if (message.includes('convertido')) {
                    downloadLinkContainer.style.display = 'block';
                } else {
                    downloadLinkContainer.style.display = 'none';
                }
            }

            if (statusOverlay) statusOverlay.style.display = 'flex';
            successMessage.style.display = 'flex';
            successMessage.classList.add('show');

            if (errorMessage) {
                errorMessage.style.display = 'none';
                errorMessage.classList.remove('show');
            }

            // Ocultar después de 6 segundos (un poco más para que de tiempo a ver el botón)
            setTimeout(() => {
                if (successMessage.classList.contains('show')) {
                    closeStatusModals();
                }
            }, 6000);
        }
    }

    // Mostrar mensaje de error
    function showError(message) {
        if (errorMessage) {
            const errorTitle = document.getElementById('errorTitle');
            const errorText = document.getElementById('errorMessageText');

            if (errorTitle) errorTitle.innerHTML = 'Ocurrió un problema';
            if (errorText) {
                errorText.textContent = message;
            }

            if (statusOverlay) statusOverlay.style.display = 'flex';
            errorMessage.style.display = 'flex';
            errorMessage.classList.add('show');

            if (successMessage) {
                successMessage.style.display = 'none';
                successMessage.classList.remove('show');
            }
        }
    }

    // Ocultar todos los mensajes
    function hideMessages() {
        closeStatusModals();
    }

    // ========== FUNCIONALIDAD DE COMPARTIR ==========

    // Elementos del modal
    const shareModal = document.getElementById('shareModal');
    const shareForm = document.getElementById('shareForm');
    const closeModal = document.querySelector('.close-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    let currentShareDocId = null;

    // Función para abrir modal
    function openShareModal(docId, docName) {
        currentShareDocId = docId;
        const nameEl = document.getElementById('shareFileName');
        if (nameEl) nameEl.textContent = docName;

        const emailInput = document.getElementById('shareEmail');
        if (emailInput) emailInput.value = '';

        const levelSelect = document.getElementById('shareLevel');
        if (levelSelect) levelSelect.value = 'viewer';

        // Limpiar errores previos
        const errorEl = document.getElementById('shareError');
        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
        }

        if (shareModal) shareModal.style.display = 'block';
    }

    // Cerrar modal
    function closeShareModal() {
        if (shareModal) shareModal.style.display = 'none';
        currentShareDocId = null;
    }

    if (closeModal) closeModal.addEventListener('click', closeShareModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeShareModal);

    // Cerrar si se hace click fuera
    window.addEventListener('click', function (event) {
        if (event.target == shareModal) {
            closeShareModal();
        }
    });

    // Manejar envío formulario compartir
    if (shareForm) {
        shareForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('shareEmail').value;
            const level = document.getElementById('shareLevel').value;
            const errorEl = document.getElementById('shareError');

            if (!email || !currentShareDocId) return;

            // Limpiar error previo
            if (errorEl) {
                errorEl.style.display = 'none';
                errorEl.textContent = '';
            }

            // Validar dominio
            if (!email.toLowerCase().endsWith('@itb.edu.ec')) {
                if (errorEl) {
                    errorEl.textContent = 'Correo inválido: debe ser @itb.edu.ec';
                    errorEl.style.display = 'block';
                } else {
                    alert('Correo inválido: debe ser @itb.edu.ec'); // Fallback
                }
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compartiendo...';

            try {
                await shareDocument(currentShareDocId, email, level);
                closeShareModal();
                showSuccess(`Documento compartido con <b>${email}</b> correctamente.`);
                // Recargar historial para mostrar la etiqueta "Compartido" inmediatamente
                loadHistory();
            } catch (error) {
                console.error('Error compartiendo:', error);

                if (errorEl) {
                    // Mostrar error en el modal
                    errorEl.textContent = error.message || 'Error al compartir el documento';
                    errorEl.style.display = 'block';
                } else {
                    alert(error.message || 'Error al compartir el documento');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // API Call para compartir
    async function shareDocument(docId, email, level) {
        try {
            const response = await fetch(`${API_URL}/api/v1/files/${docId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    permission_level: level
                })
            });

            if (response.status === 401) {
                console.error('🔒 Sesión expirada detectada al compartir');
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 404) {
                    throw new Error('Usuario no encontrado');
                }
                throw new Error(errorData.detail || 'Error al compartir');
            }

            return await response.json();
        } catch (error) {
            throw error;
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
});