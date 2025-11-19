// content/js/ConsultaBeneficiarios.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);

  let BENEFICIARIOS = [];

  function normalizarTexto(t) {
    return (t || '').toString().trim().toLowerCase();
  }

  // ============ TABLA ============
  function renderTabla(lista) {
    const tbody = $('#tablaBeneficiarios tbody');

    if (!lista.length) {
      tbody.innerHTML = `
        <tr class="text-center text-muted">
          <td colspan="8">
            <i class="bi bi-inbox me-2"></i>
            No se encontraron beneficiarios.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = lista.map(b => {
      // Nombre: usa nombreCompleto si viene, sino lo arma
      const nombre =
        b.nombreCompleto ||
        [
          b.nombre1Beneficiario,
          b.nombre2Beneficiario,
          b.nombre3Beneficiario,
          b.apellido1Beneficiario,
          b.apellido2Beneficiario,
          b.apellido3Beneficiario
        ]
          .filter(Boolean)
          .join(' ') ||
        '(sin nombre)';

      // Ubicación: SOLO la descripción del lugar (tabla Lugares)
      const ubicacion = b.nombreLugar || '';

      // Encargado: nombre si lo trae el backend, si no el id
      const encargado =
        b.nombreEncargado ||
        (b.idEncargadoBene != null ? b.idEncargadoBene : '');

      const estadoTxt = b.estadoBeneficiario === 'A' ? 'Activo' : 'Inactivo';

      const ingreso = [b.fechaIngresoBene, b.horaIngresoBene]
        .filter(Boolean)
        .join(' ');

      const actualizacion = [b.fechaActualizacion, b.horaActualizacion]
        .filter(Boolean)
        .join(' ');

      return `
        <tr>
          <td>${b.idBeneficiario}</td>
          <td>${nombre}</td>
          <td>${ubicacion}</td>
          <td>${encargado}</td>
          <td>${estadoTxt}</td>
          <td>${ingreso}</td>
          <td>${actualizacion}</td>
          <td class="text-end">
            <button type="button"
                    class="btn btn-sm btn-outline-primary"
                    data-id="${b.idBeneficiario}">
              Ver
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  // ============ FILTROS ============
  function aplicarFiltros() {
    const txt = normalizarTexto($('#filtroNombre').value);
    const est = $('#filtroEstado').value;

    const filtrados = BENEFICIARIOS.filter(b => {
      if (est && b.estadoBeneficiario !== est) return false;

      if (txt) {
        const nombreCompleto = normalizarTexto(
          b.nombreCompleto ||
          [
            b.nombre1Beneficiario,
            b.nombre2Beneficiario,
            b.nombre3Beneficiario,
            b.apellido1Beneficiario,
            b.apellido2Beneficiario,
            b.apellido3Beneficiario
          ]
            .filter(Boolean)
            .join(' ')
        );
        if (!nombreCompleto.includes(txt)) return false;
      }

      return true;
    });

    renderTabla(filtrados);
  }

  // ============ MODAL ============
  function llenarModal(b) {
    // Datos básicos
    $('#detId').value       = b.idBeneficiario;
    $('#detNom1').value     = b.nombre1Beneficiario || '';
    $('#detNom2').value     = b.nombre2Beneficiario || '';
    $('#detNom3').value     = b.nombre3Beneficiario || '';
    $('#detApe1').value     = b.apellido1Beneficiario || '';
    $('#detApe2').value     = b.apellido2Beneficiario || '';
    $('#detApe3').value     = b.apellido3Beneficiario || '';
    $('#detEstado').value   = b.estadoBeneficiario === 'A' ? 'Activo' : 'Inactivo';

    // Ubicación: DESCRIPCIONES, no IDs
    $('#detPais').value     = b.nombrePais || '';
    $('#detDepto').value    = b.nombreDepartamento || '';
    $('#detMuni').value     = b.nombreMunicipio || '';
    $('#detLugar').value    = b.nombreLugar || '';

    // Encargado: nombre, no id
    $('#detEncargado').value = b.nombreEncargado || '';

    // Usuarios
    $('#detUsrIng').value   = b.usuarioIngreso || b.idUsuarioIngreso || '';
    $('#detUsrAct').value   = b.usuarioActualiza || b.idUsuarioActualiza || '';

    // Fechas
    $('#detFIng').value     = b.fechaIngresoBene || '';
    $('#detHIng').value     = b.horaIngresoBene || '';
    $('#detFAct').value     = b.fechaActualizacion || '';
    $('#detHAct').value     = b.horaActualizacion || '';
  }

  // ============ CARGA INICIAL ============
  async function cargarBeneficiarios() {
    const tbody = $('#tablaBeneficiarios tbody');
    tbody.innerHTML = `
      <tr class="text-muted text-center">
        <td colspan="8">Cargando beneficiarios...</td>
      </tr>`;

    try {
      const r = await fetch(`${API}/beneficiarios`);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      BENEFICIARIOS = await r.json();
      renderTabla(BENEFICIARIOS);
    } catch (err) {
      console.error('[ConsultaBeneficiarios] Error al cargar:', err);
      tbody.innerHTML = `
        <tr class="text-muted text-center">
          <td colspan="8">Error al cargar beneficiarios.</td>
        </tr>`;
    }
  }

  // ============ EVENTOS ============
  document.addEventListener('DOMContentLoaded', () => {
    const formFiltro = $('#formFiltro');
    const btnLimpiar = $('#btnLimpiar');
    const tbody      = $('#tablaBeneficiarios tbody');
    const modalEl    = $('#modalDetalleBene');
    const modal      = new bootstrap.Modal(modalEl);

    cargarBeneficiarios();

    formFiltro.addEventListener('submit', e => {
      e.preventDefault();
      aplicarFiltros();
    });

    btnLimpiar.addEventListener('click', () => {
      $('#filtroNombre').value = '';
      $('#filtroEstado').value = '';
      renderTabla(BENEFICIARIOS);
    });

    // Click en botón "Ver" de la tabla
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('button[data-id]');
      if (!btn) return;

      const id = Number(btn.dataset.id);

      try {
        // ⚠️ Para el modal usamos el endpoint detallado
        const r = await fetch(`${API}/beneficiarios/${id}`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const bene = await r.json();
        llenarModal(bene);
        modal.show();
      } catch (err) {
        console.error('[ConsultaBeneficiarios] Error al cargar detalle:', err);
        alert('No se pudo cargar el detalle del beneficiario.');
      }
    });
  });

})();
