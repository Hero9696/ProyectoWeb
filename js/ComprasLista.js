// js/ComprasLista.js - Lista de compras (solo consulta)
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $ = (s, c = document) => c.querySelector(s);

  const fmtQ = n => 'Q ' + Number(n || 0).toFixed(2);

  function fmtFechaHora(fecha, hora) {
    if (!fecha && !hora) return '';
    return [fecha || '', hora || ''].join(' ').trim();
  }

  // ================================
  // Cargar compras desde la API
  // filtros = { desde, hasta, idCaja }
  // ================================
  async function cargarCompras(filtros = {}) {
    const tbody = $('#tbodyCompras');
    const lblRes = $('#lblResumenTabla');

    // Construir query params
    const params = new URLSearchParams();
    if (filtros.desde)  params.append('desde', filtros.desde);
    if (filtros.hasta)  params.append('hasta', filtros.hasta);
    if (filtros.idCaja) params.append('idCaja', filtros.idCaja);

    const url = params.toString()
      ? `${API}/compras?${params.toString()}`
      : `${API}/compras`;

    try {
      const r = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const lista = await r.json();

      if (!Array.isArray(lista) || !lista.length) {
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center text-muted py-3">
                No hay compras registradas.
              </td>
            </tr>`;
        }
        if (lblRes) lblRes.textContent = '0 compras';
        return;
      }

      if (tbody) {
        tbody.innerHTML = lista.map(c => `
          <tr>
            <td>${c.idCompra}</td>
            <td>${fmtFechaHora(c.fechaCompra, c.horaCompra)}</td>
            <td>${c.idCajaCompra}</td>
            <td class="text-end">${c.cantidadCompra}</td>
            <td class="text-end">${fmtQ(c.totalCompra)}</td>
            <td>${c.usuarioIngresaNombre || ''}</td>
          </tr>
        `).join('');
      }

      if (lblRes) {
        const txt = lista.length === 1 ? '1 compra' : `${lista.length} compras`;
        lblRes.textContent = txt;
      }

    } catch (e) {
      console.error('Error al cargar compras:', e);
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-danger py-3">
              Error al cargar compras.
            </td>
          </tr>`;
      }
      if (lblRes) lblRes.textContent = '0 compras';
    }
  }

  // ================================
  // Init
  // ================================
  document.addEventListener('DOMContentLoaded', () => {
    const formFiltros = $('#formFiltros');
    const inpDesde    = $('#filtroDesde');
    const inpHasta    = $('#filtroHasta');
    const inpCaja     = $('#filtroCaja');
    const btnLimpiar  = $('#btnLimpiarFiltros');

    // Cargar todo sin filtros al inicio
    cargarCompras();

    // Aplicar filtros
    if (formFiltros) {
      formFiltros.addEventListener('submit', (e) => {
        e.preventDefault();

        const filtros = {
          desde:  inpDesde?.value || '',
          hasta:  inpHasta?.value || '',
          idCaja: inpCaja?.value  || ''
        };

        cargarCompras(filtros);
      });
    }

    // Limpiar filtros
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', () => {
        if (inpDesde) inpDesde.value = '';
        if (inpHasta) inpHasta.value = '';
        if (inpCaja)  inpCaja.value  = '';

        cargarCompras(); // sin filtros
      });
    }
  });
})();
