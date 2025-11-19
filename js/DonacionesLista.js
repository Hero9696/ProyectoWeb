// DonacionesLista.js - Consulta de donaciones (solo lectura)
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $   = (s, c = document) => c.querySelector(s);

  let DONACIONES = [];
  let MAP_DONANTES = new Map();

  const fmtQ = n => 'Q ' + Number(n || 0).toFixed(2);

  function fmtFechaHora(fecha, hora) {
    if (!fecha && !hora) return '';
    return [fecha || '', hora || ''].join(' ').trim();
  }

  // =====================================================
  // Cargar donantes para tener nombres (por si acaso)
  // =====================================================
  async function cargarMapaDonantes() {
    try {
      const r = await fetch(`${API}/donantes`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const lista = await r.json();
      MAP_DONANTES = new Map(
        lista.map(d => [Number(d.idDonador), d.nombreCompleto || ('Donante #' + d.idDonador)])
      );
    } catch (e) {
      console.error('[DonacionesLista] Error al cargar donantes:', e);
      MAP_DONANTES = new Map();
    }
  }

  // =====================================================
  // Cargar donaciones desde la API
  // =====================================================
  async function cargarDonaciones() {
    try {
      const r = await fetch(`${API}/donaciones`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const lista = await r.json();

      DONACIONES = (Array.isArray(lista) ? lista : []).map((d, idx) => {
        const normalizada = {
          ...d,
          idDonacion        : d.idDonacion,
          idDonador         : d.idDonador,
          montoDonado       : d.montoDonado,
          fechaIngreso      : d.fechaIngreso,
          horaIngreso       : d.horaIngreso,
          fechaActualizacion: d.fechaActualizacion,
          horaActualizacion : d.horaActualizacion,
          idUsuarioIngreso  : d.idUsuarioIngreso,
          IdUsuarioActualizacion: d.IdUsuarioActualizacion,

          // nombre del donante (si no viene, usamos el mapa)
          nombreDonante: d.nombreDonante
            || MAP_DONANTES.get(Number(d.idDonador))
            || `Donante #${d.idDonador}`,

          // nombres de usuario desde los alias del SELECT
          usuarioIngresoNombre   : d.usuarioIngresoNombre   || '',
          usuarioActualizaNombre : d.usuarioActualizaNombre || ''
        };

        if (idx === 0) {
          console.log('[DonacionesLista] Primera fila normalizada ->', normalizada);
        }
        return normalizada;
      });

      aplicarFiltrosYRender();
    } catch (e) {
      console.error('[DonacionesLista] Error al cargar donaciones:', e);
      const tbody = $('#tbodyDonaciones');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">
          Error al cargar donaciones.
        </td></tr>`;
      }
      const lblRes = $('#lblResumenTabla');
      if (lblRes) lblRes.textContent = '0 donaciones';
    }
  }

  // =====================================================
  // Filtros (en front)
  // =====================================================
  function aplicarFiltrosYRender() {
    const nombreQ = ($('#filtroNombre')?.value || '').toLowerCase().trim();
    const desde   = $('#filtroDesde')?.value || '';
    const hasta   = $('#filtroHasta')?.value || '';

    let lista = DONACIONES.slice();

    if (nombreQ) {
      lista = lista.filter(d => {
        const nm = (d.nombreDonante || '').toLowerCase();
        return nm.includes(nombreQ);
      });
    }

    if (desde) {
      lista = lista.filter(d => !d.fechaIngreso || d.fechaIngreso >= desde);
    }
    if (hasta) {
      lista = lista.filter(d => !d.fechaIngreso || d.fechaIngreso <= hasta);
    }

    renderTabla(lista);
  }

  // =====================================================
  // Render tabla
  // =====================================================
  function renderTabla(lista) {
    const tbody = $('#tbodyDonaciones');
    const lblRes = $('#lblResumenTabla');
    if (!tbody) return;

    if (!lista.length) {
      tbody.innerHTML = `<tr>
        <td colspan="6" class="text-center text-muted py-3">
          No se encontraron donaciones con los filtros aplicados.
        </td>
      </tr>`;
      if (lblRes) lblRes.textContent = '0 donaciones';
      return;
    }

    tbody.innerHTML = lista.map(d => `
      <tr data-id="${d.idDonacion}">
        <td>${d.idDonacion}</td>
        <td>${fmtFechaHora(d.fechaIngreso, d.horaIngreso)}</td>
        <td>${d.nombreDonante}</td>
        <td class="text-end">${fmtQ(d.montoDonado)}</td>
        <td>${d.usuarioIngresoNombre || ''}</td>
        <td>
          <button type="button"
                  class="btn btn-sm btn-outline-primary btn-ver-donacion"
                  data-id="${d.idDonacion}">
            Ver
          </button>
        </td>
      </tr>
    `).join('');

    if (lblRes) {
      const txt = lista.length === 1 ? '1 donación' : `${lista.length} donaciones`;
      lblRes.textContent = txt;
    }
  }

  // =====================================================
  // Modal detalle
  // =====================================================
  function abrirModalDetalle(id) {
    const d = DONACIONES.find(x => String(x.idDonacion) === String(id));
    if (!d) return;

    $('#detIdDonacion').textContent   = d.idDonacion;
    $('#detDonante').textContent      = d.nombreDonante;
    $('#detMonto').textContent        = fmtQ(d.montoDonado);
    $('#detFechaHoraIng').textContent = fmtFechaHora(d.fechaIngreso, d.horaIngreso);
    $('#detUsuarioIng').textContent   = d.usuarioIngresoNombre || '';
    $('#detFechaHoraAct').textContent = fmtFechaHora(d.fechaActualizacion, d.horaActualizacion);
    $('#detUsuarioAct').textContent   = d.usuarioActualizaNombre || '';

    const modalEl = $('#modalDonacion');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  // =====================================================
  // Init
  // =====================================================
  document.addEventListener('DOMContentLoaded', async () => {
    await cargarMapaDonantes();   // por si no viniera nombreDonante
    await cargarDonaciones();     // ya incluye usuarioIngresoNombre

    // Filtros
    $('#formFiltros')?.addEventListener('submit', e => {
      e.preventDefault();
      aplicarFiltrosYRender();
    });

    $('#btnLimpiarFiltros')?.addEventListener('click', () => {
      const fNom   = $('#filtroNombre');
      const fDesde = $('#filtroDesde');
      const fHasta = $('#filtroHasta');
      if (fNom)   fNom.value = '';
      if (fDesde) fDesde.value = '';
      if (fHasta) fHasta.value = '';
      aplicarFiltrosYRender();
    });

    // Botón Ver
    $('#tbodyDonaciones')?.addEventListener('click', e => {
      const btn = e.target.closest('.btn-ver-donacion');
      if (!btn) return;
      const id = btn.dataset.id;
      abrirModalDetalle(id);
    });
  });
})();
