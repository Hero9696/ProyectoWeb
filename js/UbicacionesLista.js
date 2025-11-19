// js/UbicacionesLista.js - Consulta de ubicaciones
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $  = (s, c = document) => c.querySelector(s);

  async function apiGet(path) {
    const r = await fetch(`${API}${path}`, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  function setOptions(select, items, {
    valueField = 'id',
    textField  = 'nombre',
    placeholder = 'Todos'
  } = {}) {
    if (!select) return;
    const opts = [
      `<option value="">${placeholder}</option>`,
      ...(Array.isArray(items) ? items.map(it =>
        `<option value="${it[valueField]}">${it[textField]}</option>`
      ) : [])
    ];
    select.innerHTML = opts.join('');
    select.disabled = !items || !items.length;
  }

  async function cargarPaisesFiltro() {
    const selPais = $('#filtroPais');
    try {
      const paises = await apiGet('/paises');
      setOptions(selPais, paises, {
        valueField: 'idPais',
        textField: 'nombrePais',
        placeholder: 'Todos'
      });
    } catch (e) {
      console.error(e);
      if (selPais) {
        selPais.innerHTML = '<option value="">Error al cargar países</option>';
        selPais.disabled = true;
      }
    }
  }

  async function cargarDepartamentosFiltro(idPais) {
    const selDepa = $('#filtroDepartamento');
    const selMuni = $('#filtroMunicipio');

    if (!idPais) {
      if (selDepa) {
        selDepa.innerHTML = '<option value="">Todos</option>';
        selDepa.disabled = true;
      }
      if (selMuni) {
        selMuni.innerHTML = '<option value="">Todos</option>';
        selMuni.disabled = true;
      }
      return;
    }

    try {
      const deps = await apiGet(`/departamentos?idPais=${encodeURIComponent(idPais)}`);
      setOptions(selDepa, deps, {
        valueField: 'idDepartamento',
        textField: 'nombreDepartamento',
        placeholder: 'Todos'
      });
      if (selMuni) {
        selMuni.innerHTML = '<option value="">Todos</option>';
        selMuni.disabled = true;
      }
    } catch (e) {
      console.error(e);
      if (selDepa) {
        selDepa.innerHTML = '<option value="">Error</option>';
        selDepa.disabled = true;
      }
    }
  }

  async function cargarMunicipiosFiltro(idPais, idDepartamento) {
    const selMuni = $('#filtroMunicipio');

    if (!idPais || !idDepartamento) {
      if (selMuni) {
        selMuni.innerHTML = '<option value="">Todos</option>';
        selMuni.disabled = true;
      }
      return;
    }

    try {
      const munis = await apiGet(`/municipios?idPais=${encodeURIComponent(idPais)}&idDepartamento=${encodeURIComponent(idDepartamento)}`);
      setOptions(selMuni, munis, {
        valueField: 'idMunicipio',
        textField: 'nombreMunicipio',
        placeholder: 'Todos'
      });
    } catch (e) {
      console.error(e);
      if (selMuni) {
        selMuni.innerHTML = '<option value="">Error</option>';
        selMuni.disabled = true;
      }
    }
  }

  // =========================
  // Cargar tabla de lugares
  // =========================
  async function cargarLugares(filtros = {}) {
    const tbody = $('#tbodyUbicaciones');
    const lblRes = $('#lblResumenUbicaciones');

    const params = new URLSearchParams();
    if (filtros.idPais)         params.append('idPais', filtros.idPais);
    if (filtros.idDepartamento) params.append('idDepartamento', filtros.idDepartamento);
    if (filtros.idMunicipio)    params.append('idMunicipio', filtros.idMunicipio);

    const url = params.toString()
      ? `/lugares?${params.toString()}`
      : '/lugares';

    try {
      const lista = await apiGet(url);

      if (!Array.isArray(lista) || !lista.length) {
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="text-center text-muted py-4">
                No hay ubicaciones registradas.
              </td>
            </tr>`;
        }
        if (lblRes) lblRes.textContent = '0 ubicaciones';
        return;
      }

      if (tbody) {
        tbody.innerHTML = lista.map(l => `
          <tr>
            <td>${l.idLugar}</td>
            <td>${l.nombrePais}</td>
            <td>${l.nombreDepartamento}</td>
            <td>${l.nombreMunicipio}</td>
            <td>${l.nombreLugar}</td>
          </tr>
        `).join('');
      }

      if (lblRes) {
        const txt = lista.length === 1 ? '1 ubicación' : `${lista.length} ubicaciones`;
        lblRes.textContent = txt;
      }

    } catch (e) {
      console.error('Error al cargar ubicaciones:', e);
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-danger py-4">
              Error al cargar ubicaciones.
            </td>
          </tr>`;
      }
      if (lblRes) lblRes.textContent = '0 ubicaciones';
    }
  }

  // =========================
  // Init
  // =========================
  document.addEventListener('DOMContentLoaded', () => {
    const selPais = $('#filtroPais');
    const selDepa = $('#filtroDepartamento');
    const selMuni = $('#filtroMunicipio');
    const formFiltros = $('#formFiltrosUbicaciones');
    const btnLimpiar  = $('#btnLimpiarFiltrosUbicaciones');

    cargarPaisesFiltro();
    cargarLugares(); // sin filtros

    if (selPais) {
      selPais.addEventListener('change', () => {
        const idPais = selPais.value;
        cargarDepartamentosFiltro(idPais);
      });
    }

    if (selDepa) {
      selDepa.addEventListener('change', () => {
        const idPais  = selPais?.value || '';
        const idDepa  = selDepa.value;
        cargarMunicipiosFiltro(idPais, idDepa);
      });
    }

    if (formFiltros) {
      formFiltros.addEventListener('submit', (e) => {
        e.preventDefault();
        const filtros = {
          idPais:         selPais?.value || '',
          idDepartamento: selDepa?.value || '',
          idMunicipio:    selMuni?.value || ''
        };
        cargarLugares(filtros);
      });
    }

    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', () => {
        if (selPais) selPais.value = '';
        if (selDepa) {
          selDepa.innerHTML = '<option value="">Todos</option>';
          selDepa.disabled = true;
        }
        if (selMuni) {
          selMuni.innerHTML = '<option value="">Todos</option>';
          selMuni.disabled = true;
        }
        cargarLugares(); // sin filtros
      });
    }
  });
})();
