// ../js/pollitoprogress.js
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const GOAL = 2000; // Meta trimestral: Q2000

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function fmtQ(n) {
    return Number(n || 0).toFixed(2);
  }

  function parseFechaYmd(fechaStr) {
    if (!fechaStr) return null;
    const [y, m, d] = fechaStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function getQuarterStart(date) {
    // "últimos 3 meses" atrás
    const d = new Date(date);
    d.setMonth(d.getMonth() - 2); // este + dos meses anteriores ≈ trimestre
    d.setDate(1);
    return d;
  }

  async function fetchJson(url) {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} en ${url}`);
    return resp.json();
  }

  async function loadDashboard() {
    const goalEl        = $('#goalAmount');
    const currentEl     = $('#currentAmount');
    const remainingEl   = $('#remainingAmount');
    const percentEl     = $('#progressPercentage');
    const barEl         = $('#mainProgressBar');
    const donorsListEl  = $('#donorsList');
    const trxTableBody  = $('#transactionsTable');

    if (!goalEl || !currentEl || !remainingEl || !percentEl || !barEl) {
      console.warn('[PollitoProgress] No se encontraron algunos elementos del DOM');
      return;
    }

    // Pinta meta fija
    goalEl.textContent = fmtQ(GOAL);

    // 1) Traer donaciones y donantes
    let donaciones = [];
    let donantes   = [];
    try {
      [donaciones, donantes] = await Promise.all([
        fetchJson(`${API}/donaciones`),
        fetchJson(`${API}/donantes`)
      ]);
    } catch (err) {
      console.error('[PollitoProgress] Error al cargar datos:', err);
      if (trxTableBody) {
        trxTableBody.innerHTML = `
          <tr class="empty-row">
            <td colspan="6" class="text-center text-muted py-5">
              <span class="empty-table-icon">⚠️</span>
              <p class="mb-0 mt-2">Error al cargar datos desde el servidor</p>
              <small class="text-muted">${err.message}</small>
            </td>
          </tr>`;
      }
      return;
    }

    if (!Array.isArray(donaciones)) donaciones = [];
    if (!Array.isArray(donantes)) donantes = [];

    // Mapa idDonador → nombreCompleto
    const mapaDonantes = {};
    donantes.forEach(d => {
      const id = d.idDonador || d.idDonante || d.id;
      if (!id) return;
      mapaDonantes[id] = d.nombreCompleto || d.nombre || `Donante #${id}`;
    });

    // 2) Filtrar donaciones del último trimestre (3 meses)
    const hoy = new Date();
    const quarterStart = getQuarterStart(hoy);

    const donacionesTrim = donaciones.filter(d => {
      const f = parseFechaYmd(d.fechaIngreso || d.fechaDonacion || d.fecha);
      if (!f) return false;
      return f >= quarterStart && f <= hoy;
    });

    // 3) Calcular total recaudado en el trimestre
    const totalRecaudado = donacionesTrim.reduce(
      (acc, d) => acc + Number(d.montoDonado || d.monto || 0),
      0
    );

    const restante = Math.max(GOAL - totalRecaudado, 0);
    const porcentaje = GOAL > 0 ? Math.min((totalRecaudado / GOAL) * 100, 100) : 0;

    currentEl.textContent   = fmtQ(totalRecaudado);
    remainingEl.textContent = fmtQ(restante);
    percentEl.textContent   = `${porcentaje.toFixed(0)}%`;

    // Animar barra
    requestAnimationFrame(() => {
      barEl.style.width = `${porcentaje}%`;
    });

    // 4) Top donadores (por suma en el trimestre)
    const agregados = {}; // idDonante → total
    donacionesTrim.forEach(d => {
      const idDon = d.idDonador || d.idDonante || d.donanteId;
      if (!idDon) return;
      const monto = Number(d.montoDonado || d.monto || 0);
      agregados[idDon] = (agregados[idDon] || 0) + monto;
    });

    const ranking = Object.entries(agregados)
      .map(([id, total]) => ({
        id,
        total,
        nombre: mapaDonantes[id] || `Donante #${id}`
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    if (donorsListEl) {
      if (!ranking.length) {
        donorsListEl.innerHTML = `
          <div class="col-12">
            <div class="donor-card-pro empty-card">
              <div class="empty-state">
                <span class="empty-icon">📥</span>
                <p class="empty-text">No hay donaciones registradas en el último trimestre.</p>
              </div>
            </div>
          </div>`;
      } else {
        donorsListEl.innerHTML = ranking.map((d, i) => {
          const pct = totalRecaudado > 0
            ? (d.total / totalRecaudado) * 100
            : 0;
          return `
            <div class="col-md-6 col-xl-4">
              <div class="donor-card-pro">
                <div class="donor-rank-badge">#${i + 1}</div>
                <div class="donor-main">
                  <div class="donor-avatar">${d.nombre.charAt(0).toUpperCase()}</div>
                  <div class="donor-info">
                    <h5 class="donor-name">${d.nombre}</h5>
                    <p class="donor-meta">ID Donante: ${d.id}</p>
                  </div>
                </div>
                <div class="donor-stats">
                  <div class="donor-amount">
                    <span class="label">Total donado</span>
                    <span class="value">Q ${fmtQ(d.total)}</span>
                  </div>
                  <div class="donor-progress">
                    <div class="donor-progress-bar">
                      <div class="donor-progress-fill" style="width:${pct.toFixed(0)}%;"></div>
                    </div>
                    <span class="donor-progress-text">${pct.toFixed(1)}% del trimestre</span>
                  </div>
                </div>
              </div>
            </div>`;
        }).join('');
      }
    }

    // 5) Tabla de transacciones (donaciones del trimestre)
    if (trxTableBody) {
      if (!donacionesTrim.length) {
        trxTableBody.innerHTML = `
          <tr class="empty-row">
            <td colspan="6" class="text-center text-muted py-5">
              <span class="empty-table-icon">📊</span>
              <p class="mb-0 mt-2">No hay transacciones registradas en el último trimestre</p>
              <small class="text-muted">Las nuevas donaciones aparecerán aquí automáticamente.</small>
            </td>
          </tr>`;
      } else {
        trxTableBody.innerHTML = donacionesTrim.map((d, idx) => {
          const fecha = d.fechaIngreso || d.fechaDonacion || d.fecha || '';
          const hora  = (d.horaIngreso || d.hora || '').toString().slice(0,5);
          const idDon = d.idDonador || d.idDonante || d.donanteId;
          const nombre = mapaDonantes[idDon] || (idDon ? `Donante #${idDon}` : 'N/D');
          const monto = Number(d.montoDonado || d.monto || 0);
          const pctGoal = GOAL > 0 ? (monto / GOAL) * 100 : 0;

          return `
            <tr>
              <td>${idx + 1}</td>
              <td>${fecha} ${hora}</td>
              <td>${nombre}</td>
              <td>Q ${fmtQ(monto)}</td>
              <td>${pctGoal.toFixed(1)}%</td>
              <td><span class="badge bg-success">Registrada</span></td>
            </tr>`;
        }).join('');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadDashboard().catch(err =>
      console.error('[PollitoProgress] Error inesperado:', err)
    );
  });

})();
