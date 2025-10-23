// Variables globales para almacenar TODAS las listas
let listaEncargados = []; 
let listaPaises = [];
let listaDepartamentos = [];
let listaMunicipios = [];
let listaLugares = [];
let listaBeneficiarios = []; // Variable que contiene la lista de beneficiarios

const API_BASE = 'http://localhost:3000/api';

/**
 * Función que obtiene la fecha y hora actual en formato YYYY-MM-DD y HH:MM:SS
 */
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

/**
 * Función central para cargar TODOS los datos necesarios del Backend
 * (MODIFICADA para incluir Beneficiarios)
 */
async function cargarTodosLosDatosIniciales() {
    try {
        console.log("Iniciando carga de datos de ubicación, encargados y beneficiarios...");

        const [resEncargados, resPaises, resDepartamentos, resMunicipios, resLugares, resBeneficiarios] = await Promise.all([
            fetch(`${API_BASE}/encargados`),
            fetch(`${API_BASE}/paises`),
            fetch(`${API_BASE}/departamentos`),
            fetch(`${API_BASE}/municipios`),
            fetch(`${API_BASE}/lugares`),
            fetch(`${API_BASE}/beneficiarios`) // <-- Carga de Beneficiarios
        ]);

        if (!resEncargados.ok || !resPaises.ok || !resDepartamentos.ok || !resMunicipios.ok || !resLugares.ok || !resBeneficiarios.ok) {
            throw new Error('Al menos una de las peticiones a la API falló.');
        }

        listaEncargados = await resEncargados.json();
        listaPaises = await resPaises.json();
        listaDepartamentos = await resDepartamentos.json();
        listaMunicipios = await resMunicipios.json();
        listaLugares = await resLugares.json();
        listaBeneficiarios = await resBeneficiarios.json(); // <-- Asignación de Beneficiarios

        console.log("Datos iniciales de encargados, beneficiarios y ubicación cargados con éxito.");

    } catch (error) {
        console.error("⛔ Error Crítico al cargar datos iniciales:", error);
        alert("Error al cargar datos del servidor. Asegúrese que su backend (localhost:3000) esté corriendo.");
    }
}


/**
 * Función genérica para rellenar un <select> a partir de un array de datos.
 */
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


/**
 * Funciones de Carga de Listas en Cascada (USANDO MEMORIA)
 */

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


/**
 * Función para mostrar datos del encargado encontrado en texto no editable
 */
function mostrarDatosEncargado(encargado) {
    const infoDiv = document.getElementById('infoEncargadoActualizar');
    
    if (!infoDiv) return;

    infoDiv.innerHTML = `
        <h6 class="alert-heading">Encargado Encontrado (Datos Actuales):</h6>
        <div class="row mb-2">
            <div class="col-md-6">
                <strong>DPI/Identificación:</strong> ${encargado.IdentificacionEncarga || 'N/A'}<br>
                <strong>Nombre Completo:</strong> ${encargado.nombre1Encargado || ''} ${encargado.nombre2Encargado || ''} ${encargado.apellido1Encargado || ''}<br>
                <strong>Teléfono:</strong> ${encargado.telefonoEncargado || 'N/A'}<br>
                <strong>Correo:</strong> ${encargado.correoEncargado || 'N/A'}
            </div>
            <div class="col-md-6">
                <strong>Ubicación Registrada:</strong><br>
                País: ${encargado.nombrePais || 'N/A'}<br>
                Departamento: ${encargado.nombreDepartamento || 'N/A'}<br>
                Municipio: ${encargado.nombreMunicipio || 'N/A'}<br>
                Lugar: ${encargado.nombreLugar || 'N/A'}
            </div>
        </div>
        <hr class="my-2">
        <small class="mb-0">Modifique los campos individuales (Nombre 1, Apellido 1, etc.) en el formulario inferior y guarde los cambios.</small>
    `;
}


/**
 * Funciones de Verificación de DPI (Crear y Actualizar)
 */

function verificarDpiCrear() {
    const dpi = document.getElementById('dpiCrear').value.trim();
    const mensajeDiv = document.getElementById('mensajeDpiCrear');
    
    if (!dpi) {
        mensajeDiv.innerHTML = '<span class="text-danger">Por favor, ingrese el DPI.</span>';
        return;
    }

    const encargadoExistente = listaEncargados.find(e => e.IdentificacionEncarga === dpi);

    if (encargadoExistente) {
        mensajeDiv.innerHTML = '<span class="text-danger">❌ ¡Error! El encargado con este DPI ya existe.</span>';
        document.getElementById('formularioCrear').classList.add('d-none');
        document.getElementById('btnGuardarCrear').disabled = true;
    } else {
        mensajeDiv.innerHTML = '<span class="text-success">✅ DPI no registrado. Puede proceder con la creación.</span>';
        document.getElementById('IdentificacionEncargaCrear').value = dpi; 
        document.getElementById('seccionDpiCrear').classList.add('d-none');
        document.getElementById('formularioCrear').classList.remove('d-none');
        document.getElementById('btnGuardarCrear').disabled = false;
    }
}

async function verificarDpiActualizar() {
    const dpi = document.getElementById('dpiActualizar').value.trim();
    const mensajeDiv = document.getElementById('mensajeDpiActualizar');

    if (!dpi) {
        mensajeDiv.innerHTML = '<span class="text-danger">Por favor, ingrese el DPI.</span>';
        return;
    }
    
    const encargadoBusqueda = listaEncargados.find(e => e.IdentificacionEncarga === dpi);

    if (!encargadoBusqueda) {
        mensajeDiv.innerHTML = '<span class="text-danger">❌ ¡Error! Primero debes crear al encargado.</span>';
        document.getElementById('formularioActualizar').classList.add('d-none');
        document.getElementById('btnGuardarActualizar').disabled = true;
        return;
    }

    // OBTENEMOS EL ID PARA LA LLAMADA DETALLADA
    const idEncargado = encargadoBusqueda.idEncargado;
    let encargadoCompleto = null;

    try {
        mensajeDiv.innerHTML = '<span class="text-info">✅ Encargado encontrado. Obteniendo detalles completos...</span>';
        const response = await fetch(`${API_BASE}/encargados/${idEncargado}`);
        
        if (!response.ok) throw new Error('Error al obtener detalles del encargado.');
        
        encargadoCompleto = await response.json();
        
    } catch (error) {
        console.error("Error al obtener detalles del encargado:", error);
        mensajeDiv.innerHTML = '<span class="text-danger">Error al cargar datos detallados.</span>';
        return;
    }
    
    mensajeDiv.innerHTML = '<span class="text-success">✅ Detalles cargados.</span>';
    
    // Asignar el ID al campo hidden para el PUT y el DPI
    document.getElementById('idEncargadoActualizar').value = idEncargado;
    
    // 1. Ocultar verificación, mostrar formulario
    document.getElementById('seccionDpiActualizar').classList.add('d-none');
    document.getElementById('formularioActualizar').classList.remove('d-none');
    document.getElementById('btnGuardarActualizar').disabled = false;

    // 2. MOSTRAR LA INFORMACIÓN NO EDITABLE (usando los datos completos)
    mostrarDatosEncargado(encargadoCompleto);

    // 3. LLENAR EL FORMULARIO EDITABLE
    
    // Nombres y Apellidos
    document.getElementById('nombre1EncargadoActualizar').value = encargadoCompleto.nombre1Encargado || '';
    document.getElementById('nombre2EncargadoActualizar').value = encargadoCompleto.nombre2Encargado || '';
    document.getElementById('nombre3EncargadoActualizar').value = encargadoCompleto.nombre3Encargado || '';
    document.getElementById('apellido1EncargadoActualizar').value = encargadoCompleto.apellido1Encargado || '';
    document.getElementById('apellido2EncargadoActualizar').value = encargadoCompleto.apellido2Encargado || '';
    document.getElementById('apellido3EncargadoActualizar').value = encargadoCompleto.apellido3Encargado || '';
    
    // Campos de Contacto
    document.getElementById('telefonoEncargadoActualizar').value = encargadoCompleto.telefonoEncargado || '';
    document.getElementById('correoEncargadoActualizar').value = encargadoCompleto.correoEncargado || '';

    // Auditoría (FECHA/HORA ACTUALIZACIÓN SE AUTO-SELLAN AQUÍ)
    const { fecha, hora } = obtenerFechaHoraActual();
    const inputFechaAct = document.getElementById('fechaActualizacionActualizar');
    const inputHoraAct = document.getElementById('horaActualizacionActualizar');

    // 4. AUTO-SELLADO Y BLOQUEO DE AUDITORÍA DE ACTUALIZACIÓN
    inputFechaAct.value = fecha;
    inputHoraAct.value = hora.substring(0, 5); // HH:MM
    
    // FORZAR BLOQUEO DE EDICIÓN EN JAVASCRIPT
    inputFechaAct.setAttribute('readonly', 'readonly');
    inputFechaAct.classList.add('bg-secondary', 'text-white');
    
    inputHoraAct.setAttribute('readonly', 'readonly');
    inputHoraAct.classList.add('bg-secondary', 'text-white');
    
    document.getElementById('idUsuarioActualizaActualizar').value = encargadoCompleto.idUsuarioActualiza || '';

    // Campos de Auditoría SOLO LECTURA (INGRESADO)
    document.getElementById('fechaIngresoEncargaActualizar').value = encargadoCompleto.fechaIngresoEncarga || '';
    document.getElementById('horaIngresoEncargaActualizar').value = encargadoCompleto.horaIngresoEncarga || '';
    document.getElementById('idUsuarioIngresoActualizar').value = encargadoCompleto.idUsuarioIngreso || '';
    
    // APLICAR SOLO LECTURA AL CONTENEDOR DE AUDITORÍA DE INGRESO
    const contenedorSoloLectura = document.getElementById('camposIngresoSoloLectura');
    
    contenedorSoloLectura.querySelectorAll('input').forEach(input => {
        if (input.type !== 'hidden') {
            input.setAttribute('readonly', 'readonly');
            input.classList.add('bg-light');
        }
    });
    
    // 5. Cargar la cascada con los IDs del objeto completo
    const idPais = encargadoCompleto.idPaisEncargado || null; 
    const idDepartamento = encargadoCompleto.idDepartamentoEncargado || null;
    const idMunicipio = encargadoCompleto.idMuniEncarga || null; 
    const idLugar = encargadoCompleto.idLugarEncargado || null;

    // La cascada de Ubicación es EDITABLE
    cargarPaises('idPaisBeneActualizar', 'idDepartamentoBeneActualizar', 'idMunicipioBeneActualizar', 'idLugarEncargadoActualizar', idPais);
    if (idPais) cargarDepartamentos('idDepartamentoBeneActualizar', 'idMunicipioBeneActualizar', 'idLugarEncargadoActualizar', idPais, idDepartamento);
    if (idDepartamento) cargarMunicipios('idMunicipioBeneActualizar', 'idLugarEncargadoActualizar', idDepartamento, idMunicipio);
    if (idMunicipio) cargarLugares('idLugarEncargadoActualizar', idMunicipio, idLugar);
    document.getElementById('idLugarEncargadoActualizar').value = idLugar; 
}

/**
 * Funciones de Peticiones a la API (Crear y Actualizar)
 */

async function guardarNuevoEncargado() {
    // 1. OBTENER VALORES DE LA CASCADA Y DPI
    const dpi = document.getElementById('IdentificacionEncargaCrear').value; 
    const idPaisSeleccionado = parseInt(document.getElementById('idPaisBeneCrear').value) || null;
    const idDepartamentoSeleccionado = parseInt(document.getElementById('idDepartamentoBeneCrear').value) || null;
    const idMunicipioSeleccionado = parseInt(document.getElementById('idMunicipioBeneCrear').value) || null;
    const idLugarSeleccionado = parseInt(document.getElementById('idLugarEncargadoCrear').value) || null;
    
    const fechaIngreso = document.getElementById('fechaIngresoEncargaCrear').value || "";
    const horaIngreso = document.getElementById('horaIngresoEncargaCrear').value || "";
    
    // Validaciones Frontales
    if (!dpi) {
        alert("Error: La Identificación (DPI) no fue capturada correctamente.");
        return;
    }
    if (!idPaisSeleccionado || !idDepartamentoSeleccionado || !idMunicipioSeleccionado || !idLugarSeleccionado) {
         alert("Error de validación: Debe seleccionar un valor para País, Departamento, Municipio y Lugar.");
         return;
    }
    
    const data = {
        "IdentificacionEncarga": dpi,
        "nombre1Encargado": document.getElementById('nombre1EncargadoCrear').value,
        "apellido1Encargado": document.getElementById('apellido1EncargadoCrear').value,
        
        "idPaisEncargado": idPaisSeleccionado,
        "idDepartamentoEncargado": idDepartamentoSeleccionado, 
        "idMuniEncarga": idMunicipioSeleccionado, 
        "idLugarEncargado": idLugarSeleccionado,
        
        "idUsuarioIngreso": parseInt(document.getElementById('idUsuarioIngresoCrear').value),
        
        "telefonoEncargado": document.getElementById('telefonoEncargadoCrear').value || "",
        "correoEncargado": document.getElementById('correoEncargadoCrear').value || "",
        "fechaIngresoEncarga": fechaIngreso,
        "horaIngresoEncarga": horaIngreso,

        "nombre2Encargado": document.getElementById('nombre2EncargadoCrear').value || "",
        "nombre3Encargado": document.getElementById('nombre3EncargadoCrear').value || "",
        "apellido2Encargado": document.getElementById('apellido2EncargadoCrear').value || "",
        "apellido3Encargado": document.getElementById('apellido3EncargadoCrear').value || "",
    };

    try {
        const response = await fetch(`${API_BASE}/encargados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Respuesta de error de API:", errorText);
            throw new Error(`Error en el servidor (${response.status}): ${errorText}`);
        }
        
        alert("Encargado creado exitosamente. 🎉");
        document.getElementById('formCrearEncargado').reset();
        await cargarTodosLosDatosIniciales();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearEncargado'));
        if (modal) modal.hide(); 

    } catch (error) {
        console.error("Error al crear encargado:", error);
        alert(`Error al crear encargado: ${error.message || 'Error desconocido.'}`);
    }
}

async function actualizarEncargado() {
    const id = document.getElementById('idEncargadoActualizar').value;
    
    const IdentificacionEncargaActualiza = document.getElementById('dpiActualizar').value; 

    // CAPTURAMOS IDs DE UBICACIÓN (EDITABLE)
    const idPaisSeleccionado = parseInt(document.getElementById('idPaisBeneActualizar').value) || null;
    const idDepartamentoSeleccionado = parseInt(document.getElementById('idDepartamentoBeneActualizar').value) || null;
    const idMunicipioSeleccionado = parseInt(document.getElementById('idMunicipioBeneActualizar').value) || null;
    const idLugarSeleccionado = parseInt(document.getElementById('idLugarEncargadoActualizar').value) || null;
    
    const fechaActualiza = document.getElementById('fechaActualizacionActualizar').value || "";
    const horaActualiza = document.getElementById('horaActualizacionActualizar').value || "";

    const data = {
        "idUsuarioActualiza": parseInt(document.getElementById('idUsuarioActualizaActualizar').value),
        
        "IdentificacionEncarga": IdentificacionEncargaActualiza,
        
        "nombre1Encargado": document.getElementById('nombre1EncargadoActualizar').value || "", 
        "nombre2Encargado": document.getElementById('nombre2EncargadoActualizar').value || "", 
        "nombre3Encargado": document.getElementById('nombre3EncargadoActualizar').value || "", 
        "apellido1Encargado": document.getElementById('apellido1EncargadoActualizar').value || "", 
        "apellido2Encargado": document.getElementById('apellido2EncargadoActualizar').value || "", 
        "apellido3Encargado": document.getElementById('apellido3EncargadoActualizar').value || "", 

        "idPaisEncargado": idPaisSeleccionado,
        "idDepartamentoEncargado": idDepartamentoSeleccionado,
        "idMuniEncarga": idMunicipioSeleccionado,
        "idLugarEncargado": idLugarSeleccionado,

        "telefonoEncargado": document.getElementById('telefonoEncargadoActualizar').value || "",
        "correoEncargado": document.getElementById('correoEncargadoActualizar').value || "",
        
        "fechaActualizacion": fechaActualiza, 
        "horaActualizacion": horaActualiza,
        
        "fechaIngresoEncarga": document.getElementById('fechaIngresoEncargaActualizar').value || "",
        "horaIngresoEncarga": document.getElementById('horaIngresoEncargaActualizar').value || "",
        "idUsuarioIngreso": parseInt(document.getElementById('idUsuarioIngresoActualizar').value) || null,
    };

    try {
        const response = await fetch(`${API_BASE}/encargados/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
             const errorText = await response.text();
             console.error("Respuesta de error de API:", errorText);
             throw new Error(`Error en el servidor (${response.status}): ${errorText}`);
        }

        alert("Encargado actualizado exitosamente. 🎉");
        await cargarTodosLosDatosIniciales();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalActualizarEncargado'));
        if (modal) modal.hide();

    } catch (error) {
        console.error("Error al actualizar encargado:", error);
        alert("Error al actualizar encargado: " + error.message);
    }
}


/**
 * 7. Funciones de Reporte a Ventana Imprimible
 */

function generarReporteGeneralHTML(datos, tituloFiltro = "REPORTE GENERAL DE ENCARGADOS") {
    if (datos.length === 0) {
        alert("No se encontraron encargados para los filtros seleccionados.");
        return;
    }

    const fechaHoy = new Date().toLocaleDateString('es-GT', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let contenidoTabla = '';
    
    datos.forEach(e => {
        contenidoTabla += `
            <tr>
                <td>${e.idEncargado || 'N/A'}</td>
                <td>${e.IdentificacionEncarga || 'N/A'}</td>
                <td>${e.nombreCompleto || 'N/A'}</td>
                <td>${e.telefonoEncargado || 'N/A'}</td>
                <td>${e.correoEncargado || 'N/A'}</td>
                <td>${e.pais || 'N/A'}</td>
                <td>${e.lugar || 'N/A'}</td>
            </tr>
        `;
    });


    const htmlReporte = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Encargados</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 30px; }
                h1 { text-align: center; color: #333; margin-bottom: 5px; }
                .meta { text-align: center; margin-bottom: 20px; font-size: 0.9em; color: #666; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>${tituloFiltro}</h1>
            <div class="meta">Generado el: ${fechaHoy}</div>
            
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>DPI/Identificación</th>
                        <th>Nombre Completo</th>
                        <th>Teléfono</th>
                        <th>Correo Electrónico</th>
                        <th>País</th>
                        <th>Lugar</th>
                    </tr>
                </thead>
                <tbody>
                    ${contenidoTabla}
                </tbody>
            </table>

            <div class="no-print" style="text-align:center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Imprimir / Guardar como PDF
                </button>
            </div>
            
        </body>
        </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
        ventanaImpresion.document.write(htmlReporte);
        ventanaImpresion.document.close();
    } else {
        alert("El navegador bloqueó la ventana de impresión. Asegúrese de permitir pop-ups.");
    }
}

function generarReporteGeneral() {
    generarReporteGeneralHTML(listaEncargados);
}

function generarReportePorDPI() {
    const dpi = document.getElementById('dpiReporteBusqueda').value.trim();

    if (!dpi) {
        alert("Por favor, ingrese un DPI/Identificación.");
        return;
    }

    const encargado = listaEncargados.find(e => e.IdentificacionEncarga === dpi);

    if (!encargado) {
        alert(`Error: No se encontró ningún encargado con DPI: ${dpi}.`);
        return;
    }

    // Filtrar beneficiarios ASOCIADOS POR NOMBRE, convertido a minúsculas para mayor seguridad
    const nombreCompletoEncargado = encargado.nombreCompleto ? encargado.nombreCompleto.toLowerCase() : '';

    const beneficiariosAsociados = listaBeneficiarios.filter(b => 
        b.nombreEncargado && b.nombreEncargado.toLowerCase() === nombreCompletoEncargado
    );

    generarReporteDetalladoHTML(encargado, beneficiariosAsociados);
}

function generarReportePorUbicacion() {
    const idPais = document.getElementById('filtroPais').value;
    const nombrePais = document.getElementById('filtroPais').options[document.getElementById('filtroPais').selectedIndex].text;
    
    const idDepartamento = document.getElementById('filtroDepartamento').value;
    const nombreDepto = document.getElementById('filtroDepartamento').options[document.getElementById('filtroDepartamento').selectedIndex].text;

    const idMunicipio = document.getElementById('filtroMunicipio').value;
    const nombreMuni = document.getElementById('filtroMunicipio').options[document.getElementById('filtroMunicipio').selectedIndex].text;

    const idLugar = document.getElementById('filtroLugar').value;
    const nombreLugar = document.getElementById('filtroLugar').options[document.getElementById('filtroLugar').selectedIndex].text;
    
    let encargadosFiltrados = [...listaEncargados];
    let titulo = "REPORTE POR UBICACIÓN";
    
    if (idLugar) {
        encargadosFiltrados = encargadosFiltrados.filter(e => e.lugar === nombreLugar);
        titulo = `REPORTE: Lugar - ${nombreLugar}`;
    } else if (idMunicipio) {
        encargadosFiltrados = encargadosFiltrados.filter(e => e.municipio === nombreMuni);
        titulo = `REPORTE: Municipio - ${nombreMuni}`;
    } else if (idDepartamento) {
        encargadosFiltrados = encargadosFiltrados.filter(e => e.departamento === nombreDepto);
        titulo = `REPORTE: Departamento - ${nombreDepto}`;
    } else if (idPais) {
        encargadosFiltrados = encargadosFiltrados.filter(e => e.pais === nombrePais);
        titulo = `REPORTE: País - ${nombrePais}`;
    } else {
        alert("Debe seleccionar al menos un País para filtrar por ubicación.");
        return;
    }
    
    generarReporteGeneralHTML(encargadosFiltrados, titulo);
}


function generarReporteDetalladoHTML(encargado, beneficiarios) {
    const fechaHoy = new Date().toLocaleDateString('es-GT', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // --- Detalles del Encargado ---
    let encargadoDetalles = `
        <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
            <h3>Detalles del Encargado</h3>
            <p><strong>DPI/Identificación:</strong> ${encargado.IdentificacionEncarga}</p>
            <p><strong>Nombre Completo:</strong> ${encargado.nombreCompleto || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${encargado.telefonoEncargado || 'N/A'}</p>
            <p><strong>Ubicación:</strong> ${encargado.lugar} (${encargado.municipio}, ${encargado.departamento}, ${encargado.pais})</p>
        </div>
        <h3>Beneficiarios Asociados (${beneficiarios.length})</h3>
    `;

    // --- Tabla de Beneficiarios ---
    let contenidoTabla = '';
    if (beneficiarios.length > 0) {
        beneficiarios.forEach(b => {
            contenidoTabla += `
                <tr>
                    <td>${b.idBeneficiario}</td>
                    <td>${b.nombreCompleto}</td>
                    <td>${b.estadoBeneficiario === 'A' ? 'Activo' : 'Inactivo'}</td>
                    <td>${b.fechaIngresoBene}</td>
                    <td>${b.lugar}</td>
                </tr>
            `;
        });
    } else {
        contenidoTabla = '<tr><td colspan="5" style="text-align: center;">Este encargado no tiene beneficiarios registrados.</td></tr>';
    }


    const htmlReporte = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte Detalle Encargado</title>
            <style>
                /* Estilos para impresión (similares a los anteriores) */
                body { font-family: Arial, sans-serif; margin: 30px; }
                h1 { text-align: center; color: #333; margin-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .no-print { display: none; }
            </style>
        </head>
        <body>
            <h1>REPORTE DETALLADO DE ENCARGADO</h1>
            <div style="text-align: center; font-size: 0.9em; color: #666;">Generado el: ${fechaHoy}</div>
            
            ${encargadoDetalles}
            
            <table>
                <thead>
                    <tr>
                        <th>ID Beneficiario</th>
                        <th>Nombre Completo</th>
                        <th>Estado</th>
                        <th>Fecha Ingreso</th>
                        <th>Lugar</th>
                    </tr>
                </thead>
                <tbody>
                    ${contenidoTabla}
                </tbody>
            </table>

            <div class="no-print" style="text-align:center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Imprimir / Guardar como PDF
                </button>
            </div>
            
        </body>
        </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
        ventanaImpresion.document.write(htmlReporte);
        ventanaImpresion.document.close();
    } else {
        alert("El navegador bloqueó la ventana de impresión.");
    }
}


/**
 * 8. Carga del DOM y Enlace de Eventos (Punto de entrada)
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar todos los datos de la API una sola vez al cargar la página
    cargarTodosLosDatosIniciales();
    
    // --- Referencias de los elementos Select de los modales ---
    const selectPaisCrear = document.getElementById('idPaisBeneCrear');
    const selectDeptoCrear = document.getElementById('idDepartamentoBeneCrear');
    const selectMuniCrear = document.getElementById('idMunicipioBeneCrear');
    const selectLugarCrear = document.getElementById('idLugarEncargadoCrear');
    
    const selectPaisActualizar = document.getElementById('idPaisBeneActualizar');
    const selectDeptoActualizar = document.getElementById('idDepartamentoBeneActualizar');
    const selectMuniActualizar = document.getElementById('idMunicipioBeneActualizar');
    const selectLugarActualizar = document.getElementById('idLugarEncargadoActualizar');

    // --- REFERENCIAS DE SELECTORES DEL MODAL REPORTES ---
    const selectFiltroPais = document.getElementById('filtroPais');
    const selectFiltroDepto = document.getElementById('filtroDepartamento');
    const selectFiltroMuni = document.getElementById('filtroMunicipio');
    const selectFiltroLugar = document.getElementById('filtroLugar');
    
    const btnReporteTodos = document.getElementById('btnReporteTodos');
    const btnReporteGenerarFiltro = document.getElementById('btnReporteGenerarFiltro');
    const btnReporteDPI = document.getElementById('btnReporteDPI'); // Nuevo botón de DPI
    const modalReportes = document.getElementById('modalReportes');

    const modalCrear = document.getElementById('modalCrearEncargado');
    const modalActualizar = document.getElementById('modalActualizarEncargado');

    // Evento de apertura modal CREAR
    modalCrear.addEventListener('show.bs.modal', () => {
        const { fecha, hora } = obtenerFechaHoraActual();
        document.getElementById('fechaIngresoEncargaCrear').value = fecha;
        document.getElementById('horaIngresoEncargaCrear').value = hora.substring(0, 5);
        
        cargarPaises('idPaisBeneCrear', 'idDepartamentoBeneCrear', 'idMunicipioBeneCrear', 'idLugarEncargadoCrear');
        document.getElementById('seccionDpiCrear').classList.remove('d-none');
        document.getElementById('formularioCrear').classList.add('d-none');
        document.getElementById('btnGuardarCrear').disabled = true;
        document.getElementById('mensajeDpiCrear').textContent = '';
        document.getElementById('formCrearEncargado').reset();
    });
    
    // Evento de apertura modal ACTUALIZAR
    modalActualizar.addEventListener('show.bs.modal', () => {
        document.getElementById('seccionDpiActualizar').classList.remove('d-none');
        document.getElementById('formularioActualizar').classList.add('d-none');
        document.getElementById('btnGuardarActualizar').disabled = true;
        document.getElementById('mensajeDpiActualizar').textContent = '';
        document.getElementById('formActualizarEncargado').reset();
    });
    
    // Evento de apertura modal REPORTES
    modalReportes.addEventListener('show.bs.modal', () => {
        cargarPaises(selectFiltroPais.id, selectFiltroDepto.id, selectFiltroMuni.id, selectFiltroLugar.id);
    });

    // --- Enlace de Eventos de cambio para la CASCADA (Crear) ---
    selectPaisCrear.addEventListener('change', (e) => {
        const idPais = e.target.value;
        cargarDepartamentos(selectDeptoCrear.id, selectMuniCrear.id, selectLugarCrear.id, idPais);
    });
    selectDeptoCrear.addEventListener('change', (e) => {
        const idDepartamento = e.target.value;
        cargarMunicipios(selectMuniCrear.id, selectLugarCrear.id, idDepartamento);
    });
    selectMuniCrear.addEventListener('change', (e) => {
        const idMunicipio = e.target.value;
        cargarLugares(selectLugarCrear.id, idMunicipio);
    });
    
    // --- Enlace de Eventos de cambio para la CASCADA (Actualizar) ---
    selectPaisActualizar.addEventListener('change', (e) => {
        const idPais = e.target.value;
        cargarDepartamentos(selectDeptoActualizar.id, selectMuniActualizar.id, selectLugarActualizar.id, idPais);
    });
    selectDeptoActualizar.addEventListener('change', (e) => {
        const idDepartamento = e.target.value;
        cargarMunicipios(selectMuniActualizar.id, selectLugarActualizar.id, idDepartamento);
    });
    selectMuniActualizar.addEventListener('change', (e) => {
        const idMunicipio = e.target.value;
        cargarLugares(selectLugarActualizar.id, idMunicipio);
    });

    // --- Enlace de Eventos de cambio para la CASCADA de FILTROS ---
    selectFiltroPais.addEventListener('change', (e) => {
        const idPais = e.target.value;
        cargarDepartamentos(selectFiltroDepto.id, selectFiltroMuni.id, selectFiltroLugar.id, idPais);
    });
    selectFiltroDepto.addEventListener('change', (e) => {
        const idDepartamento = e.target.value;
        cargarMunicipios(selectFiltroMuni.id, selectFiltroLugar.id, idDepartamento);
    });
    selectFiltroMuni.addEventListener('change', (e) => {
        const idMunicipio = e.target.value;
        cargarLugares(selectFiltroLugar.id, idMunicipio);
    });


    // Enlace de Eventos de Botones de Reportes
    if (btnReporteTodos) {
        btnReporteTodos.addEventListener('click', generarReporteGeneral); 
    }
    if (btnReporteGenerarFiltro) {
        btnReporteGenerarFiltro.addEventListener('click', generarReportePorUbicacion); 
    }
    if (btnReporteDPI) {
        btnReporteDPI.addEventListener('click', generarReportePorDPI); 
    }
    
    // Enlace de Eventos de Botones y Formularios CRUD
    document.getElementById('btnVerificarDpiCrear').addEventListener('click', verificarDpiCrear);
    document.getElementById('btnVerificarDpiActualizar').addEventListener('click', verificarDpiActualizar);
    
    document.getElementById('formCrearEncargado').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarNuevoEncargado();
    });
    document.getElementById('formActualizarEncargado').addEventListener('submit', (e) => {
        e.preventDefault();
        actualizarEncargado();
    });
});