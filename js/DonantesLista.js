// DonantesLista.js - Consulta de donantes (solo lectura)
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $   = (s, c = document) => c.querySelector(s);

  let DONANTES = [];

  function fmtFechaHora(fecha, hora) {
    if (!fecha && !hora) return '';
    return [fecha || '', hora || ''].join(' ').trim();
  }

  // ================================
  // Cargar donantes desde la API
  // ================================
  async function cargarDonantes() {
    const tbody = $('#tbodyDonantes');
    const lblRes = $('#lblResumenTabla');

    try {
      const r = await fetch(`${API}/donantes`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);

      const lista = await r.json();

      DONANTES = (Array.isArray(lista) ? lista : []).map((d, idx) => {
        const nombreCompleto =
          d.nombreCompleto
          || [
              d.nombre1Donante,
              d.nombre2Donante,
              d.nombre3Donante,
              d.apellido1Donante,
              d.apellido2Donante,
              d.apellido3Donante
            ]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        const normalizada = {
          ...d,
          idDonador: d.idDonador,
          nombreCompleto,
          telefonoDonante: d.telefonoDonante || '',
          pais: d.pais || '',
          departamento: d.departamento || '',
          municipio: d.municipio || '',
          usuarioDonanteNombre   : d.usuarioDonanteNombre   || d.usuarioAsociado || '',
          usuarioIngresoNombre   : d.usuarioIngresoNombre   || d.usuarioIngreso || '',
          usuarioActualizaNombre : d.usuarioActualizaNombre || d.usuarioActualiza || '',
          fechaIngresoDona      : d.fechaIngresoDona || d.fechaIngreso || '',
          horaIngresoDona       : d.horaIngresoDona  || d.horaIngreso  || '',
          fechaActualizacion    : d.fechaActualizacion || '',
          horaActualizacion     : d.horaActualizacion  || ''
        };

        if (idx === 0) {
          console.log('[DonantesLista] Primera fila normalizada ->', normalizada);
        }
        return normalizada;
      });

      aplicarFiltrosYRender();
    } catch (e) {
      console.error('[DonantesLista] Error al cargar donantes:', e);
      if (tbody) {
        tbody.innerHTML = `<tr>
          <td colspan="6" class="text-center text-danger py-3">
            Error al cargar donantes.
          </td>
        </tr>`;
      }
      if (lblRes) lblRes.textContent = '0 donantes';
    }
  }

  // ================================
  // Filtros (en front)
  // ================================
  function aplicarFiltrosYRender() {
    const nombreQ = ($('#filtroNombre')?.value || '').toLowerCase().trim();
    const paisQ   = ($('#filtroPais')?.value   || '').toLowerCase().trim();

    let lista = DONANTES.slice();

    if (nombreQ) {
      lista = lista.filter(d => {
        const nm = (d.nombreCompleto || '').toLowerCase();
        return nm.includes(nombreQ);
      });
    }

    if (paisQ) {
      lista = lista.filter(d => {
        const txt = [
          d.pais || '',
          d.departamento || '',
          d.municipio || ''
        ].join(' ').toLowerCase();
        return txt.includes(paisQ);
      });
    }

    renderTabla(lista);
  }

  // ================================
  // Render tabla
  // ================================
  function renderTabla(lista) {
    const tbody = $('#tbodyDonantes');
    const lblRes = $('#lblResumenTabla');
    if (!tbody) return;

    if (!lista.length) {
      tbody.innerHTML = `<tr>
        <td colspan="6" class="text-center text-muted py-3">
          No se encontraron donantes con los filtros aplicados.
        </td>
      </tr>`;
      if (lblRes) lblRes.textContent = '0 donantes';
      return;
    }

    tbody.innerHTML = lista.map(d => {
      const ubicacion = [d.pais, d.departamento, d.municipio]
        .filter(Boolean).join(' • ');

      return `
        <tr data-id="${d.idDonador}">
          <td>${d.idDonador}</td>
          <td>${d.nombreCompleto || ''}</td>
          <td>${ubicacion || ''}</td>
          <td>${d.telefonoDonante || ''}</td>
          <td>${d.usuarioIngresoNombre || ''}</td>
          <td>
            <button type="button"
                    class="btn btn-sm btn-outline-primary btn-ver-donante"
                    data-id="${d.idDonador}">
              Ver
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (lblRes) {
      const txt = lista.length === 1 ? '1 donante' : `${lista.length} donantes`;
      lblRes.textContent = txt;
    }
  }

  // ================================
  // Modal detalle
  // ================================
  function abrirModalDetalle(id) {
    const d = DONANTES.find(x => String(x.idDonador) === String(id));
    if (!d) return;

    $('#detIdDonador').textContent      = `#${d.idDonador}`;
    $('#detNombreCompleto').textContent = d.nombreCompleto || '';
    $('#detTelefono').textContent       = d.telefonoDonante || '';

    const ubic = [d.pais, d.departamento, d.municipio].filter(Boolean).join(' • ');
    $('#detUbicacion').textContent      = ubic || '';

    $('#detUsuarioDonante').textContent   = d.usuarioDonanteNombre   || '';
    $('#detUsuarioIngreso').textContent   = d.usuarioIngresoNombre   || '';
    $('#detUsuarioActualiza').textContent = d.usuarioActualizaNombre || '';

    $('#detFechaHoraIng').textContent =
      fmtFechaHora(d.fechaIngresoDona, d.horaIngresoDona);
    $('#detFechaHoraAct').textContent =
      fmtFechaHora(d.fechaActualizacion, d.horaActualizacion);

    const modalEl = $('#modalDonante');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  // ================================
  // Init
  // ================================
  document.addEventListener('DOMContentLoaded', async () => {
    await cargarDonantes();

    // Filtros
    $('#formFiltros')?.addEventListener('submit', e => {
      e.preventDefault();
      aplicarFiltrosYRender();
    });

    $('#btnLimpiarFiltros')?.addEventListener('click', () => {
      const fNom  = $('#filtroNombre');
      const fPais = $('#filtroPais');
      if (fNom)  fNom.value  = '';
      if (fPais) fPais.value = '';
      aplicarFiltrosYRender();
    });

    // Botón Ver (modal detalle)
    $('#tbodyDonantes')?.addEventListener('click', e => {
      const btn = e.target.closest('.btn-ver-donante');
      if (!btn) return;
      const id = btn.dataset.id;
      abrirModalDetalle(id);
    });
  });
})();
