window.API = (function(){
const BASE = ''; // TODO: setea la URL base
const json = (method, url, body) => fetch(BASE+url, {
method,
headers: {'Content-Type':'application/json'},
credentials: 'include',
body: body ? JSON.stringify(body) : undefined
}).then(async r=>{ if(!r.ok) throw await r.json().catch(()=>({error:true})); return r.json(); });


return {
login: (username,password)=> json('POST','/auth/login',{username,password}),
me: ()=> json('GET','/auth/me'),
// Caja & transacciones
kpis: ()=> json('GET','/caja/kpis'),
listTransacciones: ()=> json('GET','/transacciones'),
crearTransaccion: (p)=> json('POST','/transacciones',p),
// Usuarios
roles: ()=> json('GET','/roles'),
crearUsuario: (u)=> json('POST','/usuarios',u),
listarUsuarios: ()=> json('GET','/usuarios'),
eliminarUsuario: (id)=> json('DELETE','/usuarios/'+id),
resetPass: (id)=> json('POST','/usuarios/'+id+'/reset')
};
})();