// ../js/EncargadosLista.js

const API_BASE = 'http://localhost:3000/api';

let listaEncargados = [];
let listaFiltrada = [];

let modalDetalleEncargado = null;

/**
 * Construye un nombre completo con todos los campos posibles.
 * Se usa sólo para mostrar en la tabla / filtro, NO en el modal.
 */
function construirNombreCompleto(e) {
  const partes = [
    e.nombre1Encargado,
    e.nombre2Encargado,
    e.nombre3Encargado,
    e.apellido1Encargado,
    e.apellido2Encargado,
    e.apellido3Encargado,
  ]
    .filter(Boolean)
    .map((p) => String(p).trim())
    .filter((p) => p.length > 0);

  if (partes.length > 0) {
    return partes.join(' ');
  }

  if (e.nombreCompleto) {
    return String(e.nombreCompleto).trim();
  }

  return '';
}

/**
 * Renderiza la tabla de encargados.
 */
function renderTablaEncargados(datos) {
  const tbody = document.querySelector('#tablaEncargados tbody');
  if (!tbody) return;

  if (!datos || datos.length === 0) {
    tbody.innerHTML = `
      <tr class="text-muted text-center">
        <td colspan="8">
          <i class="bi bi-info-circle me-2"></i>
          No se encontraron encargados con los filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  datos.forEach((e) => {
    const nombreCompleto =
      construirNombreCompleto(e) || e.nombreCompleto || '';
    const pais = e.nombrePais || e.pais || '';
    const lugar = e.nombreLugar || e.lugar || '';

    html += `
      <tr>
        <td>${e.idEncargado}</td>
        <td>${e.IdentificacionEncarga || ''}</td>
        <td>${nombreCompleto}</td>
        <td>${e.telefonoEncargado || ''}</td>
        <td>${e.correoEncargado || ''}</td>
        <td>${pais}</td>
        <td>${lugar}</td>
        <td class="text-end">
          <button 
            type="button" 
            class="btn btn-sm btn-primary"
            data-action="ver-encargado"
            data-id="${e.idEncargado}"
          >
            <i class="bi bi-eye"></i> Ver
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

/**
 * Llena el select de países para el filtro
 * (extrae los nombres desde la lista de encargados).
 */
function llenarSelectPaises() {
  const select = document.getElementById('filtroPaisEncargados');
  if (!select) return;

  const setPaises = new Set();
  listaEncargados.forEach((e) => {
    const p = e.nombrePais || e.pais;
    if (p) setPaises.add(String(p));
  });

  select.innerHTML = `<option value="">Todos</option>`;
  Array.from(setPaises)
    .sort((a, b) => a.localeCompare(b, 'es'))
    .forEach((nombre) => {
      const opt = document.createElement('option');
      opt.value = nombre;
      opt.textContent = nombre;
      select.appendChild(opt);
    });
}

/**
 * Aplica filtros de texto (DPI/nombre) y país.
 */
function aplicarFiltros() {
  const inputTexto = document.getElementById('filtroTextoEncargados');
  const selectPais = document.getElementById('filtroPaisEncargados');

  const texto = (inputTexto?.value || '').toLowerCase().trim();
  const paisFiltro = (selectPais?.value || '').toLowerCase().trim();

  listaFiltrada = listaEncargados.filter((e) => {
    const nombreCompleto = construirNombreCompleto(e).toLowerCase();
    const dpi = String(e.IdentificacionEncarga || '').toLowerCase();

    const coincideTexto =
      !texto ||
      nombreCompleto.includes(texto) ||
      dpi.includes(texto);

    const pais = String(e.nombrePais || e.pais || '').toLowerCase();
    const coincidePais = !paisFiltro || pais === paisFiltro;

    return coincideTexto && coincidePais;
  });

  renderTablaEncargados(listaFiltrada);
}

/**
 * Carga inicial desde el backend.
 */
async function cargarEncargados() {
  try {
    const res = await fetch(`${API_BASE}/encargados`);
    if (!res.ok) {
      throw new Error(`Error al obtener encargados (${res.status})`);
    }

    listaEncargados = await res.json();
    listaFiltrada = [...listaEncargados];

    renderTablaEncargados(listaFiltrada);
    llenarSelectPaises();
  } catch (err) {
    console.error('Error cargando encargados:', err);
    const tbody = document.querySelector('#tablaEncargados tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr class="text-danger text-center">
          <td colspan="8">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Error al cargar los encargados. Verifique el backend.
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Helpers para normalizar valores.
 */
function getVal(enc, ...keys) {
  for (const k of keys) {
    if (enc && enc[k] != null && enc[k] !== '') {
      return enc[k];
    }
  }
  return '';
}

function normalizarFecha(v) {
  if (!v) return '';
  const s = String(v);
  // 2025-11-17T00:00:00 → 2025-11-17
  if (s.length >= 10) return s.substring(0, 10);
  return s;
}

function normalizarHora(v) {
  if (!v) return '';
  const s = String(v);
  // 19:36:00 → 19:36
  if (s.length >= 5) return s.substring(0, 5);
  return s;
}

/**
 * Rellena y muestra el modal de detalle con TODOS los campos.
 * AHORA: pide el detalle a /encargados/:id para tener todos los campos.
 */
async function mostrarDetalleEncargado(id) {
  let enc = null;

  try {
    const res = await fetch(`${API_BASE}/encargados/${id}`);
    if (!res.ok) {
      throw new Error(`Error al obtener detalle (${res.status})`);
    }
    enc = await res.json();
  } catch (err) {
    console.error('Error al cargar detalle de encargado:', err);
    // Fallback: usar lo que haya en listaEncargados
    enc =
      listaEncargados.find((e) => String(e.idEncargado) === String(id)) ||
      null;
  }

  if (!enc) {
    alert('No se encontró la información completa del encargado.');
    return;
  }

  // Identificación
  document.getElementById('detIdEncargado').value =
    enc.idEncargado ?? '';
  document.getElementById('detDpi').value =
    getVal(enc, 'IdentificacionEncarga');

  // Nombres
  document.getElementById('detNombre1').value = getVal(
    enc,
    'nombre1Encargado',
    'primerNombre'
  );
  document.getElementById('detNombre2').value = getVal(
    enc,
    'nombre2Encargado',
    'segundoNombre'
  );
  document.getElementById('detNombre3').value = getVal(
    enc,
    'nombre3Encargado',
    'tercerNombre'
  );

  // Apellidos
  document.getElementById('detApellido1').value = getVal(
    enc,
    'apellido1Encargado',
    'primerApellido'
  );
  document.getElementById('detApellido2').value = getVal(
    enc,
    'apellido2Encargado',
    'segundoApellido'
  );
  document.getElementById('detApellido3').value = getVal(
    enc,
    'apellido3Encargado',
    'tercerApellido'
  );

  // Contacto
  document.getElementById('detTelefono').value = getVal(
    enc,
    'telefonoEncargado',
    'telefono'
  );
  document.getElementById('detCorreo').value = getVal(
    enc,
    'correoEncargado',
    'correo'
  );

  // Ubicación (descripciones, no IDs)
  document.getElementById('detPais').value = getVal(
    enc,
    'nombrePais',
    'pais'
  );
  document.getElementById('detDepartamento').value = getVal(
    enc,
    'nombreDepartamento',
    'departamento'
  );
  document.getElementById('detMunicipio').value = getVal(
    enc,
    'nombreMunicipio',
    'municipio'
  );
  document.getElementById('detLugar').value = getVal(
    enc,
    'nombreLugar',
    'lugar'
  );

  // Auditoría ingreso
  document.getElementById('detFechaIng').value = normalizarFecha(
    getVal(enc, 'fechaIngresoEncarga', 'fechaIngreso')
  );
  document.getElementById('detHoraIng').value = normalizarHora(
    getVal(enc, 'horaIngresoEncarga', 'horaIngreso')
  );

  const usuarioIng = getVal(
    enc,
    'usuarioIngresoNombre',
    'usuarioIngreso',
    'nombreUsuarioIngreso',
    'idUsuarioIngreso'
  );
  document.getElementById('detUsuarioIng').value = usuarioIng;

  // Auditoría actualización
  document.getElementById('detFechaAct').value = normalizarFecha(
    getVal(enc, 'fechaActualizacion')
  );
  document.getElementById('detHoraAct').value = normalizarHora(
    getVal(enc, 'horaActualizacion')
  );

  const usuarioAct = getVal(
    enc,
    'usuarioActualizaNombre',
    'usuarioActualiza',
    'nombreUsuarioActualiza',
    'idUsuarioActualiza'
  );
  document.getElementById('detUsuarioAct').value = usuarioAct;

  if (modalDetalleEncargado) {
    modalDetalleEncargado.show();
  }
}

/**
 * Punto de entrada.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Instanciar el modal
  const modalEl = document.getElementById('modalDetalleEncargado');
  if (modalEl && window.bootstrap) {
    modalDetalleEncargado = new bootstrap.Modal(modalEl);
  }

  // Cargar datos
  cargarEncargados();

  // Filtros
  const inputTexto = document.getElementById('filtroTextoEncargados');
  const selectPais = document.getElementById('filtroPaisEncargados');

  if (inputTexto) {
    inputTexto.addEventListener('input', aplicarFiltros);
  }
  if (selectPais) {
    selectPais.addEventListener('change', aplicarFiltros);
  }

  // Delegación de evento para botón "Ver"
  const tbody = document.querySelector('#tablaEncargados tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="ver-encargado"]');
      if (!btn) return;

      const id = btn.getAttribute('data-id');
      mostrarDetalleEncargado(id);
    });
  }
});
