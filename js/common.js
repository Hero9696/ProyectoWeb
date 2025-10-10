// Helpers globales
window.$ = (s,ctx=document)=>ctx.querySelector(s);
window.$$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
window.money = v => (v==null? '—' : 'Q '+Number(v).toFixed(2));
window.flash = (msg,type='success')=>{
const el = $('#flash'); if(!el) return;
el.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">${msg}<button class='btn-close' data-bs-dismiss='alert'></button></div>`;
};


function setWho(u){ $('#whoami')?.textContent = u? `${u.username} • ${u.role||''}` : 'Sin sesión'; }
window.setWho = setWho;


// Login común (modal presente en ambas páginas)
window.initAuth = async function(){
try{ const me = await API.me(); setWho(me); $('#btnLogout')?.classList.remove('d-none'); }catch{}
$('#formLogin')?.addEventListener('submit', async (e)=>{
e.preventDefault();
try{
const data = await API.login($('#loginUser').value.trim(), $('#loginPass').value);
setWho(data); flash('Sesión iniciada.');
bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
$('#btnLogout')?.classList.remove('d-none');
// recarga suave de la página actual para disparar lecturas
if(window.onAuthReady) window.onAuthReady();
}catch{ flash('No se pudo iniciar sesión','danger'); }
});
$('#btnLogout')?.addEventListener('click', ()=>{ location.reload(); });
};


// Marca el link activo
(function(){
const href = location.pathname.split('/').pop();
$(`#menu a[href$='${href}']`)?.classList.add('active');
})();