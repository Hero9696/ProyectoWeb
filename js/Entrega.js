// js/EntregaPollitos.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);

  const flashBox = $('#flash');
  const selBenef = $('#selBeneficiario');
  const formEntrega = $('#formEntrega');
  const invGenLbl = $('#invGenActual');
  const invBenefLbl = $('#invBenefActual');

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
  // Fallback
  return 1;
}


  function flash(msg, type = 'success') {
    if (!flashBox) return;
    flashBox.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  async function fetchJson(url, options = {}) {
    const resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      ...options
    });

    const txt = await resp.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch {}

    if (!resp.ok) {
      throw new Error(data?.message || txt || `HTTP ${resp.status}`);
    }
    return data;
  }

  // ============================
  // Cargar beneficiarios
  // ============================
  async function cargarBeneficiarios() {
    if (!selBenef) return;
    try {
      const lista = await fetchJson(`${API}/beneficiarios`);

      if (!Array.isArray(lista) || !lista.length) {
        selBenef.innerHTML = `<option value="">No hay beneficiarios</option>`;
        selBenef.disabled = true;
        return;
      }

      selBenef.disabled = false;
      selBenef.innerHTML = `<option value="">Seleccione…</option>` +
        lista.map(b => {
          const nombre =
            b.nombreCompleto ||
            [b.nombre1Beneficiario, b.nombre2Beneficiario, b.apellido1Beneficiario, b.apellido2Beneficiario]
              .filter(Boolean).join(' ');
          return `<option value="${b.idBeneficiario}">${nombre}</option>`;
        }).join('');

    } catch (err) {
      console.error('[Entrega] Error al cargar beneficiarios:', err);
      selBenef.innerHTML = `<option value="">Error al cargar beneficiarios</option>`;
      selBenef.disabled = true;
      flash('No se pudieron cargar los beneficiarios.', 'danger');
    }
  }

  // ============================
  // Cargar inventario general
  // ============================
  async function cargarInventarioGeneral() {
  if (!invGenLbl) return;
  try {
    const resp = await fetch(`${API}/inventario-general`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await resp.json();

    // Puede venir como objeto o como array
    let cantidad = 0;
    if (Array.isArray(data)) {
      cantidad = data[0]?.cantidadActual ?? 0;
    } else {
      cantidad = data.cantidadActual ?? 0;
    }

    invGenLbl.textContent = cantidad;

  } catch (err) {
    console.error('[Entrega] Error al cargar inventario general:', err);
    invGenLbl.textContent = '—';
    flash('No se pudo obtener el inventario general.', 'danger');
  }
}


  // ============================
  // Cargar inventario de beneficiario
  // ============================
  async function cargarInventarioBeneficiario(idBeneficiario) {
    if (!invBenefLbl) return;
    if (!idBeneficiario) {
      invBenefLbl.value = '';
      return;
    }
    try {
      const inv = await fetchJson(`${API}/inventario/beneficiario/${idBeneficiario}`);
      invBenefLbl.value = inv?.cantidadActual ?? 0;
    } catch (err) {
      console.error('[Entrega] Error al cargar inventario de beneficiario:', err);
      invBenefLbl.value = 0;
    }
  }

  // Cambio de beneficiario
  selBenef?.addEventListener('change', e => {
    const id = e.target.value;
    cargarInventarioBeneficiario(id);
  });

  // ============================
  // Registrar entrega
  // ============================
  async function onSubmitEntrega(e) {
    e.preventDefault();
    if (!formEntrega.checkValidity()) {
      formEntrega.classList.add('was-validated');
      return;
    }

    const idBeneficiario = selBenef.value;
    const cantidad = Number($('#cantidadEntrega').value);
    const idUsuario = getLoggedUserId();  // 👈 ahora se toma del login

    if (!idBeneficiario || !cantidad || cantidad <= 0) {
      return flash('Completa todos los campos con valores válidos.', 'warning');
    }

    if (!idUsuario) {
      // No hay usuario en sesión
      return flash('No se encontró usuario autenticado. Inicia sesión de nuevo.', 'danger');
    }

    try {
      const payload = { idBeneficiario, cantidad, idUsuario };
      const data = await fetchJson(`${API}/inventario/entregar`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      flash(data.message || 'Entrega registrada correctamente.', 'success');
      formEntrega.reset();
      formEntrega.classList.remove('was-validated');

      // Refrescar inventarios
      await cargarInventarioGeneral();
      await cargarInventarioBeneficiario(idBeneficiario);

    } catch (err) {
      console.error('[Entrega] Error al registrar entrega:', err);
      flash('Error al registrar entrega: ' + err.message, 'danger');
    }
  }


  document.addEventListener('DOMContentLoaded', () => {
    if (formEntrega) formEntrega.addEventListener('submit', onSubmitEntrega);
    cargarBeneficiarios();
    cargarInventarioGeneral();
  });

})();
