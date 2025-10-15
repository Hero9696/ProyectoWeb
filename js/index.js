const contenedor = document.getElementById('contenidoPrincipal');

    document.getElementById('btnVistaBeneficiarios').addEventListener('click', async ()=>{
      const html = await fetch('../view/VistaBeneficiarios.html').then(r=>r.text());
      contenedor.innerHTML = html;
    });

    document.getElementById('btnVistaEncargado').addEventListener('click', async ()=>{
      const html = await fetch('../view/VistaEncargado.html').then(r=>r.text());
      contenedor.innerHTML = html;
    });
// Marca activo en navbar por URL
(function markActive(){
  const path = location.pathname.replace(/\/+$/,'');
  document.querySelectorAll('.navbar a').forEach(a=>{
    try{
      if (new URL(a.href, location.origin).pathname.replace(/\/+$/,'') === path) {
        a.classList.add('is-active');
      }
    }catch(_){}
  });
})();

// Fade-in del contenedor principal
window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.page');
  if (root) requestAnimationFrame(() => root.classList.add('is-ready'));
});

// Prefetch simple de vistas (hover/touch)
(function prefetchLinks(){
  if (!('fetch' in window) || !('requestIdleCallback' in window)) return;
  const cache = new Map();
  const prefetch = (url) => {
    if (!url || cache.has(url)) return;
    cache.set(url, true);
    requestIdleCallback(() => fetch(url, { mode:'no-cors' }).catch(()=>{}));
  };
  document.addEventListener('mouseover', e=>{
    const a = e.target.closest('a[data-prefetch]');
    if (a) prefetch(a.href);
  });
  document.addEventListener('touchstart', e=>{
    const a = e.target.closest('a[data-prefetch]');
    if (a) prefetch(a.href);
  });
})();