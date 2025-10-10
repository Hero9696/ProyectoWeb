// Lógica de la VISTA: Compras
async function loadKPIs(){
const saldo = $('#kpi-saldo'), tx = $('#kpi-tx'), ing = $('#kpi-ing');
if(saldo) saldo.innerHTML = '<span class="skeleton">     </span>';
if(tx) tx.innerHTML = '<span class="skeleton">     </span>';
if(ing) ing.innerHTML = '<span class="skeleton">     </span>';
try{
const k = await API.kpis();
if(saldo) saldo.textContent = money(k.saldo);
if(tx) tx.textContent = k.transaccionesHoy ?? '—';
if(ing) ing.textContent = money(k.ingresosHoy);
}catch{/* queda en placeholders */}
}


async function loadTransacciones(){
const tbody = document.querySelector('#tablaTransacciones tbody');
if(!tbody) return;
tbody.innerHTML = `<tr class='text-muted'><td colspan='6'>Cargando…</td></tr>`;
try{
const rows = await API.listTransacciones();
if(!rows.length){ tbody.innerHTML = `<tr class='text-muted'><td colspan='6'>Sin datos</td></tr>`; return; }
tbody.innerHTML='';
rows.forEach(t=>{
const tr = document.createElement('tr');
tr.innerHTML = `<td>${t.fecha||''}</td><td>${t.detalle||''}</td><td><span class='badge ${t.tipo==='ingreso'?'text-bg-success':'text-bg-danger'}'>${t.tipo||''}</span></td><td class='text-end'>${t.cantidad??''}</td><td class='text-end'>${money(t.precio)}</td><td class='text-end fw-semibold'>${money(t.total)}</td>`;
tbody.appendChild(tr);
});
}catch{ tbody.innerHTML = `<tr class='text-muted'><td colspan='6'>Sin datos (backend)</td></tr>`; }
}


function bindCompraForm(){
const $fecha = $('#cmpFecha'); if($fecha) $fecha.value = new Date().toISOString().slice(0,10);
const $cant = $('#cmpCantidad'); const $precio = $('#cmpPrecio'); const $total = $('#cmpTotal');
function update(){ const t = (Number($cant?.value||0)*Number($precio?.value||0)); if($total) $total.textContent = t? money(t): '—'; }
['input','change'].forEach(ev=>{ $cant?.addEventListener(ev,update); $precio?.addEventListener(ev,update); });
document.querySelector('#formCompra')?.addEventListener('submit', async (e)=>{
e.preventDefault();
try{
const payload = { fecha: $('#cmpFecha').value, detalle: $('#cmpDonante').value.trim(), cantidad: Number($('#cmpCantidad').value), precio: Number($('#cmpPrecio').value), tipo: $('#cmpTipo').value, forma: $('#cmpPago').value, obs: $('#cmpObs').value.trim() };
await API.crearTransaccion(payload);
flash('Transacción guardada.');
e.target.reset(); update();
await Promise.all([loadKPIs(), loadTransacciones()]);
}catch{ flash('Error al guardar (revisar backend)','danger'); }
});
}


window.onAuthReady = ()=>{ loadKPIs(); loadTransacciones(); };


document.addEventListener('DOMContentLoaded', ()=>{ initAuth(); bindCompraForm(); loadKPIs(); loadTransacciones(); });