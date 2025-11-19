// Variables globales para almacenar TODAS las listas
let listaEncargados = []; 
let listaPaises = [];
let listaDepartamentos = [];
let listaMunicipios = [];
let listaLugares = [];

const API_BASE = 'http://localhost:3000/api';

// Objeto para mantener el Encargado ID activo
let encargadoAsignado = null; 

// ========================================================
// UTILIDADES
// ========================================================

function obtenerFechaHoraActual() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fecha = `${ahora.getFullYear()}-${pad(ahora.getMonth()+1)}-${pad(ahora.getDate())}`;
  const hora  = `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`;
  return { fecha, hora };
}

// Obtener el ID del usuario logueado desde PollitoAuth
function getLoggedUserId() {
  try {
    const s = window.PollitoAuth?.getSession?.();
    if (s && s.user && s.user.id) return s.user.id;
  } catch {}
  // por si algo falla, default 1
  return 1;
}

async function cargarTodosLosDatosIniciales() {
  try {
    const [resEncargados, resPaises, resDepartamentos, resMunicipios, resLugares] =
      await Promise.all([
        fetch(`${API_BASE}/encargados`),
        fetch(`${API_BASE}/paises`),
        fetch(`${API_BASE}/departamentos`),
        fetch(`${API_BASE}/municipios`),
        fetch(`${API_BASE}/lugares`)
      ]);

    if (!resEncargados.ok || !resPaises.ok || !resDepartamentos.ok || !resMunicipios.ok || !resLugares.ok) {
      throw new Error('Error al cargar datos iniciales del servidor.');
    }

    listaEncargados   = await resEncargados.json();
    listaPaises       = await resPaises.json();
    listaDepartamentos= await resDepartamentos.json();
    listaMunicipios   = await resMunicipios.json();
    listaLugares      = await resLugares.json();

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

// LÓGICA DE CASCADA
function cargarPaises(selectPaisId, selectDeptoId, selectMuniId, selectLugarId, valorSeleccionado = null) {
  rellenarSelect(selectPaisId, listaPaises, 'idPais', 'nombrePais', 'Seleccione un País', valorSeleccionado);
  rellenarSelect(selectDeptoId, [], 'idDepartamento', 'nombreDepartamento', 'Seleccione un Departamento');
  rellenarSelect(selectMuniId, [], 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio');
  rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
}

function cargarDepartamentos(selectDeptoId, selectMuniId, selectLugarId, idPais, valorSeleccionado = null) {
  const departamentosFiltrados = listaDepartamentos.filter(d => d.idPaisDepa == idPais);
  rellenarSelect(selectDeptoId, departamentosFiltrados, 'idDepartamento', 'nombreDepartamento', 'Seleccione un Departamento', valorSeleccionado);
  rellenarSelect(selectMuniId, [], 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio');
  rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
}

function cargarMunicipios(selectMuniId, selectLugarId, idDepartamento, valorSeleccionado = null) {
  const municipiosFiltrados = listaMunicipios.filter(m => m.idDepartamentoMuni == idDepartamento);
  rellenarSelect(selectMuniId, municipiosFiltrados, 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio', valorSeleccionado);
  rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
}

function cargarLugares(selectLugarId, idMunicipio, valorSeleccionado = null) {
  const lugaresFiltrados = listaLugares.filter(l => l.idMunicipioLugar == idMunicipio);
  rellenarSelect(selectLugarId, lugaresFiltrados, 'idLugar', 'nombreLugar', 'Seleccione un Lugar', valorSeleccionado);
}

// ========================================================
// LÓGICA BENEFICIARIOS
// ========================================================

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
    mensajeDiv.innerHTML = '<span class="text-danger">❌ Encargado no encontrado. Registre primero al Encargado.</span>';
    return;
  }
  
  encargadoAsignado = encargadoEncontrado;
  
  mensajeDiv.innerHTML = '<span class="text-success">✅ Encargado validado. Complete los datos del beneficiario.</span>';
  
  document.getElementById('idEncargadoBene').value = encargadoEncontrado.idEncargado; 
  document.getElementById('nombreEncargadoAsignado').textContent =
    `${encargadoEncontrado.nombreCompleto} (${encargadoEncontrado.IdentificacionEncarga})`;

  infoEncargadoDiv.classList.remove('d-none');
  seccionForm.classList.remove('d-none');
  document.getElementById('step2Badge').classList.remove('disabled');

  inicializarFormularioBeneficiario();
}

function inicializarFormularioBeneficiario() {
  const { fecha, hora } = obtenerFechaHoraActual();

  // fecha/hora ingreso
  const inputFechaIng = document.getElementById('fechaIngresoBene');
  const inputHoraIng  = document.getElementById('horaIngresoBene');
  const inputFechaAct = document.getElementById('fechaActualizacion');
  const inputHoraAct  = document.getElementById('horaActualizacion');

  if (inputFechaIng) inputFechaIng.value = fecha;
  if (inputHoraIng)  inputHoraIng.value  = hora;
  if (inputFechaAct) inputFechaAct.value = fecha;
  if (inputHoraAct)  inputHoraAct.value  = hora;

  // estado siempre 'A'
  const estadoInput = document.getElementById('estadoBeneficiario');
  if (estadoInput) estadoInput.value = 'A';

  // usuarios auditoría = usuario logueado
  const userId = getLoggedUserId();
  const usrIng = document.getElementById('idUsuarioIngreso');
  const usrAct = document.getElementById('idUsuarioActualiza');
  if (usrIng) usrIng.value = userId;
  if (usrAct) usrAct.value = userId;

  // cargar cascada de ubicación
  cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene');
}

async function guardarBeneficiario(e) {
  e.preventDefault();
  const form = e.target;

  if (!encargadoAsignado) {
    alert("Error: No hay Encargado asignado. Vuelva al Paso 1.");
    return;
  }

  const pad2 = n => String(n).padStart(2, '0');
  const now = new Date();
  const hoy = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}`;
  const horaNow = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const ensureTime = t => !t ? horaNow : (t.length === 8 ? t : (t.length === 5 ? `${t}:00` : horaNow));
  const toInt = v => (v === '' || v === null || v === undefined) ? null : parseInt(v, 10);
  const F = v => (v && v.trim()) ? v.trim() : "-";

  const idEncargado    = toInt(document.getElementById('idEncargadoBene').value) || 0;
  const idPais         = toInt(form.idPaisBene.value) || 0;
  const idDepartamento = toInt(form.idDepartamentoBene.value) || 0;
  const idMunicipio    = toInt(form.idMunicipioBene.value) || 0;
  const idLugar        = toInt(form.idLugarBene.value) || 0;

  const nombre1   = (form.nombre1Beneficiario.value || '').trim();
  const apellido1 = (form.apellido1Beneficiario.value || '').trim();

  if (!nombre1 || !apellido1 || !idEncargado || !idPais || !idDepartamento || !idMunicipio || !idLugar) {
    alert("Error: Complete Primer Nombre, Primer Apellido y la cascada de ubicación (País, Depto, Municipio, Lugar).");
    return;
  }

  const userId = getLoggedUserId();
  const idUsuarioIngreso   = userId;
  const idUsuarioActualiza = userId;

  const fechaIngForm = form.fechaIngresoBene.value || hoy;
  const horaIngForm  = ensureTime(form.horaIngresoBene.value);
  const fechaActForm = form.fechaActualizacion.value || fechaIngForm;
  const horaActForm  = ensureTime(form.horaActualizacion.value || horaIngForm);

  // estado fijo A
  const estadoAI = 'A';

  const base = {
    n1: F(nombre1),
    n2: F(form.nombre2Beneficiario.value),
    n3: F(form.nombre3Beneficiario.value),
    a1: F(apellido1),
    a2: F(form.apellido2Beneficiario.value),
    a3: F(form.apellido3Beneficiario.value),
    pais: idPais,
    depto: idDepartamento,
    muni: idMunicipio,
    lugar: idLugar,
    enc: idEncargado,
    fecIng: fechaIngForm,
    horIng: horaIngForm,
    fecAct: fechaActForm,
    horAct: horaActForm,
    usrIng: idUsuarioIngreso,
    usrAct: idUsuarioActualiza,
    est: estadoAI
  };

  const dataApi = {
    nombre1Beneficiario: base.n1, nombre2Beneficiario: base.n2, nombre3Beneficiario: base.n3,
    apellido1Beneficiario: base.a1, apellido2Beneficiario: base.a2, apellido3Beneficiario: base.a3,
    idPais: base.pais, idDepartamento: base.depto, idMunicipio: base.muni, idLugar: base.lugar, idEncargado: base.enc,
    estadoBeneficiario: base.est,
    fechaIngreso: base.fecIng, horaIngreso: base.horIng, idUsuarioIngreso: base.usrIng,
    fechaActualizacion: base.fecAct, horaActualizacion: base.horAct, idUsuarioActualiza: base.usrAct,

    // otras variantes de nombres
    nombre1: base.n1, nombre2: base.n2, nombre3: base.n3,
    apellido1: base.a1, apellido2: base.a2, apellido3: base.a3,
    paisId: base.pais, departamentoId: base.depto, municipioId: base.muni, lugarId: base.lugar, encargadoId: base.enc,
    estado: base.est,
    fechaIng: base.fecIng, horaIng: base.horIng, usuarioIngreso: base.usrIng,
    fechaAct: base.fecAct, horaAct: base.horAct, usuarioActualiza: base.usrAct,

    idPaisBene: base.pais, idDepartamentoBene: base.depto, idMunicipioBene: base.muni, idLugarBene: base.lugar, idEncargadoBene: base.enc,
    fechaIngresoBene: base.fecIng, horaIngresoBene: base.horIng,

    primerNombre: base.n1, segundoNombre: base.n2, tercerNombre: base.n3,
    primerApellido: base.a1, segundoApellido: base.a2, tercerApellido: base.a3
  };


  try {
    const resp = await fetch(`${API_BASE}/beneficiarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataApi)
    });

    const text = await resp.text();
    let data = null;

    try {
      data = JSON.parse(text);
    } catch {
      // si no es JSON, se deja como null
    }

    if (!resp.ok) {
      throw new Error(data?.message || text || "Error desconocido.");
    }

    // === EXTRAER ID DEVUELTO POR LA API ===
    const nuevoId = data?.idBeneficiario;

    let msg = "Beneficiario creado exitosamente 🎉";
    if (nuevoId) {
      msg += `\n\nEl ID del beneficiario es: ${nuevoId}.`;
      msg += `\nConsulta su inventario en la opción \"Inventario\" del menú.`;
    }

    alert(msg);

    // Limpia formulario
    document.getElementById('btnLimpiarTodo').click();

    // ✅ Si hay ID, redirigimos al inventario filtrado por ese beneficiario
    if (nuevoId) {
      window.location.href = `/view/VistaInventario.html?id=${encodeURIComponent(nuevoId)}`;
    }

  } catch (err) {
    console.error(err);
    alert(`Error al crear beneficiario: ${err.message || 'Error desconocido.'}`);
  }


}


// ========================================================
// ENLACE DE EVENTOS
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  cargarTodosLosDatosIniciales();
  
  const selectPais  = document.getElementById('idPaisBene');
  const selectDepto = document.getElementById('idDepartamentoBene');
  const selectMuni  = document.getElementById('idMunicipioBene');

  document.getElementById('btnValidarEncargado').addEventListener('click', validarEncargado);
  document.getElementById('formBeneficiario').addEventListener('submit', guardarBeneficiario);

  document.getElementById('btnLimpiarTodo').addEventListener('click', () => {
    document.getElementById('formBeneficiario').reset();
    document.getElementById('dpiEncargadoBusqueda').value = '';
    document.getElementById('seccionDatosBeneficiario').classList.add('d-none');
    document.getElementById('infoEncargadoAsignado').classList.add('d-none');
    document.getElementById('mensajeValidacion').textContent = '';
    document.getElementById('step2Badge').classList.add('disabled');
    encargadoAsignado = null;
    cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene');
  });

  selectPais.addEventListener('change', (e) =>
    cargarDepartamentos(selectDepto.id, selectMuni.id, document.getElementById('idLugarBene').id, e.target.value)
  );
  selectDepto.addEventListener('change', (e) =>
    cargarMunicipios(selectMuni.id, document.getElementById('idLugarBene').id, e.target.value)
  );
  selectMuni.addEventListener('change', (e) =>
    cargarLugares(document.getElementById('idLugarBene').id, e.target.value)
  );
});
