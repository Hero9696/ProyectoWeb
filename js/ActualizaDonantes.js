// content/js/ActualizaDonantes.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);

  let DONANTES = [];
  let DONANTE_ACTUAL = null;

  // ==========================
  // Obtener usuario logueado
  // ==========================
  function getLoggedUserId() {
    try {
      const s = window.PollitoAuth?.getSession?.();
      if (s && s.user && s.user.id) return s.user.id;

      if (window.PollitoAuth?.user?.idUsuario) {
        return window.PollitoAuth.user.idUsuario;
      }
    } catch (e) {
      console.warn('No se pudo obtener usuario logueado:', e);
    }
    return 1; // fallback
  }

  // ==========================
  // DATA para cascada (igual idea que en ingreso)
  // ==========================
  const DATA = {
    paises: [],          // [{id, nombre}]
    departamentos: {},   // { idPais: [ {id, nombre}, ... ] }
    municipios: {}       // { idDepartamento: [ {id, nombre}, ... ] }
  };

  // Helpers de fetch para catálogos
  async function fetchPaises() {
    const r = await fetch(`${API}/paises`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const paises = await r.json();
    DATA.paises = paises.map(p => ({
      id: p.idPais,
      nombre: p.nombrePais
    }));
  }

  async function fetchDepartamentos() {
    const r = await fetch(`${API}/departamentos`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const deps = await r.json();
    DATA.departamentos = deps.reduce((acc, d) => {
      if (!acc[d.idPaisDepa]) acc[d.idPaisDepa] = [];
      acc[d.idPaisDepa].push({
        id: d.idDepartamento,
        nombre: d.nombreDepartamento
      });
      return acc;
    }, {});
  }

  async function fetchMunicipios() {
    const r = await fetch(`${API}/municipios`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const munis = await r.json();
    DATA.municipios = munis.reduce((acc, m) => {
      if (!acc[m.idDepartamentoMuni]) acc[m.idDepartamentoMuni] = [];
      acc[m.idDepartamentoMuni].push({
        id: m.idMunicipio,
        nombre: m.nombreMunicipio
      });
      return acc;
    }, {});
  }

  async function cargarCatalogosUbicacion() {
    await Promise.all([
      fetchPaises(),
      fetchDepartamentos(),
      fetchMunicipios()
    ]);
  }

  // ==========================
  // Helpers para selects (tipo ingreso)
  // ==========================
  function fillSelectBasic(select, items, placeholder = 'Seleccione…') {
    if (!select) return;
    select.innerHTML =
      `<option value="">${placeholder}</option>` +
      (items || [])
        .map(o => `<option value="${o.id}">${o.nombre}</option>`)
        .join('');
    select.disabled = !items || !items.length;
  }

  function initCascadaUbicacion() {
    const sPais = $('#idPaisDonante');
    const sDepa = $('#idDepartamentoDona');
    const sMuni = $('#idMunicipioDona');

    if (!sPais || !sDepa || !sMuni) return;

    // Países
    fillSelectBasic(sPais, DATA.paises, 'Seleccione país');

    sPais.addEventListener('change', () => {
      const idPais = sPais.value;
      const deps   = DATA.departamentos[idPais] || [];
      fillSelectBasic(sDepa, deps, 'Departamento…');
      fillSelectBasic(sMuni, [], 'Municipio…');
    });

    sDepa.addEventListener('change', () => {
      const idDep = sDepa.value;
      const munis = DATA.municipios[idDep] || [];
      fillSelectBasic(sMuni, munis, 'Municipio…');
    });
  }

  // ==========================
  // fetchJSON genérico
  // ==========================
  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      console.error('[DEBUG] respuesta no OK', r.status, txt);
      throw new Error(`HTTP ${r.status}`);
    }
    return r.json();
  }

  // ==========================
  // Nombre completo "inteligente"
  // ==========================
  function nombreCompletoDonante(d) {
    if (!d || typeof d !== 'object') return '';

    if (d.nombreCompleto && d.nombreCompleto.trim() !== '') {
      return d.nombreCompleto.trim();
    }
    if (d.nombre && d.nombre.trim() !== '') {
      return d.nombre.trim();
    }

    const partesDirectas = [
      d.nombre1Donante,
      d.nombre2Donante,
      d.nombre3Donante,
      d.apellido1Donante,
      d.apellido2Donante,
      d.apellido3Donante
    ].filter(v => typeof v === 'string' && v.trim() !== '');

    if (partesDirectas.length) {
      return partesDirectas.join(' ');
    }

    const partesGenericas = [];
    for (const [k, v] of Object.entries(d)) {
      if (typeof v !== 'string') continue;
      const kl = k.toLowerCase();
      if (kl.includes('nombre') || kl.includes('apellido')) {
        if (v.trim() !== '') partesGenericas.push(v.trim());
      }
    }

    return partesGenericas.join(' ');
  }

  // ==========================
  // Pintar resultados búsqueda
  // ==========================
  function renderResultadosBusqueda(lista) {
    const cont = $('#resultadoBusquedaDonante');
    if (!cont) return;

    if (!lista.length) {
      cont.innerHTML = '<span class="text-danger">No se encontraron donantes.</span>';
      return;
    }

    if (lista.length === 1) {
      const nc = nombreCompletoDonante(lista[0]) || '(sin nombre)';
      cont.innerHTML = `Se encontró 1 donante: <strong>${nc}</strong> (ID: ${lista[0].idDonador})`;
      return;
    }

    cont.innerHTML = `
      <div class="mt-2">
        <p class="mb-1">Se encontraron ${lista.length} donantes. Haz clic en "Usar" para cargar uno:</p>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre completo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              ${lista
                .map(d => {
                  const nc = nombreCompletoDonante(d) || '(sin nombre)';
                  return `
                    <tr>
                      <td>${d.idDonador}</td>
                      <td>${nc}</td>
                      <td>
                        <button type="button"
                                class="btn btn-sm btn-outline-primary btn-usar-donante"
                                data-id="${d.idDonador}">
                          Usar
                        </button>
                      </td>
                    </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================
  // Llenar formulario con DETALLE
  // ==========================
  async function llenarFormularioDonante(d) {
    DONANTE_ACTUAL = d;
    if (!d) return;

    const loggedId = getLoggedUserId();

    // IDs / básicos
    $('#idDonador').value       = d.idDonador ?? '';
    $('#telefonoDonante').value = d.telefonoDonante || '';

    // Nombres y apellidos
    $('#nombre1Donante').value   = d.nombre1Donante || '';
    $('#nombre2Donante').value   = d.nombre2Donante || '';
    $('#nombre3Donante').value   = d.nombre3Donante || '';
    $('#apellido1Donante').value = d.apellido1Donante || '';
    $('#apellido2Donante').value = d.apellido2Donante || '';
    $('#apellido3Donante').value = d.apellido3Donante || '';

    // Usuario propietario
    $('#idUsuarioDonante').value = d.idUsuarioDonante ?? loggedId;

    // Auditoría ingreso
    $('#idUsuarioIngreso').value = d.idUsuarioIngreso || '';
    $('#fechaIngresoDona').value = d.fechaIngresoDona || '';
    $('#horaIngresoDona').value  = d.horaIngresoDona  || '';

    // Auditoría actualización
    $('#fechaActualizacion').value = d.fechaActualizacion || '';
    $('#horaActualizacion').value  = d.horaActualizacion  || '';

    // Usuario que actualiza = logueado
    $('#idUsuarioActualiza').value = loggedId;

    // ===== UBICACIÓN: usar MISMA lógica de cascada que ingreso =====
    const sPais = $('#idPaisDonante');
    const sDepa = $('#idDepartamentoDona');
    const sMuni = $('#idMunicipioDona');

    // Países
    fillSelectBasic(sPais, DATA.paises, 'Seleccione país');
    sPais.value = d.idPaisDonante ?? '';

    // Departamentos del país del donante
    const deps = DATA.departamentos[d.idPaisDonante] || [];
    fillSelectBasic(sDepa, deps, 'Departamento…');
    sDepa.value = d.idDepartamentoDona ?? '';

    // Municipios del depto del donante
    const munis = DATA.municipios[d.idDepartamentoDona] || [];
    fillSelectBasic(sMuni, munis, 'Municipio…');
    sMuni.value = d.idMunicipioDona ?? '';

    const cont = $('#resultadoBusquedaDonante');
    cont.innerHTML +=
      `<div class="mt-2 text-success">Formulario cargado con el donante ID ${d.idDonador ?? '(sin ID)'}.</div>`;
  }

  // ==========================
  // Cargar DETALLE por ID (usa /donantes/:id)
  // ==========================
  async function cargarDonantePorId(id) {
    if (!id) {
      alert('ID de donante no válido.');
      return;
    }
    try {
      const d = await fetchJSON(`${API}/donantes/${id}`);
      await llenarFormularioDonante(d);
    } catch (e) {
      console.error('[DonantesAct] Error al cargar donante por ID:', e);
      $('#resultadoBusquedaDonante').innerHTML =
        '<span class="text-danger">No se pudo cargar el detalle del donante.</span>';
    }
  }

  // ==========================
  // Buscar donante (ID o nombre)
  // ==========================
  async function buscarDonante(e) {
    e.preventDefault();

    const idTxt   = $('#buscaIdDonante').value.trim();
    const nombreQ = $('#buscaNombreDonante').value.trim();
    const contRes = $('#resultadoBusquedaDonante');

    contRes.innerHTML = '';

    if (!idTxt && !nombreQ) {
      contRes.innerHTML = '<span class="text-danger">Ingresa un ID o un texto de nombre/apellido.</span>';
      return;
    }

    try {
      let lista = [];

      if (idTxt) {
        // Buscar DETALLE directo por ID
        await cargarDonantePorId(idTxt);
        DONANTES = [];
        contRes.innerHTML =
          `<span class="text-success">Donante cargado por ID ${idTxt}.</span>`;
        return;
      } else {
        // Buscar por nombre: traemos todos y filtramos en front
        const todos = await fetchJSON(`${API}/donantes`);
        const qLower = nombreQ.toLowerCase();

        lista = (Array.isArray(todos) ? todos : []).filter(d => {
          const nc = nombreCompletoDonante(d).toLowerCase();
          return nc.includes(qLower);
        });
      }

      DONANTES = lista;
      renderResultadosBusqueda(lista);

      // Si solo hay uno, cargamos su DETALLE
      if (lista.length === 1) {
        await cargarDonantePorId(lista[0].idDonador);
      }

    } catch (err) {
      console.error('[DonantesAct] Error al buscar donante:', err);
      contRes.innerHTML = '<span class="text-danger">Error al buscar donante.</span>';
    }
  }

  // ==========================
  // Guardar actualización (PUT)
  // ==========================
  async function guardarDonante(e) {
    e.preventDefault();
    const form = $('#formDonanteActualizar');
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const id = $('#idDonador').value;
    if (!id) {
      alert('Primero busca y selecciona un donante antes de guardar.');
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    // Usuario que actualiza = logueado
    data.idUsuarioActualiza = getLoggedUserId();

    try {
      const resp = await fetch(`${API}/donantes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const txt = await resp.text();
      let msg = txt;
      try { msg = JSON.parse(txt).message || msg; } catch {}

      if (!resp.ok) throw new Error(msg);

      alert('Donante actualizado correctamente.');
      $('#resultadoBusquedaDonante').innerHTML =
        `<span class="text-success">Donante ID ${id} actualizado.</span>`;
    } catch (err) {
      console.error('[DonantesAct] Error al guardar donante:', err);
      alert('Error al actualizar donante: ' + err.message);
    }
  }

  // ==========================
  // Limpiezas
  // ==========================
  function limpiarBusqueda() {
    $('#buscaIdDonante').value      = '';
    $('#buscaNombreDonante').value  = '';
    $('#resultadoBusquedaDonante').innerHTML = '';
  }

  function limpiarFormulario() {
    const form = $('#formDonanteActualizar');
    form.reset();
    form.classList.remove('was-validated');
    DONANTE_ACTUAL = null;

    // Reiniciar selects de ubicación
    const sPais = $('#idPaisDonante');
    const sDepa = $('#idDepartamentoDona');
    const sMuni = $('#idMunicipioDona');
    fillSelectBasic(sPais, DATA.paises, 'Seleccione país');
    fillSelectBasic(sDepa, [], 'Departamento…');
    fillSelectBasic(sMuni, [], 'Municipio…');
  }

  // ==========================
  // Init
  // ==========================
  document.addEventListener('DOMContentLoaded', async () => {
    const formBusq = $('#formBusquedaDonante');
    const formAct  = $('#formDonanteActualizar');

    if (!formBusq || !formAct) return;

    // 1) Cargar todos los catálogos de ubicación
    try {
      await cargarCatalogosUbicacion();
      initCascadaUbicacion();
    } catch (e) {
      console.error('[DonantesAct] Error cargando catálogos:', e);
      alert('No se pudieron cargar catálogos de ubicación.');
    }

    // Búsqueda
    formBusq.addEventListener('submit', buscarDonante);
    $('#btnLimpiarBusqueda').addEventListener('click', () => {
      limpiarBusqueda();
      limpiarFormulario();
    });

    // Botones "Usar" de la tabla → siempre piden DETALLE con /donantes/:id
    $('#resultadoBusquedaDonante').addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-usar-donante');
      if (!btn) return;
      const id = btn.dataset.id;
      await cargarDonantePorId(id);
    });

    // Guardar cambios
    formAct.addEventListener('submit', guardarDonante);
    $('#btnLimpiarFormDonante').addEventListener('click', limpiarFormulario);
  });
})();
