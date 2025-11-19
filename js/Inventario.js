// ../js/Inventario.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $ = (s, c = document) => c.querySelector(s);

  let INVENTARIO = []; // cache en memoria

  function fmtQ(n) {
    return Number(n || 0).toFixed(2);
  }

  function fmtFechaHora(fecha, hora) {
    if (!fecha && !hora) return '';
    if (!fecha) return hora || '';
    if (!hora) return fecha;
    const h = (hora || '').toString().slice(0, 5);
    return `${fecha} ${h}`;
  }

  // 👉 ID que vamos a mostrar en la primera columna
  function idBenefCol(row) {
    return (
      row.idBeneficiario ??
      row.beneficiarioId ??
      row.id_beneficiario ??
      ''
    );
  }

  // 👉 Nombre que vamos a mostrar en la segunda columna
  function nombreBeneficiario(row) {
    return (
      row.nombreBeneficiario ||     // viene del SELECT: CONCAT(...)
      row.nombreCompleto ||
      row.beneficiarioNombre ||
      ''
    );
  }

  function pintarTabla(datos) {
    const tbody = $('#tablaInventario tbody');
    if (!tbody) return;

    if (!Array.isArray(datos) || !datos.length) {
      tbody.innerHTML = `
        <tr class="text-muted text-center">
          <td colspan="10">
            <i class="bi bi-emoji-frown me-2"></i>
            No se encontraron registros de inventario.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = datos.map(row => `
      <tr>
        <td class="text-center">${idBenefCol(row)}</td>
        <td>${nombreBeneficiario(row)}</td>
        <td class="text-end">${row.cantidadInicial ?? 0}</td>
        <td class="text-end">${row.cantidadVendida ?? 0}</td>
        <td class="text-end">${row.cantidadConsumida ?? 0}</td>
        <td class="text-end fw-bold">${row.cantidadActual ?? 0}</td>
        <td class="text-end">${row.ultimaCantidadIngre ?? 0}</td>
        <td class="text-end">Q ${fmtQ(row.montoTotal)}</td>
        <td>${fmtFechaHora(row.fechaIngreso, row.horaIngreso)}</td>
        <td>${fmtFechaHora(row.fechaActualizacion, row.horaActualizacion)}</td>
      </tr>
    `).join('');
  }

  // 🔍 Devuelve parámetro de la URL
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // Carga inventario; si viene un idBeneficiario consulta el endpoint específico
  async function cargarInventario(idBeneficiarioFiltro = null) {
    const tbody = $('#tablaInventario tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr class="text-muted text-center">
          <td colspan="10">
            <i class="bi bi-hourglass-split me-2"></i>
            Cargando inventario desde el servidor...
          </td>
        </tr>`;
    }

    try {
      let data;

      if (idBeneficiarioFiltro) {
        // 🚩 Inventario de un beneficiario concreto
        const resp = await fetch(`${API}/inventario/beneficiario/${idBeneficiarioFiltro}`, {
          headers: { 'Accept': 'application/json' }
        });

        if (resp.status === 404) {
          INVENTARIO = [];
          pintarTabla([]);
          return;
        }
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const row = await resp.json();
        data = [row]; // lo convertimos en array de 1
      } else {
        // 📋 Listado completo
        const resp = await fetch(`${API}/inventario`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        data = await resp.json();
      }

      INVENTARIO = Array.isArray(data) ? data : [];
      pintarTabla(INVENTARIO);
    } catch (err) {
      console.error('[Inventario] Error al cargar:', err);
      if (tbody) {
        tbody.innerHTML = `
          <tr class="text-muted text-center">
            <td colspan="10">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Error al cargar el inventario. Verifique que la API esté corriendo.
            </td>
          </tr>`;
      }
    }
  }

  function aplicarFiltros(e) {
    if (e) e.preventDefault();

    const nom   = ($('#filtroNombre')?.value || '').trim().toLowerCase();
    const fecha = ($('#filtroFecha')?.value || '').trim();

    let filtrados = [...INVENTARIO];

    if (nom) {
      filtrados = filtrados.filter(row =>
        nombreBeneficiario(row).toLowerCase().includes(nom)
      );
    }

    if (fecha) {
      filtrados = filtrados.filter(row => row.fechaIngreso === fecha);
    }

    pintarTabla(filtrados);
  }

  function resetFiltros() {
    const fNombre = $('#filtroNombre');
    const fFecha  = $('#filtroFecha');
    if (fNombre) fNombre.value = '';
    if (fFecha)  fFecha.value  = '';
    pintarTabla(INVENTARIO);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const formFiltro = $('#filtroForm');
    const btnReset   = $('#btnReset');

    if (formFiltro) formFiltro.addEventListener('submit', aplicarFiltros);
    if (btnReset)   btnReset.addEventListener('click', resetFiltros);

    const idFromUrl = getQueryParam('id') || getQueryParam('idBeneficiario');
    cargarInventario(idFromUrl);
  });

})();
