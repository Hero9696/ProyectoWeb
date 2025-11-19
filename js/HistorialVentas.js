// content/js/HistorialVentas.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);

  let VENTAS = [];

function renderTabla(lista) {
  const tbody = $('#tablaVentas tbody');

  if (!lista.length) {
    tbody.innerHTML = `
      <tr class="text-center text-muted">
        <td colspan="7">
          <i class="bi bi-inbox me-2"></i>
          No se encontraron ventas.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = lista.map(v => {
    const beneTxt = v.nombreBeneficiario
      ? `${v.idBeneficiarioVenta} - ${v.nombreBeneficiario}`
      : (v.idBeneficiarioVenta ?? '');

    const usuarioTxt = v.nombreUsuarioIngresa
      ? `${v.idUsuarioIngresa} - ${v.nombreUsuarioIngresa}`
      : (v.idUsuarioIngresa ?? '');

    return `
      <tr>
        <td>${v.idVenta}</td>
        <td>${beneTxt}</td>
        <td>Q ${Number(v.TotalVenta || 0).toFixed(2)}</td>
        <td>${v.fechaVenta}</td>
        <td>${v.horaVenta ?? ''}</td>
        <td>${usuarioTxt}</td>
        <td class="text-end">
          <button type="button"
                  class="btn btn-sm btn-outline-primary"
                  data-id="${v.idVenta}">
            Ver
          </button>
        </td>
      </tr>
    `;
  }).join('');
}


  // Filtros en memoria (beneficiario + rango fechas)
  function aplicarFiltros() {
    const bene = $('#filtroBeneficiario').value.trim();
    const desde = $('#filtroDesde').value;
    const hasta = $('#filtroHasta').value;

    const filtradas = VENTAS.filter(v => {
      if (bene && String(v.idBeneficiarioVenta) !== bene) return false;

      if (desde && v.fechaVenta < desde) return false;
      if (hasta && v.fechaVenta > hasta) return false;

      return true;
    });

    renderTabla(filtradas);
  }

  function renderDetalle(ventaDet) {
    // Cabecera
    $('#detIdVenta').value = ventaDet.idVenta;
  $('#detIdBene').value  =
    `${ventaDet.idBeneficiarioVenta} - ${(ventaDet.nombreBeneficiario || '')}`;
  $('#detFecha').value   = ventaDet.fechaVenta;
  $('#detHora').value    = ventaDet.horaVenta || '';
  $('#detUsuario').value =
    `${ventaDet.idUsuarioIngresa} - ${(ventaDet.nombreUsuarioIngresa || '')}`;
  $('#detTotal').value   = `Q ${Number(ventaDet.TotalVenta || 0).toFixed(2)}`;

    // Detalle
    const tbody = $('#tablaDetalleVenta tbody');
    const detalles = Array.isArray(ventaDet.detalles) ? ventaDet.detalles : [];

    if (!detalles.length) {
      tbody.innerHTML = `
        <tr class="text-muted text-center">
          <td colspan="4">Sin líneas de detalle.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = detalles.map((d, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${d.cantidad}</td>
        <td>Q ${Number(d.valorUnidad || 0).toFixed(2)}</td>
        <td>Q ${Number(d.subtotal || 0).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  async function cargarVentas() {
    const tbody = $('#tablaVentas tbody');
    tbody.innerHTML = `
      <tr class="text-muted text-center">
        <td colspan="7">Cargando ventas...</td>
      </tr>`;

    try {
      const r = await fetch(`${API}/ventas`);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      VENTAS = await r.json();
      renderTabla(VENTAS);
    } catch (err) {
      console.error('[HistorialVentas] Error al cargar:', err);
      tbody.innerHTML = `
        <tr class="text-muted text-center">
          <td colspan="7">Error al cargar ventas.</td>
        </tr>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const formFiltro = $('#formFiltroVentas');
    const btnLimpiar = $('#btnLimpiarVentas');
    const tbody      = $('#tablaVentas tbody');
    const modalEl    = $('#modalDetalleVenta');
    const modal      = new bootstrap.Modal(modalEl);

    cargarVentas();

    formFiltro.addEventListener('submit', e => {
      e.preventDefault();
      aplicarFiltros();
    });

    btnLimpiar.addEventListener('click', () => {
      $('#filtroBeneficiario').value = '';
      $('#filtroDesde').value = '';
      $('#filtroHasta').value = '';
      renderTabla(VENTAS);
    });

    // Click en "Ver" -> trae detalle desde /api/ventas/:id
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;

      const id = btn.dataset.id;

      try {
        const r = await fetch(`${API}/ventas/${id}`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const ventaDet = await r.json();
        renderDetalle(ventaDet);
        modal.show();
      } catch (err) {
        console.error('[HistorialVentas] Error al cargar detalle:', err);
        alert('No se pudo cargar el detalle de la venta.');
      }
    });
  });

})();
