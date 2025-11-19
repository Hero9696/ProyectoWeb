// js/Roles.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);

  const tblBody    = $('#tablaRoles tbody');
  const formCrear  = $('#formRol');
  const formEditar = $('#formEditarRol');
  const flashBox   = $('#flash');

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

    const text = await resp.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }

    if (!resp.ok) {
      const msg = (data && data.message) || text || `HTTP ${resp.status}`;
      throw new Error(msg);
    }
    return data;
  }

  // ============================
  // Cargar lista de roles
  // ============================
  async function cargarRoles() {
    tblBody.innerHTML = `
      <tr class="text-muted">
        <td colspan="3">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Cargando roles...
        </td>
      </tr>`;

    try {
      const roles = await fetchJson(`${API}/roles`);

      if (!Array.isArray(roles) || roles.length === 0) {
        tblBody.innerHTML = `
          <tr class="text-muted">
            <td colspan="3">No hay roles registrados.</td>
          </tr>`;
        return;
      }

      tblBody.innerHTML = roles.map(r => `
        <tr data-id="${r.idRol}">
          <td>${r.nombreRol}</td>
          <td>${r.descripcionRol}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary btn-edit" title="Editar rol">
              <i class="bi bi-pencil-square"></i>
            </button>
          </td>
        </tr>
      `).join('');

      // Activar botones de edición
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', e => {
          const tr = e.target.closest('tr');
          const id  = tr.dataset.id;
          const nom = tr.children[0].textContent;
          const des = tr.children[1].textContent;

          $('#editRolId').value = id;
          $('#editRolNombre').value = nom;
          $('#editRolDesc').value = des;

          new bootstrap.Modal($('#modalRol')).show();
        });
      });

    } catch (err) {
      console.error('[Roles] Error al cargar roles:', err);
      tblBody.innerHTML = `
        <tr class="text-muted">
          <td colspan="3">Error al cargar roles: ${err.message}</td>
        </tr>`;
      flash('Error al cargar roles: ' + err.message, 'danger');
    }
  }

  // ============================
  // Crear rol
  // ============================
  async function onCrearRol(e) {
    e.preventDefault();

    const nombreRol     = $('#rolNombre').value.trim();
    const descripcionRol = $('#rolDesc').value.trim();

    if (!nombreRol || !descripcionRol) {
      flash('Nombre y descripción son obligatorios.', 'warning');
      return;
    }

    const payload = { nombreRol, descripcionRol };

    try {
      const data = await fetchJson(`${API}/roles`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      flash(data.message || 'Rol creado correctamente.', 'success');
      formCrear.reset();
      await cargarRoles();

    } catch (err) {
      console.error('[Roles] Error al crear rol:', err);
      flash('Error al crear rol: ' + err.message, 'danger');
    }
  }

  // ============================
  // Editar rol
  // ============================
  async function onEditarRol(e) {
    e.preventDefault();

    const idRol         = $('#editRolId').value;
    const nombreRol     = $('#editRolNombre').value.trim();
    const descripcionRol = $('#editRolDesc').value.trim();

    if (!idRol || !nombreRol || !descripcionRol) {
      flash('Nombre y descripción son obligatorios.', 'warning');
      return;
    }

    const payload = { nombreRol, descripcionRol };

    try {
      const data = await fetchJson(`${API}/roles/${idRol}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      flash(data.message || 'Rol actualizado correctamente.', 'success');
      bootstrap.Modal.getInstance($('#modalRol')).hide();
      await cargarRoles();

    } catch (err) {
      console.error('[Roles] Error al actualizar rol:', err);
      flash('Error al actualizar rol: ' + err.message, 'danger');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (formCrear)  formCrear.addEventListener('submit', onCrearRol);
    if (formEditar) formEditar.addEventListener('submit', onEditarRol);
    cargarRoles();
  });

})();
