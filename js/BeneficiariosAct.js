// ../js/BeneficiariosEditar.js
(() => {
  'use strict';

  const API_BASE = 'http://localhost:3000/api';
  const $  = (sel, ctx = document) => ctx.querySelector(sel);

  // ==========================
  // SESIÓN / USUARIO LOGUEADO
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
    // Fallback (como en ingreso)
    return 1;
  }

  // ==========================
  // FECHA / HORA
  // ==========================
  function ahoraFecha() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function ahoraHora() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // ==========================
  // LISTAS GLOBALES (como en ingreso)
  // ==========================
  let listaPaises        = [];
  let listaDepartamentos = [];
  let listaMunicipios    = [];
  let listaLugares       = [];

  // Cargar TODO al inicio, igual que en ingreso
  async function cargarTodosLosDatosIniciales() {
    try {
      const [resPaises, resDepartamentos, resMunicipios, resLugares] =
        await Promise.all([
          fetch(`${API_BASE}/paises`),
          fetch(`${API_BASE}/departamentos`),
          fetch(`${API_BASE}/municipios`),
          fetch(`${API_BASE}/lugares`)
        ]);

      if (!resPaises.ok || !resDepartamentos.ok || !resMunicipios.ok || !resLugares.ok) {
        throw new Error('Error al cargar catálogos de ubicación.');
      }

      listaPaises        = await resPaises.json();
      listaDepartamentos = await resDepartamentos.json();
      listaMunicipios    = await resMunicipios.json();
      listaLugares       = await resLugares.json();
    } catch (err) {
      console.error('⛔ Error cargando catálogos:', err);
      alert('Error al cargar catálogos de ubicación. Verifique la API.');
    }
  }

  // ==========================
  // UTILIDAD PARA SELECTS
  // ==========================
  function rellenarSelect(selectId, dataArray, valueKey, textKey, defaultText, valorSeleccionado = null) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    selectElement.innerHTML = `<option value="">${defaultText}</option>`;

    if (!dataArray || dataArray.length === 0) {
      selectElement.disabled = true;
      return;
    }

    selectElement.disabled = false;

    dataArray.forEach(item => {
      const value = item[valueKey];
      const text  = item[textKey];
      const selected = (valorSeleccionado !== null && value == valorSeleccionado) ? 'selected' : '';
      selectElement.innerHTML += `<option value="${value}" ${selected}>${text}</option>`;
    });
  }

  // ==========================
  // CASCADA (IGUAL QUE INGRESO)
  // ==========================
  function cargarPaises(selectPaisId, selectDeptoId, selectMuniId, selectLugarId, valorSeleccionado = null) {
    rellenarSelect(selectPaisId, listaPaises, 'idPais', 'nombrePais', 'Seleccione un País', valorSeleccionado);
    rellenarSelect(selectDeptoId, [], 'idDepartamento', 'nombreDepartamento', 'Seleccione un Departamento');
    rellenarSelect(selectMuniId, [], 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio');
    rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
  }

  function cargarDepartamentos(selectDeptoId, selectMuniId, selectLugarId, idPais, valorSeleccionado = null) {
    const departamentosFiltrados = listaDepartamentos.filter(d => d.idPaisDepa == idPais);
    rellenarSelect(selectDeptoId, departamentosFiltrados, 'idDepartamento', 'nombreDepartamento', 'Seleccione un Departamento', valorSeleccionado);
    rellenarSelect(selectMuniId, [], 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio');
    rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
  }

  function cargarMunicipios(selectMuniId, selectLugarId, idDepartamento, valorSeleccionado = null) {
    const municipiosFiltrados = listaMunicipios.filter(m => m.idDepartamentoMuni == idDepartamento);
    rellenarSelect(selectMuniId, municipiosFiltrados, 'idMunicipio', 'nombreMunicipio', 'Seleccione un Municipio', valorSeleccionado);
    rellenarSelect(selectLugarId, [], 'idLugar', 'nombreLugar', 'Seleccione un Lugar');
  }

  function cargarLugares(selectLugarId, idMunicipio, valorSeleccionado = null) {
    const lugaresFiltrados = listaLugares.filter(l => l.idMunicipioLugar == idMunicipio);
    rellenarSelect(selectLugarId, lugaresFiltrados, 'idLugar', 'nombreLugar', 'Seleccione un Lugar', valorSeleccionado);
  }

  // ==========================
  // RELLENAR FORMULARIO CON BENEFICIARIO
  // ==========================
  async function llenarFormularioConBeneficiario(b) {
    // Campos básicos
    $('#idBeneficiario').value        = b.idBeneficiario;
    $('#nombre1Beneficiario').value   = b.nombre1Beneficiario ?? '';
    $('#nombre2Beneficiario').value   = b.nombre2Beneficiario ?? '';
    $('#nombre3Beneficiario').value   = b.nombre3Beneficiario ?? '';
    $('#apellido1Beneficiario').value = b.apellido1Beneficiario ?? '';
    $('#apellido2Beneficiario').value = b.apellido2Beneficiario ?? '';
    $('#apellido3Beneficiario').value = b.apellido3Beneficiario ?? '';

    $('#idEncargadoBene').value       = b.idEncargadoBene ?? '';

    $('#estadoBeneficiario').value    =
      (b.estadoBeneficiario || '').toUpperCase() === 'I' ? 'I' : 'A';

    // Ingreso original (solo lectura / hidden)
    $('#fechaIngresoBene').value      = b.fechaIngresoBene ?? '';
    $('#horaIngresoBene').value       = (b.horaIngresoBene ?? '').substring(0, 8);
    $('#idUsuarioIngreso').value      = b.idUsuarioIngreso ?? '';

    // Fechas/hora de actualización (se setean al guardar)
    $('#fechaActualizacion').value    = b.fechaActualizacion ?? '';
    $('#horaActualizacion').value     = (b.horaActualizacion ?? '').substring(0, 8);

    // IDs de ubicación
    const idPais  = b.idPaisBene;
    const idDepto = b.idDepartamentoBene;
    const idMuni  = b.idMunicipioBene;
    const idLugar = b.idLugarBene;

    // Usar EXACTAMENTE las mismas funciones de cascada del ingreso
    cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene', idPais);
    if (idPais) {
      cargarDepartamentos('idDepartamentoBene', 'idMunicipioBene', 'idLugarBene', idPais, idDepto);
    }
    if (idDepto) {
      cargarMunicipios('idMunicipioBene', 'idLugarBene', idDepto, idMuni);
    }
    if (idMuni) {
      cargarLugares('idLugarBene', idMuni, idLugar);
    }
  }

  // ==========================
  // BUSCAR BENEFICIARIO POR ID
  // ==========================
  async function buscarBeneficiarioPorId() {
    const id = parseInt($('#buscarIdBeneficiario').value, 10);
    const msg = $('#msgBusquedaBene');
    const seccionEdicion = $('#seccionEdicionBene');
    const badgePaso2 = $('#badgePaso2');

    msg.textContent = '';
    msg.className = '';
    seccionEdicion.classList.add('d-none');
    badgePaso2?.classList.add('disabled');

    if (!id || id <= 0) {
      msg.textContent = 'Ingrese un ID de beneficiario válido.';
      msg.classList.add('text-danger');
      return;
    }

    try {
      msg.textContent = 'Buscando beneficiario...';
      msg.classList.remove('text-danger', 'text-success');
      msg.classList.add('text-muted');

      const resp = await fetch(`${API_BASE}/beneficiarios/${id}`);
      if (!resp.ok) {
        if (resp.status === 404) {
          msg.textContent = `No se encontró beneficiario con ID ${id}.`;
          msg.className = 'mt-3 fw-bold text-danger';
          return;
        }
        throw new Error('Error HTTP ' + resp.status);
      }

      const bene = await resp.json();
      await llenarFormularioConBeneficiario(bene);

      msg.textContent = `Beneficiario ${bene.nombre1Beneficiario} ${bene.apellido1Beneficiario} cargado.`;
      msg.className = 'mt-3 fw-bold text-success';

      seccionEdicion.classList.remove('d-none');
      badgePaso2?.classList.remove('disabled');

    } catch (err) {
      console.error('[EditarBene] Error al buscar beneficiario:', err);
      msg.textContent = 'Ocurrió un error al buscar el beneficiario.';
      msg.className = 'mt-3 fw-bold text-danger';
    }
  }

  // ==========================
  // GUARDAR CAMBIOS (PUT)
  // ==========================
  async function guardarCambiosBeneficiario(e) {
    e.preventDefault();

    const form = e.currentTarget;
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    const id = parseInt($("#idBeneficiario").value, 10);
    if (!id) {
      alert("No hay beneficiario cargado.");
      return;
    }

    // Usuario logueado
    const usuarioActual = getLoggedUserId();
    if (!usuarioActual) {
      alert("Error: no se detectó usuario logueado.");
      return;
    }

    // Setear fecha/hora automáticamente
    $("#fechaActualizacion").value = ahoraFecha();
    $("#horaActualizacion").value = ahoraHora();
    $("#idUsuarioActualiza").value = usuarioActual;

    const payload = {
      nombre1Beneficiario: $("#nombre1Beneficiario").value.trim(),
      nombre2Beneficiario: $("#nombre2Beneficiario").value.trim(),
      nombre3Beneficiario: $("#nombre3Beneficiario").value.trim(),
      apellido1Beneficiario: $("#apellido1Beneficiario").value.trim(),
      apellido2Beneficiario: $("#apellido2Beneficiario").value.trim(),
      apellido3Beneficiario: $("#apellido3Beneficiario").value.trim(),
      idPaisBene: parseInt($("#idPaisBene").value),
      idDepartamentoBene: parseInt($("#idDepartamentoBene").value),
      idMunicipioBene: parseInt($("#idMunicipioBene").value),
      idLugarBene: parseInt($("#idLugarBene").value),
      idEncargadoBene: parseInt($("#idEncargadoBene").value),
      estadoBeneficiario: $("#estadoBeneficiario").value || "A",

      // Auditoría automática
      idUsuarioActualiza: usuarioActual
    };

    try {
      const resp = await fetch(`${API_BASE}/beneficiarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message);

      alert("Beneficiario actualizado correctamente.");
    } catch (err) {
      console.error("[EditarBene] Error al actualizar beneficiario:", err);
      alert("Error al actualizar beneficiario: " + err.message);
    }
  }

  // ==========================
  // EVENTOS
  // ==========================
  document.addEventListener('DOMContentLoaded', () => {
    // Cargar catálogos de ubicación UNA sola vez
    cargarTodosLosDatosIniciales().then(() => {
      // Una vez cargados, puedes dejar los selects vacíos hasta que busquen
      cargarPaises('idPaisBene', 'idDepartamentoBene', 'idMunicipioBene', 'idLugarBene');
    });

    const btnBuscar = $('#btnBuscarBeneficiario');
    const formEdit  = $('#formActualizarBene');
    const btnCancel = $('#btnCancelarEdicion');

    btnBuscar?.addEventListener('click', buscarBeneficiarioPorId);
    formEdit?.addEventListener('submit', guardarCambiosBeneficiario);

    btnCancel?.addEventListener('click', () => {
      $('#seccionEdicionBene')?.classList.add('d-none');
      $('#msgBusquedaBene').textContent = 'Edición cancelada.';
      $('#msgBusquedaBene').className = 'mt-3 fw-bold text-muted';
      $('#badgePaso2')?.classList.add('disabled');
    });

    // Cascada cuando el usuario cambia manualmente:
    const selectPais  = document.getElementById('idPaisBene');
    const selectDepto = document.getElementById('idDepartamentoBene');
    const selectMuni  = document.getElementById('idMunicipioBene');
    const selectLugar = document.getElementById('idLugarBene');

    selectPais?.addEventListener('change', e => {
      const idPais = e.target.value || null;
      cargarDepartamentos(selectDepto.id, selectMuni.id, selectLugar.id, idPais);
    });

    selectDepto?.addEventListener('change', e => {
      const idDepto = e.target.value || null;
      cargarMunicipios(selectMuni.id, selectLugar.id, idDepto);
    });

    selectMuni?.addEventListener('change', e => {
      const idMuni = e.target.value || null;
      cargarLugares(selectLugar.id, idMuni);
    });
  });

})();
