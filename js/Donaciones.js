// Donaciones.js — Carga donantes, guarda donación y refresca panel (caja + recientes)
(() => {
  'use strict';
  const API = 'http://localhost:3000/api';

  const $ = (s, c = document) => c.querySelector(s);

  // Formateo de quetzales con separador de miles
  const fmtQ = (() => {
    const f = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 });
    return (n) => f.format(Number(n || 0));
  })();

  // Pone fecha/hora local visibles (solo informativas)
  function setNow() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm   = pad(d.getMonth() + 1);
    const dd   = pad(d.getDate());
    const HH   = pad(d.getHours());
    const MM   = pad(d.getMinutes());

    $('#inpFecha')?.setAttribute('value', `${yyyy}-${mm}-${dd}`);
    $('#inpHora')?.setAttribute('value', `${HH}:${MM}`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#formDonacion');
    const sel  = $('#selDonante');
    if (!form || !sel) return;

    cargarDonantes(sel);
    setNow();

    form.addEventListener('submit', onSubmit);
    $('#btnRefrescar')?.addEventListener('click', refrescarPanel);
    $('#btnLimpiar')?.addEventListener('click', () => setTimeout(setNow, 0));

    // Anti-sobrescritura accidental del <select>
    new MutationObserver(() => {
      if (sel.dataset.loaded === '1' && sel.options.length <= 1) {
        cargarDonantes(sel);
      }
    }).observe(sel, { childList: true, subtree: true });

    refrescarPanel();
  });

  async function cargarDonantes(sel) {
    try {
      sel.innerHTML = '<option value="">Cargando…</option>';
      const r = await fetch(API + '/donantes', { headers: { 'Accept': 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const lista = await r.json();

      if (!Array.isArray(lista) || !lista.length) {
        sel.innerHTML = '<option value="">No hay donantes</option>';
        return;
      }
      sel.innerHTML = '<option value="">Seleccione…</option>' +
        lista.map(d => `<option value="${d.idDonador}">${d.nombreCompleto}</option>`).join('');
      sel.dataset.loaded = '1';
    } catch (e) {
      console.error('[Donaciones] Error al cargar donantes:', e);
      sel.innerHTML = '<option value="">Error al cargar</option>';
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    form.classList.add('was-validated');

    const sel = form.querySelector('#selDonante');
    const inpMonto = form.querySelector('input[name="montoDonado"]');

    const idDonador = Number(sel?.value);
    const montoDonado = Number(inpMonto?.value);

    if (!idDonador) { sel?.focus(); return; }
    if (!(montoDonado > 0)) { inpMonto?.focus(); return; }

    const payload = {
      idDonador,
      montoDonado,
      idUsuarioIngreso: window.USER_ID || 1
      // fecha/hora NO se envían: el backend usa CURDATE()/CURTIME()
    };

    try {
      const resp = await fetch(API + '/donaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(txt || 'HTTP ' + resp.status);
      }

      form.reset();
      form.classList.remove('was-validated');
      setNow();
      alert('Donación registrada.');
      await refrescarPanel();

      // (Opcional) Si tienes /api/caja/movimiento y un tipo de ingreso configurado,
      // aquí podrías acreditar la caja automáticamente:
      // await fetch(API + '/caja/movimiento', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     montoTrx: montoDonado,
      //     idTipoTrx: 1, // <- INGRESO (ajústalo al ID real)
      //     descripcionTrx: 'Ingreso por donación',
      //     idUsuarioIngreso: window.USER_ID || 1
      //   })
      // });
      // await refrescarPanel();
    } catch (err) {
      console.error('[Donaciones] Error al guardar:', err);
      alert('No se pudo guardar la donación.');
    }
  }

  async function refrescarPanel() {
    const lblCaja   = $('#lblCaja');
    const tbodyMovs = $('#tbodyMovs');

    let totalDesdeCaja = null;
    let movs = [];

    // 1) Intentar leer la caja real del backend
    try {
      const r = await fetch(API + '/caja/estado'); // <- endpoint correcto
      if (r.ok) {
        const caja = await r.json();
        if (typeof caja?.montoTotal === 'number') {
          totalDesdeCaja = caja.montoTotal;
        }
      }
    } catch {}

    // 2) Cargar últimas donaciones (sirve para la tabla y como fallback del total)
    try {
      const r = await fetch(API + '/donaciones');
      if (r.ok) movs = await r.json();
    } catch {}

    // Tabla de recientes
    if (!Array.isArray(movs) || !movs.length) {
      tbodyMovs.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Sin datos</td></tr>';
    } else {
      tbodyMovs.innerHTML = movs.slice(0, 8).map(m => `
        <tr>
          <td>${(m.fechaIngreso ?? '')} ${(m.horaIngreso ?? '')}</td>
          <td>Donación</td>
          <td class="text-end">${fmtQ(m.montoDonado)}</td>
        </tr>
      `).join('');
    }

    // Total mostrado
    if (lblCaja) {
      if (totalDesdeCaja != null) {
        lblCaja.textContent = fmtQ(totalDesdeCaja);       // total real si existe Caja
      } else {
        const totalFallback = (movs || []).reduce((s, m) => s + Number(m?.montoDonado || 0), 0);
        lblCaja.textContent = fmtQ(totalFallback);         // suma de donaciones (fallback)
      }
    }
  }
})();
