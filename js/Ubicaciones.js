// js/Ubicaciones.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);

  // =========================
  // DATA en memoria (igual idea que en ingreso)
  // =========================
  const DATA = {
    paises: [],          // [{ id, nombre }]
    departamentos: {},   // { idPais: [ {id, nombre}, ... ] }
    municipios: {}       // { idDepartamento: [ {id, nombre}, ... ] }
  };

  // =========================
  // Helpers HTTP
  // =========================
  async function apiGet(path) {
    const r = await fetch(`${API}${path}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  async function apiPost(path, data) {
    const r = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      const msg = await r.text().catch(() => '');
      throw new Error(`HTTP ${r.status}: ${msg}`);
    }
    return r.json().catch(() => ({}));
  }

  // =========================
  // Helpers de selects
  // =========================
  function setOptions(select, items, {
    placeholder = 'Selecciona una opción'
  } = {}) {
    if (!select) return;
    if (!Array.isArray(items) || !items.length) {
      select.innerHTML = `<option value="">${placeholder}</option>`;
      select.disabled = true;
      return;
    }
    select.innerHTML = [
      `<option value="">${placeholder}</option>`,
      ...items.map(it =>
        `<option value="${it.id}">${it.nombre}</option>`
      )
    ].join('');
    select.disabled = false;
  }

  function showOk(msg) {
    alert(msg);
  }

  function showError(msg) {
    console.error(msg);
    alert('Ocurrió un error: ' + msg);
  }

  // =========================
  // Cargar catálogos UNA VEZ
  // =========================
  async function cargarCatalogos() {
    // 1) Países
    const paises = await apiGet('/paises');
    DATA.paises = paises.map(p => ({
      id: p.idPais,
      nombre: p.nombrePais
    }));

    // 2) Departamentos
    const deps = await apiGet('/departamentos');
    DATA.departamentos = deps.reduce((acc, d) => {
      if (!acc[d.idPaisDepa]) acc[d.idPaisDepa] = [];
      acc[d.idPaisDepa].push({
        id: d.idDepartamento,
        nombre: d.nombreDepartamento
      });
      return acc;
    }, {});

    // 3) Municipios
    const munis = await apiGet('/municipios');
    DATA.municipios = munis.reduce((acc, m) => {
      if (!acc[m.idDepartamentoMuni]) acc[m.idDepartamentoMuni] = [];
      acc[m.idDepartamentoMuni].push({
        id: m.idMunicipio,
        nombre: m.nombreMunicipio
      });
      return acc;
    }, {});
  }

  // =========================
  // Cargar países en TODOS los selects
  // =========================
  function inicializarSelectPaises() {
    const selPaisLugar = $('#selPaisLugar');
    const selPaisDepa  = $('#selPaisDepa');
    const selPaisMuni  = $('#selPaisMuni');

    const optsPais = DATA.paises;

    if (selPaisLugar) {
      setOptions(selPaisLugar, optsPais, {
        placeholder: 'Selecciona un país'
      });
    }
    if (selPaisDepa) {
      setOptions(selPaisDepa, optsPais, {
        placeholder: 'Selecciona un país'
      });
    }
    if (selPaisMuni) {
      setOptions(selPaisMuni, optsPais, {
        placeholder: 'Selecciona un país'
      });
    }
  }

  // =========================
  // Funciones de cascada usando DATA
  // =========================
  function cargarDepartamentosDesdeData(idPais, selectDestino, placeholder = 'Selecciona un departamento') {
    if (!selectDestino) return;
    if (!idPais) {
      selectDestino.innerHTML = '<option value="">Selecciona un país primero</option>';
      selectDestino.disabled = true;
      return;
    }
    const lista = DATA.departamentos[idPais] || [];
    setOptions(selectDestino, lista, { placeholder });
  }

  function cargarMunicipiosDesdeData(idDepartamento, selectDestino, placeholder = 'Selecciona un municipio') {
    if (!selectDestino) return;
    if (!idDepartamento) {
      selectDestino.innerHTML = '<option value="">Selecciona un departamento primero</option>';
      selectDestino.disabled = true;
      return;
    }
    const lista = DATA.municipios[idDepartamento] || [];
    setOptions(selectDestino, lista, { placeholder });
  }

  // =========================
  // Init
  // =========================
  document.addEventListener('DOMContentLoaded', async () => {
    const formLugar        = $('#formLugar');
    const selPaisLugar     = $('#selPaisLugar');
    const selDepaLugar     = $('#selDepartamentoLugar');
    const selMuniLugar     = $('#selMunicipioLugar');
    const inpNombreLugar   = $('#inpNombreLugar');
    const btnLimpiarLugar  = $('#btnLimpiarLugar');

    const formPais         = $('#formPais');
    const inpNombrePais    = $('#inpNombrePais');

    const formDepa         = $('#formDepartamento');
    const selPaisDepa      = $('#selPaisDepa');
    const inpNombreDepa    = $('#inpNombreDepartamento');

    const formMuni         = $('#formMunicipio');
    const selPaisMuni      = $('#selPaisMuni');
    const selDepaMuni      = $('#selDepaMuni');
    const inpNombreMuni    = $('#inpNombreMunicipio');

    // 1) Cargar catálogos (paises, deps, munis)
    try {
      await cargarCatalogos();
      inicializarSelectPaises();
    } catch (e) {
      showError('Error al cargar catálogos de ubicación: ' + e.message);
    }

    // -----------------------------
    // Cascada para Lugar (País → Depto → Muni)
    // -----------------------------
    if (selPaisLugar) {
      selPaisLugar.addEventListener('change', () => {
        const idPais = selPaisLugar.value;
        cargarDepartamentosDesdeData(idPais, selDepaLugar, 'Selecciona un departamento');
        // limpiar municipios
        if (selMuniLugar) {
          selMuniLugar.innerHTML = '<option value="">Selecciona un departamento primero</option>';
          selMuniLugar.disabled = true;
        }
      });
    }

    if (selDepaLugar) {
      selDepaLugar.addEventListener('change', () => {
        const idDepa = selDepaLugar.value;
        cargarMunicipiosDesdeData(idDepa, selMuniLugar, 'Selecciona un municipio');
      });
    }

    // -----------------------------
    // Cascada para Municipio (País → Depto) en catálogo
    // -----------------------------
    if (selPaisMuni) {
      selPaisMuni.addEventListener('change', () => {
        const idPais = selPaisMuni.value;
        cargarDepartamentosDesdeData(idPais, selDepaMuni, 'Selecciona un departamento');
      });
    }

    // ======================
    // Guardar LUGAR
    // ======================
    if (formLugar) {
      formLugar.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        formLugar.classList.add('was-validated');
        if (!formLugar.checkValidity()) return;

        const data = {
          idPaisLugar:        Number(selPaisLugar.value),
          idDepartamentoLugar:Number(selDepaLugar.value),
          idMunicipioLugar:   Number(selMuniLugar.value),
          nombreLugar:        (inpNombreLugar.value || '').trim()
        };

        try {
          await apiPost('/lugares', data);
          showOk('Lugar guardado correctamente.');
          formLugar.reset();
          formLugar.classList.remove('was-validated');

          // Después de reset, deshabilitamos selects dependientes
          if (selDepaLugar) {
            selDepaLugar.innerHTML = '<option value="">Selecciona un país primero</option>';
            selDepaLugar.disabled = true;
          }
          if (selMuniLugar) {
            selMuniLugar.innerHTML = '<option value="">Selecciona un departamento primero</option>';
            selMuniLugar.disabled = true;
          }
        } catch (e2) {
          showError(e2.message);
        }
      });
    }

    if (btnLimpiarLugar && formLugar) {
      btnLimpiarLugar.addEventListener('click', () => {
        formLugar.classList.remove('was-validated');
        if (selDepaLugar) {
          selDepaLugar.innerHTML = '<option value="">Selecciona un país primero</option>';
          selDepaLugar.disabled = true;
        }
        if (selMuniLugar) {
          selMuniLugar.innerHTML = '<option value="">Selecciona un departamento primero</option>';
          selMuniLugar.disabled = true;
        }
      });
    }

    // ======================
    // Guardar PAÍS
    // ======================
    if (formPais) {
      formPais.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        formPais.classList.add('was-validated');
        if (!formPais.checkValidity()) return;

        const data = {
          nombrePais: (inpNombrePais.value || '').trim()
        };

        try {
          await apiPost('/paises', data);
          showOk('País guardado correctamente.');
          formPais.reset();
          formPais.classList.remove('was-validated');

          // recargar catálogos en memoria y selects de país
          await cargarCatalogos();
          inicializarSelectPaises();
        } catch (e2) {
          showError(e2.message);
        }
      });
    }

    // ======================
    // Guardar DEPARTAMENTO
    // ======================
    if (formDepa) {
      formDepa.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        formDepa.classList.add('was-validated');
        if (!formDepa.checkValidity()) return;

        const data = {
          idPaisDepa:        Number(selPaisDepa.value),
          nombreDepartamento:(inpNombreDepa.value || '').trim()
        };

        try {
          await apiPost('/departamentos', data);
          showOk('Departamento guardado correctamente.');
          formDepa.reset();
          formDepa.classList.remove('was-validated');

          // recargar catálogos
          await cargarCatalogos();
          inicializarSelectPaises();
        } catch (e2) {
          showError(e2.message);
        }
      });
    }

    // ======================
    // Guardar MUNICIPIO
    // ======================
    if (formMuni) {
      formMuni.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        formMuni.classList.add('was-validated');
        if (!formMuni.checkValidity()) return;

        const data = {
          idPaisMuni:        Number(selPaisMuni.value),
          idDepartamentoMuni:Number(selDepaMuni.value),
          nombreMunicipio:   (inpNombreMuni.value || '').trim()
        };

        try {
          await apiPost('/municipios', data);
          showOk('Municipio guardado correctamente.');
          formMuni.reset();
          formMuni.classList.remove('was-validated');
          if (selDepaMuni) {
            selDepaMuni.innerHTML = '<option value="">Selecciona un país primero</option>';
            selDepaMuni.disabled = true;
          }

          // recargar catálogos
          await cargarCatalogos();
          inicializarSelectPaises();
        } catch (e2) {
          showError(e2.message);
        }
      });
    }
  });
})();
