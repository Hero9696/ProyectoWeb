// Variables globales para almacenar TODAS las listas (Reutilizadas del módulo Encargado)
let listaEncargados = []; 
let listaPaises = [];
let listaDepartamentos = [];
let listaMunicipios = [];
let listaLugares = [];
let listaBeneficiarios = []; // Lista necesaria para el filtro de beneficiarios

const API_BASE = 'http://localhost:3000/api';

// Objeto para mantener el Encargado ID activo (Para el registro individual)
let encargadoAsignado = null; 

// ************************************************************
// NUEVO: Variables Específicas para el Lote y Actualización
// ************************************************************
let loteBeneficiarios = []; 
let loteEncargadoAsignado = null; // Encargado asignado al modal de lote
let encargadoActualizar = null; // Guarda el objeto encargado encontrado en el Paso 1 (Actualizar)
let nuevoEncargadoReasignado = null; // Guarda el objeto del nuevo encargado (si hay reasignación)

// ************************************************************
// FUNCIONES DE UTILIDAD
// ************************************************************

function obtenerFechaHoraActual() {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, '0');
    const day = String(ahora.getDate()).padStart(2, '0');
    const fecha = `${year}-${month}-${day}`;
    const hours = String(ahora.getHours()).padStart(2, '0');
    const minutes = String(ahora.getMinutes()).padStart(2, '0');
    const seconds = String(ahora.getSeconds()).padStart(2, '0');
    const hora = `${hours}:${minutes}:${seconds}`;

    return { fecha, hora };
}

async function cargarTodosLosDatosIniciales() {
    // Carga inicial de Encargados y listas de ubicación
    try {
        const [resEncargados, resPaises, resDepartamentos, resMunicipios, resLugares, resBeneficiarios] = await Promise.all([
            fetch(`${API_BASE}/encargados`),
            fetch(`${API_BASE}/paises`),
            fetch(`${API_BASE}/departamentos`),
            fetch(`${API_BASE}/municipios`),
            fetch(`${API_BASE}/lugares`),
            fetch(`${API_BASE}/beneficiarios`) // Carga Beneficiarios para el reporte/actualización
        ]);

        if (!resEncargados.ok || !resPaises.ok || !resDepartamentos.ok || !resMunicipios.ok || !resLugares.ok || !resBeneficiarios.ok) {
            throw new Error('Error al cargar datos iniciales del servidor.');
        }

        listaEncargados = await resEncargados.json();
        listaPaises = await resPaises.json();
        listaDepartamentos = await resDepartamentos.json();
        listaMunicipios = await resMunicipios.json();
        listaLugares = await resLugares.json();
        listaBeneficiarios = await resBeneficiarios.json(); // Se carga la lista completa de beneficiarios
        
        console.log("Datos iniciales de encargados y ubicación cargados.");

        // Inicializar la cascada principal al cargar datos
        cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene');

    } catch (error) {
        console.error("⛔ Error Crítico:", error);
        alert("Error al cargar datos del servidor. Verifique que la API esté corriendo.");
    }
}

function rellenarSelect(selectId, dataArray, valueKey, textKey, defaultText, valorSeleccionado = null) {
    const selectElement = document.getElementById(selectId);
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    
    if (!dataArray || dataArray.length === 0) {
        selectElement.disabled = true;
        return;
    }
    
    selectElement.disabled = false;
    
    dataArray.forEach(item => {
        const value = item[valueKey];
        const text = item[textKey];
        const selected = (valorSeleccionado !== null && value == valorSeleccionado) ? 'selected' : '';
        selectElement.innerHTML += `<option value="${value}" ${selected}>${text}</option>`;
    });
}

// LÓGICA DE CASCADA (REUTILIZADA)
function cargarPaises(selectPaisId, selectDeptoId, selectMuniId, selectLugarId, valorSeleccionado = null) {
    rellenarSelect(selectPaisId, listaPaises, 'idPais', 'nombrePais', 'Seleccione un País', valorSeleccionado);
    rellenarSelect(selectDeptoId, [], 'idDepartamento', 'nombreDepartamento', 'Seleccione un Departamento');
    rellenarSelect(selectMuniId, [], 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio');
    rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
}

function cargarDepartamentos(selectDeptoId, selectMuniId, selectLugarId, idPais, valorSeleccionado = null) {
    const selectMuni = document.getElementById(selectMuniId);
    const selectLugar = document.getElementById(selectLugarId);
    
    const departamentosFiltrados = listaDepartamentos.filter(d => d.idPaisDepa == idPais);
    rellenarSelect(selectDeptoId, departamentosFiltrados, 'idDepartamento', 'nombreDepartamento', 'Seleccione un Departamento', valorSeleccionado);
    rellenarSelect(selectMuniId, [], 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio');
    rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
}

function cargarMunicipios(selectMuniId, selectLugarId, idDepartamento, valorSeleccionado = null) {
    const selectLugar = document.getElementById(selectLugarId);

    const municipiosFiltrados = listaMunicipios.filter(m => m.idDepartamentoMuni == idDepartamento);
    rellenarSelect(selectMuniId, municipiosFiltrados, 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio', valorSeleccionado);
    rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
}

function cargarLugares(selectLugarId, idMunicipio, valorSeleccionado = null) {
    const lugaresFiltrados = listaLugares.filter(l => l.idMunicipioLugar == idMunicipio);
    rellenarSelect(selectLugarId, lugaresFiltrados, 'idLugar', 'nombreLugar', 'Seleccione un Lugar', valorSeleccionado);
}
// ************************************************************

/**
 * Lógica específica del módulo Beneficiarios (Registro Individual)
 */

async function validarEncargado() {
    const dpi = document.getElementById('dpiEncargadoBusqueda').value.trim();
    const mensajeDiv = document.getElementById('mensajeValidacion');
    const seccionForm = document.getElementById('seccionDatosBeneficiario');
    const infoEncargadoDiv = document.getElementById('infoEncargadoAsignado');

    mensajeDiv.textContent = 'Validando...';
    seccionForm.classList.add('d-none');
    infoEncargadoDiv.classList.add('d-none');
    encargadoAsignado = null; 
    document.getElementById('step2Badge').classList.add('disabled');
    document.getElementById('formBeneficiario').reset(); 

    if (!dpi) {
        mensajeDiv.innerHTML = '<span class="text-danger">Ingrese un DPI/Identificación para buscar.</span>';
        return;
    }

    const encargadoEncontrado = listaEncargados.find(e => e.IdentificacionEncarga === dpi);

    if (!encargadoEncontrado) {
        mensajeDiv.innerHTML = '<span class="text-danger">❌ **Error: Encargado no encontrado.** Por favor, realice primero el registro del Encargado.</span>';
        return;
    }
    
    encargadoAsignado = encargadoEncontrado;
    
    mensajeDiv.innerHTML = '<span class="text-success">✅ Encargado validado. Complete los datos del beneficiario.</span>';
    
    document.getElementById('idEncargadoBene').value = encargadoEncontrado.idEncargado; 
    document.getElementById('nombreEncargadoAsignado').textContent = `${encargadoEncontrado.nombreCompleto} (${encargadoEncontrado.IdentificacionEncarga})`;

    infoEncargadoDiv.classList.remove('d-none');
    seccionForm.classList.remove('d-none');
    document.getElementById('step2Badge').classList.remove('disabled');

    inicializarFormularioBeneficiario();
}

function inicializarFormularioBeneficiario() {
    // 1. Auto-sellado de Fecha/Hora de Ingreso
    const { fecha, hora } = obtenerFechaHoraActual();
    const inputFecha = document.getElementById('fechaIngresoBene');
    const inputHora = document.getElementById('horaIngresoBene');
    
    inputFecha.value = fecha;
    inputHora.value = hora.substring(0, 5); // HH:MM
    
    inputFecha.classList.add('bg-light');
    inputHora.classList.add('bg-light');

    // 2. Carga de la cascada
    cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene');
}


async function guardarBeneficiario(e) {
    e.preventDefault(); 
    const form = e.target;
    
    if (!encargadoAsignado) {
        alert("Error: No hay Encargado asignado. Vuelva al Paso 1.");
        return;
    }
    
    // --- CAPTURA Y VALIDACIÓN CRÍTICA ---
    const idEncargado = parseInt(document.getElementById('idEncargadoBene').value) || 0;
    const idPais = parseInt(form.idPaisBene.value) || 0; 
    const idDepartamento = parseInt(form.idDepartamentoBene.value) || 0; 
    const idMunicipio = parseInt(form.idMunicipioBene.value) || 0; 
    const idLugar = parseInt(form.idLugarBene.value) || 0;
    
    const nombre1 = form.nombre1Beneficiario.value.trim();
    const apellido1 = form.apellido1Beneficiario.value.trim();
    
    // Manejo de IDs de Usuario
    const idUsuarioIngreso = parseInt(form.idUsuarioIngreso.value) || 1;
    const idUsuarioActualiza = parseInt(form.idUsuarioActualiza.value) || 1;
    
    // Validación crítica (Asegura que los campos clave tengan texto y IDs válidos)
    if (!nombre1 || !apellido1 || idLugar === 0 || idEncargado === 0 || idPais === 0 || idDepartamento === 0 || idMunicipio === 0) {
        alert("Error: Por favor, complete los campos obligatorios (Primer Nombre, Primer Apellido y toda la cascada de Ubicación).");
        return;
    }
    
    // CONSTRUCCIÓN DEL OBJETO DE DATOS con TODOS los 18 campos NOT NULL
    const data = {
        // --- 1. Nombres y Apellidos (Usamos " " para evadir NOT NULL si están vacíos) ---
        "nombre1Beneficiario": nombre1,
        "nombre2Beneficiario": form.nombre2Beneficiario.value || " ", 
        "nombre3Beneficiario": form.nombre3Beneficiario.value || " ", 
        "apellido1Beneficiario": apellido1,
        "apellido2Beneficiario": form.apellido2Beneficiario.value || " ", 
        "apellido3Beneficiario": form.apellido3Beneficiario.value || " ", 
        
        // --- 2. Ubicación y Encargado (INT UNSIGNED NOT NULL) ---
        "idPaisBene": idPais,
        "idDepartamentoBene": idDepartamento,
        "idMunicipioBene": idMunicipio,
        "idLugarBene": idLugar,
        "idEncargadoBene": idEncargado, // Campo clave asociado
        
        // --- 3. Estado y Auditoría de Ingreso ---
        "estadoBeneficiario": form.estadoBeneficiario.value || "A", 
        "fechaIngresoBene": form.fechaIngresoBene.value || "2000-01-01", 
        "horaIngresoBene": form.horaIngresoBene.value || "00:00:00", 
        "idUsuarioIngreso": idUsuarioIngreso,
        
        // --- 4. Auditoría de Actualización (Usamos valores de Ingreso o default) ---
        "fechaActualizacion": form.fechaActualizacion.value || form.fechaIngresoBene.value || "2000-01-01", 
        "horaActualizacion": form.horaActualizacion.value || form.horaIngresoBene.value || "00:00:00",     
        "idUsuarioActualiza": idUsuarioActualiza, 
    };
    
    // ENVÍO DE DATOS A LA API
    try {
        const response = await fetch(`${API_BASE}/beneficiarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Respuesta de error de API (POST):", errorText);
            throw new Error(`Error en el servidor: ${errorText}`);
        }
        
        alert("Beneficiario creado exitosamente. 🎉");
        
        // Resetear la UI después de guardar
        document.getElementById('btnLimpiarTodo').click(); 
        
    } catch (error) {
        console.error("Error al crear beneficiario:", error);
        alert(`Error al crear beneficiario: ${error.message || 'Error desconocido.'}. Verifique el log del servidor.`);
    }
}


// ************************************************************
// FUNCIONES DE ACTUALIZACIÓN (NUEVAS)
// ************************************************************

/**
 * Paso 1: Busca al Encargado y Muestra la Lista de Beneficiarios Asociados
 */
async function buscarEncargadoParaActualizacion() {
    const dpi = document.getElementById('actDpiEncargadoBusqueda').value.trim();
    const mensajeDiv = document.getElementById('actMensajeValidacion');
    const listaDiv = document.getElementById('actListaBeneficiarios');
    const nombreHdr = document.getElementById('actNombreEncargadoAsignado');
    const tablaBody = document.getElementById('actTablaBeneficiariosBody');

    mensajeDiv.textContent = 'Buscando...';
    listaDiv.classList.add('d-none');
    tablaBody.innerHTML = '';
    encargadoActualizar = null;

    if (!dpi) {
        mensajeDiv.innerHTML = '<span class="text-danger">Ingrese un DPI/Identificación.</span>';
        return;
    }

    // 1. Buscar el encargado en la lista cargada
    const encargado = listaEncargados.find(e => e.IdentificacionEncarga === dpi);

    if (!encargado) {
        mensajeDiv.innerHTML = '<span class="text-danger">❌ Encargado no encontrado.</span>';
        return;
    }
    
    encargadoActualizar = encargado;
    
    // 2. Filtrar beneficiarios asociados a ese encargado (match por nombre)
    const nombreCompletoEncargado = encargado.nombreCompleto ? encargado.nombreCompleto.toLowerCase() : '';
    // NOTA: Usamos la lista de Beneficiarios cargada globalmente 
    const beneficiariosAsociados = listaBeneficiarios.filter(b => 
        b.nombreEncargado && b.nombreEncargado.toLowerCase() === nombreCompletoEncargado
    );
    
    // 3. Rellenar la tabla de selección
    if (beneficiariosAsociados.length > 0) {
        beneficiariosAsociados.forEach(b => {
            const row = tablaBody.insertRow();
            row.innerHTML = `
                <td>${b.idBeneficiario}</td>
                <td>${b.nombreCompleto}</td>
                <td>${b.estadoBeneficiario === 'A' ? 'Activo' : 'Inactivo'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="cargarBeneficiarioParaEdicion(${b.idBeneficiario})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                </td>
            `;
        });
        
        nombreHdr.textContent = encargado.nombreCompleto;
        listaDiv.classList.remove('d-none');
        mensajeDiv.textContent = '✅ Beneficiarios encontrados. Seleccione uno para modificar.';
    } else {
        mensajeDiv.innerHTML = '<span class="text-warning">⚠️ No se encontraron beneficiarios asociados a este encargado.</span>';
    }
}


/**
 * Paso 2/3: Carga los datos del beneficiario seleccionado en el formulario de edición
 */
async function cargarBeneficiarioParaEdicion(idBeneficiario) {
    const paso1 = document.getElementById('actPaso1BusquedaEncargado');
    const paso2 = document.getElementById('actPaso2Formulario');
    const nombreHdr = document.getElementById('actBeneficiarioNombreHdr');

    paso1.classList.add('d-none'); // Ocultar lista de selección
    paso2.classList.remove('d-none'); // Mostrar formulario de edición
    
    // 1. Llamar al endpoint detallado
    try {
        const response = await fetch(`${API_BASE}/beneficiarios/${idBeneficiario}`);
        if (!response.ok) throw new Error('Error al obtener datos detallados.');
        
        const b = await response.json(); // b es el objeto beneficiario detallado

        // 2. Mapear datos al formulario
        nombreHdr.textContent = `${b.nombre1Beneficiario} ${b.apellido1Beneficiario} (ID: ${b.idBeneficiario})`;
        document.getElementById('actIdBeneficiario').value = b.idBeneficiario;
        document.getElementById('actIdEncargadoBene').value = b.idEncargadoBene; // ID del encargado actual
        
        // Nombres y Apellidos
        document.getElementById('actNombre1').value = b.nombre1Beneficiario || '';
        document.getElementById('actNombre2').value = b.nombre2Beneficiario || '';
        document.getElementById('actNombre3').value = b.nombre3Beneficiario || '';
        document.getElementById('actApellido1').value = b.apellido1Beneficiario || '';
        document.getElementById('actApellido2').value = b.apellido2Beneficiario || '';
        document.getElementById('actApellido3').value = b.apellido3Beneficiario || '';
        
        // Estado
        document.getElementById('actEstadoBeneficiario').value = b.estadoBeneficiario || 'A';

        // Auditoría (Auto-sellar Fecha/Hora de Actualización)
        const { fecha, hora } = obtenerFechaHoraActual();
        document.getElementById('actFechaActualizacion').value = fecha;
        document.getElementById('actHoraActualizacion').value = hora.substring(0, 5); 
        document.getElementById('actIdUsuarioActualiza').value = b.idUsuarioActualiza || 1; 

        // Auditoría de Ingreso (Solo Lectura)
        document.getElementById('actFechaIngresoBene').value = b.fechaIngresoBene || '';
        document.getElementById('actHoraIngresoBene').value = b.horaIngresoBene || '';
        document.getElementById('actIdUsuarioIngreso').value = b.idUsuarioIngreso || '';
        
        // APLICAR SOLO LECTURA AL CONTENEDOR DE AUDITORÍA DE INGRESO
        document.getElementById('actCamposIngresoSoloLectura').querySelectorAll('input').forEach(input => {
            if (input.type !== 'hidden') {
                input.setAttribute('readonly', 'readonly');
                input.classList.add('bg-light');
            }
        });


        // 3. Inicializar Cascada de Ubicación
        const idPais = b.idPaisBene || null;
        const idDepto = b.idDepartamentoBene || null;
        const idMuni = b.idMunicipioBene || null;
        const idLugar = b.idLugarBene || null;
        
        // Cargar cascada con valores pre-seleccionados
        cargarPaises('actIdPaisBene', 'actIdDepartamentoBene', 'actIdMunicipioBene', 'actIdLugarBene', idPais);
        if (idPais) cargarDepartamentos('actIdDepartamentoBene', 'actIdMunicipioBene', 'actIdLugarBene', idPais, idDepto);
        if (idDepto) cargarMunicipios('actIdMunicipioBene', 'actIdLugarBene', idDepto, idMuni);
        if (idMuni) cargarLugares('actIdLugarBene', idMuni, idLugar);
        
        document.getElementById('actIdLugarBene').value = idLugar; // Set final value
        
        // Lógica de reasignación (limpiar mensaje y campo DPI)
        document.getElementById('actNuevoDpiEncargado').value = '';
        document.getElementById('actMensajeReasignacion').textContent = '';

    } catch (error) {
        alert("No se pudieron cargar los datos del beneficiario. Revise el log.");
        console.error("Error al cargar beneficiario por ID:", error);
        paso1.classList.remove('d-none');
        paso2.classList.add('d-none');
    }
}

/**
 * Paso 4/5: Guardar los Cambios (PUT)
 */
async function guardarCambiosBeneficiario() {
    const form = document.getElementById('formActualizarBeneficiario');
    const idBeneficiario = document.getElementById('actIdBeneficiario').value;
    
    // 1. Validación de Reasignación de Encargado (Opcional)
    const nuevoDpiEncargado = document.getElementById('actNuevoDpiEncargado').value.trim();
    let nuevoIdEncargado = document.getElementById('actIdEncargadoBene').value; // ID actual

    if (nuevoDpiEncargado) {
        const nuevoEncargado = listaEncargados.find(e => e.IdentificacionEncarga === nuevoDpiEncargado);
        if (!nuevoEncargado) {
            document.getElementById('actMensajeReasignacion').textContent = 'Error: Nuevo DPI de encargado no válido.';
            return;
        }
        nuevoIdEncargado = nuevoEncargado.idEncargado; // Asignar nuevo ID
    }
    
    // 2. Captura de Datos (Todos los campos NOT NULL)
    const data = {
        "idEncargadoBene": parseInt(nuevoIdEncargado), 
        "idUsuarioActualiza": parseInt(document.getElementById('actIdUsuarioActualiza').value) || 1, 
        
        // Nombres y Apellidos (Usamos " " para evadir NOT NULL si está vacío)
        "nombre1Beneficiario": form.nombre1Beneficiario.value || "",
        "nombre2Beneficiario": form.nombre2Beneficiario.value || " ", 
        "nombre3Beneficiario": form.nombre3Beneficiario.value || " ", 
        "apellido1Beneficiario": form.apellido1Beneficiario.value || "",
        "apellido2Beneficiario": form.apellido2Beneficiario.value || " ", 
        "apellido3Beneficiario": form.apellido3Beneficiario.value || " ", 

        // Ubicación (Se asume que la cascada tiene el valor correcto)
        "idPaisBene": parseInt(form.idPaisBene.value) || 0,
        "idDepartamentoBene": parseInt(form.idDepartamentoBene.value) || 0,
        "idMunicipioBene": parseInt(form.idMunicipioBene.value) || 0,
        "idLugarBene": parseInt(form.idLugarBene.value) || 0,
        
        "estadoBeneficiario": form.estadoBeneficiario.value,
        
        // Auditoría (Tomar valores del formulario, incluyendo los de solo lectura)
        "fechaIngresoBene": document.getElementById('actFechaIngresoBene').value,
        "horaIngresoBene": document.getElementById('actHoraIngresoBene').value,
        "idUsuarioIngreso": parseInt(document.getElementById('actIdUsuarioIngreso').value) || 0,
        "fechaActualizacion": document.getElementById('actFechaActualizacion').value,
        "horaActualizacion": document.getElementById('actHoraActualizacion').value,
    };
    
    // 3. Envío del PUT
    try {
        const response = await fetch(`${API_BASE}/beneficiarios/${idBeneficiario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en el servidor: ${errorText}`);
        }
        
        alert(`Beneficiario ID ${idBeneficiario} actualizado exitosamente.`);
        
        // Cerrar modal y refrescar datos
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalActualizarBeneficiario'));
        if (modal) modal.hide();
        cargarTodosLosDatosIniciales();

    } catch (error) {
        console.error("Error al actualizar beneficiario:", error);
        alert(`Error al actualizar beneficiario: ${error.message || 'Error desconocido.'}`);
    }
}


// ************************************************************
// FUNCIONES ESPECÍFICAS DE REGISTRO POR LOTE (Mantengo)
// ************************************************************

/**
 * Función para validar el DPI del encargado dentro del modal de lotes.
 */
async function validarEncargadoLote() {
    const dpi = document.getElementById('dpiEncargadoBusquedaLote').value.trim();
    const mensajeDiv = document.getElementById('loteMensajeValidacion');
    const infoDiv = document.getElementById('loteInfoEncargado');
    const seccionForm = document.getElementById('loteSeccionFormulario');

    mensajeDiv.textContent = 'Validando...';
    infoDiv.classList.add('d-none');
    seccionForm.classList.add('d-none');
    loteEncargadoAsignado = null; 

    if (!dpi) {
        mensajeDiv.innerHTML = '<span class="text-danger">Ingrese un DPI/Identificación para el lote.</span>';
        return;
    }

    const encargado = listaEncargados.find(e => e.IdentificacionEncarga === dpi);

    if (!encargado) {
        mensajeDiv.innerHTML = '<span class="text-danger">❌ **Error:** Encargado no encontrado para el lote.</span>';
        return;
    }
    
    // Asignar encargado
    loteEncargadoAsignado = encargado;
    document.getElementById('loteIdEncargado').value = encargado.idEncargado; 
    document.getElementById('loteNombreEncargado').textContent = `${encargado.nombreCompleto} (${encargado.IdentificacionEncarga})`;
    
    mensajeDiv.innerHTML = '<span class="text-success">✅ Encargado asignado. Agregue beneficiarios.</span>';
    infoDiv.classList.remove('d-none');
    seccionForm.classList.remove('d-none');
    
    // Inicializar el formulario del lote
    inicializarFormularioLote();
}

/**
 * Función que inicializa la cascada y fechas del formulario dentro del modal de lote.
 */
function inicializarFormularioLote() {
    // 1. Auto-sellado de Fecha/Hora
    const { fecha, hora } = obtenerFechaHoraActual();
    const formLote = document.getElementById('formBeneficiarioLote');
    
    formLote.reset();

    // Asumimos que los inputs del modal de lote tienen los names correctos
    formLote.querySelector('[name="fechaIngresoBene"]').value = fecha;
    formLote.querySelector('[name="horaIngresoBene"]').value = hora.substring(0, 5); 
    
    // 2. Carga de la cascada (usando los IDs específicos del modal de lote)
    cargarPaises('loteIdPaisBene', 'loteIdDepartamentoBene', 'loteIdMunicipioBene', 'loteIdLugarBene');
}

/**
 * Función para agregar un beneficiario del formulario a la lista en memoria.
 */
function agregarBeneficiarioAlLote() {
    const form = document.getElementById('formBeneficiarioLote');
    const mensajeDiv = document.getElementById('loteMensajeValidacion');

    // 1. Validar que haya un encargado asignado
    if (!loteEncargadoAsignado) {
        mensajeDiv.innerHTML = '<span class="text-danger">❌ **Error:** Debe validar un Encargado primero.</span>';
        return;
    }
    
    // 2. Captura y Validación
    const nombre1 = form.nombre1Beneficiario.value.trim();
    const apellido1 = form.apellido1Beneficiario.value.trim();
    
    const idPais = parseInt(form.idPaisBene.value) || 0;
    const idDepto = parseInt(form.idDepartamentoBene.value) || 0;
    const idMuni = parseInt(form.idMunicipioBene.value) || 0;
    const idLugar = parseInt(form.idLugarBene.value) || 0;

    // Validación crítica
    if (!nombre1 || !apellido1 || idLugar === 0 || idPais === 0 || idDepto === 0 || idMuni === 0) {
        alert("Faltan campos obligatorios (Primer Nombre, Primer Apellido o completar toda la Ubicación) en el formulario de lote.");
        return;
    }

    // 3. Crear el objeto de datos completo para el lote (Misma estructura del POST)
    const dataBeneficiario = {
        // IDs Clave
        "idEncargadoBene": loteEncargadoAsignado.idEncargado,
        "idUsuarioIngreso": parseInt(form.idUsuarioIngreso.value) || 1,
        
        // Nombres y Apellidos (Usamos " " para NOT NULL si está vacío)
        "nombre1Beneficiario": nombre1,
        "nombre2Beneficiario": form.nombre2Beneficiario.value || " ", 
        "nombre3Beneficiario": form.nombre3Beneficiario.value || " ", 
        "apellido1Beneficiario": apellido1,
        "apellido2Beneficiario": form.apellido2Beneficiario.value || " ", 
        "apellido3Beneficiario": form.apellido3Beneficiario.value || " ", 
        
        // Ubicación
        "idPaisBene": idPais,
        "idDepartamentoBene": idDepto,
        "idMunicipioBene": idMuni,
        "idLugarBene": idLugar,
        
        // Estado y Auditoría (Auto-sellada)
        "estadoBeneficiario": form.estadoBeneficiario.value || "A", 
        "fechaIngresoBene": form.fechaIngresoBene.value || obtenerFechaHoraActual().fecha, 
        "horaIngresoBene": form.horaIngresoBene.value || obtenerFechaHoraActual().hora, 

        "fechaActualizacion": form.fechaIngresoBene.value || obtenerFechaHoraActual().fecha, 
        "horaActualizacion": form.horaIngresoBene.value || obtenerFechaHoraActual().hora,     
        "idUsuarioActualiza": parseInt(form.idUsuarioActualiza.value) || 1, 
    };
    
    // 4. Agregar a la lista y actualizar UI
    loteBeneficiarios.push(dataBeneficiario);
    actualizarListaLoteUI();
    inicializarFormularioLote(); // Limpiar el formulario para el siguiente
    mensajeDiv.innerHTML = `<span class="text-success">✅ Beneficiario "${nombre1}" agregado a la cola.</span>`;
}

/**
 * Función para actualizar el contador y la tabla de beneficiarios en el modal.
 */
function actualizarListaLoteUI() {
    const tablaBody = document.getElementById('loteTablaBeneficiarios');
    const contador = document.getElementById('loteContador');
    const contadorFinal = document.getElementById('loteFinalContador');
    const btnGuardarFinal = document.getElementById('btnGuardarLoteFinal');
    
    tablaBody.innerHTML = ''; // Limpiar tabla
    
    loteBeneficiarios.forEach((b, index) => {
        const row = tablaBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${b.nombre1Beneficiario} ${b.apellido1Beneficiario}</td>
            <td>ID Lugar: ${b.idLugarBene}</td>
            <td><button class="btn btn-danger btn-sm" onclick="eliminarBeneficiarioLote(${index})"><i class="bi bi-dash-circle"></i></button></td>
        `;
    });
    
    contador.textContent = loteBeneficiarios.length;
    contadorFinal.textContent = loteBeneficiarios.length;

    // Habilitar el botón final si hay al menos un beneficiario
    btnGuardarFinal.disabled = loteBeneficiarios.length === 0;
}

/**
 * Función para eliminar un beneficiario de la lista en memoria.
 */
function eliminarBeneficiarioLote(index) {
    if (confirm(`¿Está seguro de eliminar a ${loteBeneficiarios[index].nombre1Beneficiario} del lote?`)) {
        loteBeneficiarios.splice(index, 1);
        actualizarListaLoteUI();
    }
}

/**
 * Función final para enviar todos los beneficiarios del lote a la API.
 */
async function guardarLoteFinal() {
    if (loteBeneficiarios.length === 0) {
        alert("El lote está vacío. Agregue al menos un beneficiario.");
        return;
    }
    
    const totalRegistros = loteBeneficiarios.length;
    
    // Usaremos Promise.all para enviar todas las peticiones a la API en paralelo
    const promesas = loteBeneficiarios.map(data => 
        fetch(`${API_BASE}/beneficiarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
    );
    
    alert(`Iniciando el guardado de ${totalRegistros} beneficiarios...`);
    
    try {
        const resultados = await Promise.all(promesas);
        const errores = resultados.filter(res => !res.ok);
        
        if (errores.length > 0) {
            alert(`ATENCIÓN: Se guardaron ${totalRegistros - errores.length} beneficiarios, pero ${errores.length} fallaron. Revise la consola para detalles.`);
        } else {
            alert("✅ ¡Lote completo guardado exitosamente!");
        }
        
        // Limpiar el lote después de intentar el guardado
        loteBeneficiarios = [];
        actualizarListaLoteUI();
        
        // Limpiar el estado del modal
        document.getElementById('dpiEncargadoBusquedaLote').value = '';
        document.getElementById('loteMensajeValidacion').textContent = '';
        document.getElementById('loteInfoEncargado').classList.add('d-none');
        document.getElementById('loteSeccionFormulario').classList.add('d-none');
        loteEncargadoAsignado = null;
        
        // Cerrar el modal (si se usa Bootstrap 5)
        const modalElement = document.getElementById('modalRegistroLote');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();

        // Si se guarda el lote, refrescamos la lista de encargados y datos maestros
        cargarTodosLosDatosIniciales(); 
        
    } catch (error) {
        console.error("Error crítico durante el procesamiento del lote:", error);
        alert("Error crítico: No se pudo completar la comunicación con el servidor.");
    }
}


// ************************************************************
// ENLACE DE EVENTOS AL DOM
// ************************************************************

document.addEventListener('DOMContentLoaded', () => {
    cargarTodosLosDatosIniciales();
    
    // Referencias de Selectores (Registro Individual)
    const selectPais = document.getElementById('idPaisBene');
    const selectDepto = document.getElementById('idDepartamentoBene');
    const selectMuni = document.getElementById('idMunicipioBene');
    const selectLugar = document.getElementById('idLugarBene');
    
    // Referencias de Selectores (Registro por Lote)
    const selectPaisLote = document.getElementById('loteIdPaisBene');
    const selectDeptoLote = document.getElementById('loteIdDepartamentoBene');
    const selectMuniLote = document.getElementById('loteIdMunicipioBene');
    const selectLugarLote = document.getElementById('loteIdLugarBene');
    
    // Lógica de Validación Individual
    document.getElementById('btnValidarEncargado').addEventListener('click', validarEncargado);

    // Lógica de Guardado Individual
    document.getElementById('formBeneficiario').addEventListener('submit', guardarBeneficiario);

    // Lógica de Limpieza Total
    document.getElementById('btnLimpiarTodo').addEventListener('click', () => {
        document.getElementById('formBeneficiario').reset();
        document.getElementById('dpiEncargadoBusqueda').value = '';
        document.getElementById('seccionDatosBeneficiario').classList.add('d-none');
        document.getElementById('infoEncargadoAsignado').classList.add('d-none');
        document.getElementById('mensajeValidacion').textContent = '';
        document.getElementById('step2Badge').classList.add('disabled');
        encargadoAsignado = null;
        cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene'); // Recargar cascada individual
    });

    // Lógica de Cascada Individual
    selectPais.addEventListener('change', (e) => cargarDepartamentos(selectDepto.id, selectMuni.id, selectLugar.id, e.target.value));
    selectDepto.addEventListener('change', (e) => cargarMunicipios(selectMuni.id, selectLugar.id, e.target.value));
    selectMuni.addEventListener('change', (e) => cargarLugares(selectLugar.id, e.target.value));
    
    // --- LÓGICA DE EVENTOS DE LOTE (NUEVA) ---
    // Validación de Encargado en Lote
    document.getElementById('btnValidarEncargadoLote').addEventListener('click', validarEncargadoLote);
    
    // Agregar Beneficiario a la lista en memoria
    document.getElementById('btnAgregarLote').addEventListener('click', agregarBeneficiarioAlLote);
    
    // Guardar todos los beneficiarios del lote
    document.getElementById('btnGuardarLoteFinal').addEventListener('click', guardarLoteFinal);
    
    // Lógica de Cascada del LOTE (Usando los IDs específicos)
    selectPaisLote.addEventListener('change', (e) => cargarDepartamentos('loteIdDepartamentoBene', 'loteIdMunicipioBene', 'loteIdLugarBene', e.target.value));
    selectDeptoLote.addEventListener('change', (e) => cargarMunicipios('loteIdMunicipioBene', 'loteIdLugarBene', e.target.value));
    selectMuniLote.addEventListener('change', (e) => cargarLugares('loteIdLugarBene', e.target.value));
    
    // Inicializar el modal de lote cuando se abre (opcional, para asegurar la limpieza)
    const modalLote = document.getElementById('modalRegistroLote');
    if (modalLote) {
        modalLote.addEventListener('show.bs.modal', inicializarFormularioLote);
    }
    
    // --- LÓGICA DE ACTUALIZACIÓN (MODAL) ---
    document.getElementById('actBtnBuscarEncargado').addEventListener('click', buscarEncargadoParaActualizacion);
    document.getElementById('actBtnGuardarCambios').addEventListener('click', guardarCambiosBeneficiario);
    
    // Lógica de Cascada en el Modal de Actualización (Activar selectores)
    document.getElementById('actIdPaisBene').addEventListener('change', (e) => cargarDepartamentos('actIdDepartamentoBene', 'actIdMunicipioBene', 'actIdLugarBene', e.target.value));
    document.getElementById('actIdDepartamentoBene').addEventListener('change', (e) => cargarMunicipios('actIdMunicipioBene', 'actIdLugarBene', e.target.value));
    document.getElementById('actIdMunicipioBene').addEventListener('change', (e) => cargarLugares('actIdLugarBene', e.target.value));

});