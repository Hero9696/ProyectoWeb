// /view/Donaciones.js — igual que el inline de VistaDonaciones.html
(() => {
  'use strict';

  const API = 'http://localhost:3000/api';
  const $ = (s, c=document) => c.querySelector(s);
  const fmtQ = n => `Q ${Number(n||0).toFixed(2)}`;

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#formDonacion');
    const sel  = $('#selDonante');
    if (!form || !sel) return;

    cargarDonantes(sel);
    form.addEventListener('submit', onSubmit);
    $('#btnRefrescar')?.addEventListener('click', refrescarPanel);
    $('#btnLimpiar')?.addEventListener('click', () => form.reset());

    new MutationObserver(() => {
      if (sel.dataset.loaded === '1' && sel.options.length <= 1) {
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
        sel.innerHTML = '<option value="">No hay donantes</option>'; return;
      }
      sel.innerHTML = '<option value="">Seleccione…</option>' +
        lista.map(d => `<option value="${d.idDonador}">${d.nombreCompleto}</option>`).join('');
      sel.dataset.loaded = '1';
    }catch(e){
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
      idUsuarioIngreso: window.USER_ID || 1
    };

    try{
      const resp = await fetch(API + '/donaciones', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      if(!resp.ok) throw new Error('HTTP '+resp.status);
      form.reset();
      form.classList.remove('was-validated');
      alert('Donación registrada.');
      refrescarPanel();
    }catch(err){
      alert('No se pudo guardar la donación.');
    }
  }

  async function refrescarPanel(){
    const lblCaja   = $('#lblCaja');
    const tbodyMovs = $('#tbodyMovs');

    try{
      const r = await fetch(API + '/caja');
      if(r.ok && lblCaja){
        const caja = await r.json();
        lblCaja.textContent = fmtQ(caja?.total ?? 0);
      }
    }catch{}

    try{
      const r = await fetch(API + '/donaciones');
      if(r.ok && tbodyMovs){
        const movs = await r.json();
        if(!Array.isArray(movs) || !movs.length){
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
    }catch{}
  }
})();
