// Donaciones.js — Carga donantes y guarda SOLO idDonador + montoDonado
(() => {
  'use strict';
  const API = 'http://localhost:3000/api';

  const $ = (s, c=document) => c.querySelector(s);
  const fmtQ = n => `Q ${Number(n||0).toFixed(2)}`;

    // ==========================
  // Obtener usuario logueado
  // ==========================
  // ==========================
  // Obtener usuario logueado (sin tocar auth.js)
  // ==========================
  function getLoggedUserId() {
    try {
      const auth    = window.PollitoAuth || {};
      const session = typeof auth.getSession === 'function'
        ? auth.getSession()
        : null;

      // candidatos en orden de prioridad
      const candidatos = [
        session?.user?.idUsuario,
        session?.user?.id,            // por si usa "id"
        auth.user?.idUsuario,
        auth.user?.id,
        window.USER_ID                // el que pusiste en el HTML
      ];

      for (const c of candidatos) {
        const n = Number(c);
        if (Number.isInteger(n) && n > 0) {
          return n;
        }
      }
    } catch (e) {
      console.warn('[Donaciones] No se pudo leer usuario logueado:', e);
    }

    console.warn('[Donaciones] getLoggedUserId() usando fallback 1');
    return 1;
  }

  // Pone fecha/hora local visibles (solo informativas)
  function setNow() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm   = pad(d.getMonth() + 1);
    const dd   = pad(d.getDate());
    const HH   = pad(d.getHours());
    const MM   = pad(d.getMinutes());

    const inpFecha = $('#inpFecha');
    const inpHora  = $('#inpHora');
    if (inpFecha) inpFecha.value = `${yyyy}-${mm}-${dd}`;
    if (inpHora)  inpHora.value  = `${HH}:${MM}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#formDonacion');
    const sel  = $('#selDonante');
    if (!form || !sel) return;

    cargarDonantes(sel);
    setNow();

    form.addEventListener('submit', onSubmit);
    $('#btnRefrescar')?.addEventListener('click', refrescarPanel);
    $('#btnLimpiar')?.addEventListener('click', () => {
      // El reset limpia valores; volvemos a poner el "ahora"
      setTimeout(setNow, 0);
    });

    // Si otro script reescribe el select, lo restauramos
    new MutationObserver(() => {
      if (sel.dataset.loaded === '1' && sel.options.length <= 1) {
        console.warn('[Donaciones] Reescritura detectada. Restaurando...');
        cargarDonantes(sel);
      }
    }).observe(sel, { childList: true, subtree: true });

    refrescarPanel();
  });

  async function cargarDonantes(sel){
    try{
      sel.innerHTML = '<option value="">Cargando…</option>';
      const r = await fetch(API + '/donantes', { headers: { 'Accept':'application/json' }});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const lista = await r.json();

      if(!Array.isArray(lista) || !lista.length){
        sel.innerHTML = '<option value="">No hay donantes</option>';
        return;
      }
      sel.innerHTML = '<option value="">Seleccione…</option>' +
        lista.map(d => `<option value="${d.idDonador}">${d.nombreCompleto}</option>`).join('');
      sel.dataset.loaded = '1';
    }catch(e){
      console.error('[Donaciones] Error al cargar donantes:', e);
      sel.innerHTML = '<option value="">Error al cargar</option>';
    }
  }

  async function onSubmit(e){
    e.preventDefault();
    const form = e.currentTarget;
    form.classList.add('was-validated');

    const sel = form.querySelector('#selDonante');
    const inpMonto = form.querySelector('input[name="montoDonado"]');

    const idDonador   = Number(sel?.value);
    const montoDonado = Number(inpMonto?.value);

    if(!idDonador){ sel?.focus(); return; }
    if(!(montoDonado > 0)){ inpMonto?.focus(); return; }

        const payload = {
      idDonador,
      montoDonado,
      idUsuarioIngreso: getLoggedUserId()
      // fecha/hora NO se envían: el backend usa CURDATE()/CURTIME()
    };


    try{
      const resp = await fetch(API + '/donaciones', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      if(!resp.ok){
        const txt = await resp.text().catch(()=> '');
        throw new Error(txt || 'HTTP '+resp.status);
      }
      form.reset();
      form.classList.remove('was-validated');
      setNow();
      alert('Donación registrada.');
      refrescarPanel();
    }catch(err){
      console.error('[Donaciones] Error al guardar:', err);
      alert('No se pudo guardar la donación.');
    }
  }
async function getCajaTotal() {
  const candidates = ['/caja/1', '/cajas/1', '/caja', '/caja/estado', '/caja/movimiento'];

  function extractTotal(d) {
    if (!d) return null;
    if (typeof d.montoTotal !== 'undefined') return Number(d.montoTotal);
    if (typeof d.total !== 'undefined') return Number(d.total);
    if (Array.isArray(d) && d.length) return extractTotal(d[0]);
    if (d.data) return extractTotal(d.data);
    return null;
  }

  for (const path of candidates) {
    try {
      const r = await fetch(API + path, { headers: { 'Accept':'application/json' }});
      if (!r.ok) continue;
      const json = await r.json();
      const total = extractTotal(json);
      if (total != null && !Number.isNaN(total)) return total;
    } catch (e) {
      console.warn('[Caja] Falló', path, e);
    }
  }
  return null;
}

async function refrescarPanel(){
  const lblCaja   = $('#lblCaja');
  const tbodyMovs = $('#tbodyMovs');

  // 💰 Estado de caja
  async function getCajaTotal() {
    const candidates = ['/caja/1', '/cajas/1', '/caja', '/caja/estado', '/caja/movimiento'];

    function extractTotal(d) {
      if (!d) return null;
      if (typeof d.montoTotal !== 'undefined') return Number(d.montoTotal);
      if (typeof d.total !== 'undefined') return Number(d.total);
      if (Array.isArray(d) && d.length) return extractTotal(d[0]);
      if (d.data) return extractTotal(d.data);
      return null;
    }

    for (const path of candidates) {
      try {
        const r = await fetch(API + path, { headers: { 'Accept':'application/json' }});
        if (!r.ok) continue;
        const json = await r.json();
        const total = extractTotal(json);
        if (total != null && !Number.isNaN(total)) return total;
      } catch (e) {
        console.warn('[Caja] Falló', path, e);
      }
    }
    return null;
  }

  try {
    const total = await getCajaTotal();
    if (total != null) {
      lblCaja.textContent = fmtQ(total);
    } else {
      lblCaja.textContent = 'Q 0.00';
    }
  } catch (err) {
    console.error('[Donaciones] Error al obtener caja:', err);
    lblCaja.textContent = 'Q 0.00';
  }

  // 🧾 Transacciones recientes
  try {
    const r = await fetch(API + '/donaciones');
    if (r.ok && tbodyMovs) {
      const movs = await r.json();
      if (!Array.isArray(movs) || !movs.length) {
        tbodyMovs.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Sin datos</td></tr>';
        return;
      }
      tbodyMovs.innerHTML = movs.slice(0,8).map(m => `
        <tr>
          <td>${(m.fechaIngreso??'')} ${(m.horaIngreso??'')}</td>
          <td>Donación</td>
          <td class="text-end">${fmtQ(m.montoDonado)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('[Donaciones] Error al cargar donaciones:', err);
  }
}

})();
