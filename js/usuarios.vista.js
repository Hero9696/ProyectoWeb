// Lógica de la VISTA: Usuarios
async function loadRoles(){
const sel = $('#usrRol'); if(!sel) return;
try{
const roles = await API.roles(); sel.innerHTML='';
roles.forEach(r=>{ const o=document.createElement('option'); o.value=r.idRol; o.textContent=r.nombre; sel.appendChild(o); });
}catch{ sel.innerHTML = `<option value="" disabled selected>No disponible</option>`; }
}


async function loadUsuarios(){
const tbody = document.querySelector('#tablaUsuarios tbody'); if(!tbody) return;
tbody.innerHTML = `<tr class='text-muted'><td colspan='3'>Cargando…</td></tr>`;
try{
const list = await API.listarUsuarios();
if(!list.length){ tbody.innerHTML = `<tr class='text-muted'><td colspan='3'>Sin datos</td></tr>`; return; }
tbody.innerHTML = '';
list.forEach(u=>{
const tr = document.createElement('tr'); tr.dataset.id = u.idUsuario;
tr.innerHTML = `<td>${u.nombreUsuario}</td><td><span class='badge text-bg-secondary'>${u.rolNombre||u.idRol}</span></td><td class='text-end'><div class='btn-group'>
<button class='btn btn-sm btn-outline-secondary' data-action='reset'>Reset pass</button>
<button class='btn btn-sm btn-outline-danger' data-action='remove'>Eliminar</button>
</div></td>`; tbody.appendChild(tr);
});
}catch{ tbody.innerHTML = `<tr class='text-muted'><td colspan='3'>Sin datos (backend)</td></tr>`; }
}


function bindUsuarioForm(){
const form = document.querySelector('#formUsuario');
form?.addEventListener('submit', async (e)=>{
e.preventDefault();
try{
const payload = { nombreUsuario: $('#usrNombre').value.trim(), contrasena: $('#usrPass').value, idRol: $('#usrRol').value };
await API.crearUsuario(payload);
flash('Usuario creado.'); form.reset(); loadUsuarios();
}catch{ flash('No se pudo crear (revisar backend)','danger'); }
});
document.querySelector('#tablaUsuarios')?.addEventListener('click', async (e)=>{
const btn = e.target.closest('button'); if(!btn) return;
const id = btn.closest('tr')?.dataset.id; if(!id) return;
if(btn.dataset.action==='remove'){ try{ await API.eliminarUsuario(id); loadUsuarios(); }catch{} }
if(btn.dataset.action==='reset'){ try{ await API.resetPass(id); flash('Password reseteado.','info'); }catch{} }
});
}


window.onAuthReady = ()=>{ loadRoles(); loadUsuarios(); };


document.addEventListener('DOMContentLoaded', ()=>{ initAuth(); bindUsuarioForm(); loadRoles(); loadUsuarios(); });