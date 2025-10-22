// Archivo de Lógica de Enrutamiento (Simulación de Router Simple)
// Este script centraliza la navegación a páginas conocidas y aplica un fallback a 404.html si la ruta no existe.

document.addEventListener('DOMContentLoaded', () => {
    // Mapa de Rutas Válidas
    // Solo se permite la navegación a las rutas definidas aquí.
    const validRoutes = {
        'btnVistaBeneficiarios': 'view/VistaBeneficiarios.html',
        'btnVistaEncargado': 'view/VistaEncargado.html',
        'btnVistaDonaciones': 'view/VistaDonaciones.html',
        // Agrega aquí todas las demás rutas válidas de tu aplicación
    };
    
    // Define la página de fallback (el Canvas actual)
    const notFoundPage = './404.html';

<<<<<<< HEAD
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
=======
    /**
     * Función centralizada para manejar la navegación interna.
     * Si el ID del botón tiene una ruta mapeada en validRoutes, navega.
     * De lo contrario, redirige al 404.html.
     */
    const go = (id) => {
        const href = validRoutes[id];
        
        if (href) {
            // Ruta válida encontrada: navega al destino.
            console.log(`Navegando a ruta válida: ${href}`);
            window.location.assign(href);
        } else {
            // Lógica de Fallback 404: Si la ruta no está definida, se redirige.
            console.warn(`Ruta desconocida para el ID ${id}. Redirigiendo a 404.`);
            window.location.assign(notFoundPage);
        }
    };

    // Función auxiliar para configurar Event Listeners en los botones
    const setupButtonNavigation = (id) => {
        const el = document.getElementById(id);
        if (!el) {
            // Si el elemento no existe, simplemente se ignora.
            return;
        }

        el.addEventListener('click', (e) => {
            // Permite click medio/ctrl+click para abrir en nueva pestaña
            if (e.ctrlKey || e.metaKey || e.button === 1) return;
            
            e.preventDefault();
            
            // Llama a la función de enrutamiento centralizada.
            go(id);
        });
    };
    
    // Configurar la navegación para las rutas conocidas:
    setupButtonNavigation('btnVistaBeneficiarios');
    setupButtonNavigation('btnVistaEncargado');
    setupButtonNavigation('btnVistaDonaciones');
    
    // Ejemplo de un botón que podría fallar si se añade al HTML sin un mapeo aquí:
    // setupButtonNavigation('btnRutaInvalida'); 
    
    console.log('Lógica de navegación inicializada con fallback a 404.');
});
>>>>>>> 36166a4a78b59cbb891534f48082074fb6617bb7
