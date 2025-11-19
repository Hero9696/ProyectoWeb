// ../js/Usuarios.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const tblBody = $('#tablaUsuarios tbody');
  const selRol  = $('#usrRol');
  const formUsr = $('#formUsuario');
  const flashBox = $('#flash');

  function showFlash(message, type = 'success') {
    if (!flashBox) return;
    flashBox.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  async function fetchJson(url, options = {}) {
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
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

  // Cargar roles en el <select>
  async function cargarRoles() {
    if (!selRol) return;
    try {
      const roles = await fetchJson(`${API}/roles`);
      if (!Array.isArray(roles) || roles.length === 0) {
        selRol.innerHTML = `<option value="">No hay roles</option>`;
        selRol.disabled = true;
        return;
      }
      selRol.disabled = false;
      selRol.innerHTML = `<option value="">Seleccione rol…</option>` +
        roles.map(r => `
          <option value="${r.idRol || r.id || ''}">
            ${r.nombreRol || r.nombre || r.descripcion || 'Rol'}
          </option>
        `).join('');
    } catch (err) {
      console.error('[Usuarios] Error al cargar roles:', err);
      selRol.innerHTML = `<option value="">Error al cargar roles</option>`;
      selRol.disabled = true;
      showFlash('No se pudieron cargar los roles desde el servidor.', 'danger');
    }
  }

async function cargarUsuarios() {
  if (!tblBody) return;
  tblBody.innerHTML = `
    <tr class="text-muted">
      <td colspan="3">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Cargando usuarios...
      </td>
    </tr>`;

  try {
    const usuarios = await fetchJson(`${API}/usuarios`);

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      tblBody.innerHTML = `
        <tr class="text-muted">
          <td colspan="3">No hay usuarios registrados.</td>
        </tr>`;
      return;
    }

    tblBody.innerHTML = usuarios.map(u => `
      <tr data-id="${u.idUsuario}">
        <td>${u.nombreUsuario}</td>
        <td>${u.nombreRol}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary btn-edit-pass" title="Cambiar contraseña">
            <i class="bi bi-pencil-square"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // ← Activar eventos del lápiz
    $$('.btn-edit-pass').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.closest('tr').dataset.id;
        $('#passUserId').value = id;
        $('#passNueva').value = '';
        new bootstrap.Modal($('#modalPass')).show();
      });
    });

  } catch (err) {
    tblBody.innerHTML = `
      <tr class="text-muted">
        <td colspan="3">Error al cargar usuarios: ${err.message}</td>
      </tr>`;
  }
}


  // Crear usuario
  async function onSubmitUsuario(e) {
    e.preventDefault();
    if (!formUsr.checkValidity()) {
      formUsr.classList.add('was-validated');
      return;
    }

    const nombreUsuario = $('#usrNombre').value.trim();
    const contrasena    = $('#usrPass').value;
    const idRol         = selRol.value;

    if (!nombreUsuario || !contrasena || !idRol) {
      formUsr.classList.add('was-validated');
      return;
    }

    const payload = {
      nombreUsuario,
      contrasena,   // el backend debe hashearla
      idRol: Number(idRol)
    };

    try {
      const data = await fetchJson(`${API}/usuarios`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showFlash(data.message || 'Usuario creado correctamente.', 'success');
      formUsr.reset();
      formUsr.classList.remove('was-validated');
      await cargarUsuarios();
    } catch (err) {
      console.error('[Usuarios] Error al crear usuario:', err);
      showFlash(`Error al crear usuario: ${err.message}`, 'danger');
    }
  }
  async function onSubmitPass(e) {
  e.preventDefault();

  const idUsuario = $('#passUserId').value;
  const nuevaPass = $('#passNueva').value;

  if (!idUsuario || nuevaPass.length < 6) return;

  try {
    const data = await fetchJson(`${API}/usuarios/${idUsuario}/password`, {
      method: 'PUT',
      body: JSON.stringify({ contrasena: nuevaPass })
    });

    showFlash(data.message || 'Contraseña actualizada.', 'success');
    bootstrap.Modal.getInstance($('#modalPass')).hide();
  } catch (err) {
    showFlash('Error al actualizar contraseña: ' + err.message, 'danger');
  }
}


document.addEventListener('DOMContentLoaded', () => {

  // Formulario de creación de usuario
  if (formUsr) formUsr.addEventListener('submit', onSubmitUsuario);

  // Formulario de cambio de contraseña (modal)
  const formPass = $('#formPass');
  if (formPass) formPass.addEventListener('submit', onSubmitPass);

  // Cargar roles y usuarios
  cargarRoles();
  cargarUsuarios();
});


})();
