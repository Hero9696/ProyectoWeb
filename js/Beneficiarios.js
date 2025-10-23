// Variables globales para almacenar TODAS las listas (Reutilizadas del módulo Encargado)
let listaEncargados = []; 
let listaPaises = [];
let listaDepartamentos = [];
let listaMunicipios = [];
let listaLugares = [];

const API_BASE = 'http://localhost:3000/api';

// Objeto para mantener el Encargado ID activo
let encargadoAsignado = null; 

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
        const [resEncargados, resPaises, resDepartamentos, resMunicipios, resLugares] = await Promise.all([
            fetch(`${API_BASE}/encargados`),
            fetch(`${API_BASE}/paises`),
            fetch(`${API_BASE}/departamentos`),
            fetch(`${API_BASE}/municipios`),
            fetch(`${API_BASE}/lugares`)
        ]);

        if (!resEncargados.ok || !resPaises.ok || !resDepartamentos.ok || !resMunicipios.ok || !resLugares.ok) {
            throw new Error('Error al cargar datos iniciales del servidor.');
        }

        listaEncargados = await resEncargados.json();
        listaPaises = await resPaises.json();
        listaDepartamentos = await resDepartamentos.json();
        listaMunicipios = await resMunicipios.json();
        listaLugares = await resLugares.json();
        console.log("Datos iniciales de encargados y ubicación cargados.");

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
 * Lógica específica del módulo Beneficiarios
 */

async function validarEncargado() {
    const dpi = document.getElementById('dpiEncargadoBusqueda').value.trim();
    const mensajeDiv = document.getElementById('mensajeValidacion');
    const seccionForm = document.getElementById('seccionDatosBeneficiario');
    const infoEncargadoDiv = document.getElementById('infoEncargadoAsignado');

    mensajeDiv.textContent = 'Validando...';
    seccionForm.classList.add('d-none');
    infoEncargadoDiv.classList.add('d-none');
    encargadoAsignado = null; // Resetear encargado
    document.getElementById('step2Badge').classList.add('disabled');
    document.getElementById('formBeneficiario').reset(); // Limpiar formulario si había datos

    if (!dpi) {
        mensajeDiv.innerHTML = '<span class="text-danger">Ingrese un DPI/Identificación para buscar.</span>';
        return;
    }

    // Buscamos el encargado en la lista cargada en memoria
    const encargadoEncontrado = listaEncargados.find(e => e.IdentificacionEncarga === dpi);

    if (!encargadoEncontrado) {
        mensajeDiv.innerHTML = '<span class="text-danger">❌ **Error: Encargado no encontrado.** Por favor, realice primero el registro del Encargado.</span>';
        return;
    }
    
    // Encargado encontrado: preparamos el formulario
    encargadoAsignado = encargadoEncontrado;
    
    // Habilitar la siguiente sección
    mensajeDiv.innerHTML = '<span class="text-success">✅ Encargado validado. Complete los datos del beneficiario.</span>';
    
    // Asignar el ID del encargado al campo oculto del formulario de Beneficiario
    document.getElementById('idEncargadoBene').value = encargadoEncontrado.idEncargado; 
    document.getElementById('nombreEncargadoAsignado').textContent = `${encargadoEncontrado.nombreCompleto} (${encargadoEncontrado.IdentificacionEncarga})`;

    // Mostrar el formulario y actualizar stepper
    infoEncargadoDiv.classList.remove('d-none');
    seccionForm.classList.remove('d-none');
    document.getElementById('step2Badge').classList.remove('disabled');

    // Llenar datos de auditoría y cascada al inicio
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
    
    // **VALIDACIÓN CRÍTICA AJUSTADA:** SOLO REQUIERE nombre1, apellido1, y la cascada completa.
    if (!nombre1 || !apellido1 || idLugar === 0 || idEncargado === 0 || idPais === 0 || idDepartamento === 0 || idMunicipio === 0) {
        alert("Error: Por favor, complete los campos obligatorios (Primer Nombre, Primer Apellido y toda la cascada de Ubicación).");
        return;
    }
    
    // CONSTRUCCIÓN DEL OBJETO DE DATOS con TODOS los 18 campos NOT NULL
    const data = {
        // --- 1. Nombres y Apellidos (Usamos " " para evadir NOT NULL si están vacíos) ---
        "nombre1Beneficiario": nombre1,
        "nombre2Beneficiario": form.nombre2Beneficiario.value || " ", // Enviamos un espacio si está vacío
        "nombre3Beneficiario": form.nombre3Beneficiario.value || " ", // Enviamos un espacio si está vacío
        "apellido1Beneficiario": apellido1,
        "apellido2Beneficiario": form.apellido2Beneficiario.value || " ", // Enviamos un espacio si está vacío
        "apellido3Beneficiario": form.apellido3Beneficiario.value || " ", // Enviamos un espacio si está vacío
        
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
// ENLACE DE EVENTOS AL DOM
// ************************************************************

document.addEventListener('DOMContentLoaded', () => {
    cargarTodosLosDatosIniciales();
    
    // Referencias de Selectores
    const selectPais = document.getElementById('idPaisBene');
    const selectDepto = document.getElementById('idDepartamentoBene');
    const selectMuni = document.getElementById('idMunicipioBene');
    
    // Lógica de Validación
    document.getElementById('btnValidarEncargado').addEventListener('click', validarEncargado);

    // Lógica de Guardado
    document.getElementById('formBeneficiario').addEventListener('submit', guardarBeneficiario);

    // Lógica de Limpieza
    document.getElementById('btnLimpiarTodo').addEventListener('click', () => {
        document.getElementById('formBeneficiario').reset();
        document.getElementById('dpiEncargadoBusqueda').value = '';
        document.getElementById('seccionDatosBeneficiario').classList.add('d-none');
        document.getElementById('infoEncargadoAsignado').classList.add('d-none');
        document.getElementById('mensajeValidacion').textContent = '';
        document.getElementById('step2Badge').classList.add('disabled');
        encargadoAsignado = null;
        cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene'); // Recargar cascada
    });

    // Lógica de Cascada 
    selectPais.addEventListener('change', (e) => cargarDepartamentos(selectDepto.id, selectMuni.id, document.getElementById('idLugarBene').id, e.target.value));
    selectDepto.addEventListener('change', (e) => cargarMunicipios(selectMuni.id, document.getElementById('idLugarBene').id, e.target.value));
    selectMuni.addEventListener('change', (e) => cargarLugares(document.getElementById('idLugarBene').id, e.target.value));
});